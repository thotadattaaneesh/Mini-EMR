import React from 'react';
import styles from './portal.module.css';
import AppointmentItem from '@/app/admin/AppointmentItem';

type Props = {
  appointments: any[];
  refreshData: () => void;
};

export default function AppointmentsTab({ appointments, refreshData }: Props) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Your 3-Month Schedule</h2>
      {appointments.length > 0 ? (
        appointments.map(app => (
          <AppointmentItem key={app.id} appointment={app} refreshData={refreshData} />
        ))
      ) : (
        <p style={{ color: '#6b7280' }}>No appointments scheduled for the next 3 months.</p>
      )}
    </div>
  );
}
