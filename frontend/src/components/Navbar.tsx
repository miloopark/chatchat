import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../contexts/authProvider';
import { signOutUser } from '../services/authService';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      closeMenu();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navbarClass = `navbar ${isScrolled ? 'scrolled' : ''} ${isOpen ? 'menu-open' : ''}`;
  
  return (
    <nav className={navbarClass}>
      <div className="navbar-container">
        <Link to="/" className="app-title" onClick={closeMenu}>
          <span className="app-name">chat^2</span>
        </Link>
        
        <div className="menu-toggle" onClick={toggleMenu}>
          <div className={`hamburger ${isOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <div className={`menu ${isOpen ? 'open' : ''}`}>
          <Link to="/" className="menu-item" onClick={closeMenu}>Home</Link>
          <Link to="/about" className="menu-item" onClick={closeMenu}>About</Link>
          
          {!loading && (
            <>
              {currentUser ? (
                <>
                  <Link to="/dashboard" className="menu-item" onClick={closeMenu}>Dashboard</Link>
                  <Link to="/questionnaire" className="menu-item" onClick={closeMenu}>Personalize</Link>
                  <Link to="/profile" className="menu-item profile-link" onClick={closeMenu}>
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="Profile" className="profile-photo" />
                    ) : (
                      <div className="profile-icon">
                        {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <span>Profile</span>
                  </Link>
                  <button className="logout-button" onClick={handleLogout}>Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="menu-item" onClick={closeMenu}>Log In</Link>
                  <Link to="/signup" className="menu-item highlight-button" onClick={closeMenu}>Sign Up</Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
