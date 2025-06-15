// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './app/store';
import { logout } from './features/auth/authSlice';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
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
  const hideNavbar = ['/login', '/register', '/'].includes(location.pathname);

  useEffect(() => {
    const syncLogout = (event) => {
      if (event.key === 'logout') {
        dispatch(logout());
        navigate('/login');
      }
    };
    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, [dispatch, navigate]);

  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem('token');
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

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
