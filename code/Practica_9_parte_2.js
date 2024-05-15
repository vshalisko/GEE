Map.setCenter(-105.2, 20.7, 7);

//// Definición del transecto A
var Puerto_Vallarta = [-105.267995, 20.668400];
var La_Bufa = [-104.827671, 20.718433];

var transecto_A = ee.Geometry.LineString([Puerto_Vallarta, La_Bufa]);

//// Cargar y visualizar MDE
var DEM_collection = ee.ImageCollection('COPERNICUS/DEM/GLO30')
                    .select('DEM')
                    .filterBounds(transecto_A);

var DEM_proj = DEM_collection.first().projection();
print(DEM_proj);

var elevacion = DEM_collection.mosaic().setDefaultProjection(DEM_proj);
print(elevacion);

//// Cargar y visualizar valore de base de datos climática
//// Verano
var verano = ee.ImageCollection('NASA/ORNL/DAYMET_V4')
                    .filterBounds(transecto_A)
                    .filter(ee.Filter.date('2020-06-01', '2020-08-31'));
var verano_tmax = verano.select('tmax');
var verano_tmin = verano.select('tmin');
var verano_prcp = verano.select('prcp');

print(verano_tmax);

var paleta_temperaturas = {
        min: 0,
        max: 35,
        palette: ['white','green','yellow','orange','red']
};

var paleta_precipitacion = {
        min: 0,
        max: 150,
        palette: ['white','lightblue','blue','darkblue','violet']
};

var verano_tmax_promedio = verano_tmax.reduce(ee.Reducer.mean())
                           .select([0], ['tmax_verano']);
Map.addLayer(verano_tmax_promedio, paleta_temperaturas, 'T max verano', false, 1);                           
var verano_tmin_promedio = verano_tmin.reduce(ee.Reducer.mean())
                           .select([0], ['tmin_verano']);
Map.addLayer(verano_tmin_promedio, paleta_temperaturas, 'T min verano', false, 1);
var verano_prcp_promedio = verano_prcp.reduce(ee.Reducer.mean())
                           .select([0], ['prcp_verano']);
var verano_prcp_promedio30 = verano_prcp_promedio.multiply(30);
var verano_prcp_promedio10 = verano_prcp_promedio.multiply(10);
Map.addLayer(verano_prcp_promedio30, paleta_precipitacion, 'P mensual verano', false, 1); 
var verano_tmedia = verano_tmax_promedio.add(verano_tmin_promedio).divide(2);
verano_tmedia = verano_tmedia.select([0], ['tmean_verano']);

//// Invierno
var invierno = ee.ImageCollection('NASA/ORNL/DAYMET_V4')
                    .filterBounds(transecto_A)
                    .filter(ee.Filter.date('2019-12-01', '2020-02-28'));
var invierno_tmax = invierno.select('tmax');
var invierno_tmin = invierno.select('tmin');
var invierno_prcp = invierno.select('prcp');

var invierno_tmax_promedio = invierno_tmax.reduce(ee.Reducer.mean())
                           .select([0], ['tmax_invierno']);
Map.addLayer(invierno_tmax_promedio, paleta_temperaturas, 'T max invierno', false, 1);                           
var invierno_tmin_promedio = invierno_tmin.reduce(ee.Reducer.mean())
                           .select([0], ['tmin_invierno']);
Map.addLayer(invierno_tmin_promedio, paleta_temperaturas, 'T min invierno', false, 1);
var invierno_prcp_promedio = invierno_prcp.reduce(ee.Reducer.mean())
                           .select([0], ['prcp_invierno']);
var invierno_prcp_promedio30 = invierno_prcp_promedio.multiply(30);
var invierno_prcp_promedio10 = invierno_prcp_promedio.multiply(10);
Map.addLayer(invierno_prcp_promedio30, paleta_precipitacion, 'P mensual invierno', false, 1); 
var invierno_tmedia = invierno_tmax_promedio.add(invierno_tmin_promedio).divide(2);
invierno_tmedia = invierno_tmedia.select([0], ['tmean_invierno']);

//// Consulta de datos sobre temperatura Landsat 8
var landsat8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
                .filterBounds(transecto_A);
