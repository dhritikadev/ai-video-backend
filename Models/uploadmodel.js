const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
    },
    filepath: {
      type: String, // For file uploads
    },
    url: {
      type: String, // For URL imports
    },
    type: {
      type: String,
      enum: ['file_upload', 'url_import'],
      default: 'file_upload'
    },
    metadata: {
      title: String,
      description: String,
      duration: Number,
      thumbnail: String,
      author: String,
      viewCount: Number,
      uploadDate: Date,
      videoId: String,
      platform: String, // 'youtube', 'vimeo', 'direct'
      tags: [String],
      category: String,
      language: String
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const upload = mongoose.model("Upload", uploadSchema);
module.exports = upload;
