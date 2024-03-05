// Navbar.tsx or Navbar.js
import React from 'react';
import logo from '../assets/logo.svg';
import './Navbar.css'; // Your CSS file for styles

const Navbar = () => {
  return (
    <nav className="navbar">
      <img src={logo} alt="Company Logo" className="logo" />
      <ul className="menu">
        <li><a href="#profile" className="menu-link">Profile</a></li>
        <li><a href="#developers" className="menu-link">Developers</a></li>
        <li><a href="#pricing" className="menu-link">Pricing</a></li>
        <li><a href="#resources" className="menu-link">Resources</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
