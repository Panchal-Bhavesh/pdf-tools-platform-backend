import path from "path";
import fs from "fs";
import { convertOfficeToPdf } from "../services/officetopdf.service.js";

export const convertExcelToPdfController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No Excel file uploaded" });
    }

    const outputDir = path.join(process.cwd(), "converted_docs");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `converted_${Date.now()}.pdf`);
    const ext = req.file.originalname.endsWith(".xls") ? "xls" : "xlsx";

    const pdfPath = await convertOfficeToPdf(req.file.buffer, ext, outputPath);

    res.download(pdfPath, "output.pdf", (err) => {
      if (err) console.error(err);
      setTimeout(() => {
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      }, 5000);
    });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({
      message: "Excel to PDF conversion failed",
      error: err.message,
    });
  }
};
