import React from 'react';
import styles from './portal.module.css';
import AppointmentItem from '@/app/admin/AppointmentItem';
import PrescriptionItem from '@/app/admin/PrescriptionItem';

type Props = {
  upcomingAppointments: any[];
  upcomingRefills: any[];
  refreshData: () => void;
};

export default function OverviewTab({ upcomingAppointments, upcomingRefills, refreshData }: Props) {
  return (
    <>
      <div className={styles.card}>
        <h1 className={styles.cardTitle}>7-Day Overview</h1>
        <p>Here is what you have coming up this week.</p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Upcoming Appointments</h2>
        {upcomingAppointments.length > 0 ? (
          upcomingAppointments.map(app => (
            <AppointmentItem key={app.id} appointment={app} refreshData={refreshData} />
          ))
        ) : (
          <p style={{ color: '#6b7280' }}>No appointments in the next 7 days.</p>
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Upcoming Refills</h2>
        {upcomingRefills.length > 0 ? (
          upcomingRefills.map(rx => (
            <PrescriptionItem key={rx.id} rx={rx} refreshData={refreshData} />
          ))
        ) : (
          <p style={{ color: '#6b7280' }}>No refills needed in the next 7 days.</p>
        )}
      </div>
    </>
  );
}
