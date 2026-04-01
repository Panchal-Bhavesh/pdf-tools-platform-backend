import fs from "fs-extra";
import { deletePDFPages } from "../services/delete.pdf.service.js";

export async function deletePdfController(req, res) {
  try {
    const file = req.file;
    const pages = JSON.parse(req.body.pages || "[]");

    if (!file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    if (!pages.length) {
      return res.status(400).json({ message: "Pages to delete are required" });
    }

    const outputPath = await deletePDFPages(file, pages);

    await fs.remove(file.path);
    res.download(outputPath, "deleted-pages.pdf", async () => {
      await fs.remove(outputPath);
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
