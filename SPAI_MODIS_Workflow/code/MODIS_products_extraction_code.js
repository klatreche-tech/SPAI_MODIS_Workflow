/**
 * MODIS Biophysical Parameter Extraction for SPAI Validation
 *
 * Project: Standardized Pluviothermal Anomaly Index (SPAI)
 * Author: Khaled Latreche
 * Date: 2026
 *
 * Purpose:
 * Automate extraction and processing of MODIS Collection 6.1 biophysical
 * variables for validation of the SPAI drought index.
 *
 * Extracted Variables:
 *   16-day composites: NDVI, EVI, VCI
 *   8-day composites: LAI, FAPAR, LST
 * 
 * Processing Features:
 *   - 5-km circular buffer around the station location
 *   - MODIS Collection 6.1 quality flag filtering
 *   - Native temporal compositing (16-day NDVI/EVI, 8-day LAI/FAPAR/LST)
 *   - Temporal smoothing of LST using a ±8-day moving window
 *   - Spatial aggregation at native MODIS resolutions
 *       • 1 km for NDVI, EVI, VCI, and LST
 *       • 500 m for LAI and FAPAR
 *   - Missing values preserved as null during extraction
 * 
 * Output: Two CSV files for Python-based monthly aggregation and SPAI validation
 */


//  -----------------------------------------
// 1. STUDY CONFIGURATION
//  -------------------------------
var stationName = 'ALGER_DAR_EL_BEIDA_AG';
var coordinates = [3.25, 36.7167];
var bufferRadius = 5000;
var startDate = '2000-01-01';
var endDate = '2024-12-31';

var station = ee.FeatureCollection([
  ee.Feature(
    ee.Geometry.Point(coordinates).buffer(bufferRadius),
    { name: stationName }
  )
]);

//  -----------------------------------
// 2. QUALITY MASK FUNCTIONS
//  ---------------------------
function maskMod13A2(img) {
  return img.updateMask(img.select('SummaryQA').bitwiseAnd(3).lte(1));
}

function maskMod11A2(img) {
  return img.updateMask(img.select('QC_Day').bitwiseAnd(3).eq(0));
}

function maskMod15A2H(img) {
  var qc = img.select('FparLai_QC');
  var good = qc.bitwiseAnd(3).lte(1);
  var noSnow = qc.rightShift(3).bitwiseAnd(1).eq(0);
  var noCloud = qc.rightShift(5).bitwiseAnd(1).eq(0);
  return img.updateMask(good.and(noSnow).and(noCloud));
}

//  -----------------------------------
// 3. MODIS DATA COLLECTIONS
//  ----------------------------
var modisVI = ee.ImageCollection('MODIS/061/MOD13A2')
  .filterDate(startDate, endDate)
  .select(['NDVI', 'EVI', 'SummaryQA']);

var modisLST = ee.ImageCollection('MODIS/061/MOD11A2')
  .filterDate(startDate, endDate)
  .select(['LST_Day_1km', 'QC_Day']);

var modisLAI = ee.ImageCollection('MODIS/061/MOD15A2H')
  .filterDate(startDate, endDate)
  .select(['Lai_500m', 'Fpar_500m', 'FparLai_QC']);

//  -----------------------------------------------------------------
// 4. PIXEL-WISE LONG-TERM NDVI MIN / MAX (FOR CONDITION INDEX)
//  ---------------------------------------------------------------
var maskedNDVI = modisVI
  .map(maskMod13A2)
  .select('NDVI')
  .map(function (img) {
    return img.multiply(0.0001);
  });

var ndviMin = maskedNDVI.min();
var ndviMax = maskedNDVI.max();

//  --------------------------------------------------
// 5. 16-DAY PROCESSING (NDVI, EVI, CONDITION INDEX)
//  ---------------------------------------------------------
function process16Day(image) {
  var date = image.date();

  var ndvi = image.select('NDVI').multiply(0.0001).rename('NDVI');
  var evi = image.select('EVI').multiply(0.0001).rename('EVI');

  var ndviCond = ndvi
    .subtract(ndviMin)
    .divide(ndviMax.subtract(ndviMin).add(1e-6))
    .multiply(100)
    .clamp(0, 100)
    .rename('VCI');

  var stats = ee.Image.cat([ndvi, evi, ndviCond]).reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: station.geometry(),
    scale: 1000, // MOD13A2 native resolution
    bestEffort: true,
    tileScale: 4
  });

  return ee.Feature(null, stats).set({
    name: stationName,
    date: date.format('YYYY-MM-dd'),
    year: date.get('year'),
    month: date.get('month'),
    doy: date.getRelative('day', 'year')
  });
}

//  -----------------------------------------
// 6. 8-DAY PROCESSING (LAI, FAPAR, LST)
//  ---------------------------------------
function process8Day(image) {
  var date = image.date();

  var lai = image.select('Lai_500m').multiply(0.1).rename('LAI');
  var fapar = image.select('Fpar_500m').multiply(0.01).rename('FAPAR');

  var lst = modisLST
    .filterDate(date.advance(-8, 'day'), date.advance(8, 'day'))
    .map(maskMod11A2)
    .mean()
    .select('LST_Day_1km')
    .multiply(0.02)
    .subtract(273.15)
    .rename('LST');

  var statsLAI = lai.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: station.geometry(),
    scale: 500, // MOD15A2H native resolution
    bestEffort: true,
    tileScale: 4
  });

  var statsFAPAR = fapar.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: station.geometry(),
    scale: 500,
    bestEffort: true,
    tileScale: 4
  });

  var statsLST = lst.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: station.geometry(),
    scale: 1000, // MOD11A2 native resolution
    bestEffort: true,
    tileScale: 4
  });

  return ee.Feature(null,
    statsLAI.combine(statsFAPAR).combine(statsLST)
  ).set({
    name: stationName,
    date: date.format('YYYY-MM-dd'),
    year: date.get('year'),
    month: date.get('month'),
    doy: date.getRelative('day', 'year')
  });
}

//  -----------------------------------------
// 7. EXECUTION & EXPORT
//  ------------------------
var final16Day = modisVI.map(maskMod13A2).map(process16Day);
var final8Day = modisLAI.map(maskMod15A2H).map(process8Day);

Export.table.toDrive({
  collection: final16Day,
  description: 'MODIS_TimeSeries_16Day_' + stationName,
  fileFormat: 'CSV',
  selectors: ['name', 'date', 'year', 'month', 'doy', 'NDVI', 'EVI', 'VCI']
});

Export.table.toDrive({
  collection: final8Day,
  description: 'MODIS_TimeSeries_8Day_' + stationName,
  fileFormat: 'CSV',
  selectors: ['name', 'date', 'year', 'month', 'doy', 'LAI', 'FAPAR', 'LST']
});

