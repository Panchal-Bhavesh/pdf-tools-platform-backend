import sys
import os
import fitz  # pymupdf

try:
    if len(sys.argv) != 4:
        print("ERROR: Usage: unlock_pdf.py input.pdf output.pdf password")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    password = sys.argv[3]

    print(f"Unlocking {input_path}")

    if not os.path.exists(input_path):
        print(f"ERROR: PDF file does not exist: {input_path}")
        sys.exit(1)

    doc = fitz.open(input_path)

    if not doc.is_encrypted:
        # Already unlocked — just copy it to the output path
        import shutil
        doc.close()
        shutil.copy2(input_path, output_path)
        print("SUCCESS")
        sys.exit(0)

    if not doc.authenticate(password):
        print("ERROR: Incorrect password")
        sys.exit(2)

    # Save without encryption
    doc.save(output_path, encryption=fitz.PDF_ENCRYPT_NONE)
    doc.close()

    if os.path.exists(output_path):
        print("SUCCESS")
    else:
        print("ERROR: Output file was not created")
        sys.exit(1)

except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
