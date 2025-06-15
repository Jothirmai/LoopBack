// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux'; // Import useSelector
import { store } from './app/store';
import { logout } from './features/auth/authSlice'; // Assuming logout action exists

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import About from './pages/About';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Locator from './pages/Locator';
import Rewards from './pages/Rewards';
import Scan from './pages/Scan';

import 'bootstrap-icons/font/bootstrap-icons.css';
import { Toaster } from 'react-hot-toast';

const AppContent = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Assuming your authSlice has an `isAuthenticated` state

  // Determine if Navbar should be hidden
  // Consider if PostLoginHome should always show Navbar. If so, adjust this array.
  const hideNavbar = ['/login', '/register', '/'].includes(location.pathname);

  // This useEffect is for cross-tab/window logout synchronization. Keep this.
  useEffect(() => {
    const syncLogout = (event) => {
      if (event.key === 'logout') {
        dispatch(logout());
        navigate('/');
      }
    };
    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, [dispatch, navigate]);

  // The 'beforeunload' useEffect that caused logout on refresh has been REMOVED.
  // Your authentication state should now persist across refreshes,
  // provided your authSlice checks for and loads the token from localStorage
  // when the app initializes.

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {!hideNavbar && <Navbar />}
      <div className="container">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/home' element={<About />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/locator' element={<Locator />} />
          <Route path='/rewards' element={<Rewards />} />
          <Route path='/scan' element={<Scan />} />
          {/* Add a route for PostLoginHome if it's a separate path */}
        </Routes>
      </div>
      <Footer />
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;