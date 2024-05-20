// Define the center point of the main rectangle
var center = ee.Geometry.Point([-105.3, 20.7]); // Replace with your desired center coordinates

var proj = ee.Projection('EPSG:32613')
print(proj);

// Convert center point to metric projection
var center_metric = center.transform(proj);

// Define the dimensions of the main rectangle
var mainWidth = 1000.0; // in m
var mainLength = 200.0; // in m

// Define the number of zones
var numZonesX = 10;
var numZonesY = 2;

// Calculate the dimensions of each zone
var zoneWidth = mainWidth / numZonesX; // in m
var zoneLength = mainLength / numZonesY; // in m

// Define a function to create a rectangle
function createRectangle(cX, cY, width, length, proj) {
  // cX, cY deben ser ee.Number()
  var halfWidth = width / 2;
  var halfLength = length / 2;
  return ee.Geometry.Rectangle([
    ee.Number(cX).subtract(halfWidth), ee.Number(cY).subtract(halfLength),
    ee.Number(cX).add(halfWidth), ee.Number(cY).add(halfLength)
  ], proj, true, false);
}

// Create the main rectangle's center coordinates (top-left corner)
var centerX = ee.Number(center_metric.coordinates().get(0));
var topLeftX = centerX.subtract(mainWidth / 2);
print(topLeftX);
var centerY = ee.Number(center_metric.coordinates().get(1));
var topLeftY = centerY.add(mainLength / 2);
print(topLeftY)

// Display the main rectangle for reference
//var mainRectangle = createRectangle(center_metric.coordinates().getInfo(), mainWidth, mainLength, proj);
var mainRectangle = createRectangle(centerX, centerY, mainWidth, mainLength, proj);
Map.addLayer(ee.Feature(mainRectangle), {color: 'blue'}, 'Rectangulo principal');

//var zones = ee.List([]);
//for (var i = 1; i <= numZonesX; i++) {
// for (var j = 1; j <= numZonesY; j++) {
   //var zoneCenter = ee.Geometry.Point([topLeftX.getInfo() + (i + 0.5) * zoneWidth,
   //               topLeftX.getInfo() + (j + 0.5) * zoneLength], proj);
//   zones = zones.add(zoneCenter);
// } 
//}

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

// Generar centros de subzonas (puntos)
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

// Convertir puntos de centros de subzonas a poliogonos
var zones = zone_centers.map(function(zone) {
  var zoneRectangle = createRectangle(
              ee.Geometry(zone).coordinates().get(0), 
              ee.Geometry(zone).coordinates().get(1), 
              zoneWidth, zoneLength, proj);
  return zoneRectangle;
});

print(zones);

var zones_features = zones.map(function(zone) {
  return ee.Feature(ee.Geometry(zone))
});

print(zones_features);

print(zones_features.get(1));

var zonesCollection = ee.FeatureCollection(
      zones_features
);

// Print the zones to the console
print(zonesCollection);

//var to_draw = ee.FeatureCollection(ee.Feature(zones.get(1)));



var lista_capas = ['B2','B3','B4','B5','B6','B7','B8'];

// Importar imagen Sentinel 2
var imagen_Sentinel = ee.ImageCollection('COPERNICUS/S2')
    .filterBounds(center)
    .filterDate('2020-03-01', '2020-05-31')
    .first();

// Visualuizar con composición de Falso color
Map.centerObject(center, 12);
Map.addLayer(imagen_Sentinel, {
    bands: ['B8', 'B4', 'B3'],
    min: 0,
    max: 2000
  }, 'Sentinel 2 2020 Falso color');


// Add the zones to the map
//Map.centerObject(center, 16);
Map.addLayer(zonesCollection, {color: 'yellow'}, 'Zones');

