// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { colors } from '../styles/theme';
import { List, X } from 'react-bootstrap-icons'; // Hamburger and close icons

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navLinkStyle = {
    color: 'white',
    textDecoration: 'none',
    margin: '0.5rem 1rem',
    display: 'block',
  };

  return (
    <nav style={{
      backgroundColor: colors.primaryColor,
      padding: '1rem',
      color: 'white',
      position: 'relative',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Logo */}
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
          LoopBack
        </Link>

        {isAuthenticated && (
  <div className="menu-icon" style={{ display: 'none', cursor: 'pointer' }}>
    <button onClick={toggleMenu} style={{ background: 'none', border: 'none', color: 'white' }}>
      {menuOpen ? <X size={28} /> : <List size={28} />}
    </button>
  </div>
)}

        {/* Links - Desktop */}
        <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center' }}>
          {!menuOpen && (
            isAuthenticated ? (
              <>
                <Link to="/home" style={navLinkStyle}>Home</Link>
                <Link to="/locator" style={navLinkStyle}>Locator</Link>
                <Link to="/scan" style={navLinkStyle}>Scan</Link>
                <Link to="/rewards" style={navLinkStyle}>Redeem Rewards</Link>
                <Link to="/rewards-history" style={navLinkStyle}>Rewards History</Link>
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid white',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginLeft: '1rem',
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
              </>
            )
          )}
        </div>
      </div>

      {/* Links - Mobile */}
      {menuOpen && (
        <div className="nav-links-mobile" style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: colors.primaryColor,
          padding: '1rem',
        }}>
          {isAuthenticated &&(
            <>
              <Link to="/home" onClick={toggleMenu} style={navLinkStyle}>Home</Link>
              <Link to="/locator" onClick={toggleMenu} style={navLinkStyle}>Locator</Link>
              <Link to="/scan" onClick={toggleMenu} style={navLinkStyle}>Scan</Link>
              <Link to="/rewards" onClick={toggleMenu} style={navLinkStyle}>Redeem Rewards</Link>
              <Link to="/rewards-history" onClick={toggleMenu} style={navLinkStyle}>Rewards History</Link>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid white',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}

      {/* Inline Styles for Media Queries */}
      <style>
        {`
          @media (max-width: 768px) {
            .menu-icon {
              display: block !important;
            }
            .nav-links-desktop {
              display: none !important;
            }
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
