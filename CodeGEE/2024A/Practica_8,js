var Estado = ee.FeatureCollection('projects/ee-viacheslavs/assets/LimiteEstatal_2008');
print(Estado);

var centroide_Jalisco = Estado.geometry().centroid();
print(centroide_Jalisco);

var MDE = ee.Image('WWF/HydroSHEDS/03VFDEM').select('b1');
print(MDE);

var MDE_Copernicus = ee.ImageCollection('COPERNICUS/DEM/GLO30')
          .filterBounds(Estado);
print(MDE_Copernicus);

var MDE_Copernicus_ejemplo = MDE_Copernicus.select('DEM').first();
var MDE_Copernicus_proj = MDE_Copernicus_ejemplo.projection();
print(MDE_Copernicus_proj);

var MDE_Copernicus_mosaico = MDE_Copernicus.select('DEM').mosaic();
MDE_Copernicus_mosaico = MDE_Copernicus_mosaico.setDefaultProjection(MDE_Copernicus_proj);

var Agua_Copernicus_mosaico = MDE_Copernicus.select('WBM').mosaic();
Agua_Copernicus_mosaico = Agua_Copernicus_mosaico.setDefaultProjection(MDE_Copernicus_proj);

// eliminar categoria de tierra firme de la capa de cuerpos de agua
var tierra_firme_mascara = Agua_Copernicus_mosaico.neq(0)
Agua_Copernicus_mosaico = Agua_Copernicus_mosaico.updateMask(tierra_firme_mascara)

var sombreado = ee.Terrain.hillshade(MDE_Copernicus_mosaico, 45, 50);
var MDE_Copernicus_clases = MDE_Copernicus_mosaico
        .where(MDE_Copernicus_mosaico.lte(0), 1)
        .where(MDE_Copernicus_mosaico.gt(0).and(MDE_Copernicus_mosaico.lte(50)), 2)
        .where(MDE_Copernicus_mosaico.gt(50).and(MDE_Copernicus_mosaico.lte(300)), 3)
        .where(MDE_Copernicus_mosaico.gt(300).and(MDE_Copernicus_mosaico.lte(600)), 4)
        .where(MDE_Copernicus_mosaico.gt(600).and(MDE_Copernicus_mosaico.lte(1000)), 5)
        .where(MDE_Copernicus_mosaico.gt(1000).and(MDE_Copernicus_mosaico.lte(1500)), 6)
        .where(MDE_Copernicus_mosaico.gt(1500).and(MDE_Copernicus_mosaico.lte(2000)), 7)
        .where(MDE_Copernicus_mosaico.gt(2000).and(MDE_Copernicus_mosaico.lte(3000)), 8)
        .where(MDE_Copernicus_mosaico.gt(3000), 9);
        
var slope = ee.Terrain.slope(MDE_Copernicus_mosaico);
var aspect = ee.Terrain.aspect(MDE_Copernicus_mosaico);

Map.centerObject(centroide_Jalisco, 8);
Map.addLayer(sombreado, {
      min: 0,
      max: 255,
      palette: ['black', 'white']
}, 'Sombreado', true, 1)

Map.addLayer(MDE, {
      min: 0,
      max: 4000,
      palette: ['darkgreen','green','yellow','brown','white']
}, 'MDE WWF', false, 1);

Map.addLayer(MDE_Copernicus_mosaico, {
      min: 0,
      max: 4000,
      palette: ['darkgreen','green','yellow','brown','white']
}, 'MDE Copernicus', true, 0.5);

Map.addLayer(MDE_Copernicus_clases, {
      min: 1,
      max: 9,
      palette: ['#82D2F5','#00552D','#5FAF2D','#A0B95F',
      '#F5E696','#EFC846','#E6A546', '#B46937', '#914B1E']
}, 'MDE Copernicus clases', true, 0.5);

Map.addLayer(Agua_Copernicus_mosaico, {
      min: 1,
      max: 3,
      palette: ['blue','darkblue','darkblue']
}, 'MDE Copernicus agua', true, 0.8);

Map.addLayer(slope, {
      min: 0,
      max: 45,
      palette: ['white','yellow','red']
}, 'Inclinación del terreno', false, 1);

Map.addLayer(aspect, {
      min: 0,
      max: 360,
      palette: ['white','black']
}, 'Orientación de laderas', false, 1);

Map.addLayer(Estado.style({
        'color': 'blue',
        'fillColor': '#00000000',
        'width': 1
        }), {}, 'Jalisco', true, 0.5);
