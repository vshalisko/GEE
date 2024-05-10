var Gdl_2015_float = ee.Image('projects/ee-viacheslavs/assets/Gdl_2015_prediction_float_tif');
print(Gdl_2015_float);
Map.addLayer(Gdl_2015_float, {
        min: 0,
        max: 1,
        palette: ['white', 'yellow', 'red']
  }, 'Gdl 2015 float');
  
var Gdl_2015_bin = Gdl_2015_float.gt(0.5);
Map.addLayer(Gdl_2015_bin, {
        min: 0,
        max: 1,
        palette: ['white', 'red']
  }, 'Gdl 2015 built-up');  
  
var Gdl_2015_bin_focal = Gdl_2015_bin.focalMean(584, 'circle', 'meters');
print(Gdl_2015_bin_focal);
Map.addLayer(Gdl_2015_bin_focal, {
        min: 0,
        max: 1,
        palette: ['white', 'yellow', 'red']
  }, 'Gdl 2015 focal');

var Gdl_2015_bin_3class = ee.Image(1)
      .where(Gdl_2015_bin.eq(1).and(Gdl_2015_bin_focal.gt(0.001)).and(Gdl_2015_bin_focal.lte(0.25)), 2)
      .where(Gdl_2015_bin.eq(1).and(Gdl_2015_bin_focal.gt(0.25)).and(Gdl_2015_bin_focal.lte(0.5)), 3)
      .where(Gdl_2015_bin.eq(1).and(Gdl_2015_bin_focal.gt(0.5)), 4)

Map.addLayer(Gdl_2015_bin_3class, {
        min: 1,
        max: 4,
        palette: ['white', 'gray', 'red', 'blue']
  }, 'Gdl 2015 3 clases de built-up');
