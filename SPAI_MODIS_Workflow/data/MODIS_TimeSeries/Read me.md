
# MODIS Time Series Exports

This directory contains the raw time-series datasets exported from Google Earth Engine (GEE) for MODIS Collection 6.1 products at station scale.

## Directory Structure

    - **MODIS_TimeSeries_8Day/**  
    Contains CSV files derived from 8-day MODIS composite products:
    - LAI (Leaf Area Index)
    - FAPAR (Fraction of Absorbed Photosynthetically Active Radiation)
    - LST (Land Surface Temperature)

    - **MODIS_TimeSeries_16Day/**  
    Contains CSV files derived from 16-day MODIS composite products:
    - NDVI (Normalized Difference Vegetation Index)
    - EVI (Enhanced Vegetation Index)
    - VCI (Vegetation Condition Index)

    Each CSV file corresponds to a single station and includes the following core fields:
    - `name` : station identifier  
    - `date` : observation date  
    - `year`, `month`, `doy` : temporal attributes  
    - MODIS biophysical variables  

## Data Characteristics and Limitations

### High-Latitude and Cold Stations
**Note:** 
Note on High-Latitude Stations (Cold stations): Satellite observations (NDVI, LAI, EVI, etc.) are naturally unavailable during the polar night and periods of persistent snow cover. In the provided datasets, these periods are represented by empty cells or NaN values. Statistical correlations reported in the manuscript were calculated exclusively for the vegetative (snow-free) season to ensure physical relevance and avoid spurious signals. Users of this dataset should apply similar seasonality filters when performing ecological analyses for stations in polar, boreal, or high-alpine environments.


## Relation to Downstream Processing

The datasets stored in this directory serve as inputs for:
- monthly aggregation using the Python script located in `code/MODIS_monthly_aggregation_code.py`, and  
- subsequent validation of drought indices presented in the manuscript.

Users are encouraged to verify station latitude and seasonal data availability before performing statistical analyses.
