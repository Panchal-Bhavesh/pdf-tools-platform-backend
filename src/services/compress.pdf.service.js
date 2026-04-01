import { execFile } from "child_process";
import path from "path";
import fs from "fs-extra";
import { v4 as uuid } from "uuid";

export async function compressPDF(file, level) {
  const inputPath = file.path;
  const outputPath = path.resolve(process.cwd(), `src/uploads/${uuid()}.pdf`);

  const qualityMap = {
    extreme: "/screen",
    recommanded: "/ebook",
    less: "/printer",
  };

  const quality = qualityMap[level] || "/ebook";

  const args = [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    `-dPDFSETTINGS=${quality}`,
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    `-sOutputFile=${outputPath}`,
    inputPath,
  ];

  await new Promise((resolve, reject) => {
    execFile("gs", args, (err, stdout, stderr) => {
      if (err) {
        // attach stderr for better debugging
        err.message = `${err.message}\n${stderr || stdout || ""}`;
        return reject(err);
      }
      resolve();
    });
  });

  const originalSize = (await fs.stat(inputPath)).size;
  const compressedSize = (await fs.stat(outputPath)).size;

  return {
    originalSize,
    compressedSize,
    outputPath,
  };
}
