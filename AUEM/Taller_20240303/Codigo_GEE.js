var center = ee.Geometry.Point([-105.3, 20.7]);
print(center);

// Consultar imagen de satelite Sentinel
var imagen_Sentinel = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
              .filterBounds(center)
              .filterDate('2020-03-01', '2020-05-31')
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 5))
              .first();
              
print(imagen_Sentinel);
Map.addLayer(imagen_Sentinel, {
      bands: ['B8', 'B4', 'B3'],
      min: 0,
      max: 2000
}, 'Sentinel 2');
Map.addLayer(center, {}, 'Punto de control');
