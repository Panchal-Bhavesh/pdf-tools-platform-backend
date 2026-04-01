import app from "./app.js";
import { exec } from "child_process";

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// Log presence of Ghostscript binary at startup (helps verify Docker/Railway install)
exec("which gs", (err, stdout, stderr) => {
  if (err) {
    console.warn(
      "Ghostscript (gs) not found in PATH:",
      err.message || stderr || "",
    );
  } else {
    console.log("Ghostscript found at:", stdout.trim());
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
