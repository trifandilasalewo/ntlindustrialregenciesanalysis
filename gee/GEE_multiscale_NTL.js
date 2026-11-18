/*  ============================================================================
    Multi-scale nighttime light (Forum Geografi revision: enclave indicators)
    ----------------------------------------------------------------------------
    Produces three CSV files in Google Drive (folder NTL_revision):
      A) ntl_regency_concentration.csv : 79 regencies x 2015-2025
           sum of lights (SOL) and SOL from bright pixels (>=5, >=10, >=20
           nW/cm2/sr), number of lit and of all pixels  -> spatial concentration
      B) regency_geometry.csv          : centroid (lon, lat), area (km2) and the
           list of neighbouring regencies (shared border, 1 km tolerance)
      C) ntl_facility_rings.csv         : for each nickel smelter/estate, SOL in
           the core (0-5 km), adjacent ring (5-20 km) and the rest of the host
           regency, 2015-2025
    Data: VIIRS VNL v2 annual, band average_masked (V21 2015-2021, V22 2022-2025);
          FAO GAUL 2024 level 2 (same sources as the manuscript).
    How to run: paste into code.earthengine.google.com, press Run, then start the
    three tasks in the Tasks tab. Running time is usually 10-30 minutes.
    ============================================================================ */

// ---------------- 1. Settings ----------------
var YEARS = ee.List.sequence(2015, 2025);
var SCALE = 463.83;                         // native VNL v2 pixel size (m)
var THRESH = [5, 10, 20];                   // bright-core thresholds (nW/cm2/sr)
var CORE_KM = 5, RING_KM = 20;              // facility rings
var PROVINCES = ['Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan',
                 'Sulawesi Tenggara', 'Maluku Utara'];

// ---------------- 2. Boundaries ----------------
var adm2 = ee.FeatureCollection('projects/sat-io/open-datasets/FAO/GAUL/GAUL_2024_L2')
  .filter(ee.Filter.eq('gaul0_name', 'Indonesia'))
  .filter(ee.Filter.inList('gaul1_name', PROVINCES));
print('Number of regencies (should be 79):', adm2.size());

// ---------------- 3. Annual VNL v2 image for a year ----------------
var v21 = ee.ImageCollection('NOAA/VIIRS/DNB/ANNUAL_V21').select('average_masked');
var v22 = ee.ImageCollection('NOAA/VIIRS/DNB/ANNUAL_V22').select('average_masked');
function vnl(year) {
  year = ee.Number(year);
  var start = ee.Date.fromYMD(year, 1, 1), end = start.advance(1, 'year');
  var col = ee.ImageCollection(ee.Algorithms.If(year.lte(2021), v21, v22));
  return ee.Image(col.filterDate(start, end).first()).unmask(0).rename('rad');
}

// stack of bands: total radiance, radiance of bright pixels, lit and all pixels
function stack(img) {
  var bands = [img.rename('sol'),
               img.gt(0).rename('n_lit'),
               ee.Image.constant(1).rename('n_px')];
  THRESH.forEach(function (t) {
    bands.push(img.updateMask(img.gte(t)).unmask(0).rename('sol_ge' + t));
  });
  return ee.Image.cat(bands);
}

// ---------------- A. Regency concentration ----------------
var tableA = ee.FeatureCollection(YEARS.map(function (y) {
  var img = stack(vnl(y));
  return img.reduceRegions({collection: adm2, reducer: ee.Reducer.sum(),
                            scale: SCALE, tileScale: 4})
    .map(function (f) {
      return ee.Feature(null, f.toDictionary(['sol', 'n_lit', 'n_px',
                                              'sol_ge5', 'sol_ge10', 'sol_ge20']))
        .set({year: y, regency: f.get('gaul2_name'), province: f.get('gaul1_name')});
    });
})).flatten();
Export.table.toDrive({collection: tableA, description: 'ntl_regency_concentration',
  folder: 'NTL_revision', fileFormat: 'CSV',
  selectors: ['province', 'regency', 'year', 'sol', 'sol_ge5', 'sol_ge10', 'sol_ge20',
              'n_lit', 'n_px']});

