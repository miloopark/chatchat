import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings'
import SurveyComponent from './pages/Questionnaire/SurveyComponent.jsx';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/questionnaire" element={<SurveyComponent />} />
          {/* Define other routes here */}
        </Routes>
      </div>
    </Router>
  );
}

/*<Route path="/" element={<Home />} /> */

export default App;
