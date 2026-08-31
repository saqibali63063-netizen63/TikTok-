const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


// ================================
// HOME
// ================================

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


// ================================
// TIKTOK VIDEO API
// ================================

app.get("/api/tiktok", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        status: "error",
        error: "TikTok URL is required"
      });
    }

    if (!url.includes("tiktok.com")) {
      return res.status(400).json({
        status: "error",
        error: "Please enter a valid TikTok URL"
      });
    }

    console.log("TikTok URL:", url);

    const apiUrl =
      "https://www.tikwm.com/api/?url=" +
      encodeURIComponent(url);

    const response = await axios.get(apiUrl, {
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"
      }
    });

    console.log("TikWM response:", response.data);

    if (
      !response.data ||
      response.data.code !== 0 ||
      !response.data.data
    ) {
      return res.status(400).json({
        status: "error",
        error:
          response.data?.msg ||
          "TikTok video could not be found"
      });
    }

    const data = response.data.data;

    const video =
      data.hdplay ||
      data.play ||
      data.wmplay;

    if (!video) {
      return res.status(400).json({
        status: "error",
        error: "Video download link was not found"
      });
    }

    res.json({
      status: "success",
      title: data.title || "TikTok Video",
      video: video,
      cover: data.cover || "",
      author: data.author?.nickname || ""
    });

  } catch (error) {
    console.error("TikTok API Error:", error.message);

    res.status(500).json({
      status: "error",
      error: "Failed to fetch TikTok video"
    });
  }
});


// ================================
// TIKTOK MP4 DOWNLOAD
// ================================

app.get("/api/tiktok/download", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).send("TikTok URL is required");
    }

    if (!url.includes("tiktok.com")) {
      return res.status(400).send("Invalid TikTok URL");
    }

    console.log("Downloading TikTok:", url);

    const apiUrl =
      "https://www.tikwm.com/api/?url=" +
      encodeURIComponent(url);

    const response = await axios.get(apiUrl, {
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"
      }
    });

    if (
      !response.data ||
      response.data.code !== 0 ||
      !response.data.data
    ) {
      return res.status(400).send("Could not get TikTok video");
    }

    const videoUrl =
      response.data.data.hdplay ||
      response.data.data.play ||
      response.data.data.wmplay;

    if (!videoUrl) {
      return res.status(400).send("Video download link not found");
    }

    console.log("Video URL found");

    const video = await axios.get(videoUrl, {
      responseType: "stream",
      timeout: 120000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"
      }
    });

    res.setHeader("Content-Type", "video/mp4");

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="VideoFlow-TikTok.mp4"'
    );

    video.data.pipe(res);

  } catch (error) {
    console.error("Download Error:", error.message);

    if (!res.headersSent) {
      res.status(500).send("Failed to download video");
    }
  }
});


// ================================
// YOUTUBE THUMBNAIL
// ================================

app.get("/api/thumbnail", (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        status: "error",
        error: "YouTube URL is required"
      });
    }

    let videoId = "";

    // youtube.com/watch?v=
    if (url.includes("v=")) {
      videoId = url
        .split("v=")[1]
        .split("&")[0];
    }

    // youtu.be/
    else if (url.includes("youtu.be/")) {
      videoId = url
        .split("youtu.be/")[1]
        .split("?")[0];
    }

    // youtube.com/shorts/
    else if (url.includes("/shorts/")) {
      videoId = url
        .split("/shorts/")[1]
        .split("?")[0];
    }

    if (!videoId) {
      return res.status(400).json({
        status: "error",
        error: "Invalid YouTube URL"
      });
    }

    const thumbnail =
      "https://img.youtube.com/vi/" +
      videoId +
      "/maxresdefault.jpg";

    res.json({
      status: "success",
      thumbnail: thumbnail,
      videoId: videoId
    });

  } catch (error) {
    console.error("Thumbnail Error:", error.message);

    res.status(500).json({
      status: "error",
      error: "Error generating thumbnail"
    });
  }
});


// ================================
// API HEALTH CHECK
// ================================

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "VideoFlow API is running"
  });
});


// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `VideoFlow server running on port ${PORT}`
  );
});
