import API_BASE_URL, { getAuthToken } from './apiConfig.js';

/**
 * Get all PDFs for the logged-in user
 * @route GET /api/v1/pdfs
 * @access Private
 */
export const getAllPdfs = async () => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/pdfs`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch PDFs');
  }
  
  const data = await response.json();
  return data;
};

/**
 * Upload one or more PDF files
 * @route POST /api/v1/pdfs/upload
 * @access Private
 * @param {FileList|File[]} files - PDF files to upload
 */
export const uploadPdfs = async (files) => {
  const token = getAuthToken();
  const formData = new FormData();
  
  // Add all files to FormData with the field name 'pdfs'
  if (files instanceof FileList) {
    Array.from(files).forEach(file => {
      formData.append('pdfs', file);
    });
  } else if (Array.isArray(files)) {
    files.forEach(file => {
      formData.append('pdfs', file);
    });
  } else {
    formData.append('pdfs', files);
  }
  
  const response = await fetch(`${API_BASE_URL}/pdfs/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type for FormData, browser will set it with boundary
    },
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload PDFs');
  }
  
  const data = await response.json();
  return data;
};
