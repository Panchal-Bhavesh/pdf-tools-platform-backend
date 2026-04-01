import sys
import os
import fitz  # pymupdf

try:
    if len(sys.argv) != 4:
        print("ERROR: Usage: protect_pdf.py input.pdf output.pdf password")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    password = sys.argv[3]

    print(f"Protecting {input_path} with password")

    if not os.path.exists(input_path):
        print(f"ERROR: PDF file does not exist: {input_path}")
        sys.exit(1)

    doc = fitz.open(input_path)

    if doc.is_encrypted:
        print("ERROR: PDF is already encrypted")
        sys.exit(1)

    # Encrypt with both user and owner password
    # Permission flags: allow printing and copying but restrict editing
    perm = fitz.PDF_PERM_PRINT | fitz.PDF_PERM_COPY | fitz.PDF_PERM_ACCESSIBILITY
    doc.save(
        output_path,
        encryption=fitz.PDF_ENCRYPT_AES_256,
        user_pw=password,
        owner_pw=password,
        permissions=perm,
    )
    doc.close()

    if os.path.exists(output_path):
        print("SUCCESS")
    else:
        print("ERROR: Output file was not created")
        sys.exit(1)

except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
