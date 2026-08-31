const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// TikTok info
app.get("/api/tiktok", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        error: "URL is required"
      });
    }

    const response = await axios.get(
      `https://tikwm.com/api/?url=${encodeURIComponent(url)}`,
      {
        timeout: 20000
      }
    );

    const data = response.data?.data;

    if (!data?.play) {
      return res.status(502).json({
        error: "Video could not be found"
      });
    }

    res.json({
      status: "success",
      title: data.title || "TikTok video",
      video: data.play
    });

  } catch (error) {
    console.error("TikTok error:", error.message);

    res.status(500).json({
      error: "Failed to fetch video"
    });
  }
});

// TikTok actual download
app.get("/api/tiktok/download", async (req, res) => {
  try {
    const video = req.query.video;

    if (!video) {
      return res.status(400).json({
        error: "Video URL is required"
      });
    }

    const response = await axios.get(video, {
      responseType: "stream",
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.tiktok.com/"
      }
    });

    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "video/mp4"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="tiktok-video.mp4"'
    );

    if (response.headers["content-length"]) {
      res.setHeader(
        "Content-Length",
        response.headers["content-length"]
      );
    }

    response.data.pipe(res);

  } catch (error) {
    console.error("Download error:", error.message);

    res.status(502).json({
      error: "Video download failed"
    });
  }
});

// YouTube Thumbnail
app.get("/api/thumbnail", (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        error: "URL is required"
      });
    }

    let videoId = null;

    try {
      const parsed = new URL(url);

      if (parsed.hostname.includes("youtu.be")) {
        videoId = parsed.pathname
          .split("/")
          .filter(Boolean)[0];

      } else if (parsed.hostname.includes("youtube.com")) {
        videoId = parsed.searchParams.get("v");
      }

    } catch (_) {}

    if (!videoId) {
      return res.status(400).json({
        error: "Invalid YouTube URL"
      });
    }

    const thumbnail =
      `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/maxresdefault.jpg`;

    res.json({
      status: "success",
      thumbnail: thumbnail
    });

  } catch (error) {
    res.status(500).json({
      error: "Error generating thumbnail"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
