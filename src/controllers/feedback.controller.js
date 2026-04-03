export async function feedbackController(req, res) {
  try {
    const { rating, note, tool } = req.body;

    if (rating === undefined || rating === null) {
      return res.status(400).json({ message: "rating is required." });
    }

    console.log(
      `[Feedback] tool=${tool ?? "unknown"} rating=${rating} note=${note ?? ""}`,
    );

    return res.status(200).json({ message: "Feedback received. Thank you!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
