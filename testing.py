import cv2
import matplotlib.pyplot as plt
import numpy as np

# img = cv2.imread('red_green.png')
img = cv2.imread('redYellow.jpg')


img_cvt = cv2.cvtColor(img, cv2.COLOR_BGR2RGB) 

def transform_image(image, matrix):


    image_float = image.astype(np.float32) / 255.0
    transformed = np.dot(image_float, matrix.T)
    transformed = np.clip(transformed, 0, 1)
    return (transformed * 255).astype(np.uint8)



protanopia_simulation = np.array([
    [0.56667, 0.43333, 0.0],
    [0.55833, 0.44167, 0.0],
    [0.0,     0.24167, 0.75833]
])

protanopia_daltonization = np.array([
    [0.0, 2.02344, -2.52581],
    [0.0, 1.0,     0.0],
    [0.0, 0.0,     1.0]
])

deuteranopia_simulation = np.array([
    [0.625, 0.375, 0.0],
    [0.7,   0.3,   0.0],
    [0.0,   0.3,   0.7]
])

deuteranopia_daltonization = np.array([
    [1.0, 0.0,      0.0],
    [0.494207, 0.0, 1.24827],
    [0.0, 0.0,      1.0]
])

tritanopia_simulation = np.array([
    [0.95,  0.05,   0.0],
    [0.0,   0.433,  0.567],
    [0.0,   0.475,  0.525]
])

tritanopia_daltonization = np.array([
    [1.0,  0.0,       0.0],
    [0.0,  1.0,       0.0],
    [-0.395913, 0.801109, 0.0]
])


def color_recolor(img,sim,dalt):
    img_sim = transform_image(img,sim)

    img_dalton = transform_image(img, dalt)

    img_rec = transform_image(img_dalton, sim)

    return img_rec,img_sim,img_dalton



color_type = int(input('1. protonopia \n 2. deuteranopia \n 3. tritanopia \n :'))

if color_type == 1:
    img_rec,img_sim,img_dalton = color_recolor(img_cvt,protanopia_simulation,protanopia_daltonization)
elif color_type == 2:
    img_rec,img_sim,img_dalton = color_recolor(img_cvt,deuteranopia_simulation,deuteranopia_daltonization)
elif color_type == 3:
    img_rec,img_sim,img_dalton = color_recolor(img_cvt,tritanopia_simulation,tritanopia_daltonization)




plt.figure(figsize=(18, 6))

plt.subplot(1, 5, 1)
plt.title("Original Image")
plt.imshow(img)
plt.axis("off")

plt.subplot(1, 5, 2)
plt.title("corrected image")
plt.imshow(img_cvt)
plt.axis("off")

plt.subplot(1, 5, 3)
plt.title("simulated Image")
plt.imshow(img_sim)
plt.axis("off")

plt.subplot(1, 5, 4)
plt.title("daltonized Image")
plt.imshow(img_dalton)
plt.axis("off")

plt.subplot(1, 5, 5)
plt.title("recolored Image")
plt.imshow(img_rec)
plt.axis("off")

plt.show()

