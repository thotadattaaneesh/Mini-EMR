import React from 'react';
import styles from './portal.module.css';

type Props = {
  name: string;
  activeTab: string;
  setActiveTab: (tab: 'overview' | 'appointments' | 'prescriptions' | 'settings') => void;
  handleLogout: () => void;
};

export default function PortalSidebar({ name, activeTab, setActiveTab, handleLogout }: Props) {
  return (
    <aside className={styles.sidebar}>
      <img 
        src="https://cdn.prod.website-files.com/64ac3a433180d94638a63ead/64acc00e5f8b28a1f8b430a9_Logo-Zealthy-Black.svg" 
        alt="Zealthy Logo" 
        style={{ width: '100%', maxWidth: '150px', marginBottom: '24px' }} 
      />
      <h2 className={styles.header}>Welcome, {name.split(' ')[0]}</h2>
      <ul className={styles.patientList}>
        <li 
          className={`${styles.patientItem} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Dashboard (7-Days)
        </li>
        <li 
          className={`${styles.patientItem} ${activeTab === 'appointments' ? styles.active : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments (3-Months)
        </li>
        <li 
          className={`${styles.patientItem} ${activeTab === 'prescriptions' ? styles.active : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          All Prescriptions
        </li>
        <li 
          className={`${styles.patientItem} ${activeTab === 'settings' ? styles.active : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Profile & Settings
        </li>
      </ul>
      <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
        <button className={styles.buttonSecondary} style={{ width: '100%' }} onClick={handleLogout}>Log Out</button>
      </div>
    </aside>
  );
}
