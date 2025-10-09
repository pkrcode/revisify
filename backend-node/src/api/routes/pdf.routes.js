import { Router } from 'express';
import multer from 'multer';
import { protect } from '../middlewares/auth.middleware.js';
import { 
    uploadPdfController, 
    updatePdfStatusController, 
    getAllPdfsController 
} from '../controllers/pdf.controller.js';

const router = Router();

// --- Multer Configuration for file uploads ---
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDFs are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 50 // 50MB file size limit
  }
});

/**
 * @route   GET /api/v1/pdfs
 * @desc    Get all PDFs for the logged-in user
 * @access  Private
 */
router.get('/', protect, getAllPdfsController);


/**
 * @route   POST /api/v1/pdfs/upload
 * @desc    Upload one or more PDF files
 * @access  Private
 */
router.post(
  '/upload',
  protect,
  upload.array('pdfs', 10), // Expect up to 10 files with the field name 'pdfs'
  uploadPdfController
);

/**
 * @route   POST /api/v1/pdfs/update-status
 * @desc    Callback for the AI service to update PDF processing status
 * @access  Internal (No user-facing auth, but could be secured with a secret key)
 */
router.post('/update-status', updatePdfStatusController);


export default router;

