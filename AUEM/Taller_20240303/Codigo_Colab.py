## Configuración del entorno
import ee
import geemap

# Autentificación en GEE - Trigger the authentication flow.
ee.Authenticate()

# Inicialización de proyecto GEE - Initialize the library.
ee.Initialize(project='ee-viacheslavs')

## Generar un punto
center = ee.Geometry.Point([-105.3, 20.7])
print(center)

## filtrado de datos Landsat 8
L8_collection_2020 = (ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
                      .filterBounds(center)
                      .filterDate('2020-03-01', '2020-05-31')
                      .filter(ee.Filter.lessThan('CLOUD_COVER', 1)))
print('Capas de datos filtrados 2020:', L8_collection_2020.size().getInfo())

## Cargar imagen individual de la colección (Landsat 8).
L8_image_2020 = L8_collection_2020.first()
image_meta_2020 = L8_image_2020.getInfo()
imagename_2020 = image_meta_2020.get('properties',{}).get('LANDSAT_PRODUCT_ID')
print('Imagen 2020 elegido:', imagename_2020)


## Generar un mapa interactivo con imagen de satelite
Map = geemap.Map()
Map.centerObject(center, 10)

vizParams_L8 = {
  'bands': ['SR_B2', 'SR_B3', 'SR_B4'],
   'min': 5000,
   'max': 15000
}
Map.addLayer(L8_image_2020, vizParams_L8, 'Landsat 8 2020', True, 1)
Map.addLayer(center, {}, 'Punto de interés', True, 1)

## Presentar mapa
Map
