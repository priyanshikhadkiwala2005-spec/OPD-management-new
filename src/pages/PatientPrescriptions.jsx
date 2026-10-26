import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

import { API, getToken } from '../api';

export default function PatientPrescriptions() {
  const { user }   = useAuth();
  const patientName = user?.full_name || 'Patient';

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    fetch(`${API}/prescriptions/my`, { headers: { 'Authorization': "Bearer ${getToken()}" } })
      .then(r => r.json())
      .then(d => { if (d.success) setPrescriptions(d.data.prescriptions); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function formatDateTime(str) {
    if (!str) return '';
    const d = new Date(str);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) {
    return (
      <Layout role="patient" name={patientName} title="My Prescriptions" subtitle="View all your prescriptions">
        <div style={{ textAlign: 'center', padding: 80, color: '#64748b' }}>⏳ Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout role="patient" name={patientName} title="My Prescriptions" subtitle="View all your prescriptions and medications">

      {prescriptions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 60, marginBottom: 14 }}>💊</div>
          <p style={{ color: '#64748b', fontSize: 15 }}>No prescriptions yet.</p>
        </div>
      ) : prescriptions.map(pr => (
        <div className="consult-card" key={pr.id}>
          <div className="consult-header">
            <div className="patient-left">
              <div className="pat-av">👨‍⚕️</div>
              <div>
                <div className="c-pat-name">{pr.doctor_name}</div>
                <div className="c-pat-meta">
                  {pr.specialization} • {pr.medicines.length} medicine(s)
                </div>
              </div>
            </div>
            <div className="consult-right">
              <span className="fee-tag">₹{Number(pr.consultation_fee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              <span className="date-tag">🕒 {formatDateTime(pr.created_at)}</span>
            </div>
          </div>

          <div className="consult-body">
            {(pr.symptoms || pr.diagnosis) && (
              <div className="info-grid">
                {pr.symptoms && (
                  <div className="info-block">
                    <label>Symptoms</label>
                    <p>{pr.symptoms}</p>
                  </div>
                )}
                {pr.diagnosis && (
                  <div className="info-block">
                    <label>Diagnosis</label>
                    <p>{pr.diagnosis}</p>
                  </div>
                )}
              </div>
            )}

            {pr.medicines.length > 0 && (
              <div className="medicines-section">
                <h4>💊 Prescribed Medicines ({pr.medicines.length})</h4>
                <div className="med-tags">
                  {pr.medicines.map(m => (
                    <div key={m.id} className={`med-tag${m.medicine_type === 'Injection' ? ' injection' : ''}`}>
                      <div className="mname">{m.medicine_type === 'Injection' ? '💉 ' : '💊 '}{m.medicine_name}</div>
                      <div className="mdetail">{m.dosage} • {m.frequency} • {m.duration}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(pr.notes_for_patient || pr.additional_instructions) && (
              <div className="notes-section">
                <label>📝 Instructions from Doctor</label>
                {pr.additional_instructions && <p>{pr.additional_instructions}</p>}
                {pr.notes_for_patient && <p style={{ marginTop: 4 }}>{pr.notes_for_patient}</p>}
              </div>
            )}
          </div>
        </div>
      ))}
    </Layout>
  );
}
