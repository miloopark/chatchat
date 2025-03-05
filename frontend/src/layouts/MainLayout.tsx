import React, { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import './MainLayout.css';
import { Link } from 'react-router-dom';

// Define the navigation routes
const routes = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Chat' },
  { path: '/about', label: 'About' },
  { path: '/profile', label: 'Profile' },
];

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="main-layout">
      <Navbar routes={routes} />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default MainLayout; 