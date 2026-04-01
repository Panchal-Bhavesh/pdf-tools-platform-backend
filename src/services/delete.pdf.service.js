import { PDFDocument } from "pdf-lib";
import fs from "fs-extra";
import path from "path";
import { v4 as uuid } from "uuid";

export async function deletePDFPages(file, pagesToDelete) {
  const inputpath = file.path;
  const pdfBytes = await fs.readFile(inputpath);
  const pdf = await PDFDocument.load(pdfBytes);

  const totalPages = pdf.getPageCount();
  const pagesTokeep = [];

  for (let i = 0; i < totalPages; i++) {
    const pageNumber = i + 1;
    if (!pagesToDelete.includes(pageNumber)) {
      pagesTokeep.push(i);
    }
  }

  if (pagesTokeep.length === 0) {
    throw new Error("You cannot delete all pages from the PDF.");
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdf, pagesTokeep);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const outputPath = path.join("src/uploads", `${uuid()}.pdf`);
  await fs.writeFile(outputPath, await newPdf.save());

  return outputPath;
}
