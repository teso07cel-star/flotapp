import glob
from PIL import Image
import os

for file in glob.glob('public/icons/*.png'):
    print(f"Processing {file}")
    img = Image.open(file)
    img = img.convert('RGBA')
    datas = img.getdata()
    newData = []
    
    for item in datas:
        # If it's pure white or very close, make it transparent
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            newData.append((255, 255, 255, 0))
        elif item[0] < 50 and item[1] < 50 and item[2] < 50:
            # Maybe the icon itself is black, let's keep it black or if we want it white
            newData.append(item)
        else:
            newData.append(item)
    
    img.putdata(newData)
    img.save(file, 'PNG')
    print('Saved', file)
