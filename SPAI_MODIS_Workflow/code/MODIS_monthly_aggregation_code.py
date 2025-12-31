"""
Monthly Aggregation of MODIS Biophysical Parameters for SPAI Validation

Project: Standardized Pluviothermal Anomaly Index (SPAI)
Author: Khaled Latreche
Year: 2026

Description:
This script performs monthly aggregation of MODIS biophysical variables
(NDVI, EVI, VCI, LAI, FAPAR, LST) extracted at native temporal resolutions
(8-day and 16-day composites) using Google Earth Engine.

Processing:
- Reads MODIS time series exported from GEE (CSV/Excel)
- Separates 8-day and 16-day products by worksheet
- Computes simple arithmetic monthly means
- Filters missing and invalid values (-9999)
- Outputs monthly station-scale datasets for SPAI validation

Output:
- Monthly MODIS biophysical parameters (Excel format)
"""


import pandas as pd
import os

# 1. INPUT FILES (from GEE exports)
# ------------------------------------

station_name = 'ALGER_DAR_EL_BEIDA_AG'

file_16day = f'MODIS_TimeSeries_16Day_{station_name}.csv'
file_8day  = f'MODIS_TimeSeries_8Day_{station_name}.csv'

# Output directory
output_dir = 'Monthly_data'
os.makedirs(output_dir, exist_ok=True)

# 2. READ CSV FILES
# -------------------------------

df_16 = pd.read_csv(file_16day)
df_8  = pd.read_csv(file_8day)

# Convert date column
df_16['date'] = pd.to_datetime(df_16['date'])
df_8['date']  = pd.to_datetime(df_8['date'])

# 3. MONTHLY AGGREGATION
# ----------------------------

vars_16 = ['NDVI', 'EVI', 'VCI']
vars_8  = ['LAI', 'FAPAR', 'LST']

monthly_16 = (
    df_16
    .groupby(['name', 'year', 'month'], as_index=False)[vars_16]
    .mean()
)

monthly_8 = (
    df_8
    .groupby(['name', 'year', 'month'], as_index=False)[vars_8]
    .mean()
)

# 4. MERGE 8-DAY & 16-DAY PRODUCTS
# -------------------------------------

df_monthly = pd.merge(
    monthly_16,
    monthly_8,
    on=['name', 'year', 'month'],
    how='outer'
)

# Monthly timestamp
df_monthly['date'] = pd.to_datetime(
    df_monthly[['year', 'month']].assign(day=1)
)

# Rounding
for col in vars_16 + vars_8:
    df_monthly[col] = df_monthly[col].round(4)

# 5. EXPORT
# -----------------

output_file = os.path.join(
    output_dir,
    f'MODIS_Monthly_{station_name}.xlsx'
)

df_monthly.to_excel(output_file, index=False)

print(f"Monthly MODIS aggregation successfully completed")
print(f"Monthly MODIS dataset exported to: {output_file}")
