// Definir punto de interés
var punto_interes = ee.Geometry.Point([-103.76, 19.75])

// Consultar colecciones de imagenes Landsat 8 y Sentinel 2
var sentinel2 = ee.ImageCollection("COPERNICUS/S2").filterBounds(punto_interes)
var landsat8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2").filterBounds(punto_interes)

// Filtrar por intervaqlo de fechas de interés
var sentinel2d = sentinel2.filterDate('2019-04-01', '2019-06-10');
var landsat8d = landsat8.filterDate('2019-04-01', '2019-06-10');

// Filtrar descartando datos con demasiados nubes
var landsat8dc = landsat8d.filter(ee.Filter.lessThan('CLOUD_COVER', 5));
var sentinel2dc = sentinel2d.filter(ee.Filter.lessThan('CLOUD_COVERAGE_ASSESSMENT', 5));

// Explorar el resultado de filtrado
print(sentinel2)
print(sentinel2d)
print(sentinel2dc)
print(landsat8)
print(landsat8d)
print(landsat8dc)

// Función para agregar imagen a ventana de visualización
function addLandsat(ic) { 
  var image = ee.Image(ic.id);
  Map.addLayer(image,
      {
        bands: ['SR_B4', 'SR_B3', 'SR_B2'],
        min: 5000,
        max: 15000
      }, ic.id);
}

function addSentinel(ic) { 
  var image = ee.Image(ic.id);
  Map.addLayer(image,
      {
        bands: ['B4', 'B3', 'B2'],
        min: 0,
        max: 2000
      }, ic.id);
}

// Llamada de función para agragar imgenes a visualización
landsat8dc.evaluate(
  function(landsat8dc) {  
    landsat8dc.features.map(addLandsat)
  }
)

//sentinel2dc.evaluate(
//  function(sentinel2dc) {  
//    sentinel2dc.features.map(addSentinel)
//  }
//)

// Fechas de interés: Sentinel 3 de mayo 2019, 18 mayo 2019 o 23 de mayo 2019
// Calculo de NBR
function calculateSentinelNBR(im) {
  var image = ee.Image(im.id);
  var nir = image.select('B8');
  var swir = image.select('B12');
  var numerator = nir.subtract(swir);
  var denominator = nir.add(swir);
  var nbr = numerator.divide(denominator);
  return nbr.set({
        'name': 'NBR',
        'id': im.id
    });
}

sentinel2dc.evaluate(
  function(sentinel2dc) {  
    var resultado_nbr = sentinel2dc.features.map(calculateSentinelNBR)
    print(resultado_nbr)
    var NBR_antes = resultado_nbr[5]
    var NBR_despues = resultado_nbr[9]
    var NBR_despues2 = resultado_nbr[8]
    var dNBR = NBR_despues.subtract(NBR_antes)
    var dNBR2 = NBR_despues2.subtract(NBR_antes)
    
    Map.addLayer(NBR_antes,
      { palette: ['gray','white','darkgreen'],
        min: -1,
        max: 1
      }, 'NBR antes');  
      
    Map.addLayer(NBR_despues,
      { palette: ['gray','white','darkgreen'],
        min: -1,
        max: 1
      }, 'NBR despues (23.05)');  
      
    Map.addLayer(NBR_despues2,
      { palette: ['gray','white','darkgreen'],
        min: -1,
        max: 1
      }, 'NBR despues (18.05');  

    Map.addLayer(dNBR,
      {
        palette: ['darkred','red','white','white','gray'],
        min: -1,
        max: 1
      }, 'dNBR (23.05)');  
      
    Map.addLayer(dNBR2,
      {
        palette: ['darkred','red','white','white','gray'],
        min: -1,
        max: 1
      }, 'dNBR (18.05)');  
  }
)
