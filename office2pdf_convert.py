import sys
import os
import subprocess
import shutil

try:
    if len(sys.argv) != 3:
        print("ERROR: Usage: office2pdf_convert.py input_file output.pdf")
        sys.exit(1)

    input_path = sys.argv[1]
    pdf_path = sys.argv[2]

    print(f"Converting {input_path} to {pdf_path}")

    if not os.path.exists(input_path):
        print(f"ERROR: Input file does not exist: {input_path}")
        sys.exit(1)

    out_dir = os.path.dirname(pdf_path)

    result = subprocess.run(
        [
            "soffice",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", out_dir,
            input_path,
        ],
        capture_output=True,
        text=True,
        timeout=120,
    )

    if result.returncode != 0:
        print(f"ERROR: soffice failed: {result.stderr or result.stdout}")
        sys.exit(1)

    # soffice names the output after the input file
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    generated_path = os.path.join(out_dir, base_name + ".pdf")

    if not os.path.exists(generated_path):
        print(f"ERROR: Output file was not created at {generated_path}")
        sys.exit(1)

    # Move to the desired output path if different
    if generated_path != pdf_path:
        shutil.move(generated_path, pdf_path)

    if os.path.exists(pdf_path):
        print("SUCCESS")
    else:
        print("ERROR: Output file was not created")
        sys.exit(1)

except subprocess.TimeoutExpired:
    print("ERROR: Conversion timed out")
    sys.exit(1)
except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
