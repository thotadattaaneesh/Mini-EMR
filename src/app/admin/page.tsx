"use client";

import { useEffect, useState } from 'react';
import styles from './admin.module.css';
import PatientSidebar from './PatientSidebar';
import AppointmentItem from './AppointmentItem';
import PrescriptionItem from './PrescriptionItem';

type Patient = {
  id: number;
  name: string;
  email: string;
};

type FullPatient = Patient & {
  appointments: any[];
  prescriptions: any[];
};

export default function AdminDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [patientsError, setPatientsError] = useState<string | null>(null);

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientDetails, setPatientDetails] = useState<FullPatient | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [isEditingPatient, setIsEditingPatient] = useState(false);

  // Forms state
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  useEffect(() => {
    setIsLoadingPatients(true);
    setPatientsError(null);
    fetch('/api/patients', { credentials: 'omit' })
      .then(async res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setPatients(data);
        setIsLoadingPatients(false);
      })
      .catch(err => {
        console.error("Failed to fetch patients", err);
        setPatientsError("Could not load patients list.");
        setIsLoadingPatients(false);
      });
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      refreshData();
    }
  }, [selectedPatientId]);

  const refreshData = () => {
    if (!selectedPatientId) return;
    setIsLoadingDetails(true);
    setDetailsError(null);
    fetch(`/api/patients/${selectedPatientId}`, { credentials: 'omit' })
      .then(async res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        setPatientDetails(data);
        setShowAppointmentForm(false);
        setShowPrescriptionForm(false);
        setIsLoadingDetails(false);
      })
      .catch(err => {
        console.error("Failed to fetch patient details", err);
        setDetailsError("Could not load patient details.");
        setIsLoadingDetails(false);
      });
  };

  const handleEditPatient = (id: number) => {
    setSelectedPatientId(id);
    setIsEditingPatient(true);
  };

  const handleUpdatePatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password') || undefined,
    };
    await fetch(`/api/patients/${selectedPatientId}`, {
      method: 'PATCH',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    fetch('/api/patients', { credentials: 'omit' })
      .then(res => res.json())
      .then(data => setPatients(data));
      
    setIsEditingPatient(false);
    refreshData();
  };

  const handleCreateAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      provider: formData.get('provider'),
      datetime: formData.get('datetime'),
      repeat: formData.get('repeat'),
      userId: selectedPatientId
    };

    await fetch('/api/appointments', {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    refreshData();
  };

  const handleCreatePrescription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      medication: formData.get('medication'),
      dosage: formData.get('dosage'),
      quantity: formData.get('quantity'),
      refill_on: formData.get('refill_on'),
      refill_schedule: formData.get('refill_schedule'),
      userId: selectedPatientId
    };

    await fetch('/api/prescriptions', {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    refreshData();
  };

  return (
    <div className={styles.container}>

      <PatientSidebar
        patients={patients}
        selectedPatientId={selectedPatientId}
        onSelectPatient={(id) => { setSelectedPatientId(id); setIsEditingPatient(false); }}
        onEditPatient={handleEditPatient}
        isLoading={isLoadingPatients}
        error={patientsError}
      />


      <main className={styles.main}>
        {!selectedPatientId && (
          <div className={styles.card}>
            <p>Select a patient from the sidebar to view their details.</p>
          </div>
        )}

        {selectedPatientId && isLoadingDetails && (
          <div className={styles.card}>
            <p style={{ color: '#6b7280' }}>Loading patient details...</p>
          </div>
        )}

        {selectedPatientId && detailsError && (
          <div className={styles.card}>
            <p style={{ color: '#ef4444' }}>{detailsError}</p>
            <button className={styles.button} onClick={refreshData}>Try Again</button>
          </div>
        )}

        {selectedPatientId && !isLoadingDetails && !detailsError && patientDetails && (
          <>
            <div className={styles.card}>
              {!isEditingPatient ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h1 className={styles.cardTitle}>{patientDetails.name}</h1>
                      <p>Email: {patientDetails.email}</p>
                    </div>
                    <button className={styles.buttonSecondary} onClick={() => setIsEditingPatient(true)}>Edit Patient</button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdatePatient}>
                  <h2 className={styles.cardTitle}>Edit Patient</h2>
                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input name="name" defaultValue={patientDetails.name} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input name="email" type="email" defaultValue={patientDetails.email} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>New Password (leave blank to keep current)</label>
                    <input name="password" type="password" />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className={styles.button}>Save Changes</button>
                    <button type="button" className={styles.buttonSecondary} onClick={() => setIsEditingPatient(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>

            <div className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className={styles.cardTitle}>Appointments</h2>
                <button className={styles.buttonSecondary} onClick={() => setShowAppointmentForm(!showAppointmentForm)}>
                  {showAppointmentForm ? 'Cancel' : 'Add Appointment'}
                </button>
              </div>

              {showAppointmentForm && (
                <form onSubmit={handleCreateAppointment} style={{ marginTop: '16px', marginBottom: '16px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <div className={styles.formGroup}>
                    <label>Provider Name</label>
                    <input name="provider" required placeholder="Dr. Smith" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Date & Time</label>
                    <input name="datetime" type="datetime-local" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Repeat</label>
                    <select name="repeat">
                      <option value="none">None</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <button type="submit" className={styles.button}>Save Appointment</button>
                </form>
              )}

              {patientDetails.appointments.length > 0 ? (
                <div>
                  {patientDetails.appointments.map(app => (
                    <AppointmentItem key={app.id} appointment={app} refreshData={refreshData} isAdmin={true} />
                  ))}
                </div>
              ) : (
                <p style={{ marginTop: '16px', color: '#6b7280' }}>No appointments found.</p>
              )}
            </div>

            <div className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className={styles.cardTitle}>Prescriptions</h2>
                <button className={styles.buttonSecondary} onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}>
                  {showPrescriptionForm ? 'Cancel' : 'Add Prescription'}
                </button>
              </div>

              {showPrescriptionForm && (
                <form onSubmit={handleCreatePrescription} style={{ marginTop: '16px', marginBottom: '16px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <div className={styles.formGroup}>
                    <label>Medication</label>
                    <select name="medication" required>
                      <option value="">Select Medication</option>
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
                    <select name="dosage" required>
                      <option value="">Select Dosage</option>
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
                    <input name="quantity" type="number" required placeholder="30" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Next Refill On</label>
                    <input name="refill_on" type="date" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Refill Schedule</label>
                    <select name="refill_schedule">
                      <option value="none">None</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <button type="submit" className={styles.button}>Save Prescription</button>
                </form>
              )}

              {patientDetails.prescriptions.length > 0 ? (
                <div>
                  {patientDetails.prescriptions.map(rx => (
                    <PrescriptionItem key={rx.id} rx={rx} refreshData={refreshData} isAdmin={true} />
                  ))}
                </div>
              ) : (
                <p style={{ marginTop: '16px', color: '#6b7280' }}>No prescriptions found.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
