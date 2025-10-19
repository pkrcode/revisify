import Pdf from '../models/Pdf.model.js';
import cloudinary from '../../config/cloudinary.js';
import axios from 'axios';
import streamifier from 'streamifier';
import { google } from 'googleapis';

// NEW: Initialize the YouTube Data API client
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY, // Make sure to add this to your .env file
});

/**
 * @desc    Upload PDFs, save to Cloudinary, and trigger AI processing.
 * @route   POST /api/v1/pdfs/upload
 * @access  Private
 */
export const uploadPdfController = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded.' });
  }

  try {
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'pdf_coursebooks',
            resource_type: 'raw',
            access_mode: 'public',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve({ result, originalname: file.originalname });
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    const pdfRecords = [];
    for (const { result, originalname } of uploadResults) {
      const newPdf = new Pdf({
        filename: originalname,
        cloudinaryUrl: result.secure_url,
        cloudinaryId: result.public_id,
        owner: req.user.id,
        processingStatus: 'processing',
      });
      await newPdf.save();
      pdfRecords.push(newPdf);

      // Trigger AI service in a fire-and-forget manner
      axios.post(`${process.env.AI_SERVICE_URL}/api/v1/process-pdf`, {
        pdfId: newPdf._id.toString(),
        pdfUrl: newPdf.cloudinaryUrl,
      }).catch(err => {
        console.error(`[${newPdf._id}] Failed to trigger AI service:`, err.message);
        newPdf.processingStatus = 'failed';
        newPdf.save();
      });
    }

    res.status(201).json({
      message: `${pdfRecords.length} file(s) are being processed.`,
      pdfs: pdfRecords,
    });

  } catch (error) {
    console.error('Upload Controller Error:', error.message);
    res.status(500).json({ message: 'Server error during file upload.' });
  }
};

/**
 * @desc    Callback from AI service to update status and save YouTube recommendations.
 * @route   POST /api/v1/pdfs/update-status
 * @access  Internal
 */
export const updatePdfStatusController = async (req, res) => {
  const { pdfId, status, vectorStorePath, youtubeTopics } = req.body;

  if (!pdfId || !status) {
    return res.status(400).json({ message: 'pdfId and status are required.' });
  }

  try {
    const pdf = await Pdf.findById(pdfId);
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found.' });
    }

    pdf.processingStatus = status;
    if (status === 'ready' && vectorStorePath) {
      pdf.vectorStorePath = vectorStorePath;
    }

    // NEW: If processing is ready and we received topics, find the videos
    if (status === 'ready' && youtubeTopics && youtubeTopics.length > 0) {
      console.log(`[${pdfId}] Received topics, searching YouTube...`);
      const recommendations = [];
      
      for (const topic of youtubeTopics) {
        try {
          const searchResponse = await youtube.search.list({
            part: 'snippet',
            q: topic,
            type: 'video',
            maxResults: 1, // Get only the top result
          });

          const topResult = searchResponse.data.items[0];
          if (topResult) {
            recommendations.push({
              title: topResult.snippet.title,
              videoId: topResult.id.videoId,
              url: `https://www.youtube.com/watch?v=${topResult.id.videoId}`,
            });
          }
        } catch (ytError) {
          console.error(`[${pdfId}] Error searching YouTube for "${topic}":`, ytError.message);
        }
      }
      
      pdf.youtubeRecommendations = recommendations;
      console.log(`[${pdfId}] Saved ${recommendations.length} YouTube recommendations.`);
    }

    await pdf.save();
    res.status(200).json({ message: `Status for PDF ${pdfId} updated to ${status}.` });

  } catch (error) {
    console.error('Update Status Error:', error.message);
    res.status(500).json({ message: 'Server error while updating PDF status.' });
  }
};

// ... (imports and other functions remain the same) ...

/**
 * @desc    Get all PDFs for the logged-in user
 * @route   GET /api/v1/pdfs
 * @access  Private
 */
export const getAllPdfsController = async (req, res) => {
    try {
        // Get all PDFs owned by any user - shared library approach
        const pdfs = await Pdf.find({ processingStatus: 'ready' }).sort({ updatedAt: -1 });
        
        res.status(200).json({ pdfs });
    } catch (error) {
        console.error('Get All PDFs Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching PDFs.' });
    }
};