import { useState, useEffect } from 'react';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { getAuthToken, removeAuthToken } from './services/apiConfig';
import { logout } from './services/authService';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = getAuthToken();
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error parsing user data:', err);
        removeAuthToken();
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData.user));
    setUser(userData.user);
    setIsAuthenticated(true);
  };

  const handleSignupSuccess = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData.user));
    setUser(userData.user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

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

