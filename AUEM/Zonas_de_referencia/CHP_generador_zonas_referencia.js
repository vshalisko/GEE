// Para fines de administración de trabajo se propone realizar segmentación 
// Cada segmento es un corte elegido de un conjunto de total de zonas 
// Sugerencias de cortes: 1-20, 21-40, 41-60...
// De preferencia evitar cortes mayores de 50 zonas, ya que por cuestiones de
// velocidad, la cantidad de subzonas que se visualizan simultaneamente se limita a 1000
var slice_start = 1; // inicio de corte segmento (enumeración inicia con 1)
var slice_end = 20; // fin de corte de segmento (última subzona incluida en corte)

// Limites del rectangulo delimitados xll, xur, yll, yur en coordenadas métricas
// Nota: modificación de los valores aqui resultara en cambio de ubicación 
// y enumeración de las zonas de referencia generadas
var limites_utm = [675000, 690584, 2243845, 2247123];

// coordenadas geográficas del centro de circulo de mayor densidad de puntos
var centro = ee.Geometry.Point([-103.19311594152542, 20.289329365002367]);
// radio del circulo en m
var radius = 500;

//Proyeción métrica en sistema EPSG
var proj = ee.Projection('EPSG:32613')
//print(proj);

// Prefijo de área de estudio
var prefijo = 'CHP';

// Densidad de muestreo deseable (zonas por km2)
var sampling_density = 0.1;

/////// No modificar codigo por debajo de este línea en caso que no sabes que hacer

// Tamaño de pixel
//var pixel = 30;

// Tamaño de rectangulo de referencia
var mainWidth = 1000.0; // en m
var mainLength = 200.0; // en m

// Número de subzonas en rectangulo de referenica
var numZonesX = 10;
var numZonesY = 2;

// semilla de generador de números aleatorios
var semilla = 1234; 

// factor de redundancia en generación de puntos antes de filtrado
var redundancy = 10;

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

// Construir un circulo de la zona con mayor densidad de puntos
centro = centro.transform(proj);
var sampleCircle = centro.buffer({'distance': radius, 'proj': proj});
//print(sampleCircle);

// Calcular número de zonas
var numero_zonas_estimado = Math.round((limites_utm[1] - limites_utm[0]) * 
                     (limites_utm[3] - limites_utm[2]) * sampling_density / 
                     100000)
print('Número total de zonas en área de estudio', numero_zonas_estimado);


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

// Generar puntos aleatorios en área de estudio
// Nota: una parte de puntos se va a descartar, se requiere tener 
// mas puntos para quedar al final con cantidad requerida, el exceso de puntos 
// queda definido en la variable redundancy
// Opcion 1) Puntos con distribucion uniforme en el rectangulo de área de estudio
//var numero_zonas_con_redundancia = redundancy * numero_zonas_estimado;
//var points_geo = ee.FeatureCollection.randomPoints({
//    region: sampleArea_red,
//    points: numero_zonas_con_redundancia,
//    seed: semilla
//});

// Opcion 2) Generar puntos aleatorios con mayor concentracion 
// en circulo central (65% de puntos) y menor en el rectangulo completo (35%)
var numero_zonas_circulo = Math.round(redundancy * 0.65 * numero_zonas_estimado);
var numero_zonas_fuera = redundancy * numero_zonas_estimado - numero_zonas_circulo;
var points_geo_circle = ee.FeatureCollection.randomPoints({
    region: sampleCircle,
    points: numero_zonas_circulo,
    seed: semilla
});
var points_geo_general = ee.FeatureCollection.randomPoints({
    region: sampleArea_red,
    points: numero_zonas_fuera,
    seed: semilla
});
var points_geo = points_geo_circle.merge(points_geo_general);
points_geo = points_geo.randomColumn('random', semilla);
points_geo = points_geo.sort('random');

// filtrar y descartar puntos muy cercanos
// existed dos posibles estrategias de filtrado:
// 1) con zona buffer circular definida en variable distance
// 2) con zonas rectangulares desde el centro de rectangulo 
// definidas por ancho, alto y amortiguamiento adicional
var filterDistance = function(points) {
  // var distance = 700;   // m, se usa con buffer circular
  var ahcho_buffer = 0.018;
  var alto_buffer = 0.006;
  var margen_buffer = 0.001;
  var filt2 = ee.List([]);
  var filt = points.iterate(function(el, inic){
                         var ini = ee.List(inic);
                         var fcini = ee.FeatureCollection(ini);
                         // alternativa 1) buffer circular
                         // var buf = ee.Feature(el).geometry().buffer(distance);
                         // alternativa 2) buffer rectangular
                         // distancias para caso de rectangulo van en coordenadas geograficas
                         var point_centerX = ee.Number(ee.Feature(el).geometry().coordinates().get(0));
                         var point_centerY = ee.Number(ee.Feature(el).geometry().coordinates().get(1));
                         var buf = ee.Geometry(createRectangle(point_centerX, point_centerY, ahcho_buffer, alto_buffer))
                                    .buffer(margen_buffer);
                         var s = fcini.filterBounds(buf).size();
                         var cond = s.lte(0);
                         return ee.Algorithms.If(cond, ini.add(el), ini);
                       }, filt2);
  var filtered = ee.FeatureCollection(ee.List(filt));
  return filtered;
};
var points_geo = filterDistance(points_geo);

