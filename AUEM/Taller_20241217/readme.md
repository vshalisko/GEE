Scripts para el taller 2024.12.17

### Caso Ensenada
1) Modificacióin del marco de estudio
2) Modificacióin de script para trabajar en la cuenta de Google personal (Colab, GEE, Google Drive)
3) Seleccion de datos para 2015
4) Consolidacion de imagenes L8 (con reemplazo de pixeles de nube), su guardado en numpy
5) Consolidacion de datos de referencia y su guardado en numpy
6) Guardado de datos en GeoTIFF
7) Revision de goerefferenciación y su ajuste (en su caso), puntos de referencia para ajuste de georefferenciación

### Scripts
1) ESE_visualizacion_zona_estudio.ipynb - solo visualización de rectangulo de recorte e imagen Landsat 8 elegido
2) ESE_visualizacion_zona_estudio_con_reduccion_nubes.ipynb - visualización de rectangulo de recorte y producción de imagen combinado (mosaico) con nubes eliminados y cobertura completa
3) ESE_preprocesamiento_zona_estudio_con_reduccion_nubes.ipynb - script final de la etapa de preprocesamiento que permite descarga de datos en forma de numpy array y GeoTIFF a Google Drive, con asignación de georefferenciación, aplicable al imagen de satelite 2015 y variables categoricas 2015 requeridos para el entrenamiento

#### Avances
* Se corregio error en segmentación que consistia en falta del ultimo segmento incompleto en la parte derecha
* Se corregio el error de desfase general de georefferenciación en la coordenada x, estaba relacionado con diferencia entre el numero de pixeles esperado con tamaño de pixel definido y los pixeles que realmente salen del proceso de segmentación la diferencia es en orden de 2% en ancho de segmento
* Se aplico la corrección de ancho de segmentos, eliminando la última columna y fila de pixeles en cada segmento, ya que se repiten en siguiente segmento, con esto se logro tener georefferenciación sin distorciones
* Se guardan los GeoTIFFs de rasters monobanda y multibanda

#### Pendientes

* Aplicar mismo proceso para los demás fechas y zonas

