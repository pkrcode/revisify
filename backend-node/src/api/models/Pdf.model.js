import mongoose from 'mongoose';

const pdfSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'failed'],
      default: 'pending',
    },
    vectorStorePath: { type: String },
    // NEW FIELD: To store the final video recommendations
    youtubeRecommendations: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        videoId: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Pdf = mongoose.model('Pdf', pdfSchema);
export default Pdf;