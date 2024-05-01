import React, { useState } from "react";
import logo from "../assets/logo.svg";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div
        className="logo-container"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img src={logo} alt="Company Logo" className="logo" />
        {isHovering && (
          <ul className="menu">
            <li>
              <a href="#profile" className="menu-link">
                Profile
              </a>
            </li>
            <li>
              <a href="#developers" className="menu-link">
                Developers
              </a>
            </li>
            <li>
              <a href="#pricing" className="menu-link">
                Pricing
              </a>
            </li>
            <li>
              <a href="#resources" className="menu-link">
                Resources
              </a>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
