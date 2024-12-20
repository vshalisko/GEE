Scripts para el taller 2024.12.19

### ¿Como trabajar en este taller?
Si no sabes con que script comenzar o que hacer, el flujo de trabajo incluye dos scripts que debes configurar y correr en una secuancia para obtener los resultados completos:
1) **Paso 1**. Configurar y ejecutar **ESE_preprocesamiento_L8_tres_fechas.ipynb** para descargar datos Landsat 8 y categoricos de referencia
2) **Paso 2**. Configurar y ejecutar **ESE_ANN_simple_L8_con_2020.ipynb** para obtener predicciones de mancha urbana en 2015, 2014 y 2020


### Caso Ensenada
1) Iniciamos con datos de 2015 (feature: Landsat 8, target: categorico de 3 clases) en forma de Numpy arryas en Google Drive
2) Descargamos datos 2020 para predicción y datos de 2014 como la fecha mas temprana de Landsat 8 disponible
3) Transformación inicial de datos y normalización con StandardScaler
4) Subdividir datos en subconuntos de entrenamiento (80%), validación (10%) y control (10%)
5) Definir los hiperparámetros iniciales
6) Entrenar el modelo ANN (Keras, Tensor Flow 2) con hiperparamentros iniciales (modelo M1)
7) Realizar calculo de las estadisticas de validación de M1
8) Entrenar el modelo ANN con hiperparamentros alternativos (modelo M2)
9) Realizar calculo de las estadisticas de validación de M2
10) Elegir el modelo mas preciso entre M1 y M2 y guardarlo
11) Calcular las estadisticas de precisión 2015 con datos de control internos
12) Realizar predicción completa para 2015
13) Realizar predicción para 2020
14) Realizar predicción para 2014
15) Guardar las capas de predicción en forma de Numpy arrays y GeoTIFF

### Descripción de los scripts
* ESE_preprocesamiento_L8_tres_fechas.ipynb - sirve para descarga de datos 2014, 2015 y 2020 y su guardado en Google Drive (numpy arrays y GeoTIFF)
* ESE_ANN_simple_L8.ipynb - script para general dos modelos ANN para 2015, evaluarlos y realizar predicción en 2015
* ESE_ANN_simple_L8_con_2020.ipynb - lo mismo que anterior pero con prediccion en 2015, 2014 y 2020

### Nota: 2 asistences presenciales del taller, 3 asistentes del taler que van a ver la grabación

### Pendientes
* Difinir el universo de hiperparámetros de ANN a explorar (cantidad de épocas y tamaño de batch de entrenamiento, número de neuronas y capas internas, métricas de ajuste, funciones de activación, entre otros)
* Realizar un estudio y búsqueda de hiperparámetros óptimos de ANN para 6 ciudades, aplicables al modelo ANN de Landsat 8 entrenado con datos de 2015
* Generar universo los conuuntos de datos Landsat 5 con el script corregido de preprocesamiento para 6 ciudades en tres fechas: 2000, 2010 y 2011
* Entrenar modelos con datos de Landsat 5 2011 y target obtenido a partir de predicción en 2014
* Generar predicciones actualizados para 2000 y 2010 con modelo entrenado con datos Landsat 5

### Asignación de tareas:
* Guadalajara - pendiente para enero
* Mérida - Shalisko
* Puerto Vallarta - todos
* Ensenada - ya quedo
* Ocotlan - todos
* Chapala - todos
