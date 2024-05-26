// Para fines de administración de trabajo se propone realizar segmentación 
// Cada segmento es un corte elegido de un conjunto de total de zonas 
// De preferencia evitar tener cortes mayores de 50 zonas, ya que por cuestiones de
// velocidad, la cantidad de subzonas que se visualizan simultaneamente se limito a 1000
var slice_start = 11; // inicio de corte de zonas (Enumeración inicia con 1)
var slice_end = 61; // fin de corte de zonas (Laúltima subzona no se incluye en corte)

// Limites de rectangulo delimitados xll, xur, yll, yur
var limites_utm = [640000, 702800, 2255000, 2310000];

// Tamaño de pixel
var pixel = 30;

//Proyeción métrica en sistema EPSG
var proj = ee.Projection('EPSG:32613')
print(proj);

// Prefijo de zona
var prefijo = 'GDL';

// Densidad de muestreo deseable (zonas por 100 km2)
var sampling_density = 100;
//var numero_zonas = 30;  // solución para pruebas

// Tamaño de rectangulo de referencia
var mainWidth = 1000.0; // en m
var mainLength = 200.0; // en m

// Número de subzonas en rectangulo de referenica
var numZonesX = 10;
var numZonesY = 2;

var semilla = 1234; // semilla de generador de números aleatorios

// Construir rectangulo delimitador para realizar el muetreo
var sampleArea = ee.Geometry.Rectangle([limites_utm[0],
                                        limites_utm[2],
                                        limites_utm[1],
                                        limites_utm[3]], 
                            proj, true, false);

// Construir rectangulo sin zona del margen, para evitar zonas que salen fuera
var sampleArea_red = ee.Geometry.Rectangle([limites_utm[0]+0.55*mainWidth,
                                            limites_utm[2]+0.6*mainLength,
                                            limites_utm[1]-0.55*mainWidth,
                                            limites_utm[3]-0.6*mainLength], 
                            proj, true, false);


// Calcular número de zonas
var numero_zonas_estimado = Math.round((limites_utm[1] - limites_utm[0]) * 
                     (limites_utm[3] - limites_utm[2]) / 
                     (sampling_density * 100000))
print('Número de zonas', numero_zonas_estimado);

// Generar puntos aleatorios en área de estudio
var points_geo = ee.FeatureCollection.randomPoints({
    region: sampleArea_red,
    points: numero_zonas_estimado,
    seed: semilla
});

// Reproyectar los puntos aleatorios a coordenadas metricas
// y agregar propiesdad número de zona
var points_metric = points_geo.map(function(point) {
        // obtener indice numerico de elemento en la coleccion y usarlo como numero
        var index = ee.Number.parse(ee.Feature(point).id());
        index = index.add(1);
        // generar id de zona con prefijo
        var prefix_index = ee.String(prefijo).cat(ee.String(index));
        var point_con_id = ee.Feature(ee.Feature(point).geometry(), {'zone': prefix_index});
        return ee.Feature(point_con_id).transform(proj);
});

print(points_metric, 'Puntos aleatorios metricos');
Map.addLayer(sampleArea, {}, 'Area de estudio', false);
Map.addLayer(points_metric, {}, 'Puntos aleatorios', false);

var point_file_name = prefijo.concat('_')
                      .concat(numero_zonas_estimado)
                      .concat('_puntos_aleatorioz_zonas');
print(point_file_name);

// Exportar puntos (FeatureCollection) al archivo KML en Google Drive
Export.table.toDrive({
  collection: points_metric,
  folder: "Colab Data Zones",
  fileNamePrefix: point_file_name,
  description: point_file_name,
  fileFormat: 'KML'
});

// Realizar selección de un subconjunto de puntos par generar zonas
var points_metric_list = points_metric.toList(numero_zonas_estimado);
points_metric_list = points_metric_list.slice(slice_start-1, slice_end-1);
var points_metric_sliced = ee.FeatureCollection(points_metric_list);
print('Número de zonas en corte', points_metric_sliced.size());

