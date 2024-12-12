var Puerto_Vallarta = [-105.268, 20.668];
var La_Bufa = [-104.8277, 20.7183];
//var La_Bufa = [-105.31230223633636, 21.031512558436333];

var transecto_A = ee.Geometry.LineString([Puerto_Vallarta, La_Bufa]);

Map.addLayer(transecto_A, {color: 'red'}, 'Transecto A', true, 1);

var clima = ee.Image("WORLDCLIM/V1/BIO");

var clima_tmedia = clima.select('bio01').multiply(0.1);
var clima_prec = clima.select('bio12').multiply(1);

print(clima_tmedia);
print(clima_prec);

var inicio_transecto_A = ee.FeatureCollection(ee.Geometry.Point(Puerto_Vallarta));
Map.addLayer(inicio_transecto_A, {color: 'red'}, 'Inicio A', true, 1);

// calcular distancias desde el punto de origen
var distancia_A = inicio_transecto_A.distance(60000);
// aplicar mascara de capas de datos de referencia
distancia_A = distancia_A.mask(clima_prec);
Map.addLayer(distancia_A, {min: 0, max: 60000}, 'Distancias PV', true, 0.5);

// conformar conjunto de variables raster
var datos_A = distancia_A
              .addBands(clima_tmedia)
              .addBands(clima_prec);
print('Conjunto de datos A', datos_A);

// Proyeción métrica en sistema EPSG
var proj = ee.Projection('EPSG:32613');
print(proj);

// Reproyectar datos raster a proyección métrica
datos_A = datos_A.reproject(proj, null, 50);

// Realizar muestreo en zona de transecto
var array_A = datos_A
               .reduceRegion({
                geometry: transecto_A,
                reducer: ee.Reducer.toList(),
                scale: 100
              });
print('Resultado de muestreo en transecto', array_A);

// Reordenar variables en orden de aumento de distancia
var array_A_1 = ee.List(array_A.get('distance'));
var array_A_2 = ee.List(array_A.get('bio01'));
var array_A_3 = ee.List(array_A.get('bio12'));
var array_A_ordenado = ee.List([array_A_1.sort(),
                   array_A_2.sort(array_A_1),
                   array_A_3.sort(array_A_1)]);
print('Resultado ordenado de muestreo en transecto', array_A_ordenado);

// Preparar variables para grafica
var x_A = array_A_ordenado.slice(0, 1).get(0);
var y_A = array_A_ordenado.slice(1, 3);

print('X',x_A);
print('Y',y_A);

// Presentación de grafica de líneas
var chart_A = ui.Chart.array.values(y_A, 1, x_A)
              .setChartType('LineChart')
              .setSeriesNames(['T media anual','Precipitación anual'])
              .setOptions({
                title: 'Transecto Puerto Vallarta - La Bufa',
                hAxis: {title: 'Distancia de Puerto Vallarta (m)'},
                vAxes: {
                    0: {title: 'Temperatura (°C)'},
                    1: {title: 'Precipitación (mm)'}
                },
                interpolateNulls: true,
                pointSize: 0,
                colors: ['red', 'blue'],
                lineWidth: 2,
                series: {
                  0: {targetAxisIndex: 0},
                  1: {targetAxisIndex: 1}
                }
              });
print(chart_A);