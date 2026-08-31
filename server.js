const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/* =========================
   HOME
========================= */
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

/* =========================
   TIKTOK DOWNLOADER
========================= */

// Main endpoint
app.get("/api/tiktok", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        status: "error",
        error: "TikTok URL is required"
      });
    }

    const response = await axios.get("https://tikwm.com/api/", {
      params: {
        url: url
      },
      timeout: 30000
    });

    const data = response.data;

    if (!data || !data.data || !data.data.play) {
      return res.status(500).json({
        status: "error",
        error: "Failed to fetch TikTok video"
      });
    }

    res.json({
      status: "success",
      title: data.data.title || "TikTok Video",
      video: data.data.play,
      cover: data.data.cover || null
    });

  } catch (error) {
    console.error("TikTok Error:", error.message);

    res.status(500).json({
      status: "error",
      error: "Failed to fetch TikTok video"
    });
  }
});


/* =========================
   DOWNLOAD ENDPOINT
========================= */

// Ye endpoint bhi rakha hai taake
// /api/tiktok/download wali problem na aaye.

app.get("/api/tiktok/download", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        status: "error",
        error: "TikTok URL is required"
      });
    }

    const response = await axios.get("https://tikwm.com/api/", {
      params: {
        url: url
      },
      timeout: 30000
    });

    const data = response.data;

    if (!data || !data.data || !data.data.play) {
      return res.status(500).json({
        status: "error",
        error: "Failed to fetch TikTok video"
      });
    }

    res.json({
      status: "success",
      title: data.data.title || "TikTok Video",
      video: data.data.play,
      cover: data.data.cover || null
    });

  } catch (error) {
    console.error("TikTok Download Error:", error.message);

    res.status(500).json({
      status: "error",
      error: "Failed to fetch TikTok video"
    });
  }
});


/* =========================
   YOUTUBE THUMBNAIL
========================= */

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
      videoId = url.split("v=")[1].split("&")[0];
    }

    // youtu.be/
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
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
    console.error("Thumbnail Error:", error.message);

    res.status(500).json({
      status: "error",
      error: "Error generating thumbnail"
    });
  }
});


/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`VideoFlow server running on port ${PORT}`);
});
