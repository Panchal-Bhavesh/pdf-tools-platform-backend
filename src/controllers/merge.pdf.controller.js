import { mergePDFs } from "../services/merge.pdf.service.js";
import { removeFiles } from "../utils/fileCleanup.js";

export async function mergePdfController(req, res) {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ message: "At least 2 PDFs required." });
    }

    const outputPath = await mergePDFs(req.files);
    const filePaths = req.files.map((file) => file.path);

    res.download(outputPath, "merged.pdf", () => {
      removeFiles([...filePaths, outputPath]);
    });
  } catch (error) {
    const filePaths = req.files ? req.files.map((file) => file.path) : [];
    removeFiles(filePaths);
    res.status(500).json({ error: error.message });
  }
}
