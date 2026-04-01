import path from "path";
import fs from "fs";
import { convertPdfToPptx } from "../services/pdftopptx.service.js";

export const convertPdfToPptxController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    const outputDir = path.join(process.cwd(), "converted_docs");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `converted_${Date.now()}.pptx`);

    // Convert using buffer directly
    const pptxPath = await convertPdfToPptx(req.file.buffer, outputPath);

    res.download(pptxPath, (err) => {
      if (err) console.error(err);

      // Optional cleanup
      setTimeout(() => {
        if (fs.existsSync(pptxPath)) fs.unlinkSync(pptxPath);
      }, 5000);
    });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({
      message: "PDF to PPTX conversion failed",
      error: err.message,
    });
  }
};
