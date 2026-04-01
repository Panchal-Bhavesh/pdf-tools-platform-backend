import { PDFDocument } from "pdf-lib";
import fs from "fs-extra";
import path from "path";
import { v4 as uuid } from "uuid";
import archiver from "archiver";

export async function splitPDF({ file, mode, ranges }) {
  const pdfBytes = await fs.readFile(file.path);
  const pdf = await PDFDocument.load(pdfBytes);
  const totalPages = pdf.getPageCount();

  const outputDir = `src/uploads/${uuid()}`;
  await fs.ensureDir(outputDir);

  if (mode === "single") {
    for (let i = 0; i < totalPages; i++) {
      const newPDF = await PDFDocument.create();
      const [page] = await newPDF.copyPages(pdf, [i]);
      newPDF.addPage(page);

      const bytes = await newPDF.save();
      await fs.writeFile(`${outputDir}/page-${i + 1}.pdf`, bytes);
    }
  }
  if (mode === "fixed") {
    const step = ranges.fixed;
    for (let i = 0; i < totalPages; i += step) {
      const newPDF = await PDFDocument.create();
      const pages = [];

      for (let j = i; j < i + step && j < totalPages; j++) {
        pages.push(j);
      }
      const copied = await newPDF.copyPages(pdf, pages);
      copied.forEach((page) => newPDF.addPage(page));

      const bytes = await newPDF.save();
      await fs.writeFile(
        `${outputDir}/pages-${i + 1}-${i + pages.length}.pdf`,
        bytes
      );
    }
  }
  if (mode === "custom" && Array.isArray(ranges)) {
    let index = 1;
    for (const range of ranges) {
      const newPdf = await PDFDocument.create();
      const pages = [];

      for (let i = range.start - 1; i < range.end; i++) {
        if (i >= 0 && i < totalPages) pages.push(i);
      }

      const copied = await newPdf.copyPages(pdf, pages);
      copied.forEach((page) => newPdf.addPage(page));

      const bytes = await newPdf.save();
      await fs.writeFile(`${outputDir}/custom-${index}.pdf`, bytes);
      index++;
    }
  }

  const zipPath = `${outputDir}.zip`;
  await zipFolder(outputDir, zipPath);

  await fs.remove(outputDir);
  return zipPath;
}

function zipFolder(source, out) {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const stream = fs.createWriteStream(out);

    archive.directory(source, false).on("error", reject).pipe(stream);
    stream.on("close", resolve);
    archive.finalize();
  });
}
