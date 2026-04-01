import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { v4 as uuidv4 } from "uuid";

export const convertPdfToJpg = async (pdfBuffer, outputPath) => {
  try {
    const tempDir = path.join(process.cwd(), "uploads", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempPdfPath = path.join(tempDir, `${uuidv4()}.pdf`);
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    const pythonBin = process.env.PYTHON_BIN || "python3";
    const pythonProcess = spawn(
      pythonBin,
      ["pdf2jpg_convert.py", tempPdfPath, outputPath],
      { cwd: process.cwd() },
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
      const timeout = setTimeout(() => {
        pythonProcess.kill("SIGKILL");
        if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
        reject(new Error("PDF to JPG conversion timed out"));
      }, 120000);

      pythonProcess.on("close", (code) => {
        clearTimeout(timeout);
        if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);

        if (code === 0) {
          resolve(outputPath);
        } else {
          console.error("Python script failed:");
          console.error("STDOUT:", stdout);
          console.error("STDERR:", stderr);
          reject(
            new Error(
              `PDF to JPG conversion failed (exit code ${code}): ${stderr || stdout}`,
            ),
          );
        }
      });

      pythonProcess.on("error", (err) => {
        clearTimeout(timeout);
        if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
        reject(new Error("PDF to JPG conversion failed: " + err.message));
      });
    });
  } catch (err) {
    throw new Error("PDF to JPG conversion failed: " + err.message);
  }
};
