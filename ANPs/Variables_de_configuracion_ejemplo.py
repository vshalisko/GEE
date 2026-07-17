PREFIJO     = 'NCL'
NOMBRE      = 'Nevado_Colima'
#RUTA_AOI    = '/content/drive/MyDrive/ANP/AOI'
RUTA_AOI    = '/content/drive/MyDrive/Colab Data/Naylet/AOI'
RUTA_GEOJSON = f'{RUTA_AOI}/aoi_{PREFIJO}.geojson'
RUTA_BBOX   = f'{RUTA_AOI}/{PREFIJO}_bbox.geojson'
RUTA_CSV    = f'{RUTA_AOI}/{PREFIJO}_coordenadas.csv'
CRS_GEO     = 4326
CRS_UTM     = 32613
#GEE_PROJECT = 'ee-nayleths'
GEE_PROJECT = 'ee-vshalisko'

YEAR             = 2020
COLECCION_L7    = 'LANDSAT/LE07/C02/T1_L2'
COLECCION_L8    = 'LANDSAT/LC08/C02/T1_L2'
COLECCION_S2    = 'COPERNICUS/S2_SR_HARMONIZED'

TEMPORADA_SECA   = ('03-01', '05-31')
TEMPORADA_HUMEDA = ('08-01', '11-30')

# Bandas L7 (igual que L5)
BANDAS_SR       = ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7']
BANDAS_CORR     = [b + '_corr' for b in BANDAS_SR]

# Bandas L8 (distinto orden: B2-B7 sin B6)
BANDAS_SR_L8    = ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7']
BANDAS_CORR_L8  = [b + '_corr' for b in BANDAS_SR_L8]

# Bandas S2
BANDAS_S2       = ['B2', 'B3', 'B4', 'B8', 'B11', 'B12']

# Coeficientes Tasseled Cap L7 (mismos que L5)
TC_BRIGHT  = [0.3561, 0.3972, 0.3904, 0.6966, 0.2286, 0.1596]
TC_GREEN   = [-0.3344, -0.3544, -0.4556, 0.6966, -0.0242, -0.2630]
TC_WET     = [0.2626, 0.2141, 0.0926, 0.0656, -0.7629, -0.5388]

# Coeficientes Tasseled Cap L8
TC_BRIGHT_L8 = [0.3029, 0.2786, 0.4733, 0.5599, 0.5082, 0.1872]
TC_GREEN_L8  = [-0.2941, -0.2430, 0.5421, 0.2410, -0.5312, -0.3826]
TC_WET_L8    = [0.1511, 0.1973, 0.3283, 0.3407, -0.7117, 0.4559]

# Coeficientes Tasseled Cap S2 (from Shi & Xu, 2019)
TC_BRIGHT_S2 = [0.3037, 0.2793, 0.4743, 0.5585, 0.5082, 0.1863]
TC_GREEN_S2  = [-0.2848, -0.2435, -0.5436, 0.7243, 0.0840, -0.1800]
TC_WET_S2    = [0.1509, 0.1973, 0.3279, 0.3406, -0.7112, -0.4572]

ESCALA_L      = 30
ESCALA_S2     = 10
MAX_NUBES_S2  = 20
ZOOM          = 12
STYLE_AREA    = {'color': 'blue', 'fillColor': '#0000ff30', 'weight': 1.5}
STYLE_BBOX    = {'color': 'red',  'fillColor': '#00000000', 'weight': 2.5}
MAP_TITLE     = 'Área de estudio Nevado de Colima'

## La funcon de exportación a Google Drive admite solo el nombre de un folder en raiz de Google Drive, si posibilidad de especificar una subcarpera
#RUTA_IMAGENES = '/content/drive/MyDrive/ANP/Landsat'
RUTA_IMAGENES = 'Colab Data NDC 2020'
