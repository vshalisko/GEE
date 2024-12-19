Scripts para el taller 2024.12.19

### Caso Ensenada
1) Iniciamos con datos de 2015 (feature: Landsat 8, target: categorico de 3 clases) en forma de Numpy arryas en Google Drive
2) Descargamos datos 2020 para predicción y datos de 2014 como la fecha mas temprana de Landsat 8 disponible
3) Transformación inicial de datos
4) Subdividir datos en subconuntos de entrenamiento (80%), validación (10%) y control (10%)
5) Definir los hiperparámetros iniciales
6) Entrenar el modelo ANN (Keras, Tensor Flow 3) con hiperparamentros iniciales (modelo M1)
7) Realizar calculo de las estadisticas de validación de M1
8) Entrenar el modelo ANN con hiperparamentros alternativos (modelo M2)
9) Realizar calculo de las estadisticas de validación de M2
10) Elegir el modelo mas preciso entre M1 y M2 y guardarlo
11) Calcular las estadisticas de precisión 2015 con datos de control internos
12) Realizar predicción completa para 2015
13) Realizar predicción para 2020
14) Realizar predicción para 2014
15) Guardar las capas de predicción en forma de Numpy arrays y GeoTIFF
