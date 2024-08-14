// cargar GeoTIFF previamente colocado en Assets
var raster_3_class = ee.Image("projects/ee-viacheslavs/assets/CHP_2000_corrected_ok2");
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
      .where(urbano_bin.eq(1).and(urbano_bin_focal.gt(0.001)).and(urbano_bin_focal.lte(0.25)), 2)
      .where(urbano_bin.eq(1).and(urbano_bin_focal.gt(0.25)).and(urbano_bin_focal.lte(0.5)), 3)
      .where(urbano_bin.eq(1).and(urbano_bin_focal.gt(0.5)), 4)

Map.addLayer(urbano_3class, {
        min: 1,
        max: 4,
        palette: ['white', 'gray', 'orange', 'black']
  }, 'urbano segun Angel', true, 1);
  
var urbanos_suburbanos = urbano_3class.gt(2);
Map.addLayer(urbanos_suburbanos, {
        min: 0,
        max: 1,
        palette: ['white', 'red']
  }, 'urbano y suburbano', false, 1);  

var projection = raster_3_class.projection().getInfo();
print(projection);
print(projection.crs);
              
Export.image.toDrive({
  image: urbano_3class,
  description: 'CHP_2000_urbano_3class',
  folder: "Colab Data Angel",
  crs: projection.crs,
  crsTransform: projection.transform,
  scale: 30,
  region: raster_3_class.geometry()
});

Export.image.toDrive({
  image: urbanos_suburbanos,
  description: 'CHP_2000_urbano_suburbano_juntos',
  folder: "Colab Data Angel",
  crs: projection.crs,
  crsTransform: projection.transform,
  scale: 30,
  region: raster_3_class.geometry()
});

