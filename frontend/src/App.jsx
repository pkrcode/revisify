import { useState } from 'react';
import MainPage from './pages/MainPage';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  // Mock user for development
  const mockUser = {
    name: 'Dev User',
    email: 'dev@example.com',
  };

  // To skip login, we can directly render MainPage with a mock user.
  // The original logic is commented out below.
  return <MainPage user={mockUser} onLogout={() => alert('Logout clicked!')} />;

  /*
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    setUser(userData.user);
  };

  const handleSignupSuccess = (userData) => {
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    setUser(userData.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (user) {
    return <MainPage user={user} onLogout={handleLogout} />;
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
  */
}

export default App;

