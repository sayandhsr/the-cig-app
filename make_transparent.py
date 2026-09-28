from PIL import Image

# Open the generated image
img_path = r"C:\Users\Dell\.gemini\antigravity\brain\1c16d59a-bb27-4947-8f81-35056200cf4e\realistic_cat_smoking_1790618475864.jpg"
img = Image.open(img_path).convert("RGBA")

datas = img.getdata()
new_data = []

# Make white (and near white) pixels transparent
for item in datas:
    # change all white (also shades of whites)
    # to transparent
    if item[0] > 230 and item[1] > 230 and item[2] > 230:
        new_data.append((255, 255, 255, 0))
    else:
        new_data.append(item)

img.putdata(new_data)
import os
os.makedirs(r"x:\cig app\public\images", exist_ok=True)
img.save(r"x:\cig app\public\images\cat-sticker.png", "PNG")
print("Saved cat-sticker.png")