// ---------------- B. Centroids, area and neighbours ----------------
var tableB = adm2.map(function (f) {
  var g = f.geometry();
  var nb = adm2.filterBounds(g.buffer(1000, 100))
               .filter(ee.Filter.neq('gaul2_code', f.get('gaul2_code')))
               .aggregate_array('gaul2_name');
  var c = g.centroid(100).coordinates();
  return ee.Feature(null, {
    province: f.get('gaul1_name'), regency: f.get('gaul2_name'),
    lon: c.get(0), lat: c.get(1), area_km2: g.area(100).divide(1e6),
    neighbours: nb.join(';')
  });
});
Export.table.toDrive({collection: tableB, description: 'regency_geometry',
  folder: 'NTL_revision', fileFormat: 'CSV',
  selectors: ['province', 'regency', 'lon', 'lat', 'area_km2', 'neighbours']});

// ---------------- C. Facility rings (nickel smelters and estates) ----------------
// Coordinates and sources are listed in facility_coordinates.csv.
// Rows labelled VERIFY are approximate locations (see the 'precision' column of
// facility_coordinates.csv); rows with lon = null could not be located from open
// sources and are skipped. The labels are kept as they appear in the output files.
var FAC = [
  // id, regency (host), facility, lon, lat
  ['NE1', 'Morowali',          'IMIP, Bahodopi',              122.1551372, -2.8295432],
  ['NE2', 'Halmahera Tengah',  'IWIP, Weda Bay (Lelilef)',    128.0081471,  0.4761609],
  ['NE3', 'Halmahera Selatan', 'Harita Nickel, Kawasi (Obi)', 127.4210337, -1.5614331],
  ['NE4', 'Konawe',            'VDNI / OSS, Morosi',          122.419265,  -3.907537],
  ['NS1', 'Kolaka',            'Antam Pomalaa smelter',       121.592935,  -4.179865],
  ['NS2', 'Luwu Timur',        'PT Vale, Sorowako (VERIFY)',  121.35750,   -2.52028],
  ['NS3', 'Halmahera Timur',   'Antam FeNi, Tanjung Buli (VERIFY)', 128.285273, 0.832508],
  ['NS4', 'Morowali Utara',    'GNI, Bunta, Petasia Timur (FILL IN)', null, null],
  ['NE5', 'Bantaeng',          'Huadi, Pa\'jukukang (FILL IN)', null, null],
  ['NS5', 'Luwu',              'Bumi Mineral Sulawesi, Bua (FILL IN)', null, null]
];
var facilities = ee.FeatureCollection(FAC.filter(function (r) { return r[3] !== null; })
  .map(function (r) {
    return ee.Feature(ee.Geometry.Point([r[3], r[4]]), {fid: r[0], host: r[1], facility: r[2]});
  }));

var zones = facilities.map(function (f) {
  var p = f.geometry();
  // host = regency polygon containing the point (3 km tolerance for coastal sites)
  var host = ee.Feature(adm2.filterBounds(p.buffer(3000, 50))
      .map(function (r) { return r.set('d', r.geometry().distance(p, 50)); })
      .sort('d').first()).geometry();
  var core = p.buffer(CORE_KM * 1000, 50).intersection(host, 50);
  var disc = p.buffer(RING_KM * 1000, 50);
  var ring = disc.difference(p.buffer(CORE_KM * 1000, 50), 50).intersection(host, 50);
  var rest = host.difference(disc, 50);
  return ee.FeatureCollection([
    ee.Feature(core, f.toDictionary().set('zone', 'core_0_5km')),
    ee.Feature(ring, f.toDictionary().set('zone', 'ring_5_20km')),
    ee.Feature(rest, f.toDictionary().set('zone', 'rest_of_host'))
  ]);
}).flatten();

var tableC = ee.FeatureCollection(YEARS.map(function (y) {
  var img = stack(vnl(y));
  return img.reduceRegions({collection: zones, reducer: ee.Reducer.sum(),
                            scale: SCALE, tileScale: 4})
    .map(function (f) {
      return ee.Feature(null, f.toDictionary(['fid', 'host', 'facility', 'zone', 'sol',
                                              'sol_ge10', 'n_lit', 'n_px']))
        .set('year', y);
    });
})).flatten();
Export.table.toDrive({collection: tableC, description: 'ntl_facility_rings',
  folder: 'NTL_revision', fileFormat: 'CSV',
  selectors: ['fid', 'host', 'facility', 'zone', 'year', 'sol', 'sol_ge10', 'n_lit', 'n_px']});

// quick visual check
Map.centerObject(adm2, 6);
Map.addLayer(vnl(2024), {min: 0, max: 20}, 'VNL 2024');
Map.addLayer(zones, {color: 'red'}, 'facility zones');
