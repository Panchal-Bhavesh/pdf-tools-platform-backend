import sys
import os
from pdf2docx import Converter

try:
    if len(sys.argv) != 3:
        print("ERROR: Incorrect number of arguments")
        sys.exit(1)

    pdf_path = sys.argv[1]
    docx_path = sys.argv[2]

    print(f"Converting {pdf_path} to {docx_path}")

    if not os.path.exists(pdf_path):
        print(f"ERROR: PDF file does not exist: {pdf_path}")
        sys.exit(1)

    cv = Converter(pdf_path)
    cv.convert(docx_path)
    cv.close()

    if os.path.exists(docx_path):
        print("SUCCESS")
    else:
        print("ERROR: Output file was not created")
        sys.exit(1)

except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
