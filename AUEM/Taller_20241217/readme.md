Scripts para el taller 2024.

### Caso Ensenada
1) Modificacióin del marco de estudio
2) Modificacióin de script para trabajar en la cuenta de Google personal (Colab, GEE, Google Drive)
3) Seleccion de datos para 2015
4) Consolidacion de imagenes L8 (con reemplazo de pixeles de nube), su guardado en numpy
5) Consolidacion de datos de referencia y su guardado en numpy
6) Guardado de datos en GeoTIFF
7) Revision de goerefferenciación y su ajuste (en su caso), puntos de referencia para ajuste de georefferenciación

#### Pendientes
* Se corregio error en segmentación que consistia en falta del ultimo segmento incompleto en la parte derecha
* Lograr que se guarda GeoTIFF multibanda al final del script de preprocesamiento
* Falta corregir el error de georefferenciación en la coordenada x que surge en el script de preprocesamiento; tentativamente la origen del error se encuentra en el proceso de asignación de proyección o transformación para exportar en GeoTIFF, en particular caso de Ensenada si en lugar de ancho de pixel 30 ponemos 29.5 se logra georefferenciacion casi perfecta; habra que determinar como surge esta diferencia
