import fs from "fs-extra";
import { compressPDF } from "../services/compress.pdf.service.js";
import { removeFile, removeFiles } from "../utils/fileCleanup.js";

export async function compressPDFController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file required." });
    }
    const level = req.body.level || "recommended";
    const { outputPath, originalSize, compressedSize } = await compressPDF(
      req.file,
      level
    );

    res.setHeader("X-Original-Size", originalSize);
    res.setHeader("X-Compressed-Size", compressedSize);
    res.download(outputPath, "compressed.pdf", async () => {
      await removeFiles([outputPath, req.file.path]);
    });
  } catch (error) {
    console.error("Error compressing PDF:", error);
    await removeFile(req.file.path);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}