points_metric = points_metric_sliced;

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
//print(combinations);

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

// conjunto de puntos de esqiena izquerda superior
var points_topLeft = points_metric.map(function(point) {
  var nombre_zona = ee.Feature(point).get('zone');
  var point_centerX = ee.Number(ee.Feature(point).geometry().coordinates().get(0));
  var point_topLeftX = point_centerX.subtract(mainWidth / 2);
  var point_centerY = ee.Number(ee.Feature(point).geometry().coordinates().get(1));
  var point_topLeftY = point_centerY.add(mainLength / 2);
  return ee.Feature(ee.Geometry.Point([point_topLeftX, point_topLeftY]), {'zone': nombre_zona});
});
print('Lista de coordenadas topLeft', points_topLeft);

// generador de rectangulos de zonas
var rectangulos_zonas = points_metric.map(function (point) {
  var nombre_zona = ee.Feature(point).get('zone');
  var point_centerX = ee.Number(ee.Feature(point).geometry().coordinates().get(0));
  var point_centerY = ee.Number(ee.Feature(point).geometry().coordinates().get(1));
  var rectangulo_geometrias = createRectangle(point_centerX, point_centerY, mainWidth, mainLength, proj);
  return ee.Feature(rectangulo_geometrias, {'zone': nombre_zona})
});

var rectangulos_zonas = ee.FeatureCollection(
      rectangulos_zonas
);
print('Rectangulos de referencia', rectangulos_zonas);
Map.addLayer(rectangulos_zonas, {}, 'Rectangulos de referencia (segmento)', false);

var rectangulos_zonas_file_name = prefijo.concat('_')
                      .concat(numero_zonas_estimado)
                      .concat('_rectangulos_zonas_')
                      .concat(slice_start).concat('_')
                      .concat(slice_end-1);
print(rectangulos_zonas_file_name);

// Exportar seleccion de zonas (FeatureCollection) al archivo KML en Google Drive
Export.table.toDrive({
  collection: rectangulos_zonas,
  folder: "Colab Data Zones",
  fileNamePrefix: rectangulos_zonas_file_name,
  description: rectangulos_zonas_file_name,
  fileFormat: 'KML'
});

// Generar subzonas
var rectangulos_subzonas = points_topLeft.map(
    function(point) {
      var nombre_zona = ee.Feature(point).get('zone');
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
            return ee.Feature(ee.Geometry(subzone), {'zone': nombre_zona, 'subzone': subindex})
      });
      return ee.FeatureCollection(zone_centers_feature.flatten());
});

rectangulos_subzonas = rectangulos_subzonas.flatten();

print(rectangulos_subzonas.limit(1000));
Map.addLayer(rectangulos_subzonas.limit(1000), {color: 'white'}, 'Subzonas', false);

// Exportar seleccion de subzonas (FeatureCollection) al archivo KML en Google Drive
var rectangulos_subzonas_file_name = prefijo.concat('_')
                      .concat(numero_zonas_estimado)
                      .concat('_rectangulos_subzonas_')
                      .concat(slice_start).concat('_')
                      .concat(slice_end-1);
print(rectangulos_subzonas_file_name);

// Exportar seleccion de subzonas (FeatureCollection) al archivo KML en Google Drive
Export.table.toDrive({
  collection: rectangulos_subzonas,
  folder: "Colab Data Zones",
  fileNamePrefix: rectangulos_subzonas_file_name,
  description: rectangulos_subzonas_file_name,
  fileFormat: 'KML'
});


////// Datos de referencia

// Importar imagen Sentinel 2
var imagen_Sentinel = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
    .filterBounds(sampleArea)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 5))
    .filterDate('2020-03-01', '2020-05-31')
    .first();

// Visualuizar con composición de Falso color
Map.centerObject(sampleArea, 12);
Map.addLayer(imagen_Sentinel, {
    bands: ['B8', 'B4', 'B3'],
    min: 0,
    max: 2000
  }, 'Sentinel 2 2020 Falso color', false, 0.5);

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
