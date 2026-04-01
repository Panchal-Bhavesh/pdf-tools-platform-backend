import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { v4 as uuidv4 } from "uuid";

export const convertPdfToWord = async (pdfBuffer, outputPath) => {
  const tempDir = path.join(process.cwd(), "uploads", "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempPdfPath = path.join(tempDir, `${uuidv4()}.pdf`);
  fs.writeFileSync(tempPdfPath, pdfBuffer);

  try {
    // Use LibreOffice to convert PDF to DOCX (much more reliable than pdf2docx)
    const loProcess = spawn(
      "libreoffice",
      [
        "--headless",
        "--infilter=writer_pdf_import",
        "--convert-to",
        "docx",
        "--outdir",
        tempDir,
        tempPdfPath,
      ],
      { cwd: process.cwd() },
    );

    let stdout = "";
    let stderr = "";

    loProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    loProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    const convertedTempPath = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        loProcess.kill("SIGKILL");
        reject(new Error("PDF to Word conversion timed out"));
      }, 120000); // 2 minutes

      loProcess.on("close", (code) => {
        clearTimeout(timeout);

        if (code === 0) {
          // LibreOffice outputs the file in the same dir with .docx extension
          const baseName = path.basename(tempPdfPath, ".pdf");
          const convertedPath = path.join(tempDir, `${baseName}.docx`);

          if (fs.existsSync(convertedPath)) {
            resolve(convertedPath);
          } else {
            reject(
              new Error(
                "LibreOffice conversion completed but output file not found",
              ),
            );
          }
        } else {
          console.error("LibreOffice conversion failed:");
          console.error("STDOUT:", stdout);
          console.error("STDERR:", stderr);
          reject(
            new Error(
              `PDF to Word conversion failed (exit code ${code}): ${stderr || stdout}`,
            ),
          );
        }
      });

      loProcess.on("error", (err) => {
        clearTimeout(timeout);
        reject(new Error("PDF to Word conversion failed: " + err.message));
      });
    });

    // Move the converted file to the desired output path
    fs.renameSync(convertedTempPath, outputPath);
    return outputPath;
  } finally {
    // Always clean up temp PDF
    if (fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
    }
  }
};
