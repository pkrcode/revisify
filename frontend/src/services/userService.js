import API_BASE_URL, { getAuthToken } from './apiConfig.js';

/**
 * Get user profile
 * @route GET /api/v1/users/profile
 * @access Private
 */
export const getUserProfile = async () => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user profile');
  }
  
  const data = await response.json();
  return data;
};
