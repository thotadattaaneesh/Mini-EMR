import React, { useState } from 'react';
import styles from './portal.module.css';

type Props = {
  patientId: number;
  currentName: string;
  currentEmail: string;
  refreshData: () => void;
};

export default function SettingsTab({ patientId, currentName, currentEmail, refreshData }: Props) {
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setIsUpdatingProfile(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
    };

    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setProfileSuccess('Profile updated successfully!');
        refreshData();
      } else {
        const errorData = await res.json();
        setProfileError(errorData.error || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileError('Network error. Please try again.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');
    setIsUpdatingPassword(true);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      setIsUpdatingPassword(false);
      return;
    }

    const data = {
      oldPassword: formData.get('oldPassword'),
      password: newPassword,
    };

    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setPasswordSuccess('Password updated successfully!');
        (e.target as HTMLFormElement).reset();
      } else {
        const errorData = await res.json();
        setPasswordError(errorData.error || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordError('Network error. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div>
      <h1 className={styles.cardTitle} style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Profile & Settings</h1>
      
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Update Profile</h2>
        {profileSuccess && <p style={{ color: 'green', marginBottom: '16px' }}>{profileSuccess}</p>}
        {profileError && <p style={{ color: 'red', marginBottom: '16px' }}>{profileError}</p>}
        
        <form onSubmit={handleUpdateProfile}>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input name="name" defaultValue={currentName} required disabled={isUpdatingProfile} />
          </div>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input name="email" type="email" defaultValue={currentEmail} required disabled={isUpdatingProfile} />
          </div>
          <button type="submit" className={styles.button} disabled={isUpdatingProfile}>
            {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Change Password</h2>
        {passwordSuccess && <p style={{ color: 'green', marginBottom: '16px' }}>{passwordSuccess}</p>}
        {passwordError && <p style={{ color: 'red', marginBottom: '16px' }}>{passwordError}</p>}

        <form onSubmit={handleUpdatePassword}>
          <div className={styles.formGroup}>
            <label>Current Password</label>
            <input name="oldPassword" type="password" required disabled={isUpdatingPassword} />
          </div>
          <div className={styles.formGroup}>
            <label>New Password</label>
            <input name="newPassword" type="password" required disabled={isUpdatingPassword} />
          </div>
          <div className={styles.formGroup}>
            <label>Confirm New Password</label>
            <input name="confirmPassword" type="password" required disabled={isUpdatingPassword} />
          </div>
          <button type="submit" className={styles.button} disabled={isUpdatingPassword}>
            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
