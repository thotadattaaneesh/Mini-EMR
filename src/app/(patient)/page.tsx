"use client";

import { useEffect, useState } from 'react';
import styles from './portal.module.css';
import LoginForm from './LoginForm';
import PortalSidebar from './PortalSidebar';
import OverviewTab from './OverviewTab';
import AppointmentsTab from './AppointmentsTab';
import PrescriptionsTab from './PrescriptionsTab';
import SettingsTab from './SettingsTab';

type Patient = {
  id: number;
  name: string;
  email: string;
  appointments: any[];
  prescriptions: any[];
};

export default function PatientPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'prescriptions' | 'settings'>('overview');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(true);
        fetchFullData(data.id);
      } else {
        setIsLoggedIn(false);
      }
    } catch (e) {
      console.log("Not logged in");
      setIsLoggedIn(false);
    }
  };

  const fetchFullData = async (id: number) => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const res = await fetch(`/api/patients/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPatientData(data);
      } else {
        setDataError("Failed to load your health records.");
      }
    } catch (e) {
      setDataError("A network error occurred while loading your data.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (res.ok) {
        setIsLoggedIn(true);
        checkSession();
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      if (res.ok) {
        setIsLoggedIn(true);
        checkSession();
      } else {
        const data = await res.json();
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  };

  if (!isLoggedIn) {
    return (
      <LoginForm 
        name={name}
        setName={setName}
        email={email} 
        setEmail={setEmail} 
        password={password} 
        setPassword={setPassword} 
        error={error} 
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        isLoading={isLoggingIn}
      />
    );
  }

  if (isLoadingData) {
    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '1.25rem' }}>Loading your secure health data...</p>
      </div>
    );
  }

  if (dataError || !patientData) {
    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <p style={{ color: '#ef4444', fontSize: '1.25rem', marginBottom: '16px' }}>{dataError || 'Failed to load data.'}</p>
        <button className={styles.button} onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const upcomingAppointments = patientData.appointments.filter(app => {
    const d = new Date(app.datetime);
    return d >= now && d <= nextWeek;
  });

  const upcomingRefills = patientData.prescriptions.filter(rx => {
    const d = new Date(rx.refill_on);
    return d >= now && d <= nextWeek;
  });

  const threeMonths = new Date();
  threeMonths.setDate(now.getDate() + 90);
  const threeMonthAppointments = patientData.appointments.filter(app => {
    const d = new Date(app.datetime);
    return d <= threeMonths;
  });

  return (
    <div className={styles.container}>
      <PortalSidebar 
        name={patientData.name} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
      />

      <main className={styles.main}>
        {activeTab === 'overview' && (
          <OverviewTab 
            upcomingAppointments={upcomingAppointments} 
            upcomingRefills={upcomingRefills} 
            refreshData={() => fetchFullData(patientData.id)} 
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsTab 
            appointments={threeMonthAppointments} 
            refreshData={() => fetchFullData(patientData.id)} 
          />
        )}

        {activeTab === 'prescriptions' && (
          <PrescriptionsTab 
            prescriptions={patientData.prescriptions} 
            refreshData={() => fetchFullData(patientData.id)} 
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            patientId={patientData.id}
            currentName={patientData.name}
            currentEmail={patientData.email}
            refreshData={() => fetchFullData(patientData.id)}
          />
        )}
      </main>
    </div>
  );
}
