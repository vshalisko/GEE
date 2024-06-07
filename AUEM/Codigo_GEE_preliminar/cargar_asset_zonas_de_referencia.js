////// Cargar datos de referencia en formato SHP Asset

var rectangulos_subzonas = ee.FeatureCollection(
    'projects/ee-viacheslavs/assets/OCT_63_rectangulos_subzonas_41_63_Shapefile');
print(rectangulos_subzonas)


////// No modificar codigo por debajo de esta linea sin necesidad

var sampleArea = rectangulos_subzonas;

Map.centerObject(sampleArea, 12);

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

////// Cargar datos de referencia

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

