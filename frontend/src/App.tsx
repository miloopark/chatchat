import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from './layouts/MainLayout';
import './layouts/MainLayout.css';
import './App.css';

// Import pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Navigation from "./pages/Navigation";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Questionnaire from "./pages/Questionnaire/Questionnaire";
import ConversationPage from "./pages/Conversation";
import Main from "./pages/Main";
import About from "./pages/About";
import Profile from "./pages/Profile";

// Auth components
import { AuthProvider } from "./contexts/authProvider";
import { ProtectedRoute } from "./contexts/protectedRoute";

// Placeholder components for pages that don't exist yet
const NotFound = () => <div><h1>404</h1><p>Page not found.</p></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/questionnaire" element={
              <ProtectedRoute>
                <Questionnaire />
              </ProtectedRoute>
            } />
            <Route path="/conversation/:conversationId" element={
              <ProtectedRoute>
                <ConversationPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* Redirects */}
            <Route path="/chat" element={<Navigate to="/dashboard" replace />} />
            <Route path="/main" element={<Navigate to="/" replace />} />
            <Route path="/navigation" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
