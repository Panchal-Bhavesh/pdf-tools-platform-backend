import sys
import os
import zipfile
from pdf2image import convert_from_path

try:
    if len(sys.argv) != 3:
        print("ERROR: Incorrect number of arguments")
        sys.exit(1)

    pdf_path = sys.argv[1]
    zip_path = sys.argv[2]

    print(f"Converting {pdf_path} to {zip_path}")

    if not os.path.exists(pdf_path):
        print(f"ERROR: PDF file does not exist: {pdf_path}")
        sys.exit(1)

    images = convert_from_path(pdf_path, dpi=150)

    if not images:
        print("ERROR: No pages found in PDF")
        sys.exit(1)

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for i, image in enumerate(images):
            img_filename = f"page_{i + 1}.jpg"
            img_bytes = __import__("io").BytesIO()
            image.save(img_bytes, format="JPEG", quality=90)
            zf.writestr(img_filename, img_bytes.getvalue())

    if os.path.exists(zip_path):
        print("SUCCESS")
    else:
        print("ERROR: Output file was not created")
        sys.exit(1)

except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
