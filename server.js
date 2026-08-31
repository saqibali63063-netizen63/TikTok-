const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Website files serve karo
app.use(express.static(__dirname));

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// TikTok Downloader API
app.get("/api/tiktok", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        status: "error",
        error: "TikTok URL is required"
      });
    }

    const response = await axios.get(
      "https://tikwm.com/api/",
      {
        params: { url: url },
        timeout: 20000
      }
    );

    const data = response.data;

    if (!data || !data.data || !data.data.play) {
      return res.status(400).json({
        status: "error",
        error: "Video could not be found"
      });
    }

    res.json({
      status: "success",
      title: data.data.title || "TikTok Video",
      video: data.data.play
    });

  } catch (error) {
    console.error("TikTok error:", error.message);

    res.status(500).json({
      status: "error",
      error: "Failed to fetch TikTok video"
    });
  }
});

// YouTube Thumbnail API
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

    // youtube.com/shorts/
    if (url.includes("/shorts/")) {
      videoId = url.split("/shorts/")[1].split("?")[0];
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
    console.error("Thumbnail error:", error.message);

    res.status(500).json({
      status: "error",
      error: "Error generating thumbnail"
    });
  }
});

// Railway PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
