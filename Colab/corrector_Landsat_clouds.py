## Método para obtrener un mosaico con nubes recortados

import ee
import geemap
import numpy as np


# Trigger the authentication flow.
ee.Authenticate()

# Initialize the library.
ee.Initialize(project='ee-viacheslavs')

## funcion para eliminar nubes y sombras
def maskCloudsL8(image):
    qa = image.select('QA_PIXEL')
    cloud_shadow_bit_mask = (1 << 3)
    cloud_bit_mask = (1 << 4)
    cloud_mask = qa.bitwiseAnd(cloud_shadow_bit_mask).eq(0).And(qa.bitwiseAnd(cloud_bit_mask).eq(0))
    return image.updateMask(cloud_mask)


L8_collection_2015 = (ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
                      .filterBounds(punto_interes)
                      .filter(ee.Filter.calendarRange(2,5,'month'))
                      .filter(ee.Filter.calendarRange(2015, 2016, 'year'))
                      .filter(ee.Filter.lessThan('CLOUD_COVER', 5)))
print('Capas de datos filtrados 2015:', L8_collection_2015.size().getInfo())

# Cargar un imagen de la colección (Landsat 8).
## requerimos contar con imagen original para obtener datos de proyeccion
L8_image_2015 = L8_collection_2015.first()
image_meta_2015 = L8_image_2015.getInfo()
imagename_2015 = image_meta_2015.get('properties',{}).get('LANDSAT_PRODUCT_ID')
print('Imagen 2015 elegido:', imagename_2015)

## generar el mosaico de 2015
L8_image_2015_mosaic = L8_collection_2015.map(maskCloudsL8).reduce(ee.Reducer.mean())

## Despues de mosaic todos datos no estan en la proyeccion correcta, pero estan en "default projection"
projection = L8_image_2015.projection().getInfo();
print(projection)
print(projection.get('crs'))
print(projection.get('transform'))

L8_image_2015_re = L8_image_2015_mosaic.reproject(projection.get('crs'), projection.get('transform'), None)

Map = geemap.Map()

vizParams_L8_mean = {
  'bands': ['SR_B5_mean', 'SR_B4_mean', 'SR_B3_mean'],
   'min': 5000,
   'max': 15000
  #'gamma': [0.95, 1.1, 1]
}

Map.addLayer(L8_image_2015_re, vizParams_L8_mean, '2015 falso color', True, 1)
