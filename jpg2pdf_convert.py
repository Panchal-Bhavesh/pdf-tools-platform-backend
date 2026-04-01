import sys
import os
from PIL import Image

try:
    if len(sys.argv) < 3:
        print("ERROR: Usage: jpg2pdf_convert.py output.pdf image1.jpg [image2.jpg ...]")
        sys.exit(1)

    pdf_path = sys.argv[1]
    image_paths = sys.argv[2:]

    print(f"Converting {len(image_paths)} image(s) to {pdf_path}")

    for img_path in image_paths:
        if not os.path.exists(img_path):
            print(f"ERROR: Image file does not exist: {img_path}")
            sys.exit(1)

    images = []
    for img_path in image_paths:
        img = Image.open(img_path).convert("RGB")
        images.append(img)

    if not images:
        print("ERROR: No images to convert")
        sys.exit(1)

    first = images[0]
    rest = images[1:]
    first.save(pdf_path, save_all=True, append_images=rest)

    if os.path.exists(pdf_path):
        print("SUCCESS")
    else:
        print("ERROR: Output file was not created")
        sys.exit(1)

except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
