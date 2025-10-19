import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_BASE_URL = 'http://localhost:5000/api/v1';
const PDF_DIR = path.join(process.cwd(), 'scripts', 'seed-pdfs');

const USER_EMAIL = process.env.ADMIN_EMAIL;
const USER_PASSWORD = process.env.ADMIN_PASSWORD;

async function getAuthToken() {
  console.log('Logging in to upload PDFs...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: USER_EMAIL,
      password: USER_PASSWORD,
    });
    console.log('Login successful.');
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    throw new Error('Could not authenticate user.');
  }
}

async function uploadPdf(token, filePath) {
  const form = new FormData();
  form.append('pdfs', fs.createReadStream(filePath));
  
  const filename = path.basename(filePath);
  console.log(`Uploading ${filename}...`);
  
  try {
    await axios.post(`${API_BASE_URL}/pdfs/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log(`Successfully triggered processing for ${filename}.`);
  } catch (error) {
    console.error(`Failed to upload ${filename}:`, error.response ? error.response.data : error.message);
  }
}

async function runSeeder() {
  if (!USER_EMAIL || !USER_PASSWORD) {
    console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file (these are your regular user credentials).');
    return;
  }

  try {
    const token = await getAuthToken();
    const pdfFiles = fs.readdirSync(PDF_DIR).filter(file => file.endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      console.log('No PDF files found in the seed-pdfs directory.');
      return;
    }

    console.log(`Found ${pdfFiles.length} PDFs to upload.`);
    for (const file of pdfFiles) {
      const fullPath = path.join(PDF_DIR, file);
      await uploadPdf(token, fullPath);
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 2000)); 
    }
    
    console.log('PDF upload process completed. Files will be processed by the AI service.');
  } catch (error) {
    console.error('An error occurred during the seeding process:', error.message);
  }
}

runSeeder();