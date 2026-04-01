import { PDFDocument } from "pdf-lib";
import fs from "fs-extra";
import path from "path";
import { v4 as uuid } from "uuid";

export async function reorderPDF(file, pageOrder) {
  const inputPath = file.path;
  const pdfBytes = await fs.readFile(inputPath);
  const pdf = await PDFDocument.load(pdfBytes);

  const newPdf = await PDFDocument.create();

  const pages = await newPdf.copyPages(
    pdf,
    pageOrder.map((p) => p - 1),
  );
  pages.forEach((page) => newPdf.addPage(page));

  const outputPath = path.join("src/uploads", `${uuid()}.pdf`);
  await fs.writeFile(outputPath, await newPdf.save());

  return outputPath;
}
