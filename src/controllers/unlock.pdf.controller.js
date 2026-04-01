import path from "path";
import fs from "fs";
import { unlockPdf } from "../services/unlock.pdf.service.js";

export const unlockPdfController = async (req, res) => {
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

    const outputPath = path.join(outputDir, `unlocked_${Date.now()}.pdf`);

    const unlockedPath = await unlockPdf(req.file.buffer, password.trim(), outputPath);

    res.download(unlockedPath, "unlocked.pdf", (err) => {
      if (err) console.error(err);
      setTimeout(() => {
        if (fs.existsSync(unlockedPath)) fs.unlinkSync(unlockedPath);
      }, 5000);
    });
  } catch (err) {
    console.error("Unlock error:", err);

    if (err.message === "WRONG_PASSWORD") {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.status(500).json({
      message: "PDF unlock failed",
      error: err.message,
    });
  }
};
