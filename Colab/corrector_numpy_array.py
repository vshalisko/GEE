import numpy as np
from google.colab import drive

drive.mount('/content/drive')

# Load the arrays as .npy files
prediction_2015 = np.load('/content/drive/MyDrive/Colab Data/OCT_2015_prediction_class.npy')
prediction_2020 = np.load('/content/drive/MyDrive/Colab Data/OCT_2020_prediction_class.npy')
prediction_2010 = np.load('/content/drive/MyDrive/Colab Data/OCT_2010_prediction_class.npy')
prediction_2000 = np.load('/content/drive/MyDrive/Colab Data/OCT_2000_prediction_class.npy')


def corrector_2000(a, b):
  if (a == 2 and b == 0):
    return 0
  else:
    return a

def corrector_2010(a, b):
  if (a == 2 and b == 0):
    return 0
  else:
    return a

def corrector_2020(a, b):
  if (a == 2):
    return 2
  else:
    return b

def corrector(before, after, correction_fun):
  #print('Raster antes: ', before.shape)
  #print('Raster despues: ', after.shape)
  rows = before.shape[0]
  cols = before.shape[1]
  new_before = np.empty((rows,cols))
  for x in range(0, rows):
    for y in range(0, cols):
        new_before[x,y] = correction_fun(before[x,y], after[x,y])
  return(new_before)

prediction_2020_corrected = corrector(prediction_2020, prediction_2015, corrector_2020)
prediction_2010_corrected = corrector(prediction_2010, prediction_2020_corrected, corrector_2010)
prediction_2000_corrected = corrector(prediction_2000, prediction_2010_corrected, corrector_2000)
