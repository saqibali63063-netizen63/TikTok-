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
   TIKTOK API
========================= */

async function getTikTokData(url) {

  const response = await axios.get("https://tikwm.com/api/", {
    params: {
      url: url
    },
    timeout: 30000
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
    title: data.data.title || "TikTok Video",
    video: data.data.play,
    cover: data.data.cover || null
  };
}


/* =========================
   TIKTOK DOWNLOAD / GET VIDEO
========================= */

app.get("/api/tiktok", async (req, res) => {

  try {

    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        status: "error",
        error: "TikTok URL is required"
      });
    }

    const result = await getTikTokData(url);

    res.json({
      status: "success",
      title: result.title,
      video: result.video,
      cover: result.cover
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
   TIKTOK DOWNLOAD ENDPOINT
   SUPPORTS GET + POST
========================= */

app.get("/api/tiktok/download", async (req, res) => {

  try {

    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        status: "error",
        error: "TikTok URL is required"
      });
    }

    const result = await getTikTokData(url);

    res.json({
      status: "success",
      title: result.title,
      video: result.video,
      cover: result.cover
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
   POST TIKTOK DOWNLOAD
========================= */

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

    const result = await getTikTokData(url);

    res.json({
      status: "success",
      title: result.title,
      video: result.video,
      cover: result.cover
    });

  } catch (error) {

    console.error("TikTok POST Error:", error.message);

    res.status(500).json({
      status: "error",
      error: "Failed to fetch TikTok video"
    });

  }

});


/* =========================
   FORCE MP4 DOWNLOAD
========================= */

app.get("/api/tiktok/file", async (req, res) => {

  try {

    const videoUrl = req.query.video;

    if (!videoUrl) {
      return res.status(400).send("Video URL is required");
    }

    const response = await axios.get(videoUrl, {
      responseType: "stream",
      timeout: 60000
    });

    res.setHeader(
      "Content-Type",
      "video/mp4"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="VideoFlow-TikTok.mp4"'
    );

    response.data.pipe(res);

  } catch (error) {

    console.error(
      "Video Download Error:",
      error.message
    );

    if (!res.headersSent) {
      res.status(500).send(
        "Unable to download video"
      );
    }

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

    if (url.includes("v=")) {
      videoId =
        url.split("v=")[1].split("&")[0];
    }

    if (url.includes("youtu.be/")) {
      videoId =
        url.split("youtu.be/")[1].split("?")[0];
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


/* =========================
   SERVER
========================= */

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `VideoFlow server running on port ${PORT}`
  );

});
