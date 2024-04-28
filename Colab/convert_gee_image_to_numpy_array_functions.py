## functions related to conversion of GEE image to mumpy array, in segmented fasion
def segmentation(limits, pixel_size, max_tile_size, proj):
  alto = math.ceil((limits[3] - limits[2]) / pixel_size)
  print('Alto del segmento (pixeles)', alto)
  ancho = math.ceil(max_tile_size / alto)
  print('Ancho del segmento (pixeles)', ancho)
  incremento = ancho * pixel_size
  print('Ancho del segmento (unidades de proyeccion)', incremento)
  seq = list(np.arange(limits[0], limits[1], incremento))
  print('Secuencia de marcas de longitud')
  print(seq)
  segments = []
  for i in range(len(seq)-1):
    #print(seq[i], seq[i+1])
    segment = ee.Geometry.Rectangle([int(seq[i]), limites_utm[2], int(seq[i+1]), limites_utm[3]], proj, True, False)
    #print(segment)
    segments.append(segment)
  return segments

def tile_to_numpy(image, rectangle, bands):
  ## extraccion de bandas en un region rectangular
  image_tile = image.sampleRectangle(region=rectangle,defaultValue=0)
  first_band = image_tile.get(bands[0])
  band_array_np = np.array(first_band.getInfo())
  band_array_np = np.expand_dims(band_array_np, 2)
  for b in bands[1:]:
    b_arr = image_tile.get(b)
    b_arr_np = np.array(b_arr.getInfo())
    b_arr_np = np.expand_dims(b_arr_np, 2)
    #print(b_arr_np.shape)
    #print(band_array_np.shape)
    band_array_np = np.concatenate((band_array_np, b_arr_np), 2)
  return band_array_np

limites_utm = [640453, 702758, 2260275, 2317848]
pixel = 30
max_tile = 250000
utm13 = ee.Projection('EPSG:32613')
bands_L8 = ['SR_B2','SR_B3','SR_B4','SR_B5','SR_B6','SR_B7']
bands_B = ['settlement']

segment_list = segmentation(limites_utm, pixel, max_tile, utm13)

array_feature = tile_to_numpy(L8_image, segment_list[0], bands_L8)
print("New feature array", array_feature.shape)
for segment in segment_list[1:]:
  feature_segment = tile_to_numpy(L8_image, segment, bands_L8)
  print("Feature segment", feature_segment.shape)
  array_feature = np.concatenate((array_feature, feature_segment), 1)
print("Full new feature array", array_feature.shape)

array_target = tile_to_numpy(built_2015_hr_reprojected, segment_list[0], bands_B)
print("New label array", array_target.shape)
for segment in segment_list[1:]:
  target_segment = tile_to_numpy(built_2015_hr_reprojected, segment, bands_B)
  print("Label segment", target_segment.shape)
  array_target = np.concatenate((array_target, target_segment), 1)
print("Full new label array", array_target.shape)
