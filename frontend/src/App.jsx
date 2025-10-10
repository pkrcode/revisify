import { useState, useEffect } from 'react';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { getAuthToken, removeAuthToken } from './services/apiConfig';
import { logout } from './services/authService';
import { getUserProfile } from './services/userService';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          // Fetch user profile using the token
          const userData = await getUserProfile();
          console.log('User data on init:', userData);
          setUser(userData); // Backend returns user data directly
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Error fetching user profile:', err);
          removeAuthToken();
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLoginSuccess = async (userData) => {
    // Token is already saved by authService
    console.log('Login success, fetching user profile...');
    try {
      // Fetch user profile after login
      const userProfile = await getUserProfile();
      console.log('User profile response:', userProfile);
      setUser(userProfile); // Backend returns user data directly, not wrapped in { user: ... }
      setIsAuthenticated(true);
      console.log('Authentication state updated:', { user: userProfile, isAuthenticated: true });
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const handleSignupSuccess = async (userData) => {
    // Token is already saved by authService
    console.log('Signup success, fetching user profile...');
    try {
      // Fetch user profile after signup
      const userProfile = await getUserProfile();
      console.log('User profile response:', userProfile);
      setUser(userProfile); // Backend returns user data directly, not wrapped in { user: ... }
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <MainPage onLogout={handleLogout} />;
  }

  return showLogin ? (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onSwitchToSignup={() => setShowLogin(false)}
    />
  ) : (
    <SignupPage
      onSignupSuccess={handleSignupSuccess}
      onSwitchToLogin={() => setShowLogin(true)}
    />
  );
}

export default App;

