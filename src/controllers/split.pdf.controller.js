import { splitPDF } from "../services/split.pdf.service.js";
import { removeFile, removeFiles } from "../utils/fileCleanup.js";

export async function splitPdfController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file required." });
    }
    const { mode } = req.body;
    let ranges = [];

    if (req.body.ranges) {
      ranges = JSON.parse(req.body.ranges);
    }
    const zipPath = await splitPDF({ file: req.file, mode, ranges });
    
    res.download(zipPath, "split-pdf.zip", () => {
      removeFiles([req.file.path, zipPath]);
    });
  } catch (error) {
    await removeFile(req.file.path);
    res.status(500).json({ error: error.message });
  }
}
