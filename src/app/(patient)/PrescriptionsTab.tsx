import React from 'react';
import styles from './portal.module.css';
import PrescriptionItem from '@/app/admin/PrescriptionItem';

type Props = {
  prescriptions: any[];
  refreshData: () => void;
};

export default function PrescriptionsTab({ prescriptions, refreshData }: Props) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>All Active Prescriptions</h2>
      {prescriptions.length > 0 ? (
        prescriptions.map(rx => (
          <PrescriptionItem key={rx.id} rx={rx} refreshData={refreshData} />
        ))
      ) : (
        <p style={{ color: '#6b7280' }}>No active prescriptions on file.</p>
      )}
    </div>
  );
}
