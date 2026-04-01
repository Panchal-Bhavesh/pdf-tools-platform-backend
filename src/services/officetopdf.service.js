import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { v4 as uuidv4 } from "uuid";

export const convertOfficeToPdf = async (fileBuffer, ext, outputPath) => {
  try {
    const tempDir = path.join(process.cwd(), "uploads", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempInputPath = path.join(tempDir, `${uuidv4()}.${ext}`);
    fs.writeFileSync(tempInputPath, fileBuffer);

    const pythonBin = process.env.PYTHON_BIN || "python3";
    const pythonProcess = spawn(
      pythonBin,
      ["office2pdf_convert.py", tempInputPath, outputPath],
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
        if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
        reject(new Error(`${ext.toUpperCase()} to PDF conversion timed out`));
      }, 120000);

      pythonProcess.on("close", (code) => {
        clearTimeout(timeout);
        if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);

        if (code === 0) {
          resolve(outputPath);
        } else {
          console.error("Python script failed:");
          console.error("STDOUT:", stdout);
          console.error("STDERR:", stderr);
          reject(
            new Error(
              `${ext.toUpperCase()} to PDF conversion failed (exit code ${code}): ${stderr || stdout}`,
            ),
          );
        }
      });

      pythonProcess.on("error", (err) => {
        clearTimeout(timeout);
        if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
        reject(
          new Error(
            `${ext.toUpperCase()} to PDF conversion failed: ${err.message}`,
          ),
        );
      });
    });
  } catch (err) {
    throw new Error(
      `${ext.toUpperCase()} to PDF conversion failed: ${err.message}`,
    );
  }
};
