import h5py
import numpy as np
import codecs
import json


# "thickness" - Ice thickness (m) (2991, 1670)
# "VX" - x component of velocity (m/year) (2991, 1670)
# "VY" - y component of velocity (m/year) (2991, 1670)
# "surface" - Surface elevation (m above sea level) (2991, 1670)
# "bed" - Elevation of material under ice (m above sea level) (2991, 1670)
# "t2m" - Mean annual temperature at 2 m above surface (K)
# "smb" - Rate of ice accumulation (m/year) (2991, 1670)
# "x" - x coordinate of data (1670,)
# "y" - y coordinate of data (2991,)
f = h5py.File("data/GreenlandInBedCoord.h5")

fkeys = ['VX', 'VY', 'bed', 'smb', 'surface', 't2m', 'thickness']
ikeys = ['x', 'y']
keys = fkeys + ikeys

for k in keys:
    print(k)
    type_ = np.int32 if (k in ikeys) else np.float32
    data = np.array(f[k], dtype=type_).tolist()
    fdout = codecs.open('data/{}.json'.format(k), 'w', encoding='utf-8')
    json.dump(data, fdout, separators=(',', ':'), sort_keys=True)
    fdout.close()
