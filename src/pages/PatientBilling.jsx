import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../data/mockData';
import ReceiptModal from '../components/ReceiptModal';
import { Wallet, Clock3, Receipt, User, Eye } from 'lucide-react';

import { API, getToken } from '../api';

export default function PatientBilling() {
  const { user } = useAuth();
  const patientName = user?.full_name || 'Patient';

  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({
    total_paid: 0,
    total_pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [clinicInfo, setClinicInfo] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptBill, setReceiptBill] = useState(null);

  useEffect(() => {
    const token = getToken();

    fetch(`${API}/billing/my`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch bills');
        }

        return data;
      })
      .then((data) => {
        if (data.success) {
          setBills(data.data?.bills || []);
          setSummary({
            total_paid: data.data?.total_paid || 0,
            total_pending: data.data?.total_pending || 0,
          });
        }
      })
      .catch((error) => {
        console.error(error);
        setBills([]);
      })
      .finally(() => setLoading(false));

    fetch(`${API}/settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        return data;
      })
      .then((data) => {
        if (data.success) setClinicInfo(data.data?.clinic || null);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) {
    return (
      <Layout
        role="patient"
        name={patientName}
        title="My Bills"
        subtitle="View your billing history"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            padding: 80,
            color: '#0F2E57',
            fontWeight: 600,
          }}
        >
          <Clock3 size={20} />
          Loading Bills...
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      role="patient"
      name={patientName}
      title="My Bills"
      subtitle="View your billing history and payments"
    >
      {/* ===== TOP 3 NAVY CARDS ===== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
          gap: 20,
          marginBottom: 28,
        }}
      >
        {/* Paid */}

        <div
          style={{
            background: '#0F2E57',
            borderRadius: 22,
            padding: 24,
            color: '#fff',
            boxShadow: '0 10px 25px rgba(15,46,87,.25)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(255,255,255,.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
            }}
          >
            <Wallet size={26} color="#fff" />
          </div>

          <h2
            style={{
              margin: 0,
              color: '#fff',
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            ₹
            {Number(summary.total_paid).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </h2>

          <p
            style={{
              marginTop: 10,
              color: '#D8E7FF',
              fontSize: 16,
            }}
          >
            Total Paid
          </p>
        </div>

        {/* Pending */}

        <div
          style={{
            background: '#0F2E57',
            borderRadius: 22,
            padding: 24,
            color: '#fff',
            boxShadow: '0 10px 25px rgba(15,46,87,.25)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(255,255,255,.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
            }}
          >
            <Clock3 size={26} color="#fff" />
          </div>

          <h2
            style={{
              margin: 0,
              color: '#fff',
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            ₹
            {Number(summary.total_pending).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </h2>

          <p
            style={{
              marginTop: 10,
              color: '#D8E7FF',
              fontSize: 16,
            }}
          >
            Pending Amount
          </p>
        </div>

        {/* Bills */}

        <div
          style={{
            background: '#0F2E57',
            borderRadius: 22,
            padding: 24,
            color: '#fff',
            boxShadow: '0 10px 25px rgba(15,46,87,.25)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(255,255,255,.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
            }}
          >
            <Receipt size={26} color="#fff" />
          </div>

          <h2
            style={{
              margin: 0,
              color: '#fff',
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            {bills.length}
          </h2>

          <p
            style={{
              marginTop: 10,
              color: '#D8E7FF',
              fontSize: 16,
            }}
          >
            Total Bills
          </p>
        </div>
      </div>

      {/* Bills Table */}

      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 22,
          border: '1px solid #D6E4FF',
          overflow: 'hidden',
          boxShadow: '0 4px 18px rgba(15,46,87,.05)',
        }}
      >
        <div
          style={{
            padding: '22px 26px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Receipt size={26} color="#0F2E57" />
          <h2
            style={{
              margin: 0,
              color: '#0F172A',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            All Bills
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 760,
            }}
          >
            <thead style={{ background: '#F8FAFC' }}>
              <tr>
                {['#', 'DOCTOR NAME', 'AMOUNT', 'PAYMENT STATUS', 'DATE', 'ACTION'].map((item) => (
                  <th
                    key={item}
                    style={{
                      padding: 18,
                      textAlign: 'left',
                      color: '#47617F',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {bills.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div
                      style={{
                        padding: 60,
                        textAlign: 'center',
                        color: '#64748B',
                      }}
                    >
                      <Receipt size={42} color="#94A3B8" />
                      <div>No Bills Yet</div>
                    </div>
                  </td>
                </tr>
              ) : (
                bills.map((b, i) => (
                  <tr
                    key={b.id}
                    style={{ borderTop: '1px solid #EEF2F7' }}
                  >
                    <td
                      style={{
                        padding: 18,
                        color: '#64748B',
                        fontWeight: 600,
                      }}
                    >
                      {i + 1}
                    </td>

                    <td style={{ padding: 18 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: '#E8F1FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <User size={20} color="#0F2E57" />
                        </div>

                        <strong>{b.doctor_name || 'Doctor'}</strong>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: 18,
                        color: '#0F2E57',
                        fontWeight: 700,
                      }}
                    >
                      ₹
                      {Number(b.amount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td style={{ padding: 18 }}>
                      <span
                        style={{
                          padding: '8px 18px',
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 600,
                          background:
                            b.payment_status === 'Paid'
                              ? '#DCEBFF'
                              : '#F3F4F6',
                          color:
                            b.payment_status === 'Paid'
                              ? '#1D4ED8'
                              : '#475569',
                        }}
                      >
                        {b.payment_status || 'Pending'}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: 18,
                        color: '#334155',
                      }}
                    >
                      {formatDate(b.created_at)}
                    </td>

                    <td style={{ padding: 18 }}>
                      <button
                        onClick={() => {
                          setReceiptBill(b);
                          setReceiptOpen(true);
                        }}
                        style={{
                          background: '#0F2E57',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 12,
                          padding: '11px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        <Eye size={17} />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReceiptModal
        isOpen={receiptOpen}
        bill={receiptBill}
        clinicInfo={clinicInfo}
        onClose={() => {
          setReceiptOpen(false);
          setReceiptBill(null);
        }}
      />
    </Layout>
  );
}