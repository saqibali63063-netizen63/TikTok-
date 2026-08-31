const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.static(__dirname));
app.use(cors());

// Home route
app.get("/", (req, res) => {
  res.send("API Working ✅");
});

// TikTok Downloader API
app.get("/api/tiktok", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const response = await axios.get(`https://tikwm.com/api/?url=${url}`);

    res.json({
      status: "success",
      title: response.data.data.title,
      video: response.data.data.play
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch video" });
  }
});

// YouTube Thumbnail API
app.get("/api/thumbnail", (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const videoId = url.split("v=")[1]?.split("&")[0];

    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    res.json({
      status: "success",
      thumbnail: thumbnail
    });

  } catch (err) {
    res.status(500).json({ error: "Error generating thumbnail" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
