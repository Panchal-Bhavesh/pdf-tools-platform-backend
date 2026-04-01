import path from "path";
import fs from "fs";
import { convertPdfToExcel } from "../services/pdftoexcel.service.js";

export const convertPdfToExcelController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    const outputDir = path.join(process.cwd(), "converted_docs");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `converted_${Date.now()}.xlsx`);

    // Convert using buffer directly
    const excelPath = await convertPdfToExcel(req.file.buffer, outputPath);

    res.download(excelPath, (err) => {
      if (err) console.error(err);

      // Optional cleanup
      setTimeout(() => {
        if (fs.existsSync(excelPath)) fs.unlinkSync(excelPath);
      }, 5000);
    });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({
      message: "PDF to Excel conversion failed",
      error: err.message,
    });
  }
};
