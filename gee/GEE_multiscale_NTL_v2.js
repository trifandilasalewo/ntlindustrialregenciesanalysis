/*  ============================================================================
    Multi-scale nighttime light, version 2 (10 nickel smelters and estates)
    ----------------------------------------------------------------------------
    What is new compared with version 1
      1. The three sites missing in version 1 (GNI in Morowali Utara, Huadi /
         Bantaeng Industrial Park in Bantaeng, Bumi Mineral Sulawesi in Luwu)
         are added. Their points are placed by you on the satellite basemap
         (step 1 below), because open sources give only the village.
      2. Rings are computed for several radii, so the results can be shown to
         be robust to the choice of 5 km and 20 km:
            core 0-3 km  + ring 3-20 km
            core 0-5 km  + ring 5-20 km   (main, as in the manuscript)
            core 0-10 km + ring 10-20 km
            core 0-5 km  + ring 5-30 km
      3. Optional: if you draw the outline of an estate (step 2), the estate
         polygon is used as the core instead of a circle ("estate_polygon"
         specification), which answers the "single point" limitation.

    STEP 1 (required, about 10 minutes) - place the three missing points
      a. Paste this script into code.earthengine.google.com and press Run.
      b. Switch the map to "Satellite". Use the search box at the top of the
         map to go to each place below. The smelters are large grey/black
         industrial complexes with stacks and a jetty, and they are among the
         brightest spots in the "VNL 2024" layer that this script adds.
            GNI   : Bunta village, Petasia Timur district, Morowali Utara
                    (captive coal plant in the neighbouring village Tanauge)
            Huadi : Bantaeng Industrial Park (KIBA), Papan Loe village,
                    Pa'jukukang district, Bantaeng
            BMS   : PT Bumi Mineral Sulawesi smelter, Bua district, Luwu
      c. Open the "Inspector" tab, click on the centre of the smelter
         buildings, and copy the longitude and latitude into SITE_POINTS
         below (replace the nulls). Press Run again.
    STEP 2 (optional) - estate outlines
      Use the polygon tool to draw the fenced industrial area of an estate,
      rename the import to the site id (e.g. NE1), and add it to
      ESTATE_POLYGONS below, e.g.  var ESTATE_POLYGONS = {NE1: NE1, NE2: NE2};
    STEP 3 - start the tasks in the Tasks tab and send the two CSV files:
      ntl_facility_rings_10sites.csv and facility_points_v2.csv
    ============================================================================ */

// ---------------- STEP 1: fill in these three points ----------------
var SITE_POINTS = {
  NS4: [121.4373, -2.0059],   // GNI, Bunta, Morowali Utara   (2 00 21 S, 121 26 14 E)
  NE5: [120.0567, -5.5633],   // Huadi, KIBA, Bantaeng         (5 33 48 S, 120 03 24 E)
  NS5: [120.2367, -3.1328]    // BMS, Bua, Luwu                (3 07 58 S, 120 14 12 E)
};
// ---------------- STEP 2 (optional) ----------------
var ESTATE_POLYGONS = {};

// ---------------- Settings ----------------
var YEARS = ee.List.sequence(2015, 2025);
var SCALE = 463.83;
var SPECS = [  // [name, core radius km, outer ring radius km]
  ['c3_r20', 3, 20], ['c5_r20', 5, 20], ['c10_r20', 10, 20], ['c5_r30', 5, 30]];
var PROVINCES = ['Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan',
                 'Sulawesi Tenggara', 'Maluku Utara'];
var adm2 = ee.FeatureCollection('projects/sat-io/open-datasets/FAO/GAUL/GAUL_2024_L2')
  .filter(ee.Filter.eq('gaul0_name', 'Indonesia'))
  .filter(ee.Filter.inList('gaul1_name', PROVINCES));

var v21 = ee.ImageCollection('NOAA/VIIRS/DNB/ANNUAL_V21').select('average_masked');
var v22 = ee.ImageCollection('NOAA/VIIRS/DNB/ANNUAL_V22').select('average_masked');
function vnl(year) {
  year = ee.Number(year);
  var start = ee.Date.fromYMD(year, 1, 1), end = start.advance(1, 'year');
  var col = ee.ImageCollection(ee.Algorithms.If(year.lte(2021), v21, v22));
  return ee.Image(col.filterDate(start, end).first()).unmask(0).rename('rad');
}
function stack(img) {
  return ee.Image.cat([img.rename('sol'), img.updateMask(img.gte(10)).unmask(0).rename('sol_ge10'),
                       img.gt(0).rename('n_lit'), ee.Image.constant(1).rename('n_px')]);
}

