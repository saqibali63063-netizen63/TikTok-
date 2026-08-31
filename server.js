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

async function getTikTok(url) {
  if (!url) {
    throw new Error("TikTok URL is required");
  }

  const response = await axios.get("https://tikwm.com/api/", {
    params: {
      url: url
    },
    timeout: 30000
  });

  const data = response.data;

  if (!data || !data.data || !data.data.play) {
    throw new Error("Failed to fetch TikTok video");
  }

  return {
    title: data.data.title || "TikTok Video",
    video: data.data.play,
    cover: data.data.cover || null
  };
}


/* =========================
   TIKTOK VIDEO INFO
   GET
   /api/tiktok?url=
========================= */

app.get("/api/tiktok", async (req, res) => {
  try {
    const result = await getTikTok(req.query.url);

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
      error: error.message
    });
  }
});


/* =========================
   TIKTOK DOWNLOAD
   GET
   /api/tiktok/download?url=
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

    const result = await getTikTok(url);

    /* Agar download=1 hai to
       video ko direct download karwao */

    if (req.query.download === "1") {

      const videoResponse = await axios.get(result.video, {
        responseType: "stream",
        timeout: 60000
      });

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="VideoFlow-TikTok.mp4"'
      );

      res.setHeader(
        "Content-Type",
        "video/mp4"
      );

      videoResponse.data.pipe(res);

      return;
    }

    /* Normal API response */

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
      error: "Failed to download TikTok video"
    });
  }
});


/* =========================
   TIKTOK DOWNLOAD
   POST
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

    const result = await getTikTok(url);

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
      error: error.message
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
  console.log(
    `VideoFlow server running on port ${PORT}`
  );
});
