import path from "path";
import fs from "fs";
import { protectPdf } from "../services/protect.pdf.service.js";

export const protectPdfController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    const { password } = req.body;
    if (!password || password.trim() === "") {
      return res.status(400).json({ message: "Password is required" });
    }

    const outputDir = path.join(process.cwd(), "converted_docs");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `protected_${Date.now()}.pdf`);

    const protectedPath = await protectPdf(req.file.buffer, password.trim(), outputPath);

    res.download(protectedPath, "protected.pdf", (err) => {
      if (err) console.error(err);
      setTimeout(() => {
        if (fs.existsSync(protectedPath)) fs.unlinkSync(protectedPath);
      }, 5000);
    });
  } catch (err) {
    console.error("Protection error:", err);
    res.status(500).json({
      message: "PDF protection failed",
      error: err.message,
    });
  }
};
