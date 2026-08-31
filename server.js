const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// FRONTEND
// =========================

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


// =========================
// TIKTOK API FUNCTION
// =========================

async function getTikTokVideo(url) {

  if (!url) {
    throw new Error("TikTok URL is required");
  }

  const response = await axios.get("https://tikwm.com/api/", {
    params: {
      url: url
    },
    timeout: 30000,
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  const data = response.data;

  if (
    !data ||
    !data.data ||
    !data.data.play
  ) {
    throw new Error("Failed to fetch TikTok video");
  }

  return {
    status: "success",
    title: data.data.title || "TikTok Video",

    // Frontend ke liye
    videoUrl: data.data.play,

    // Compatibility
    downloadUrl: data.data.play,
    video: data.data.play,

    cover: data.data.cover || null
  };
}


// =========================
// TIKTOK DOWNLOAD - POST
// =========================

app.post("/api/tiktok/download", async (req, res) => {

  try {

    const url =
      req.body.url ||
      req.body.tiktokUrl;

    if (!url) {

      return res.status(400).json({
        status: "error",
        error: "TikTok URL is required"
      });

    }

    const result = await getTikTokVideo(url);

    res.json(result);

  } catch (error) {

    console.error(
      "TikTok POST Error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      error:
        error.message ||
        "Failed to fetch TikTok video"
    });

  }

});


// =========================
// TIKTOK DOWNLOAD - GET
// =========================
// Ye bhi rakha hai compatibility ke liye.

app.get("/api/tiktok/download", async (req, res) => {

  try {

    const url = req.query.url;

    if (!url) {

      return res.status(400).json({
        status: "error",
        error: "TikTok URL is required"
      });

    }

    const result = await getTikTokVideo(url);

    res.json(result);

  } catch (error) {

    console.error(
      "TikTok GET Error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      error:
        error.message ||
        "Failed to fetch TikTok video"
    });

  }

});


// =========================
// TIKTOK SIMPLE API
// =========================

app.get("/api/tiktok", async (req, res) => {

  try {

    const url = req.query.url;

    if (!url) {

      return res.status(400).json({
        status: "error",
        error: "TikTok URL is required"
      });

    }

    const result = await getTikTokVideo(url);

    res.json(result);

  } catch (error) {

    console.error(
      "TikTok API Error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      error:
        error.message ||
        "Failed to fetch TikTok video"
    });

  }

});


// =========================
// YOUTUBE THUMBNAIL
// =========================

app.get("/api/thumbnail", (req, res) => {

  try {

    const url = req.query.url;

    if (!url) {

      return res.status(400).json({
        status: "error",
        error: "YouTube URL is required"
      });

    }

    let videoId = null;

    // youtube.com/watch?v=
    if (url.includes("v=")) {

      videoId =
        url.split("v=")[1]
          .split("&")[0];

    }

    // youtu.be/
    else if (url.includes("youtu.be/")) {

      videoId =
        url.split("youtu.be/")[1]
          .split("?")[0];

    }

    if (!videoId) {

      return res.status(400).json({
        status: "error",
        error: "Invalid YouTube URL"
      });

    }

    const thumbnail =
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    res.json({
      status: "success",
      thumbnail: thumbnail
    });

  } catch (error) {

    console.error(
      "Thumbnail Error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      error: "Error generating thumbnail"
    });

  }

});


// =========================
// 404 JSON FOR API ROUTES
// =========================

app.use("/api", (req, res) => {

  res.status(404).json({
    status: "error",
    error: "API endpoint not found"
  });

});


// =========================
// SERVER
// =========================

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `VideoFlow server running on port ${PORT}`
  );

});
