// cargar GeoTIFF previamente colocado en Assets
var raster_3_class = ee.Image("projects/ee-viacheslavs/assets/MID_2010_prediction_corregido");
print(raster_3_class);
Map.addLayer(raster_3_class, {
        min: 0,
        max: 2,
        palette: ['lightgray', 'blue', 'gray']
  }, '3 class', false, 1);

// Realizar clasificación binaria
// aplicar el umbral de clasificacion
var umbral_binario = 1.5;
var urbano_bin = raster_3_class.gt(umbral_binario);
Map.addLayer(urbano_bin, {
        min: 0,
        max: 1,
        palette: ['white', 'red']
  }, 'urbano', false, 1);  
  
// realizar calculo de promedios de 0 y 1 en un radio la capa binaria
var urbano_bin_focal = urbano_bin.focalMean(584, 'circle', 'meters');
print(urbano_bin_focal);
//Map.addLayer(urbano_bin_focal, {
//        min: 0,
//        max: 1,
//        palette: ['white', 'yellow', 'red']
//  }, 'urbano focal', false, 1);

// aplicar esquema de reclasificaciones de pixeles urbanos de Angel et al. (2015)
var urbano_3class = ee.Image(1)
      .where(urbano_bin.eq(1).and(urbano_bin_focal.gt(0)).and(urbano_bin_focal.lte(0.25)), 2)
      .where(urbano_bin.eq(1).and(urbano_bin_focal.gt(0.25)).and(urbano_bin_focal.lte(0.5)), 3)
      .where(urbano_bin.eq(1).and(urbano_bin_focal.gt(0.5)), 4)

var urbanos_suburbanos = urbano_3class.gt(2);

var abierto_marginal = urbanos_suburbanos.focalMax(100, 'circle', 'meters');

var urbano_4class = urbano_3class
    .where(urbano_3class.eq(1).and(abierto_marginal.eq(1)), 5)

//Map.addLayer(abierto_marginal, {
//        min: 0,
//        max: 1,
//        palette: ['white', 'orange']
//  }, 'abierto marginal', false, 1);

//Map.addLayer(urbano_4class, {
//        min: 1,
//        max: 5,
//        palette: ['white', 'gray', 'orange', 'black', 'lightgreen']
//  }, 'urbano y marginal', true, 1);

Map.addLayer(urbano_3class, {
        min: 1,
        max: 4,
        palette: ['white', 'gray', 'orange', 'black']
  }, 'urbano segun Angel', false, 1);
  

Map.addLayer(urbanos_suburbanos, {
        min: 0,
        max: 1,
        palette: ['white', 'red']
  }, 'urbano y suburbano', false, 1);  

var projection = raster_3_class.projection().getInfo();
print(projection);
print(projection.crs);
              
var projection_ok = raster_3_class.projection();
var scale = raster_3_class.projection().nominalScale();

// generar poligonos de espacio abierto excepto marginal
var abierto_vector = abierto_marginal.reduceToVectors({
    geometry: raster_3_class.geometry(),
    crs: projection_ok,
    scale: 30, // scale
    geometryType: 'polygon',
    eightConnected: false,
    labelProperty: 'zone',
    bestEffort: false,
    maxPixels: 1e13,
    tileScale: 3 // In case of error.
});

abierto_vector = abierto_vector.filter(ee.Filter.eq('zone', 0))

// Calcular y agregar area de los poligonos filtrados
var addArea = function(feature) {
  return feature.set({'area': feature.geometry().area({'maxError': 5, 'proj': projection.crs})});
};
abierto_vector = abierto_vector.map(addArea);
// Eliminar el poligono más grande y los poligonos mayores que 200 Ha
var abierto_vector_sorted = abierto_vector.sort('area', false);
var area_maxima = abierto_vector_sorted.first().get('area');
var abierto_vector_capturado = abierto_vector_sorted
                .filter(ee.Filter.neq('area', area_maxima))
                .filter(ee.Filter.lt('area', 2000000));

abierto_vector_capturado = abierto_vector_capturado.map(function(feat) {
    return feat.set('capturado', 1);
});

print(abierto_vector_sorted.size());
print(abierto_vector_capturado.size());
print(abierto_vector_capturado.limit(10));

var abiertoDrawn = abierto_vector_capturado.draw({
    color: 'black',
    strokeWidth: 1
});
Map.addLayer(abiertoDrawn, {}, 'Abierto polygon', false, 0.5);

var abierto_capturado = abierto_vector_capturado.reduceToImage(['capturado'], ee.Reducer.first())
    .unmask();

var urbano_6class = urbano_4class
    .where(urbano_4class.eq(1).and(abierto_capturado.eq(1)), 6);
    
var urbano_7class = urbano_6class
    .where(urbano_6class.eq(1).and(raster_3_class.eq(1)), 7);

var abierto = ee.Image(0)
        .where(urbano_7class.eq(1), 1)
        .where(urbano_7class.eq(5), 5)
        .where(urbano_7class.eq(6), 6);

//Map.addLayer(abierto_capturado, {
//        min: 0,
//        max: 1,
//        palette: ['white', 'pink']
//  }, 'abierto capturado', false, 1);

// clases: 1 - abierto rural, 2 - rural, 3 - suburbano, 4 - urbano,
// 5 - abierto marginal, 6 - abierto capturado, 7 - agua
    
Map.addLayer(urbano_6class, {
        min: 1,
        max: 6,
        palette: ['beige', 'gray', 'orange', 'black', 'lightgreen', 'pink']
  }, 'urbano, abierto', false, 1);    

Map.addLayer(urbano_7class, {
        min: 1,
        max: 7,
        palette: ['beige', 'gray', 'orange', 'black', 'lightgreen', 'pink', 'blue']
  }, 'urbano, abierto y agua', true, 1);
  
Map.addLayer(abierto, {
        min: 0,
        max: 6,
        palette: ['white','beige', 'gray', 'orange', 'black', 'lightgreen', 'pink']
  }, 'abierto', true, 1); 

Export.image.toDrive({
  image: urbano_6class,
  description: 'MID_2010_urbano_abierto_6class',
  folder: "Colab Data Angel",
  crs: projection.crs,
  crsTransform: projection.transform,
  scale: 30,
  region: raster_3_class.geometry()
});

Export.image.toDrive({
  image: urbano_7class,
  description: 'MID_2010_7class',
  folder: "Colab Data Angel",
  crs: projection.crs,
  crsTransform: projection.transform,
  scale: 30,
  region: raster_3_class.geometry()
});

Export.image.toDrive({
  image: abierto,
  description: 'MID_2010_abierto',
  folder: "Colab Data Angel",
  crs: projection.crs,
  crsTransform: projection.transform,
  scale: 30,
  region: raster_3_class.geometry()
});
