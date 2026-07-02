import React, { useState } from 'react';
import styles from './admin.module.css';

type Patient = {
  id: number;
  name: string;
  email: string;
};

type Props = {
  patients: Patient[];
  selectedPatientId: number | null;
  onSelectPatient: (id: number) => void;
  onEditPatient: (id: number) => void;
  isLoading?: boolean;
  error?: string | null;
};

export default function PatientSidebar({ patients, selectedPatientId, onSelectPatient, onEditPatient, isLoading, error }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className={styles.sidebar}>

      <img
        src="https://cdn.prod.website-files.com/64ac3a433180d94638a63ead/64acc00e5f8b28a1f8b430a9_Logo-Zealthy-Black.svg"
        alt="Zealthy Logo"
        style={{ width: '100%', maxWidth: '150px', marginBottom: '24px' }}
      />
      <h2 className={styles.header}>EMR</h2>

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
        />
      </div>

      {isLoading ? (
        <p style={{ padding: '0.75rem', color: '#6b7280' }}>Loading patients...</p>
      ) : error ? (
        <p style={{ padding: '0.75rem', color: '#ef4444' }}>{error}</p>
      ) : (
        <ul className={styles.patientList}>
          {filteredPatients.map(p => (
            <li
              key={p.id}
              className={`${styles.patientItem} ${selectedPatientId === p.id ? styles.active : ''}`}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span onClick={() => onSelectPatient(p.id)} style={{ flex: 1 }}>{p.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onEditPatient(p.id); }}
                style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#6b7280' }}
                title="Edit Patient"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
