import { PDFDocument } from "pdf-lib";
import fs from "fs-extra";
import path from "path";
import { v4 as uuid } from "uuid";

export async function mergePDFs(files) {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const pdfBytes = await fs.readFile(file.path);
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const outputPath = `src/uploads/${uuid()}.pdf`;
  const mergedBytes = await mergedPdf.save();

  await fs.writeFile(outputPath, mergedBytes);

  return outputPath;
}
