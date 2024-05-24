var limites_utm = [640000, 702800, 2255000, 2310000];
var pixel = 30;
var proj = ee.Projection('EPSG:32613')
print(proj);

var prefijo = 'GDL';
var numero_zonas = 30;

// Construir rectangulo delimitador
var sampleArea = ee.Geometry.Rectangle([limites_utm[0],limites_utm[2],
                                        limites_utm[1],limites_utm[3]], 
                            proj, true, false);

// Generar puntos aleatorios en área
var points_geo = ee.FeatureCollection.randomPoints({
    region: sampleArea,
    points: numero_zonas,
    seed: 1234
});

// Reproyectar los puntos aleatorios a coordenadas metricas
var points_metric = points_geo.map(function(point) {
        return ee.Feature(point).transform(proj);
});

print(points_metric, 'Puntos metricos');
Map.addLayer(sampleArea, {}, 'Area de estudio', false);
Map.addLayer(points_metric, {}, 'Puntos aleatorios', false);

// Tamaño de rectangulo de referencia
var mainWidth = 1000.0; // in m
var mainLength = 200.0; // in m

// Número de subzonas en rectangulo de referenica
var numZonesX = 10;
var numZonesY = 2;

// Calcular tamaño de cada rectangulo de referencia
var zoneWidth = mainWidth / numZonesX; // in m
var zoneLength = mainLength / numZonesY; // in m

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
print(combinations);

// Funcion para generar rectangulo a partir de centro (regresa geometria)
function createRectangle(cX, cY, width, length, proj) {
  // cX, cY deben ser ee.Number()
  var halfWidth = width / 2;
  var halfLength = length / 2;
  return ee.Geometry.Rectangle([
    ee.Number(cX).subtract(halfWidth), ee.Number(cY).subtract(halfLength),
    ee.Number(cX).add(halfWidth), ee.Number(cY).add(halfLength)
  ], proj, true, false);
}

// conjunto de puntos de esquena izquerda superior
var points_topLeft = points_metric.map(function(point) {
  // obtener indice numerico de elemento en la coleccion y usarlo como numero
  var index = ee.Number.parse(ee.Feature(point).id());
  index = index.add(1);
  // generar id de zona con prefijo
  var prefix_index = ee.String(prefijo).cat(ee.String(index));
  var point_centerX = ee.Number(ee.Feature(point).geometry().coordinates().get(0));
  var point_topLeftX = point_centerX.subtract(mainWidth / 2);
  var point_centerY = ee.Number(ee.Feature(point).geometry().coordinates().get(1));
  var point_topLeftY = point_centerY.add(mainLength / 2);
  return ee.Feature(ee.Geometry.Point([point_topLeftX, point_topLeftY]), {'zone': prefix_index});
});
print(points_topLeft, 'Lista de coordenadas topLeft');

// generador de rectangulos de zonas
var rectangles_main = points_metric.map(function (point) {
  // obtener indice numerico de elemento en la coleccion y usarlo como numero
  var index = ee.Number.parse(ee.Feature(point).id());
  index = index.add(1);
  // generar id de zona con prefijo
  var prefix_index = ee.String(prefijo).cat(ee.String(index));
  var point_centerX = ee.Number(ee.Feature(point).geometry().coordinates().get(0));
  var point_centerY = ee.Number(ee.Feature(point).geometry().coordinates().get(1));
  var rectangulo_geometrias = createRectangle(point_centerX, point_centerY, mainWidth, mainLength, proj);
  return ee.Feature(rectangulo_geometrias, {'zone': prefix_index})
});

var rectanglesCollection = ee.FeatureCollection(
      rectangles_main
);
print(rectanglesCollection, 'Rectangulos de referencia');
Map.addLayer(rectanglesCollection, {}, 'Rectangulos de referencia', false);

var rectanglesCollectionSubzones = points_topLeft.map(
    function(point) {
      var index = ee.Number.parse(ee.Feature(point).id());
      index = index.add(1);
      // generar id de zona con prefijo
      var prefix_index = ee.String(prefijo).cat(ee.String(index))
      var topLeftX = ee.Number(ee.Feature(point).geometry().coordinates().get(0));
      var topLeftY = ee.Number(ee.Feature(point).geometry().coordinates().get(1));
      var zone_centers = combinations.map(
              function(i) {
              var xOffset = ee.Number(ee.List(i).get(0)).multiply(zoneWidth);
              var yOffset = ee.Number(ee.List(i).get(1)).multiply(zoneLength);
              var zoneCenter = ee.Geometry.Point([
                  topLeftX.add(xOffset).add(zoneWidth / 2),
                  topLeftY.subtract(yOffset).subtract(zoneLength / 2)
              ]);
            return zoneCenter;
      });
      var zone_center_rectangles = zone_centers.map(function(zone) {
            var zoneRectangle = createRectangle(
                ee.Geometry(zone).coordinates().get(0), 
                ee.Geometry(zone).coordinates().get(1), 
                zoneWidth, zoneLength, proj);
            return zoneRectangle;
      });
      var zone_centers_feature = zone_center_rectangles.map(
        function(subzone) {
            var subindex = zone_center_rectangles.indexOf(subzone);
            subindex = subindex.add(1);
            return ee.Feature(ee.Geometry(subzone), {'zone': prefix_index, 'subzone': subindex})
      });
      return ee.FeatureCollection(zone_centers_feature.flatten());
});
print(rectanglesCollectionSubzones.flatten().limit(500));
Map.addLayer(rectanglesCollectionSubzones.flatten().limit(500), {color: 'white'}, 'Subzonas', false);



////// Ejempolo de rectangulo individual con subzonas (PV)

// Centro de zona de referencia
var center = ee.Geometry.Point([-105.3, 20.7]);
var zone_id = 1;

// Convertir a proyeccion metrica
var center_metric = center.transform(proj);
// Create the main rectangle's center coordinates (top-left corner)
var centerX = ee.Number(center_metric.coordinates().get(0));
var topLeftX = centerX.subtract(mainWidth / 2);
print(topLeftX);
var centerY = ee.Number(center_metric.coordinates().get(1));
var topLeftY = centerY.add(mainLength / 2);
print(topLeftY)

// Rectangulo principal
var mainRectangle = createRectangle(centerX, centerY, mainWidth, mainLength, proj);

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
print(zone_centers);

// Convertir puntos de centros de subzonas a rectangulos
var zones = zone_centers.map(function(zone) {
  var zoneRectangle = createRectangle(
              ee.Geometry(zone).coordinates().get(0), 
              ee.Geometry(zone).coordinates().get(1), 
              zoneWidth, zoneLength, proj);
  return zoneRectangle;
});

print(zones);

// convertir a Features
var zones_features = zones.map(function(zone) {
  var index = zones.indexOf(zone);
  index = index.add(1);
  return ee.Feature(ee.Geometry(zone), {'zone':zone_id, 'subzone': index})
});
print(zones_features);
print(zones_features.get(1));

var zonesCollection = ee.FeatureCollection(
      zones_features
);
print(zonesCollection);


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



