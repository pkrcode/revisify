import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_BASE_URL = 'http://localhost:5000/api/v1';
const PDF_DIR = path.join(process.cwd(), 'scripts', 'seed-pdfs');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function getAuthToken() {
  console.log('Attempting to log in as admin...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    console.log('Login successful.');
    return response.data.token;
  } catch (error) {
    console.error('Admin login failed:', error.response ? error.response.data : error.message);
    throw new Error('Could not authenticate admin user.');
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
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file.');
    return;
  }

  try {
    const token = await getAuthToken();
    const pdfFiles = fs.readdirSync(PDF_DIR).filter(file => file.endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      console.log('No PDF files found in the seed-pdfs directory.');
      return;
    }

    console.log(`Found ${pdfFiles.length} PDFs to seed.`);
    for (const file of pdfFiles) {
      const fullPath = path.join(PDF_DIR, file);
      await uploadPdf(token, fullPath);
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 2000)); 
    }
    
    console.log('Seeding process completed.');
  } catch (error) {
    console.error('An error occurred during the seeding process:', error.message);
  }
}

runSeeder();