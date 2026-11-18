# Data and code for "Nighttime Light and Industrial Enclaves: Regency Evidence from Indonesia's Nickel Downstreaming Region"

Anonymized for review. Author information will be added after review.

## How to run
Open `NTL_industrial_regencies_analysis.ipynb` in the folder that contains `data/` and `gee/` and run all cells. The notebook finds the input files by name in these folders, applies every data correction in code while keeping the original values, prints all tables and draws the figures of the manuscript (Figures 1–10), which are also saved in `figures/`. The notebook was executed with Python 3.11, scikit-learn 1.5.2, xgboost 3.0.5, numpy 2.0.2, scipy 1.15.3, pandas 2.2.3, linearmodels 7.1, statsmodels 0.15, geopandas 1.2, matplotlib 3.10 and csdid 0.4.5; the machine-learning candidates of the dynamic nowcast (Section 13) depend on these versions. Sections 12o–12u contain the analyses added during peer review (exploratory).

## Data (`data/`)
- `merged_panel_2015_2025.csv`: balanced panel of 79 regencies and cities, 2015–2025 (GRDP, nighttime light, controls, industrial classification).
- `industrial_facilities.csv`: main facility, facility type, start year and strength of evidence for the 37 industrial regencies and cities (Table 10).
- `GRDP_17_industries_current_prices_2015_2025.csv`: GRDP at current prices by 17 industries for each regency-year, compiled from 90 BPS publications, with source file, page, data status and correction notes for every row (values in million rupiah).
- `VNL_annual_masked_5prov_2015_2025.csv`: annual VIIRS VNL v2 (average_masked) sum of lights per regency, extracted in Google Earth Engine.
- `GRDP_current_constant_prices_2015_2025.xlsx`: total GRDP at current and constant 2010 prices (BPS), with a sheet describing the compilation.
- `GRDP_sectoral_share_BC_2015_2023.xlsx`: shares of mining (B) and manufacturing (C) in GRDP (BPS).
- `climate_ERA5Land_2015_2025.csv`, `cropland_*.csv`, `population_density_2015_2025.xlsx`, `urban_rural_classification_2025.csv`, `NTL_VIIRS_VCMCFG_monthly_mean_2015_2025.csv`: control variables and the earlier monthly light extraction (VCMCFG), used as an alternative light measure (Table 6).
- `admin_boundaries_5prov.geojson`: regency boundaries (FAO GAUL 2024, level 2, harmonized names).

Main column names: `province`, `regency`, `year`, `grdp_current_bn` and `grdp_constant_bn` (GRDP, billion rupiah), `viirs_mean_radiance` (VIIRS radiance from the earlier extraction; replaced in the notebook by the VNL sum of lights), `pop_density_per_km2`, `crops_frac_mean`, `precip_annual_mm`, `tmin_mean_C`, `tmax_mean_C`, `pct_urban`, `industrial_dummy`, `industrial_class`, `start_year`, `data_status` (final, preliminary, very preliminary).

## Google Earth Engine (`gee/`)
- `GEE_climate_ERA5Land.js`: produces `data/climate_ERA5Land_2015_2025.csv` (ERA5-Land daily temperature and precipitation, regency mean at the native ~11 km resolution).
- `GEE_multiscale_NTL.js`: regency light concentration and regency geometry (and the first, seven-site version of the facility zones) (VIIRS VNL v2 average_masked, FAO GAUL 2024 level 2).
- `GEE_multiscale_NTL_v2.js`: facility zones for all ten nickel smelters and estates, with cores of 3, 5 and 10 km and outer radii of 20 and 30 km.
- `ntl_regency_concentration.csv`: sum of lights per regency and year, light from bright pixels (≥5, ≥10, ≥20 nW/cm²/sr), lit and total pixels.
- `regency_geometry.csv`: regency centroid, area and neighbouring regencies (shared border, 1 km tolerance).
- `ntl_facility_rings_10sites.csv`: light in the core, the ring and the rest of the host regency around the ten nickel smelters and estates, 2015–2025, for each set of radii (`spec`; main = `c5_r20`, core 0–5 km and ring 5–20 km).
- `facility_coordinates.csv`: facility points, location precision and sources (Global Energy Monitor for seven sites; Google Maps checked on satellite imagery for GNI, Huadi and Bumi Mineral Sulawesi); the GEE script exports the points as `facility_points_v2.csv`, and this file adds the location sources.

## Results file
`revision_results.json`: written by the notebook (Section 12u, results file); estimates of the analyses added in review, as reported in the manuscript.

## Pre-analysis plans
`Preanalysis_plan_S1_S2.md`, `Preanalysis_plan_H3a_H3b.md`: analysis plans written before the corresponding estimates were computed (see the numbering note at the top of each file).

## Sources
VIIRS Nighttime Lights (Earth Observation Group, via Google Earth Engine); Statistics Indonesia (BPS) regional accounts; Dynamic World; ERA5-Land; FAO GAUL 2024; Global Energy Monitor (facility locations).
