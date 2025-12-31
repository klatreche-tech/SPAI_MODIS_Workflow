# Workflow for MODIS Data Extraction and Monthly Aggregation for SPAI


## Repository Structure

    SPAI_MODIS_Workflow/
    │
    ├── code/
    │   ├── MODIS_products_extraction_code.js       # GEE script for raw MODIS extraction
    │   └── MODIS_monthly_aggregation_code.py       # Python script for monthly aggregation
    │
    ├── data/
    │   ├── stations_metadata.js                    # Station metadata (JS format, for GEE)
    │   ├── stations_metadata.xlsx                  # Station metadata (XLSX, reference)
    │   │
    │   ├── MODIS_TimeSeries/
    │   │   ├── MODIS_TimeSeries_8Day/              # GEE exports (8-day products)
    │   │   ├── MODIS_TimeSeries_16Day/             # GEE exports (16-day products)
    │   │   └── README.md                           # Description of MODIS exports
    │   │
    │   └── Drought_Indices_Meteo_Series.csv        # SPAI, SPEI, SPI, P, T, ET
    │
    ├── README.md                                   # Main workflow documentation
    └── CITATION.cff



    
## 1. Objective
    The goal is to generate monthly time series of MODIS biophysical parameters (NDVI, EVI, VCI, LAI, FAPAR, LST) for validating the Standardized Pluviothermal Anomaly Index (SPAI). The workflow combines:
        1- Station-scale extraction via Google Earth Engine (GEE).
        2- Monthly aggregation via Python/Pandas.

## 2. Prerequisites
    - GEE account to run the JavaScript script
    - Access to MODIS Collection 6.1 products: MOD13A2, MOD11A2, MOD15A2H
    - Python 3.x installed

## 3. Dependencies
    - Python packages:
    - pandas >= 1.5
    - openpyxl >= 3.0
    - Google Earth Engine (JavaScript API; run in code editor)

## 4. Step 1: Station-scale extraction in GEE

    ### 4.1 Configuration
    - Define the station name and coordinates:
    ```javascript
        var stationName = 'ALGER_DAR_EL_BEIDA_AG';
        var coordinates = [3.25, 36.7167];
        var bufferRadius = 5000; // 5 km
        var startDate = '2000-01-01';
        var endDate = '2024-12-31';
    ```
    - Create a FeatureCollection for the station buffer.

    ### 4.2 Extraction per temporal resolution
    - 16-day composites: NDVI, EVI, VCI
    - 8-day composites: LAI, FAPAR, LST
    - Compute the mean over the 5 km buffer for each image.

    ### 4.3 Export time series

    - Export two CSV files:
    ```javascript 
        MODIS_TimeSeries_16Day_ALGER_DAR_EL_BEIDA_AG.csv
        MODIS_TimeSeries_8Day_ALGER_DAR_EL_BEIDA_AG.csv
    ```
    - Key columns: name, date, year, month, doy, [variables].


## 5. Step 2: Monthly aggregation in Python

    ### 5.1 Read GEE outputs
    ```python  
        import pandas as pd
        import os
        file_16day = 'MODIS_TimeSeries_16Day_ALGER_DAR_EL_BEIDA_AG.csv'
        file_8day  = 'MODIS_TimeSeries_8Day_ALGER_DAR_EL_BEIDA_AG.csv'
        df_16 = pd.read_csv(file_16day)
        df_8  = pd.read_csv(file_8day)
    ``` 

    ### 5.2 Preprocessing
        - Convert date column to datetime format.
        - Filter out invalid values (NaN or -9999).

    ### 5.3 Compute monthly means
        - Arithmetic mean per station, year, and month:
    ```python
        vars_16 = ['NDVI', 'EVI', 'VCI']
        vars_8  = ['LAI', 'FAPAR', 'LST']

        monthly_16 = df_16.groupby(['name', 'year', 'month'])[vars_16].mean()
        monthly_8  = df_8.groupby(['name', 'year', 'month'])[vars_8].mean()
    ```

    ### 5.4 Merge 8-day and 16-day products
    ```python
        df_monthly = pd.merge(monthly_16, monthly_8, on=['name','year','month'], how='outer')
        df_monthly['date'] = pd.to_datetime(df_monthly[['year','month']].assign(day=1))
    ```

    ### 5.5 Export monthly dataset
    ```python
        output_file = 'Monthly_data/MODIS_Monthly_ALGER_DAR_EL_BEIDA_AG.xlsx'
        df_monthly.to_excel(output_file, index=False)
    ```

## 6. Result
   - One Excel file per station with monthly aggregated MODIS variables.
   - Ready for SPAI validation or any other climatological analysis.

## 7. Best Practices
   - Always check MODIS dates and projections.
   - Ensure GEE exports are downloaded before running Python aggregation.
   - Missing values are coded as -9999 to maintain compatibility.
   - The workflow is modular, allowing processing of multiple stations independently.