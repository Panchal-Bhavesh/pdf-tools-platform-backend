import express from "express";
import cors from "cors";
import multer from "multer";
import pdfRoutes from "./routes/pdf.routes.js";

const app = express();

// Frontend origin for CORS (set this in your .env or Vercel environment)
const FRONTEND_URL = process.env.FRONTEND_URL || "https://pagelypdf.vercel.app";

// CORS configuration - allow all origins for development
// The cors() middleware automatically handles OPTIONS preflight requests
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow mobile apps / curl

      const allowedOrigins = ["https://pagelypdf.vercel.app", FRONTEND_URL];

      // Use the exact origin string (not `true`) to avoid trailing-slash mismatch
      if (allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Content-Disposition"],
    exposedHeaders: [
      "Content-Disposition",
      "Content-Type",
      "X-Original-Size",
      "X-Compressed-Size",
    ],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === "POST") {
    console.log("Content-Type:", req.headers["content-type"]);
  }
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Test endpoint for PDF routes
app.get("/api/pdf/test", (req, res) => {
  res.status(200).json({ message: "PDF API is working" });
});

app.use("/api/pdf", pdfRoutes);

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Set CORS headers on error responses
  res.setHeader("Access-Control-Allow-Origin", FRONTEND_URL);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File too large. Maximum size is 50MB." });
    }
    return res
      .status(400)
      .json({ message: err.message || "File upload error" });
  }

  // Handle other errors
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

export default app;
