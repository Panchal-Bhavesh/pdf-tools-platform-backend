import path from "path";
import fs from "fs";
import { convertPdfToJpg } from "../services/pdftojpg.service.js";

export const convertPdfToJpgController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    const outputDir = path.join(process.cwd(), "converted_docs");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `converted_${Date.now()}.zip`);

    const zipPath = await convertPdfToJpg(req.file.buffer, outputPath);

    res.download(zipPath, "images.zip", (err) => {
      if (err) console.error(err);
      setTimeout(() => {
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
      }, 5000);
    });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({
      message: "PDF to JPG conversion failed",
      error: err.message,
    });
  }
};
