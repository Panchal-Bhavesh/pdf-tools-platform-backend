import sys
import os
import pandas as pd

try:
    if len(sys.argv) != 3:
        print("ERROR: Incorrect number of arguments")
        sys.exit(1)

    pdf_path = sys.argv[1]
    excel_path = sys.argv[2]

    print(f"Converting {pdf_path} to {excel_path}")

    if not os.path.exists(pdf_path):
        print(f"ERROR: PDF file does not exist: {pdf_path}")
        sys.exit(1)

    # Try to import required libraries
    try:
        import tabula
    except ImportError:
        print("ERROR: tabula-py is not installed. Install with: pip install tabula-py")
        sys.exit(1)

    # Extract tables from PDF and save to Excel
    tables = tabula.read_pdf(pdf_path, pages="all", multiple_tables=True)
    
    if not tables:
        print("WARNING: No tables found in PDF")
        # Create an empty Excel file
        import openpyxl
        wb = openpyxl.Workbook()
        wb.save(excel_path)
    else:
        # Write all tables to Excel with one table per sheet
        with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
            for idx, table in enumerate(tables):
                sheet_name = f"Sheet_{idx+1}"
                table.to_excel(writer, sheet_name=sheet_name, index=False)

    if os.path.exists(excel_path):
        print("SUCCESS")
    else:
        print("ERROR: Output file was not created")
        sys.exit(1)

except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
