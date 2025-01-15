//// Script GEE para calculo de densidad de poblacion por poligonos 
//// y representacion en pixeles de espacio construido
//// Insumos: 1) los polígonos de áreas geoestadisticos de la sitius urbanizados
//// (Puede ser AGEBs o manzanas), los poligonos cuentan con datos del censo de población
//// 2) El raster del espacio construido (builtup)
//// Los valores de densidad de población (habitantes por ha) se recalculan para zonas 
//// (pixeles) con presencia del espacio construido

//// Código inspirado en https://spatialthoughts.com/2020/06/19/calculating-area-gee/

// cargar GeoTIFF de espacio construido previamente colocado en Assets
var raster_3_class = ee.Image("projects/ee-viacheslavs/assets/ESE_2020_prediccion_new");
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
print(urbano_bin)
Map.addLayer(urbano_bin, {
        min: 0,
        max: 1,
        palette: ['white', 'red']
  }, 'urbano', false, 1);  
  
////// Cargar datos de censo en formato SHP Asset 
/////  Poligonos (debe contener columnas CVEGEO y csPOBTOT)

var agebs = ee.FeatureCollection(
    'projects/ee-viacheslavs/assets/ENS_censo2020_agebsu1');
print(agebs)

var calculateDensity = function(feature) {
    var areas = ee.Image.pixelArea().addBands(urbano_bin)
    .reduceRegion({
      reducer: ee.Reducer.sum().group({
      groupField: 1,
      groupName: 'b1',
    }),
    geometry: feature.geometry(),
    scale: 10,
    maxPixels: 1e10
    })
 
    var classAreas = ee.List(areas.get('groups'))
    var classAreaLists = classAreas.map(function(item) {
      var areaDict = ee.Dictionary(item)
      var classNumber = ee.Number(
        areaDict.get('b1')).format()
      var area = ee.Number(
        //areaDict.get('sum')).divide(1e6).round()
        areaDict.get('sum'))
      return ee.List([classNumber, area])
    })
 
    var result = ee.Dictionary(classAreaLists.flatten())
    var area_ageb = ee.Number(result.get('1',0)).add(ee.Number(result.get('0',0)))
    var urbano_p = ee.Number(result.get('1',0)).divide(area_ageb)
    var cvegeo = feature.get('CVEGEO')
    var pobtot = feature.get('csPOBTOT')
    var dens = ee.Number(pobtot).divide(ee.Number(result.get('1',0))).multiply(1e4)
    return ee.Feature(
      feature.geometry(),
      result.set('CVEGEO', cvegeo)
            .set('POBTOT', pobtot)
            .set('area_ageb', area_ageb)
            .set('urbano_p', urbano_p)
            .set('densidad', dens)
            )
}
 
var densidad_ageb = agebs.map(calculateDensity);

print(densidad_ageb);

//// Vectorial de agebs
Map.addLayer(densidad_ageb, {}, 'AGEBs', false, 1)

var densidad_ageb_raster = densidad_ageb.reduceToImage({
    properties: ['densidad'],
    reducer: ee.Reducer.first()
});

//// Densidad por AGEB recalculada
Map.addLayer(densidad_ageb_raster, {
      min: 0, 
      max: 500,
      palette: ['white', 'red']
}, 'AGEBs, pers/ha', false, 1);

var urbano_dens = urbano_bin.multiply(densidad_ageb_raster);

//var mask_urbano_dens = urbano_dens.lte(0);
//var urbano_dens_masked = urbano_dens.updateMask(mask_urbano_dens)
var urbano_dens = urbano_dens.unmask(0);

print(urbano_dens);

//// Densidad por pixel
Map.addLayer(urbano_dens, {
      min: 0, 
      max: 500,
      palette: ['white', 'red']
}, 'U dens, pers/ha', false, 1);
