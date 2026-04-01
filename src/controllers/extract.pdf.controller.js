import fs from "fs-extra";
import { extractPdfPagesService } from "../services/extract.pdf.service.js";
import { removeFile } from "../utils/fileCleanup.js";

export const extractPdfPagesController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file required." });
    }

    const { pages } = req.body;

    if (!pages) {
      await removeFile(req.file.path);
      return res.status(400).json({ message: "Pages are required." });
    }

    const pageNumbers = JSON.parse(pages);

    if (!Array.isArray(pageNumbers) || pageNumbers.length === 0) {
      await removeFile(req.file.path);
      return res.status(400).json({ message: "Invalid pages format." });
    }

    const extractedPdf = await extractPdfPagesService(
      req.file.buffer,
      pageNumbers
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=extracted_pages.pdf"
    );

    res.send(Buffer.from(extractedPdf));

    await removeFile(req.file.path);
  } catch (error) {
    console.error(error);
    await removeFile(req.file.path);
    res.status(500).json({ message: error.message || "Extract failed." });
  }
};
