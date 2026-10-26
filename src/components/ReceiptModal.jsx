import { useEffect, useRef } from 'react';

export default function ReceiptModal({ isOpen, bill, clinicInfo, onClose }) {
  const printRef = useRef();

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !bill) return null;

  function handlePrint() {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=700,height=600');
    win.document.write(`
      <html><head><title>Receipt - ${bill.patient_name}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Segoe UI', sans-serif; padding: 30px; color: #0f172a; }
        .receipt-header { text-align:center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; }
        .receipt-header h1 { font-size: 22px; color: #2563eb; }
        .receipt-header p  { font-size: 13px; color: #64748b; margin-top: 3px; }
        .info-row { display:flex; justify-content:space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size:14px; }
        .info-row span:first-child { color: #64748b; }
        .info-row span:last-child  { font-weight: 700; color: #0f172a; }
        .amount-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 10px; padding: 16px; text-align:center; margin: 20px 0; }
        .amount-box .label { font-size: 12px; color: #64748b; text-transform:uppercase; letter-spacing:1px; }
        .amount-box .amount { font-size: 28px; font-weight: 800; color: #10b981; margin-top: 4px; }
        .status-paid    { background:#f0fdf4; color:#10b981; padding:4px 14px; border-radius:20px; font-weight:700; font-size:13px; border:1px solid #bbf7d0; }
        .status-pending { background:#fff7ed; color:#f59e0b; padding:4px 14px; border-radius:20px; font-weight:700; font-size:13px; border:1px solid #fde68a; }
        .footer { text-align:center; margin-top:24px; font-size:12px; color:#94a3b8; padding-top:16px; border-top:1px dashed #e2e8f0; }
      </style></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  }

  const dateStr = bill.created_at
    ? new Date(bill.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box receipt-modal-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>🧾 Bill Receipt</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handlePrint} style={{
              padding: '7px 16px', background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>🖨️ Print</button>
            <button onClick={onClose} style={{
              padding: '7px 14px', background: '#f1f5f9', color: '#64748b',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>✕ Close</button>
          </div>
        </div>

        {/* Printable content */}
        <div ref={printRef}>
          <div className="receipt-header">
            <h1>🏥 {clinicInfo?.clinic_name || 'MedCare OPD'}</h1>
            {clinicInfo?.clinic_address && <p>{clinicInfo.clinic_address}</p>}
            {clinicInfo?.clinic_phone   && <p>📞 {clinicInfo.clinic_phone}</p>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div className="info-row">
              <span>Receipt No.</span>
              <span>#REC-{String(bill.id).padStart(5, '0')}</span>
            </div>
            <div className="info-row">
              <span>Patient Name</span>
              <span>{bill.patient_name}</span>
            </div>
            {bill.doctor_name && (
              <div className="info-row">
                <span>Doctor</span>
                <span>{bill.doctor_name}</span>
              </div>
            )}
            <div className="info-row">
              <span>Date</span>
              <span>{dateStr}</span>
            </div>
            <div className="info-row">
              <span>Payment Status</span>
              <span className={bill.payment_status === 'Paid' ? 'status-paid' : 'status-pending'}>
                {bill.payment_status}
              </span>
            </div>
          </div>

          <div className="amount-box">
            <div className="label">Total Amount</div>
            <div className="amount">₹{Number(bill.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>

          <div className="footer">
            Thank you for choosing {clinicInfo?.clinic_name || 'MedCare OPD'} 🙏<br />
            Get well soon!
          </div>
        </div>
      </div>
    </div>
  );
}
