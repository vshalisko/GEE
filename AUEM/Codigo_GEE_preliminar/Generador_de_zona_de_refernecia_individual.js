////// Ejempolo de rectangulo individual con subzonas (PV)

// Centro de zona de referencia (en coordenadas geográficas)
var center = ee.Geometry.Point([-105.3, 20.7]);

// Código de identificador de la zona
var zone_id = 'PVR9999';

// Proyección metrica por usar (en notación EPSG)
var proj = ee.Projection('EPSG:32613')
print(proj);

// Tamaño de rectangulo de referencia
var mainWidth = 1000.0; // en m
var mainLength = 200.0; // en m

// Número de subzonas en rectangulo de referenica
var numZonesX = 10;
var numZonesY = 2;

// Convertir centro de zona e proyección métrica
var center_metric = center.transform(proj);

// Calcular tamaño de subzonas
var zoneWidth = mainWidth / numZonesX; // en m
var zoneLength = mainLength / numZonesY; // en m

// Determinar coordenadas métricas de la esquina superior izquerda de zona
var centerX = ee.Number(center_metric.coordinates().get(0));
var topLeftX = centerX.subtract(mainWidth / 2);
print(topLeftX);
var centerY = ee.Number(center_metric.coordinates().get(1));
var topLeftY = centerY.add(mainLength / 2);
print(topLeftY)

// Función básica para crea rectangulo a partir del centro
function createRectangle(cX, cY, width, length, proj) {
  // cX, cY deben ser ee.Number()
  // proj debe ser ee.Projection()
  var halfWidth = width / 2;
  var halfLength = length / 2;
  return ee.Geometry.Rectangle([
    ee.Number(cX).subtract(halfWidth), ee.Number(cY).subtract(halfLength),
    ee.Number(cX).add(halfWidth), ee.Number(cY).add(halfLength)
  ], proj, true, false);
}

// Generar y visualizar el rectangulo de zona
var mainRectangle = createRectangle(centerX, centerY, mainWidth, mainLength, proj);
var mainRactangle_feature = ee.Feature(mainRectangle, {'zone': zone_id});
Map.addLayer(mainRactangle_feature, {color: 'blue'}, 'Rectangulo principal');
print(mainRactangle_feature);

var listX = ee.List.sequence(0, numZonesX - 1);
var listY = ee.List.sequence(0, numZonesY - 1);

// Generar el indice de subzonas
var combinations = ee.List(
  listX.iterate(
    function (e1, acc) {
      var pairs = listY.map(
        function (e2) {
          return [e1, e2];
        })
      return ee.List(acc).cat(pairs)
    }, ee.List([]) // the second argument of the iterate is previous state of the list
  )
);
print('Índice de subzonas', combinations);

// Codigo a nivel de cliente que genera subzonas, no se requiere
//var zones = ee.List([]);
//for (var i = 1; i <= numZonesX; i++) {
// for (var j = 1; j <= numZonesY; j++) {
   //var zoneCenter = ee.Geometry.Point([topLeftX.getInfo() + (i + 0.5) * zoneWidth,
   //               topLeftX.getInfo() + (j + 0.5) * zoneLength], proj);
//   zones = zones.add(zoneCenter);
// } 
//}

// Generar centros de subzonas (puntos) de subzona particular
var zone_centers = combinations.map(
  function(i) {
    var xOffset = ee.Number(ee.List(i).get(0)).multiply(zoneWidth);
    var yOffset = ee.Number(ee.List(i).get(1)).multiply(zoneLength);
    var zoneCenter = ee.Geometry.Point([
      topLeftX.add(xOffset).add(zoneWidth / 2),
      topLeftY.subtract(yOffset).subtract(zoneLength / 2)
    ]);
    return zoneCenter;
  }
);
print('Puntos de centros de subzonas', zone_centers);

// Convertir puntos de centros de subzonas a rectangulos
var zones = zone_centers.map(function(zone) {
  var zoneRectangle = createRectangle(
              ee.Geometry(zone).coordinates().get(0), 
              ee.Geometry(zone).coordinates().get(1), 
              zoneWidth, zoneLength, proj);
  return zoneRectangle;
});

print('Rectangulos de subzonas',  zones);

// convertir suboznas a Features
var zones_features = zones.map(function(zone) {
  var index = zones.indexOf(zone);
  index = index.add(1);
  return ee.Feature(ee.Geometry(zone), {'zone':zone_id, 'subzone': index})
});
print('Features de subzonas', zones_features);

// consultar subzona individual
print(zones_features.get(5));

// convertir subzonas a FeatureCollection
var zonesCollection = ee.FeatureCollection(
      zones_features
);
print('Colección de subzonas', zonesCollection);


////// Datos de referencia
// Importar imagen Sentinel 2
var imagen_Sentinel = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
    .filterBounds(center)
    .filterDate('2020-03-01', '2020-05-31')
    .first();

// Visualuizar con composición de Falso color
Map.centerObject(center, 12);
Map.addLayer(imagen_Sentinel, {
    bands: ['B8', 'B4', 'B3'],
    min: 0,
    max: 2000
  }, 'Sentinel 2 2020 Falso color', false, 0.5);

Map.addLayer(ee.Feature(mainRectangle), {color: 'blue'}, 'Rectangulo PV');
Map.addLayer(zonesCollection, {color: 'yellow'}, 'Subzonas PV');

var fvLayer = ui.Map.FeatureViewLayer(
  'GOOGLE/Research/open-buildings/v3/polygons_FeatureView');

var visParams = {
  rules: [
    {
      filter: ee.Filter.expression('confidence >= 0.65 && confidence < 0.7'),
      color: 'FF0000'
    },
    {
      filter: ee.Filter.expression('confidence >= 0.7 && confidence < 0.75'),
      color: 'FFFF00'
    },
    {
      filter: ee.Filter.expression('confidence >= 0.75'),
      color: '00FF00'
    },
  ]
};

fvLayer.setVisParams(visParams);
fvLayer.setShown(false);
fvLayer.setName('Buildings');

Map.add(fvLayer);
Map.setOptions('SATELLITE');