// reducir el conjunto al número de puntos deseable
points_geo = points_geo.limit(numero_zonas_estimado);

// Homogenizar dos Feature Collecitons y asignar indice simple
var points_geo_idList = ee.List.sequence(0,points_geo.size().subtract(1));
var points_geo_list = points_geo.toList(points_geo.size());
var points_geo = ee.FeatureCollection(points_geo_idList.map(function(newSysIndex){
  var feat = ee.Feature(points_geo_list.get(newSysIndex));
  // format number to string (system:index must be a string)
  var indexString = ee.Number(newSysIndex).format('%03d')
  return feat.set('system:index', indexString, 'ID', indexString);
}));

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

Map.centerObject(sampleArea, 12);
Map.addLayer(sampleArea, {}, 'Area de estudio', false);
Map.addLayer(sampleCircle, {}, 'Circulo de estudio', false);
Map.addLayer(points_metric, {}, 'Puntos aleatorios', false);

// Exportar puntos (FeatureCollection) al archivo KML en Google Drive
var point_file_name = prefijo.concat('_')
                      .concat(numero_zonas_estimado)
                      .concat('_puntos_aleatorioz_zonas');
//print(point_file_name);

Export.table.toDrive({
  collection: points_metric,
  folder: "Colab Data Zones",
  fileNamePrefix: point_file_name,
  description: point_file_name,
  fileFormat: 'KML'
});

// Realizar selección de un subconjunto de puntos par generar subzonas
var points_metric_list = points_metric.toList(numero_zonas_estimado);
points_metric_list = points_metric_list.slice(slice_start-1, slice_end);
var points_metric_sliced = ee.FeatureCollection(points_metric_list);
print('Corte de zonas de '.concat(slice_start).concat(' a ').concat(slice_end));
print('Número de zonas en corte', points_metric_sliced.size());

print('Puntos aleatorios completos', points_metric);
print('Puntos aleatorios en corte', points_metric_sliced);

// Calcular tamaño de cada rectangulo de referencia
var zoneWidth = mainWidth / numZonesX; // in m
var zoneLength = mainLength / numZonesY; // in m

var listX = ee.List.sequence(0, numZonesX - 1);
var listY = ee.List.sequence(0, numZonesY - 1);

// Generar el indice de subzonas
var combinations = ee.List(
  listY.iterate(
    function (e1, acc) {
      var pairs = listX.map(
        function (e2) {
          return [e2, e1];
        })
      return ee.List(acc).cat(pairs)
    }, ee.List([]) // the second argument of the iterate is previous state of the list
  )
);
//print(combinations);

// generador de rectangulos de las zonas
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
Map.addLayer(rectangulos_zonas, {}, 'Rectangulos de referencia', false);

// Exportar zonas (FeatureCollection) al archivo KML en Google Drive
var rectangulos_zonas_file_name = prefijo.concat('_')
                      .concat(numero_zonas_estimado)
                      .concat('_rectangulos_zonas')
//print(rectangulos_zonas_file_name);

Export.table.toDrive({
  collection: rectangulos_zonas,
  folder: "Colab Data Zones",
  fileNamePrefix: rectangulos_zonas_file_name,
  description: rectangulos_zonas_file_name,
  fileFormat: 'KML'
});

// asignar el corte de subzonas
points_metric = points_metric_sliced;

// conjunto de puntos de esqiena izquerda superior (aplicando el corte de zonas)
var points_topLeft = points_metric.map(function(point) {
  var nombre_zona = ee.Feature(point).get('zone');
  var point_centerX = ee.Number(ee.Feature(point).geometry().coordinates().get(0));
  var point_topLeftX = point_centerX.subtract(mainWidth / 2);
  var point_centerY = ee.Number(ee.Feature(point).geometry().coordinates().get(1));
  var point_topLeftY = point_centerY.add(mainLength / 2);
  return ee.Feature(ee.Geometry.Point([point_topLeftX, point_topLeftY]), {'zone': nombre_zona});
});
print('Lista de coordenadas topLeft en corte', points_topLeft);

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
            var nombre_kml = ee.String(nombre_zona).cat(ee.String('_')).cat(ee.String(subindex));
            return ee.Feature(ee.Geometry(subzone), {'Name': nombre_kml,
                                                     'subzone': subindex, 
                                                     'zone': nombre_zona})
      });
      return ee.FeatureCollection(zone_centers_feature.flatten());
});

