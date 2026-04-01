import { exec } from "child_process";
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

  const command = `
    gs -sDEVICE=pdfwrite \
       -dCompatibilityLevel=1.4 \
       -dPDFSETTINGS=${quality} \
       -dNOPAUSE -dQUIET -dBATCH \
       -sOutputFile=${outputPath} \
       ${inputPath}
  `;

  await new Promise((resolve, reject) => {
    exec(command, (err) => {
      if (err) reject(err);
      else resolve();
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
