const Upload = require('../Models/uploadmodel');
const axios = require('axios');

exports.uploadFile = async (req, res) => {
    console.log('Upload request received');
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'No video file uploaded' 
            });
        }
        const { description } = req.body;
        console.log("req", req.body)
        
        // Create minimal upload record - only store what you need
        const uploadData = new Upload({
            filepath: req.file.path,           // Full file path for backend
            filename: req.file.filename,       // Just the filename
            description: description,          // Optional description
            type: 'file_upload'               // Add type to distinguish from URL imports
        });
        
        const savedUpload = await uploadData.save();

        // Return minimal response for frontend
        res.status(201).json({
            success: true,
            savedUpload
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server Error' 
        });
    }
};

exports.importVideoFromUrl = async (req, res) => {
    console.log('Video URL import request received');
    try {
        const { url, description } = req.body;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'Video URL is required'
            });
        }

        let metadata = {};

        // Handle YouTube URLs with official API
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            try {
                const videoId = extractYouTubeVideoId(url);
                if (!videoId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid YouTube URL'
                    });
                }

                // Use YouTube Data API
                const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
                    params: {
                        part: 'snippet,contentDetails,statistics',
                        id: videoId,
                        key: process.env.YOUTUBE_API_KEY // Make sure you have this in .env
                    }
                });
                if (response.data.items.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Video not found'
                    });
                }
                const video = response.data.items[0];
                // Parse duration from PT format (PT4M13S = 4 minutes 13 seconds)
                const duration = parseDuration(video.contentDetails.duration);
                
                metadata = {
                    title: video.snippet.title,
                    description: video.snippet.description,
                    duration: duration,
                    thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
                    author: video.snippet.channelTitle,
                    viewCount: parseInt(video.statistics.viewCount),
                    uploadDate: video.snippet.publishedAt,
                    videoId: videoId,
                    platform: 'youtube'
                };

            } catch (apiError) {
                console.error('YouTube API error:', apiError);
                return res.status(400).json({
                    success: false,
                    message: 'Failed to extract YouTube video information using API'
                });
            }
        }
        // Handle other URLs...
        else {
            const path = require('path');
            metadata = {
                title: path.basename(url),
                description: description || '',
                platform: 'direct',
                duration: null,
                thumbnail: null
            };
        }

        // Create upload record with metadata
        const uploadData = new Upload({
            url: url,
            filename: metadata.title || 'Imported Video',
            description: description || metadata.description,
            metadata: metadata,
            type: 'url_import'
        });

        const savedUpload = await uploadData.save();

        res.status(201).json({
            success: true,
            savedUpload: savedUpload,
            metadata: metadata
        });

    } catch (error) {
        console.error('URL import error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to import video from URL',
            error: error.message
        });
    }
};

// Helper functions
function extractYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function parseDuration(duration) {
    // Convert PT4M13S to seconds
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
}

function extractVimeoId(url) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
}

async function getVimeoMetadata(videoId) {
    if (!process.env.VIMEO_ACCESS_TOKEN) {
        throw new Error('Vimeo access token not configured');
    }
    
    const response = await axios.get(`https://api.vimeo.com/videos/${videoId}`, {
        headers: {
            'Authorization': `bearer ${process.env.VIMEO_ACCESS_TOKEN}`
        }
    });
    return response.data;
}