// ---------------- Facilities (sources in facility_coordinates.csv) ----------------
var FAC = [
  ['NE1', 'Morowali',          'IMIP, Bahodopi',                        122.1551372, -2.8295432, 'exact (GEM)'],
  ['NE2', 'Halmahera Tengah',  'IWIP, Weda Bay (Lelilef)',              128.0081471,  0.4761609, 'exact (GEM)'],
  ['NE3', 'Halmahera Selatan', 'Harita Nickel, Kawasi (Obi)',           127.4210337, -1.5614331, 'exact (GEM)'],
  ['NE4', 'Konawe',            'VDNI / OSS, Morosi',                    122.419265,  -3.907537,  'exact (GEM)'],
  ['NS1', 'Kolaka',            'Antam Pomalaa smelter',                 121.592935,  -4.179865,  'exact (GEM)'],
  ['NS2', 'Luwu Timur',        'PT Vale, Sorowako',                     121.35750,   -2.52028,   'approximate (town centre)'],
  ['NS3', 'Halmahera Timur',   'Antam FeNi, Tanjung Buli',              128.285273,   0.832508,  'approximate (planned plant, GEM)'],
  ['NS4', 'Morowali Utara',    'GNI, Bunta, Petasia Timur',             null, null, 'Google Maps location, checked on satellite basemap'],
  ['NE5', 'Bantaeng',          'Huadi / Bantaeng Industrial Park',      null, null, 'Google Maps location, checked on satellite basemap'],
  ['NS5', 'Luwu',              'Bumi Mineral Sulawesi, Bua',            null, null, 'Google Maps location, checked on satellite basemap']
];
var rows = FAC.map(function (r) {
  var pt = SITE_POINTS[r[0]];
  if (r[3] === null && pt) { r = r.slice(); r[3] = pt[0]; r[4] = pt[1]; }
  return r;
}).filter(function (r) { return r[3] !== null; });
print('Sites included:', rows.length, '(10 when step 1 is done)');

var facilities = ee.FeatureCollection(rows.map(function (r) {
  return ee.Feature(ee.Geometry.Point([r[3], r[4]]),
                    {fid: r[0], host: r[1], facility: r[2], lon: r[3], lat: r[4], precision: r[5]});
}));

function hostOf(p) {
  return ee.Feature(adm2.filterBounds(p.buffer(3000, 50))
    .map(function (r) { return r.set('d', r.geometry().distance(p, 50)); })
    .sort('d').first()).geometry();
}

var zoneList = [];
rows.forEach(function (r) {
  var p = ee.Geometry.Point([r[3], r[4]]);
  var host = hostOf(p);
  var props = {fid: r[0], host: r[1], facility: r[2]};
  var specs = SPECS.slice();
  if (ESTATE_POLYGONS[r[0]]) specs.push(['estate_polygon', null, 15]);
  specs.forEach(function (s) {
    var inner, outer;
    if (s[0] === 'estate_polygon') {
      inner = ee.Geometry(ESTATE_POLYGONS[r[0]]);
      outer = inner.buffer(s[2] * 1000, 50);
    } else {
      inner = p.buffer(s[1] * 1000, 50);
      outer = p.buffer(s[2] * 1000, 50);
    }
    var core = inner.intersection(host, 50);
    // ring = outer disc minus the full inner disc (not minus core, which would leave slivers at the core edge)
    var ring = outer.difference(inner, 50).intersection(host, 50);
    var rest = host.difference(outer, 50);
    [['core', core], ['ring', ring], ['rest_of_host', rest]].forEach(function (z) {
      zoneList.push(ee.Feature(z[1], props).set({spec: s[0], zone: z[0]}));
    });
  });
});
var zones = ee.FeatureCollection(zoneList);

var table = ee.FeatureCollection(YEARS.map(function (y) {
  return stack(vnl(y)).reduceRegions({collection: zones, reducer: ee.Reducer.sum(),
                                      scale: SCALE, tileScale: 4})
    .map(function (f) {
      return ee.Feature(null, f.toDictionary(['fid', 'host', 'facility', 'spec', 'zone',
                                              'sol', 'sol_ge10', 'n_lit', 'n_px'])).set('year', y);
    });
})).flatten();

Export.table.toDrive({collection: table, description: 'ntl_facility_rings_10sites', folder: 'NTL_revision',
  fileFormat: 'CSV', selectors: ['fid', 'host', 'facility', 'spec', 'zone', 'year', 'sol', 'sol_ge10', 'n_lit', 'n_px']});
Export.table.toDrive({collection: facilities.map(function (f) { return ee.Feature(null, f.toDictionary()); }),
  description: 'facility_points_v2', folder: 'NTL_revision', fileFormat: 'CSV',
  selectors: ['fid', 'host', 'facility', 'lon', 'lat', 'precision']});

Map.setOptions('SATELLITE');
Map.centerObject(adm2, 6);
Map.addLayer(vnl(2024), {min: 0, max: 30, palette: ['000000', 'ffff00', 'ffffff']}, 'VNL 2024', true, 0.6);
Map.addLayer(adm2.style({color: 'white', fillColor: '00000000', width: 1}), {}, 'regencies');
Map.addLayer(facilities, {color: 'red'}, 'facility points');
Map.addLayer(facilities.filter(ee.Filter.inList('fid', ['NS4', 'NE5', 'NS5'])), {color: 'cyan'}, 'new points (check)');
Map.addLayer(zones.filter(ee.Filter.eq('spec', 'c5_r20')), {color: 'cyan'}, 'main rings', false);
