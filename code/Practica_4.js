var sfoPoint = ee.Geometry.Point(-105.35, 20.60);
// Importar imagen Sentinel 2
var sfoImage_2020 = ee.ImageCollection('COPERNICUS/S2')
    .filterBounds(sfoPoint)
    .filterDate('2020-03-01', '2020-05-31')
    .first();

// Visualuizar con composición de Falso color
Map.centerObject(sfoPoint, 12);
Map.addLayer(sfoImage_2020, {
    bands: ['B8', 'B4', 'B3'],
    min: 0,
    max: 2000
  }, 'Sentinel 2 Color falso');

// Calcular NDVI
var ndviND_2020 = sfoImage_2020.normalizedDifference(['B8', 'B4']);
Map.addLayer(ndviND_2020, {
    min: -1,
    max: 1,
    palette: ['red', 'white', 'green']
  }, 'NDVI 2020');
  
// Reclasificar NDVI para detectar presencia de agua
var agua_2020 = ndviND_2020.lt(-0.1);
Map.addLayer(agua_2020, {
        min: 0,
        max: 1,
        palette: ['white', 'blue']
  }, 'Tierra vs. Agua 2020');
  
// Reclasificar NDVI para detectar presencia de bosque
var bosque_2020 = ndviND_2020.gt(0.55);
Map.addLayer(bosque_2020, {
        min: 0,
        max: 1,
        palette: ['white', 'green']
  }, 'No-bosque vs. Bosque 2020');

var urbano_2020 = sfoImage_2020.select('B2').gt(1000)
             .and(sfoImage_2020.select('B3').gt(1000))
             .and(sfoImage_2020.select('B4').gt(1000))
             .and(sfoImage_2020.select('B5').gt(1500));
Map.addLayer(urbano_2020, {
        min: 0,
        max: 1,
        palette: ['white', 'gray']
  }, 'No-urbano vs. Uarbano 2020');

// Definir una capa de datos que va a contener los resultados de clasificación  
var clases = ee.Image(1).clip(sfoImage_2020.geometry());
// Aplicar los criterios de árbol de decición en capa de clases
clases = clases.where(agua_2020.eq(1),0)
clases = clases.where(bosque_2020.eq(1),2)
clases = clases.where(urbano_2020.eq(1),3)
Map.addLayer(clases,
    {
        min: 0,
        max: 3,
        palette: ['blue','white','green','gray']
    }, 'Agua, Rural, Bosque, Urbano');
