## Preprocesamiento

**Esquema_preprocesamiento.mermaid**

#### Opciones de estandarización:
* scikit-learn StandardScaler: escala las características para que tengan una media de cero (μ = 0) y una desviación estándar de uno (σ = 1)
* scikit-learn RobustScaler: escala características numéricas restando la mediana y dividiendo por el Rango Intercuartílico (RIC o IQR). 
  
Nota: RobustScaler es apropiado cuando se pretende usar los algoritmos sensibles a la escala de las características y a los valores extremos, 
como Regresión Logística, Máquinas de Soporte Vectorial (SVM) o K-Vecinos más Cercanos (KNN). Es apropiado para trabajar con datos de distribución asimpetrica
o con presencia de valores atipicos que no se opuede eliminar.
