import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authProvider';
import { Link } from 'react-router-dom';
import { updateUserEmail, updateUserPassword, reauthenticateUser } from '../services/authService';
import '../App.css';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const validateForm = () => {
    // Reset messages
    setError(null);
    setSuccess(null);

    // Check if current password is provided
    if (!currentPassword) {
      setError('Please enter your current password to authorize changes');
      return false;
    }

    // Validating email change
    if (email && email !== currentUser?.email) {
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }

    // Validating password change
    if (newPassword) {
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Re-authenticate user first
      if (currentUser?.email) {
        await reauthenticateUser(currentUser.email, currentPassword);
      } else {
        throw new Error('User email is not available');
      }
      
      // Update email if changed
      if (email !== currentUser?.email) {
        await updateUserEmail(email);
      }
      
      // Update password if provided
      if (newPassword) {
        await updateUserPassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }
      
      setSuccess('Profile updated successfully');
      setCurrentPassword('');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="profile-container">
        <h2>Profile</h2>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Account Settings</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
      
      <div className="profile-section">
        <h3>User Information</h3>
        <form className="profile-form" onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="new-password">New Password (leave blank to keep current)</label>
            <input
              type="password"
              id="new-password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              type="password"
              id="confirm-password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="current-password">Current Password (required to make changes)</label>
            <input
              type="password"
              id="current-password"
              className="form-control"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="update-profile-button"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
      
      <div className="profile-section">
        <h3>Need to update your learning preferences?</h3>
        <p>Visit the <Link to="/questionnaire" style={{ color: '#5c6bc0', fontWeight: 'bold' }}>Personalize</Link> page to update your learning style, interests, and other preferences.</p>
      </div>
    </div>
  );
};

export default Profile; 