import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { v4 as uuidv4 } from "uuid";

export const convertJpgToPdf = async (imageBuffers, outputPath) => {
  try {
    const tempDir = path.join(process.cwd(), "uploads", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write each image buffer to a temp file
    const tempImagePaths = imageBuffers.map((buffer, i) => {
      const tempPath = path.join(tempDir, `${uuidv4()}_${i}.jpg`);
      fs.writeFileSync(tempPath, buffer);
      return tempPath;
    });

    const pythonBin = process.env.PYTHON_BIN || "python3";
    const pythonProcess = spawn(
      pythonBin,
      ["jpg2pdf_convert.py", outputPath, ...tempImagePaths],
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
        tempImagePaths.forEach((p) => {
          if (fs.existsSync(p)) fs.unlinkSync(p);
        });
        reject(new Error("JPG to PDF conversion timed out"));
      }, 120000);

      pythonProcess.on("close", (code) => {
        clearTimeout(timeout);
        tempImagePaths.forEach((p) => {
          if (fs.existsSync(p)) fs.unlinkSync(p);
        });

        if (code === 0) {
          resolve(outputPath);
        } else {
          console.error("Python script failed:");
          console.error("STDOUT:", stdout);
          console.error("STDERR:", stderr);
          reject(
            new Error(
              `JPG to PDF conversion failed (exit code ${code}): ${stderr || stdout}`,
            ),
          );
        }
      });

      pythonProcess.on("error", (err) => {
        clearTimeout(timeout);
        tempImagePaths.forEach((p) => {
          if (fs.existsSync(p)) fs.unlinkSync(p);
        });
        reject(new Error("JPG to PDF conversion failed: " + err.message));
      });
    });
  } catch (err) {
    throw new Error("JPG to PDF conversion failed: " + err.message);
  }
};
