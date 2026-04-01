import path from "path";
import fs from "fs";
import { convertPdfToWord } from "../services/pdftoword.service.js";

export const convertPdfController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    const outputDir = path.join(process.cwd(), "converted_docs");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `converted_${Date.now()}.docx`);

    // Convert using buffer directly
    const docxPath = await convertPdfToWord(req.file.buffer, outputPath);

    res.download(docxPath, (err) => {
      if (err) console.error(err);

      // Optional cleanup
      setTimeout(() => {
        if (fs.existsSync(docxPath)) fs.unlinkSync(docxPath);
      }, 5000);
    });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({
      message: "PDF to Word conversion failed",
      error: err.message,
    });
  }
};
