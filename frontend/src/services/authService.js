import API_BASE_URL, { setAuthToken, removeAuthToken } from './apiConfig.js';

/**
 * Login user
 * @route POST /api/v1/auth/login
 * @access Public
 * @param {string} email - User email
 * @param {string} password - User password
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to login");
  }

  const data = await response.json();
  
  // Store the token if it exists
  if (data.token) {
    setAuthToken(data.token);
  }
  
  return data;
};

/**
 * Signup new user
 * @route POST /api/v1/auth/signup
 * @access Public
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 */
export const signup = async (name, email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to signup");
  }

  const data = await response.json();
  
  // Store the token if it exists
  if (data.token) {
    setAuthToken(data.token);
  }
  
  return data;
};

/**
 * Logout user
 */
export const logout = () => {
  removeAuthToken();
};
