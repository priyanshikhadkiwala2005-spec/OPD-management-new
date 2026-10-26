import { useRef } from 'react';

export default function PrintPrescription({ prescription, doctorInfo, clinicInfo, onClose }) {
  const printRef = useRef();
  if (!prescription) return null;

  function fmt(str) {
    if (!str) return '';
    return new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      + ', ' + new Date(str).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  function handlePrint() {
    const html = printRef.current.innerHTML;
    const win  = window.open('', '_blank', 'width=820,height=700');
    win.document.write(`<html><head><title>Prescription</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Segoe UI',sans-serif;padding:32px;color:#0f172a;font-size:14px}
      .rx-header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2563eb;padding-bottom:14px;margin-bottom:18px}
      .rx-clinic-name{font-size:22px;font-weight:800;color:#2563eb}
      .rx-clinic-sub{font-size:12px;color:#64748b;margin-top:3px;line-height:1.6}
      .rx-doc-info{text-align:right;font-size:12px;color:#334155;line-height:1.7}
      .rx-doc-info strong{font-size:15px;color:#0f172a}
      .rx-patient-strip{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin-bottom:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
      .rx-pat-field label{font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:#94a3b8;font-weight:700;display:block;margin-bottom:2px}
      .rx-pat-field span{font-size:13px;font-weight:700;color:#0f172a}
      .rx-section-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:#64748b;margin:14px 0 8px;border-bottom:1px dashed #e2e8f0;padding-bottom:4px}
      .rx-diag-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
      .rx-diag-box{background:#f8fafc;border-radius:6px;padding:10px 12px;border-left:3px solid #2563eb}
      .rx-diag-box label{font-size:10px;text-transform:uppercase;color:#94a3b8;font-weight:700;display:block;margin-bottom:4px}
      .rx-diag-box p{font-size:13px;color:#0f172a;line-height:1.5}
      table{width:100%;border-collapse:collapse;margin-bottom:14px}
      table th{background:#eff6ff;color:#2563eb;font-size:11px;font-weight:700;text-transform:uppercase;padding:8px 12px;text-align:left;border:1px solid #dbeafe}
      table td{padding:9px 12px;font-size:13px;border:1px solid #f1f5f9}
      table tr:nth-child(even) td{background:#fafbff}
      .badge-inj{background:#fce7f3;color:#9f1239;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700}
      .badge-med{background:#eff6ff;color:#2563eb;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700}
      .rx-notes-box{background:#fff7ed;border-left:3px solid #f59e0b;border-radius:6px;padding:10px 14px;margin-bottom:12px}
      .rx-notes-box label{font-size:10px;text-transform:uppercase;color:#92400e;font-weight:700;display:block;margin-bottom:4px}
      .rx-notes-box p{font-size:13px;color:#78350f;line-height:1.5}
      .rx-footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:24px;padding-top:16px;border-top:2px solid #e2e8f0}
      .rx-sign .line{width:140px;height:1px;background:#0f172a;margin-bottom:4px;margin-left:auto}
      .rx-sign p{font-size:11px;color:#64748b;text-align:right}
      .rx-sign strong{font-size:13px;color:#0f172a;display:block;text-align:right}
    </style></head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  }

  const p = prescription;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box print-modal-box" onClick={e => e.stopPropagation()}>

        {/* Toolbar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ fontSize:17, fontWeight:700, color:'#0f172a' }}>💊 Prescription Preview</h3>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={handlePrint} style={{
              padding:'8px 20px', background:'linear-gradient(135deg,#2563eb,#0ea5e9)',
              color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:700, cursor:'pointer',
            }}>🖨️ Print / PDF</button>
            <button onClick={onClose} style={{
              padding:'8px 14px', background:'#f1f5f9', color:'#64748b',
              border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer',
            }}>✕ Close</button>
          </div>
        </div>

        {/* Printable area */}
        <div ref={printRef}>

          {/* Header */}
          <div className="rx-header">
            <div>
              <div className="rx-clinic-name">🏥 {clinicInfo?.clinic_name || 'MedCare OPD'}</div>
              <div className="rx-clinic-sub">
                {clinicInfo?.clinic_address && <span>{clinicInfo.clinic_address}<br /></span>}
                {clinicInfo?.clinic_phone   && <span>📞 {clinicInfo.clinic_phone}</span>}
                {clinicInfo?.clinic_email   && <span> | ✉️ {clinicInfo.clinic_email}</span>}
              </div>
            </div>
            <div className="rx-doc-info">
              <strong>Dr. {doctorInfo?.full_name || ''}</strong><br />
              {doctorInfo?.specialization || ''}<br />
              {doctorInfo?.mobile && <span>📞 {doctorInfo.mobile}</span>}
            </div>
          </div>

          {/* Patient strip */}
          <div className="rx-patient-strip">
            <div className="rx-pat-field"><label>Patient</label><span>{p.patient_name}</span></div>
            <div className="rx-pat-field"><label>Age / Gender</label><span>{p.age} yrs / {p.gender}</span></div>
            <div className="rx-pat-field"><label>Blood Group</label><span>{p.blood_group || '—'}</span></div>
            <div className="rx-pat-field"><label>Date</label><span>{fmt(p.created_at)}</span></div>
          </div>

          {/* Diagnosis */}
          {(p.symptoms || p.diagnosis) && (
            <>
              <div className="rx-section-title">Clinical Notes</div>
              <div className="rx-diag-grid">
                {p.symptoms  && <div className="rx-diag-box"><label>Symptoms</label><p>{p.symptoms}</p></div>}
                {p.diagnosis && <div className="rx-diag-box"><label>Diagnosis</label><p>{p.diagnosis}</p></div>}
              </div>
            </>
          )}

          {/* Medicines Table */}
          {p.medicines?.length > 0 && (
            <>
              <div className="rx-section-title">℞ Prescription</div>
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Medicine</th><th>Type</th>
                    <th>Dosage</th><th>Frequency</th><th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {p.medicines.map((m, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td><strong>{m.medicine_name}</strong></td>
                      <td>
                        <span className={m.medicine_type === 'Injection' ? 'badge-inj' : 'badge-med'}>
                          {m.medicine_type}
                        </span>
                      </td>
                      <td>{m.dosage}</td>
                      <td>{m.frequency}</td>
                      <td>{m.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Notes */}
          {(p.additional_instructions || p.notes_for_patient) && (
            <div className="rx-notes-box">
              <label>📝 Instructions &amp; Notes</label>
              {p.additional_instructions && <p>{p.additional_instructions}</p>}
              {p.notes_for_patient && <p style={{ marginTop:4 }}>{p.notes_for_patient}</p>}
            </div>
          )}

          {/* Footer */}
          <div className="rx-footer">
            <div style={{ fontSize:12, color:'#94a3b8' }}>
              Consultation Fee:{' '}
              <strong style={{ color:'#10b981' }}>
                ₹{Number(p.consultation_fee).toLocaleString('en-IN', { minimumFractionDigits:2 })}
              </strong>
            </div>
            <div className="rx-sign">
              <div className="line" />
              <strong>Dr. {doctorInfo?.full_name || ''}</strong>
              <p>{doctorInfo?.specialization || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
