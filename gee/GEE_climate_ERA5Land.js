/*  Annual climate controls per regency/city, 2015-2025 (Forum Geografi manuscript)
    Source : ECMWF/ERA5_LAND/DAILY_AGGR (Munoz-Sabater et al., 2021)
    Units  : precip_annual_mm = sum of daily total_precipitation_sum x 1000
             tmax_mean_C / tmin_mean_C = annual mean of daily max / min 2 m temperature
    Areas  : FAO GAUL 2024 level 2, five provinces; regency mean at 11,132 m
             (native ERA5-Land resolution). This set-up reproduces
             data/climate_ERA5Land_2015_2025.csv (temperature exactly,
             precipitation within 0.13%).                                          */
var YEARS = ee.List.sequence(2015, 2025);
var PROVINCES = ['Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan',
                 'Sulawesi Tenggara', 'Maluku Utara'];
var adm2 = ee.FeatureCollection('projects/sat-io/open-datasets/FAO/GAUL/GAUL_2024_L2')
  .filter(ee.Filter.eq('gaul0_name', 'Indonesia'))
  .filter(ee.Filter.inList('gaul1_name', PROVINCES));
var era5d = ee.ImageCollection('ECMWF/ERA5_LAND/DAILY_AGGR');

var table = ee.FeatureCollection(YEARS.map(function (y) {
  y = ee.Number(y);
  var start = ee.Date.fromYMD(y, 1, 1), d = era5d.filterDate(start, start.advance(1, 'year'));
  var img = ee.Image.cat([
    d.select('temperature_2m_max').mean().subtract(273.15).rename('tmax_mean_C'),
    d.select('temperature_2m_min').mean().subtract(273.15).rename('tmin_mean_C'),
    d.select('total_precipitation_sum').sum().multiply(1000).rename('precip_annual_mm')
  ]).toFloat();
  return img.reduceRegions({collection: adm2, reducer: ee.Reducer.mean(), scale: 11132, tileScale: 8})
    .map(function (f) {
      return ee.Feature(null, {province: f.get('gaul1_name'), regency: f.get('gaul2_name'), year: y,
        tmax_mean_C: f.get('tmax_mean_C'), tmin_mean_C: f.get('tmin_mean_C'),
        precip_annual_mm: f.get('precip_annual_mm')});
    });
})).flatten();

Export.table.toDrive({collection: table, description: 'climate_ERA5Land_2015_2025',
  fileFormat: 'CSV',
  selectors: ['province', 'regency', 'year', 'tmax_mean_C', 'tmin_mean_C', 'precip_annual_mm']});
