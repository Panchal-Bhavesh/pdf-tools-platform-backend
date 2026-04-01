import fs from "fs-extra";
import { reorderPDF } from "../services/reorder.pdf.service.js";

export async function reorderPdfController(req, res) {
  try {
    const { order } = req.body;
    if (!order) {
      return res.status(400).json({ message: "Page order is required" });
    }

    const pageOrder = JSON.parse(order);
    if (!Array.isArray(pageOrder) || pageOrder.length === 0) {
      return res.status(400).json({ message: "Invalid order array" });
    }
    const outputPath = await reorderPDF(req.file, pageOrder);

    await fs.remove(req.file.path);
    res.download(outputPath, "reordered.pdf", () => {
      fs.remove(outputPath);
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
