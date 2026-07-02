import React, { useState } from 'react';
import styles from './admin.module.css';

type Appointment = {
  id: number;
  provider: string;
  datetime: string;
  repeat: string;
};

export default function AppointmentItem({ appointment, refreshData, isAdmin = false }: { appointment: Appointment; refreshData: () => void; isAdmin?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete appointment?")) return;
    await fetch(`/api/appointments/${appointment.id}`, { 
      method: 'DELETE',
      credentials: isAdmin ? 'omit' : 'same-origin'
    });
    refreshData();
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      provider: formData.get('provider'),
      datetime: formData.get('datetime'),
      repeat: formData.get('repeat'),
    };
    await fetch(`/api/appointments/${appointment.id}`, {
      method: 'PATCH',
      credentials: isAdmin ? 'omit' : 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setIsEditing(false);
    refreshData();
  };

  return (
    <div style={{ border: '1px solid #e5e7eb', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>{appointment.provider}</strong> - {new Date(appointment.datetime).toLocaleString()}
        </div>
        <button className={styles.buttonSecondary} onClick={() => { setIsExpanded(!isExpanded); setIsEditing(false); }}>
          {isExpanded ? 'Hide' : 'View'}
        </button>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
          {!isEditing ? (
            <>
              <p><strong>Provider:</strong> {appointment.provider}</p>
              <p><strong>Date & Time:</strong> {new Date(appointment.datetime).toLocaleString()}</p>
              <p><strong>Repeat:</strong> {appointment.repeat}</p>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                {isAdmin && (
                  <>
                    <button className={styles.button} onClick={() => setIsEditing(true)}>Edit</button>
                    <button className={styles.buttonDanger} onClick={handleDelete}>Delete</button>
                  </>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleUpdate}>
              <div className={styles.formGroup}>
                <label>Provider Name</label>
                <input name="provider" defaultValue={appointment.provider} required />
              </div>
              <div className={styles.formGroup}>
                <label>Date & Time</label>
                <input name="datetime" type="datetime-local" defaultValue={new Date(appointment.datetime).toISOString().slice(0, 16)} required />
              </div>
              <div className={styles.formGroup}>
                <label>Repeat</label>
                <select name="repeat" defaultValue={appointment.repeat}>
                  <option value="none">None</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button type="submit" className={styles.button}>Save</button>
                <button type="button" className={styles.buttonSecondary} onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
