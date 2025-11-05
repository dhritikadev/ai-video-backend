const express = require('express');
const router = express.Router();
const upload = require('../middleware/videoupload'); 
const { uploadFile, importVideoFromUrl } = require('../Controller/upload');
// Single video upload route
router.post('/upload-video', upload.single('video'), uploadFile);
router.post('/import-video-url', importVideoFromUrl);

// Multiple video upload route
// router.post('/upload-videos', upload.array('videos', 10), uploadMultipleFiles);


module.exports = router;
