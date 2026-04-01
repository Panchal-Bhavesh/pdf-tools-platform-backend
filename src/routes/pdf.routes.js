import express from "express";
import multer from "multer";
import { upload } from "../middlewares/upload.middleware.js";
import { mergePdfController } from "../controllers/merge.pdf.controller.js";
import { splitPdfController } from "../controllers/split.pdf.controller.js";
import { compressPDFController } from "../controllers/compress.pdf.controller.js";
import { extractPdfPagesController } from "../controllers/extract.pdf.controller.js";
import { reorderPdfController } from "../controllers/reorder.pdf.controller.js";
import { deletePdfController } from "../controllers/delete.pdf.controller.js";
import { convertPdfController } from "../controllers/pdftoword.pdf.controller.js";
import { convertPdfToPptxController } from "../controllers/pdftopptx.pdf.controller.js";
import { convertPdfToExcelController } from "../controllers/pdftoexcel.pdf.controller.js";
import { convertPdfToJpgController } from "../controllers/pdftojpg.pdf.controller.js";
import { convertJpgToPdfController } from "../controllers/jpgtopdf.pdf.controller.js";
import { convertWordToPdfController } from "../controllers/wordtopdf.pdf.controller.js";
import { convertPptxToPdfController } from "../controllers/pptxtopdf.pdf.controller.js";
import { convertExcelToPdfController } from "../controllers/exceltopdf.pdf.controller.js";
import { protectPdfController } from "../controllers/protect.pdf.controller.js";
import { unlockPdfController } from "../controllers/unlock.pdf.controller.js";
const router = express.Router();
const storage = multer({ storage: multer.memoryStorage() });

router.post("/merge", upload.array("files"), mergePdfController);
router.post("/split", upload.single("file"), splitPdfController);
router.post("/compress", upload.single("file"), compressPDFController);
router.post("/extract", storage.single("file"), extractPdfPagesController);
router.post("/reorder", upload.single("file"), reorderPdfController);
router.post("/delete", upload.single("file"), deletePdfController);
router.post("/pdf-to-word", storage.single("file"), convertPdfController);
router.post("/pdf-to-pptx", storage.single("file"), convertPdfToPptxController);
router.post("/pdf-to-ppt", storage.single("file"), convertPdfToPptxController);
router.post(
  "/pdf-to-excel",
  storage.single("file"),
  convertPdfToExcelController,
);
router.post("/pdf-to-jpg", storage.single("file"), convertPdfToJpgController);
router.post("/jpg-to-pdf", storage.array("files"), convertJpgToPdfController);
router.post("/word-to-pdf", storage.single("file"), convertWordToPdfController);
router.post("/pptx-to-pdf", storage.single("file"), convertPptxToPdfController);
router.post("/excel-to-pdf", storage.single("file"), convertExcelToPdfController);
router.post("/protect-pdf", storage.single("file"), protectPdfController);
router.post("/unlock-pdf", storage.single("file"), unlockPdfController);

export default router;
