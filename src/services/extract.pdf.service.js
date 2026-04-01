import { PDFDocument } from "pdf-lib";

export const extractPdfPagesService = async (fileBuffer, pages) => {
  const sourcePdf = await PDFDocument.load(fileBuffer);
  const newPdf = await PDFDocument.create();

  const totalPages = sourcePdf.getPageCount();

  for (const pageNumber of pages) {
    if (pageNumber < 1 || pageNumber > totalPages) {
      throw new Error(
        `Page number ${pageNumber} is out of bounds. The document has ${totalPages} pages.`
      );
    }
    const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageNumber - 1]);
    newPdf.addPage(copiedPage);
  }
  return await newPdf.save();
};
