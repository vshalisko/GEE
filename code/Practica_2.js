var nighttime_2014 = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG')
  .filter(ee.Filter.date('2014-05-01', '2014-05-31')).select('avg_rad');

var nighttime_2017 = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG')
  .filter(ee.Filter.date('2017-05-01', '2017-05-31')).select('avg_rad');
  
var nighttime_2023 = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG')
  .filter(ee.Filter.date('2023-05-01', '2023-05-31')).select('avg_rad');

print(nighttime_2014);
print(nighttime_2017);
print(nighttime_2023);

var parametros_avg_rad = {bands: ['avg_rad'], min: 0, max: 100}

Map.setCenter(-99.25, 19.45, 8);
Map.addLayer(nighttime_2014, parametros_avg_rad, 'Luz nocturna 2014');
Map.addLayer(nighttime_2017, parametros_avg_rad, 'Luz nocturna 2017');
Map.addLayer(nighttime_2023, parametros_avg_rad, 'Luz nocturna 2023');

var nighttime_2014_image = ee.Image('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG/20140501')
  .select('avg_rad').rename('2014');
var nighttime_2017_image = ee.Image('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG/20170501')
  .select('avg_rad').rename('2017');
var nighttime_2023_image = ee.Image('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG/20230501')
  .select('avg_rad').rename('2023');
  
print(nighttime_2014_image);
print(nighttime_2017_image);
print(nighttime_2023_image);

var nighttimeChange_2014_2023 = nighttime_2014_image
                                  .addBands(nighttime_2017_image)
                                  .addBands(nighttime_2023_image);
    
print(nighttimeChange_2014_2023);

Map.addLayer(nighttimeChange_2014_2023,
              {min: 0, max: 100},
              'Comparativa luz nocturna 2014-2023');

var rectangulo_recorte = ee.Geometry.Polygon(
        [[[-106.23332166099951, 21.471508793182625],
          [-106.23332166099951, 17.579136282737643],
          [-85.77677869224951, 17.579136282737643],
          [-85.77677869224951, 21.471508793182625]]], null, false);
var projection = nighttime_2014_image.projection().getInfo();
print(projection);
              
Export.image.toDrive({
  image: nighttimeChange_2014_2023,
  description: 'nighttimeChange_2014_2023',
  crs: projection.crs,
  crsTransform: projection.transform,
  region: rectangulo_recorte
});
              