rectangulos_subzonas = rectangulos_subzonas.flatten();

// se imprimen máximo 100 elementos, para accelerar el proceso
print(rectangulos_subzonas.limit(100));

// Exportar corte de subzonas (FeatureCollection) al archivo KML en Google Drive
var rectangulos_subzonas_file_name = prefijo.concat('_')
                      .concat(numero_zonas_estimado)
                      .concat('_rectangulos_subzonas_')
                      .concat(slice_start).concat('_')
                      .concat(slice_end);
//print(rectangulos_subzonas_file_name);

Export.table.toDrive({
  collection: rectangulos_subzonas,
  folder: "Colab Data Zones",
  fileNamePrefix: rectangulos_subzonas_file_name,
  description: rectangulos_subzonas_file_name,
  fileFormat: 'KML'
});

////// Consultar datos de subzonas y presentarlos en un panel
function getProps(loc) {
  loc = ee.Dictionary(loc);
  var point = ee.Geometry.Point(loc.getNumber('lon'), loc.getNumber('lat'));
  var thisFeature = rectangulos_subzonas.filterBounds(point).first();
  var props = thisFeature.toDictionary();
  
  props.evaluate(function(props) {
    var str = 'Datos de subzona:\n';
    if (props === undefined || props === null) { 
      return null; 
    } else {
      Object.keys(props).forEach(function(i) {
          str = str + i + ': ' + props[i] + '\n';
      });
      info.setValue(str);
    }
  });
}

var panel = ui.Panel({style: {position: 'bottom-left', width: '300px', height: '110px'}});
var info = ui.Label({value: 'Click en subzona para conocer sus datos\n(respuesta puede tardar)', style: {whiteSpace: 'pre'}});
panel.add(info);

Map.add(panel);
Map.style().set('cursor', 'crosshair');
Map.onClick(getProps);


////// Datos de referencia

// Importar imagen Sentinel 2
var imagen_Sentinel_2020 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
    .filterBounds(sampleArea)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 5))
    .filterDate('2020-03-01', '2020-05-31')
    //.first();
    
var imagen_Sentinel_2020_composite = imagen_Sentinel_2020.median();

// Visualuizar con composición de Falso color
Map.addLayer(imagen_Sentinel_2020_composite, {
    bands: ['B8', 'B4', 'B3'],
    min: 0,
    max: 2500
  }, 'Sentinel 2 2020 Falso color', false, 1);
  
  
// Importar imagen Landsat 5 2010
var imagen_L5_2010 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
    .filterBounds(sampleArea)
    .filter(ee.Filter.lt('CLOUD_COVER', 5))
    .filterDate('2010-01-01', '2010-05-31')
    //.first();
    
var imagen_L5_2010_composite = imagen_L5_2010.median();

// Visualuizar con composición de Falso color
Map.addLayer(imagen_L5_2010_composite, {
    bands: ['SR_B4', 'SR_B3', 'SR_B2'],
    min: 6000,
    max: 18000
  }, 'Landsat 5 2010 Falso color', false, 1);
  
var imagen_L7_2000_pan = ee.ImageCollection("LANDSAT/LE07/C02/T1_TOA")
    .filterBounds(sampleArea)
    .filter(ee.Filter.lt('CLOUD_COVER', 5))
    .filterDate('2000-01-01', '2000-05-31')
    .select(['B8']);
var imagen_L7_2000_pan_composite = imagen_L7_2000_pan.median();

// Visualuizar con composición de gris
Map.addLayer(imagen_L7_2000_pan_composite, {
    bands: ['B8'],
    min: 0.0,
    max: 0.4,
    gamma: 1.2,
  }, 'Landsat 7 2000 Panchromatic', false, 1);

// Importar imagen Landsat 5 2000
var imagen_L5_2000 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
    .filterBounds(sampleArea)
    .filter(ee.Filter.lt('CLOUD_COVER', 5))
    .filterDate('2000-01-01', '2000-05-31')
    //.first();
    
var imagen_L5_2000_composite = imagen_L5_2000.median();

// Visualuizar con composición de Falso color
Map.addLayer(imagen_L5_2000_composite, {
    bands: ['SR_B4', 'SR_B3', 'SR_B2'],
    min: 6000,
    max: 20000
  }, 'Landsat 5 2000 Falso color', false, 1);

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

Map.addLayer(rectangulos_subzonas.limit(1000), {color: 'yellow'}, 'Subzonas', true, 0.8);


