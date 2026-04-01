import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { v4 as uuidv4 } from "uuid";

export const convertPdfToExcel = async (pdfBuffer, outputPath) => {
  try {
    // Create a temporary PDF file
    const tempDir = path.join(process.cwd(), "uploads", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempPdfPath = path.join(tempDir, `${uuidv4()}.pdf`);
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    // Call the Python script for PDF to Excel conversion
    // Note: This assumes you have a pdf2excel_convert.py script
    const pythonProcess = spawn(
      path.join(process.cwd(), "venv", "bin", "python3"),
      ["pdf2excel_convert.py", tempPdfPath, outputPath],
      {
        cwd: process.cwd(),
      },
    );

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    return new Promise((resolve, reject) => {
      pythonProcess.on("close", (code) => {
        // Clean up temp file
        if (fs.existsSync(tempPdfPath)) {
          fs.unlinkSync(tempPdfPath);
        }

        if (code === 0) {
          resolve(outputPath);
        } else {
          console.error("Python script failed:");
          console.error("STDOUT:", stdout);
          console.error("STDERR:", stderr);
          reject(
            new Error(
              `PDF to Excel conversion failed: ${stderr || "Unknown error"}`,
            ),
          );
        }
      });

      pythonProcess.on("error", (err) => {
        if (fs.existsSync(tempPdfPath)) {
          fs.unlinkSync(tempPdfPath);
        }
        reject(err);
      });
    });
  } catch (err) {
    throw new Error(`PDF to Excel conversion error: ${err.message}`);
  }
};
