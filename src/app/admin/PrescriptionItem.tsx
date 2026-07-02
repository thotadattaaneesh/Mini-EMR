import React, { useState } from 'react';
import styles from './admin.module.css';

type Prescription = {
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refill_on: string;
  refill_schedule: string;
};

export default function PrescriptionItem({ rx, refreshData, isAdmin = false }: { rx: Prescription; refreshData: () => void; isAdmin?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete prescription?")) return;
    await fetch(`/api/prescriptions/${rx.id}`, { 
      method: 'DELETE',
      credentials: isAdmin ? 'omit' : 'same-origin'
    });
    refreshData();
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      medication: formData.get('medication'),
      dosage: formData.get('dosage'),
      quantity: formData.get('quantity'),
      refill_on: formData.get('refill_on'),
      refill_schedule: formData.get('refill_schedule'),
    };
    await fetch(`/api/prescriptions/${rx.id}`, {
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
          <strong>{rx.medication}</strong> ({rx.dosage}) - Next Refill: {new Date(rx.refill_on).toLocaleDateString()}
        </div>
        <button className={styles.buttonSecondary} onClick={() => { setIsExpanded(!isExpanded); setIsEditing(false); }}>
          {isExpanded ? 'Hide' : 'View'}
        </button>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
          {!isEditing ? (
            <>
              <p><strong>Medication:</strong> {rx.medication}</p>
              <p><strong>Dosage:</strong> {rx.dosage}</p>
              <p><strong>Quantity:</strong> {rx.quantity}</p>
              <p><strong>Refill On:</strong> {new Date(rx.refill_on).toLocaleDateString()}</p>
              <p><strong>Schedule:</strong> {rx.refill_schedule}</p>
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
                <label>Medication</label>
                <select name="medication" defaultValue={rx.medication} required>
                  <option value="Diovan">Diovan</option>
                  <option value="Lexapro">Lexapro</option>
                  <option value="Metformin">Metformin</option>
                  <option value="Ozempic">Ozempic</option>
                  <option value="Prozac">Prozac</option>
                  <option value="Seroquel">Seroquel</option>
                  <option value="Tegretol">Tegretol</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Dosage</label>
                <select name="dosage" defaultValue={rx.dosage} required>
                  <option value="1mg">1mg</option>
                  <option value="2mg">2mg</option>
                  <option value="3mg">3mg</option>
                  <option value="5mg">5mg</option>
                  <option value="10mg">10mg</option>
                  <option value="25mg">25mg</option>
                  <option value="50mg">50mg</option>
                  <option value="100mg">100mg</option>
                  <option value="250mg">250mg</option>
                  <option value="500mg">500mg</option>
                  <option value="1000mg">1000mg</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Quantity</label>
                <input name="quantity" type="number" defaultValue={rx.quantity} required />
              </div>
              <div className={styles.formGroup}>
                <label>Next Refill On</label>
                <input name="refill_on" type="date" defaultValue={new Date(rx.refill_on).toISOString().slice(0, 10)} required />
              </div>
              <div className={styles.formGroup}>
                <label>Refill Schedule</label>
                <select name="refill_schedule" defaultValue={rx.refill_schedule}>
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
