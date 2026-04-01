import path from "path";
import fs from "fs";
import { convertJpgToPdf } from "../services/jpgtopdf.service.js";

export const convertJpgToPdfController = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const outputDir = path.join(process.cwd(), "converted_docs");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `converted_${Date.now()}.pdf`);
    const imageBuffers = req.files.map((f) => f.buffer);

    const pdfPath = await convertJpgToPdf(imageBuffers, outputPath);

    res.download(pdfPath, "output.pdf", (err) => {
      if (err) console.error(err);
      setTimeout(() => {
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      }, 5000);
    });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({
      message: "JPG to PDF conversion failed",
      error: err.message,
    });
  }
};