print(landsat8)
var temperature10_verano = landsat8.filter(ee.Filter.calendarRange(6, 8, 'month'))
                        .select(['B10'],['temp'])
                        .map(function(image) {
                          return image.subtract(273.15);
                        });
var temperature11_verano = landsat8.filter(ee.Filter.calendarRange(6, 8, 'month'))
                        .select(['B11'],['temp'])
                        .map(function(image) {
                          return image.subtract(273.15);
                        });
var temperature10_invierno = landsat8.filter(ee.Filter.calendarRange(12, 2, 'month'))
                        .select(['B10'],['temp'])
                        .map(function(image) {
                          return image.subtract(273.15);
                        });
var temperature11_invierno = landsat8.filter(ee.Filter.calendarRange(12, 2, 'month'))
                        .select(['B11'],['temp'])
                        .map(function(image) {
                          return image.subtract(273.15);
                        });
var t_landsat10_verano = temperature10_verano
                          .reduce(ee.Reducer.median())
                          .select([0], ['t_landsat_verano']);
var t_landsat10_invierno = temperature10_invierno
                          .reduce(ee.Reducer.median())
                          .select([0], ['t_landsat_invierno']);
var t_landsat11_verano = temperature11_verano
                          .reduce(ee.Reducer.median())
                          .select([0], ['t_landsat_verano']);
var t_landsat11_invierno = temperature11_invierno
                          .reduce(ee.Reducer.median())
                          .select([0], ['t_landsat_invierno']);
                          
var t_landsat_verano = t_landsat10_verano.add(t_landsat11_verano).divide(2);
var t_landsat_invierno = t_landsat10_invierno.add(t_landsat11_invierno).divide(2);
print(t_landsat_verano);
print(t_landsat_invierno);

//// Muestreo en transectos
var inicio_transecto_A = ee.FeatureCollection(ee.Geometry.Point(Puerto_Vallarta));
var distancia_A = inicio_transecto_A.distance(150000);

var datos_A = distancia_A
              .addBands(elevacion)
              .addBands(verano_prcp_promedio10)
              .addBands(verano_tmedia)
              .addBands(invierno_tmedia)
              .addBands(t_landsat_verano)
              .addBands(t_landsat_invierno);
print('Conjunto de datos A', datos_A);

Map.addLayer(elevacion, {min: 0, max: 3000}, 'MDE', true, 1);
Map.addLayer(transecto_A, {color: 'FF0000'}, 'Transectos', true, 1);
Map.addLayer(inicio_transecto_A, {color: '00FF00'}, 'Puerto Vallarta', true, 1);
Map.addLayer(distancia_A, {min: 0, max: 150000}, 'distancia Puerto Valarta', false, 1);

var array_A = datos_A.reduceRegion(ee.Reducer.toList(), transecto_A, 1000)
              .toArray(datos_A.bandNames());
print(array_A);


//// Presentación de gráfica
var x_A = array_A.slice(0, 0, 1).project([1]);
var y_A = array_A.slice(0, 1);
var chart_A = ui.Chart.array.values(y_A, 1, x_A)
              .setChartType('LineChart')
              .setSeriesNames(['Elevación','P de verano (10 dias)','T media verano','T media invierno', 'T landsat verano', 'T landsat invierno'])
              .setOptions({
                title: 'Transecto Puerto Vallarta - La Bufa',
                hAxis: {title: 'Distancia de Puerto Vallara (m)'},
                vAxes: {
                        0: {title: 'Elevacion (msnm)', baselineColor: 'transparent'},
                        1: {title: 'Precipitacion en 10 dias (mm) \nTemperatura (°C)'}
                },
                interpolateNulls: true,
                pointSize: 0,
                colors: ['black', 'blue', 'red', 'green', 'red', 'green'],
                lineWidth: 2,
                series: {
                  0: {targetAxisIndex: 0},
                  1: {targetAxisIndex: 1},
                  2: {targetAxisIndex: 1},
                  3: {targetAxisIndex: 1},
                  4: {targetAxisIndex: 1, lineDashStyle: [2, 2]},
                  5: {targetAxisIndex: 1, lineDashStyle: [2, 2]}
                }
              });
print(chart_A);
