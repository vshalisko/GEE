Scripts para el taller 2024.

### Caso Ensenada
1) Modificacióin del marco de estudio
2) Modificacióin de script para trabajar en la cuenta de Google personal (Colab, GEE, Google Drive)
3) Seleccion de datos para 2015
4) Consolidacion de imagenes L8 (con reemplazo de pixeles de nube), su guardado en numpy
5) Consolidacion de datos de referencia y su guardado en numpy
6) Guardado de datos en GeoTIFF
7) Revision de goerefferenciación y su ajuste (en su caso), puntos de referencia para ajuste de georefferenciación

#### Avances
* Se corregio error en segmentación que consistia en falta del ultimo segmento incompleto en la parte derecha
* Se corregio el error de desfase general de georefferenciación en la coordenada x, estaba relacionado con diferencia entre el numero de pixeles esperado con tamaño de pixel definido y los pixeles que realmente salen del proceso de segmentación la diferencia es en orden de 2% en ancho de segmento
* Se aplico la corrección de ancho de segmentos, eliminando la última columna y fila de pixeles en cada segmento, ya que se repiten en siguiente segmento, con esto se logro tener georefferenciación sin distorciones
* Se guardan los GeoTIFFs de rasters monobanda y multibanda

#### Pendientes

* Aplicar mismo proceso para los demás fechas y zonas

