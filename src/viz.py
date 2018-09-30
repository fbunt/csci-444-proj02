import h5py
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.pyplot import imshow, show


def ishow(values):
    if type(values) is np.ndarray:
        values = [values]
    for x in values:
        plt.figure()
        imshow(x)
    show()


# H "thickness" - Ice thickness (m) (2991, 1670)
# vx "VX" - x component of velocity (m/year) (2991, 1670)
# vy "VY" - y component of velocity (m/year) (2991, 1670)
# S "surface" - Surface elevation (m above sea level) (2991, 1670)
# B "bed" - Elevation of material under ice (m above sea level) (2991, 1670)
# T "t2m" - Mean annual temperature at 2 m above surface (K)
# A "smb" - Rate of ice accumulation (m/year) (2991, 1670)
# x "x" - x coordinate of data (1670,)
# y "y" - y coordinate of data (2991,)
f = h5py.File("../data/GreenlandInBedCoord.h5")
H = np.array(f["thickness"], dtype=np.float32)
vx = np.array(f["VX"], dtype=np.float32)
vy = np.array(f["VY"], dtype=np.float32)
V = np.sqrt(vx*vx + vy*vy)
logv = np.log(V + 1)
log10v = np.log10(V + 1)
S = np.array(f["surface"], dtype=np.float32)
B = np.array(f["bed"], dtype=np.float32)
T = np.array(f["t2m"], dtype=np.float32)
A = np.array(f["smb"], dtype=np.float32)
X = np.array(f["x"])
Y = np.array(f["y"])
