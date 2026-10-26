import { useState, useEffect, Fragment } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../data/mockData';
import {
  CalendarDays,
  Stethoscope,
  Pill,
  CreditCard,
  ClipboardList,
  UserRound,
  Syringe,
  FileText,
  Droplets,
  Clock3,
} from 'lucide-react';
import { API, getToken } from '../api';

export default function PatientMedicalRecords() {
  const { user } = useAuth();

  const patientName = user?.full_name || 'Patient';

  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // ============================================================
  // LOAD ALL MEDICAL RECORD DATA
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const loadRecords = async () => {
      try {
        const token = getToken();

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const getData = async (url) => {
          const response = await fetch(url, {
            method: 'GET',
            headers,
          });

          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(
              data?.message ||
                data?.error ||
                `Request failed: ${response.status}`
            );
          }

          return data;
        };

        const [prescriptionResponse, appointmentResponse, billingResponse] =
          await Promise.all([
            getData(`${API}/prescriptions/my`),
            getData(`${API}/appointments/my`),
            getData(`${API}/billing/my`),
          ]);

        if (!mounted) return;

        setPrescriptions(
          prescriptionResponse?.success &&
            Array.isArray(prescriptionResponse?.data?.prescriptions)
            ? prescriptionResponse.data.prescriptions
            : []
        );

        setAppointments(
          appointmentResponse?.success &&
            Array.isArray(appointmentResponse?.data?.appointments)
            ? appointmentResponse.data.appointments
            : []
        );

        setBills(
          billingResponse?.success &&
            Array.isArray(billingResponse?.data?.bills)
            ? billingResponse.data.bills
            : []
        );
      } catch (error) {
        console.error('Medical Records Error:', error);

        if (mounted) {
          setPrescriptions([]);
          setAppointments([]);
          setBills([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadRecords();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // MEDICINES FROM ALL PRESCRIPTIONS
  // ============================================================

  const allMedicines = prescriptions.flatMap((prescription) => {
    const medicines = Array.isArray(prescription?.medicines)
      ? prescription.medicines
      : [];

    return medicines.map((medicine) => ({
      ...medicine,
      date: prescription?.created_at,
      doctor: prescription?.doctor_name || 'Doctor',
    }));
  });

  // ============================================================
  // TOTAL PAID
  // ============================================================

  const paidAmount = bills
    .filter(
      (bill) =>
        String(bill?.payment_status || '').toLowerCase() === 'paid'
    )
    .reduce((total, bill) => total + Number(bill?.amount || 0), 0);

  // ============================================================
  // UI ONLY — WHITE + NAVY BLUE THEME
  // ============================================================

  const medicalRecordsStyles = `
    .medical-records-page .stat-card {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 14px !important;
      box-shadow: 0 4px 14px rgba(15, 42, 74, 0.06) !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .medical-records-page .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(15, 42, 74, 0.10) !important;
    }
    .medical-records-page .stat-icon {
      background: #eff6ff !important;
      color: #0f2a4a !important;
      border-radius: 12px !important;
    }
    .medical-records-page .stat-icon svg {
      color: #0f2a4a !important;
      stroke: #0f2a4a !important;
    }
    .medical-records-page .stat-info h2 {
      color: #0f2a4a !important;
    }
    .medical-records-page .stat-info p {
      color: #64748b !important;
    }
    .medical-records-page .table-box {
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 14px !important;
      box-shadow: 0 4px 14px rgba(15, 42, 74, 0.05) !important;
    }
    .medical-records-page .table-header {
      background: #ffffff !important;
      border-bottom: 1px solid #e2e8f0 !important;
    }
    .medical-records-page .table-header h2 {
      color: #0f2a4a !important;
    }
    .medical-records-page table thead th {
      color: #0f2a4a !important;
      background: #f8fafc !important;
      border-bottom: 1px solid #e2e8f0 !important;
    }
    .medical-records-page table tbody tr {
      border-bottom: 1px solid #f1f5f9 !important;
    }
    .medical-records-page table tbody tr:hover {
      background: #f8fafc !important;
    }
    .medical-records-page .badge {
      border-radius: 999px !important;
    }
    .medical-records-page button {
      font-family: inherit;
    }
  `;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Layout
        role="patient"
        name={patientName}
        title="Medical Records"
        subtitle="Complete health history in one place"
      >
        <style>{medicalRecordsStyles}</style>
        <div className="medical-records-page"
          style={{
            minHeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: 15,
          }}
        >
          <><Clock3 size={17} style={{ verticalAlign: 'middle', marginRight: 8 }} />Loading medical records...</>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      role="patient"
      name={patientName}
      title="Medical Records"
      subtitle="Complete health history in one place"
    >
      <style>{medicalRecordsStyles}</style>
      <div className="medical-records-page">
      {/* ========================================================
          1. PATIENT HEALTH SUMMARY
      ======================================================== */}

      <div
        style={{
          background:
            '#0f2a4a',
          borderRadius: 18,
          padding: '26px 30px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 10px 30px rgba(15,42,74,0.18)',
          color: '#fff',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              opacity: 0.85,
              marginBottom: 6,
            }}
          >
            Medical Record of
          </div>

          <div
            style={{
              fontSize: 25,
              fontWeight: 800,
              marginBottom: 12,
              textTransform: 'capitalize',
            }}
          >
            {patientName}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px 22px',
              fontSize: 13,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                whiteSpace: 'nowrap',
              }}
            >
              <Droplets
                size={18}
                strokeWidth={2}
                style={{ flexShrink: 0 }}
              />
              <span>Blood Group:</span>
              <strong
                style={{
                  marginLeft: 2,
                  fontWeight: 800,
                }}
              >
                {user?.blood_group || '—'}
              </strong>
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                whiteSpace: 'nowrap',
              }}
            >
              <UserRound
                size={18}
                strokeWidth={2}
                style={{ flexShrink: 0 }}
              />
              <span>Age:</span>
              <strong
                style={{
                  marginLeft: 2,
                  fontWeight: 800,
                }}
              >
                {user?.age ? `${user.age} yrs` : '—'}
              </strong>
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                whiteSpace: 'nowrap',
              }}
            >
              <UserRound
                size={18}
                strokeWidth={2}
                style={{ flexShrink: 0 }}
              />
              <span>Gender:</span>
              <strong
                style={{
                  marginLeft: 2,
                  fontWeight: 800,
                }}
              >
                {user?.gender || '—'}
              </strong>
            </span>
          </div>
        </div>

        <div
          style={{
            width: 66,
            height: 66,
            borderRadius: 18,
            background: 'rgba(255,255,255,0.16)',
            border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 34,
            flexShrink: 0,
          }}
        >
          <Stethoscope size={34} strokeWidth={1.7} />
        </div>
      </div>

      {/* ========================================================
          2. FOUR SUMMARY CARDS
      ======================================================== */}

      <div
        className="cards-grid"
        style={{
          marginBottom: 28,
        }}
      >
        <div className="stat-card blue">
          <div className="stat-icon"><CalendarDays size={25} strokeWidth={1.8} /></div>

          <div className="stat-info">
            <h2>{appointments.length}</h2>
            <p>Appointments</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon"><Stethoscope size={25} strokeWidth={1.8} /></div>

          <div className="stat-info">
            <h2>{prescriptions.length}</h2>
            <p>Consultations</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon"><Pill size={25} strokeWidth={1.8} /></div>

          <div className="stat-info">
            <h2>{allMedicines.length}</h2>
            <p>Medicines</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon"><CreditCard size={25} strokeWidth={1.8} /></div>

          <div className="stat-info">
            <h2>
              ₹{paidAmount.toLocaleString('en-IN')}
            </h2>
            <p>Total Paid</p>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. CONSULTATION HISTORY — MAIN SECTION
      ======================================================== */}

      <div
        className="table-box"
        style={{
          marginBottom: 28,
          overflow: 'hidden',
        }}
      >
        <div className="table-header">
          <div>
            <h2><Stethoscope size={20} /> Consultation History</h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#94a3b8',
                fontSize: 13,
              }}
            >
              Consultations and treatment details provided by your doctors
            </p>
          </div>

          <div
            style={{
              background: '#eff6ff',
              color: '#0f2a4a',
              padding: '7px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {prescriptions.length}{' '}
            {prescriptions.length === 1
              ? 'Consultation'
              : 'Consultations'}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Symptoms</th>
                <th>Diagnosis</th>
                <th>Medicines</th>
                <th>Fee</th>
                <th>Date</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div
                      className="empty-state"
                      style={{
                        minHeight: 210,
                      }}
                    >
                      <span className="empty-icon"><Stethoscope size={42} /></span>

                      <div
                        style={{
                          marginTop: 8,
                          fontWeight: 600,
                        }}
                      >
                        No consultations available yet.
                      </div>

                      <div
                        style={{
                          marginTop: 5,
                          fontSize: 12,
                          color: '#94a3b8',
                        }}
                      >
                        Your consultation history will appear here
                        after your doctor creates a prescription.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                prescriptions.map((prescription, index) => {
                  const id =
                    prescription?.id ||
                    prescription?._id ||
                    `prescription-${index}`;

                  const medicines = Array.isArray(
                    prescription?.medicines
                  )
                    ? prescription.medicines
                    : [];

                  const isExpanded = expandedId === id;

                  return (
                    <Fragment key={id}>
                      <tr>
                        {/* DOCTOR */}
                        <td>
                          <div
                            style={{
                              fontWeight: 700,
                              color: '#0f172a',
                              fontSize: 13,
                            }}
                          >
                            {prescription?.doctor_name || 'Doctor'}
                          </div>

                          {prescription?.specialization && (
                            <div
                              style={{
                                fontSize: 11,
                                color: '#94a3b8',
                                marginTop: 3,
                              }}
                            >
                              {prescription.specialization}
                            </div>
                          )}
                        </td>

                        {/* SYMPTOMS */}
                        <td
                          style={{
                            fontSize: 13,
                            color: '#475569',
                            maxWidth: 180,
                          }}
                        >
                          {prescription?.symptoms || '—'}
                        </td>

                        {/* DIAGNOSIS */}
                        <td
                          style={{
                            fontSize: 13,
                            color: '#475569',
                            maxWidth: 180,
                          }}
                        >
                          {prescription?.diagnosis || '—'}
                        </td>

                        {/* MEDICINES */}
                        <td>
                          <span
                            style={{
                              background: '#eff6ff',
                              color: '#2563eb',
                              fontWeight: 700,
                              fontSize: 12,
                              padding: '4px 9px',
                              borderRadius: 12,
                            }}
                          >
                            {medicines.length} meds
                          </span>
                        </td>

                        {/* FEE */}
                        <td
                          style={{
                            fontWeight: 700,
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          ₹
                          {Number(
                            prescription?.consultation_fee || 0
                          ).toLocaleString('en-IN')}
                        </td>

                        {/* DATE */}
                        <td
                          style={{
                            fontSize: 12,
                            color: '#64748b',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {prescription?.created_at
                            ? formatDate(prescription.created_at)
                            : '—'}
                        </td>

                        {/* VIEW DETAILS */}
                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(
                                isExpanded ? null : id
                              )
                            }
                            style={{
                              border: '1px solid #bfdbfe',
                              background: isExpanded
                                ? '#2563eb'
                                : '#eff6ff',
                              color: isExpanded
                                ? '#fff'
                                : '#2563eb',
                              borderRadius: 8,
                              padding: '7px 12px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: 12,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {isExpanded
                              ? 'Hide Details'
                              : 'View Details'}
                          </button>
                        </td>
                      </tr>

                      {/* ==================================================
                          VIEW DETAILS
                      ================================================== */}

                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={7}
                            style={{
                              padding: 0,
                              background: '#f8fafc',
                            }}
                          >
                            <div
                              style={{
                                padding: 22,
                                borderTop: '1px solid #e2e8f0',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 15,
                                  fontWeight: 800,
                                  color: '#0f172a',
                                  marginBottom: 18,
                                }}
                              >
                                Consultation Details
                              </div>

                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns:
                                    'repeat(auto-fit, minmax(200px, 1fr))',
                                  gap: 14,
                                }}
                              >
                                {/* SYMPTOMS */}
                                <div
                                  style={{
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 12,
                                    padding: 15,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 800,
                                      color: '#64748b',
                                      textTransform: 'uppercase',
                                      marginBottom: 7,
                                    }}
                                  >
                                    Symptoms
                                  </div>

                                  <div
                                    style={{
                                      color: '#0f172a',
                                      fontSize: 13,
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {prescription?.symptoms ||
                                      'No symptoms recorded.'}
                                  </div>
                                </div>

                                {/* DIAGNOSIS */}
                                <div
                                  style={{
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 12,
                                    padding: 15,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 800,
                                      color: '#64748b',
                                      textTransform: 'uppercase',
                                      marginBottom: 7,
                                    }}
                                  >
                                    Diagnosis
                                  </div>

                                  <div
                                    style={{
                                      color: '#0f172a',
                                      fontSize: 13,
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {prescription?.diagnosis ||
                                      'No diagnosis recorded.'}
                                  </div>
                                </div>

                                {/* CONSULTATION FEE */}
                                <div
                                  style={{
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 12,
                                    padding: 15,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 800,
                                      color: '#64748b',
                                      textTransform: 'uppercase',
                                      marginBottom: 7,
                                    }}
                                  >
                                    Consultation Fee
                                  </div>

                                  <div
                                    style={{
                                      color: '#0f2a4a',
                                      fontSize: 18,
                                      fontWeight: 800,
                                    }}
                                  >
                                    ₹
                                    {Number(
                                      prescription?.consultation_fee || 0
                                    ).toLocaleString('en-IN')}
                                  </div>
                                </div>
                              </div>

                              {/* MEDICINES */}
                              <div style={{ marginTop: 20 }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    fontSize: 12,
                                    fontWeight: 800,
                                    color: '#475569',
                                    marginBottom: 10,
                                  }}
                                >
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Pill size={16} /> Prescribed Medicines</span>
                                </div>

                                {medicines.length > 0 ? (
                                  <div
                                    style={{
                                      display: 'grid',
                                      gap: 9,
                                    }}
                                  >
                                    {medicines.map(
                                      (medicine, medicineIndex) => (
                                        <div
                                          key={
                                            medicine?.id ||
                                            medicine?._id ||
                                            medicineIndex
                                          }
                                          style={{
                                            background: '#fff',
                                            border:
                                              '1px solid #e2e8f0',
                                            borderRadius: 10,
                                            padding: '12px 14px',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 14,
                                            alignItems: 'center',
                                          }}
                                        >
                                          <strong
                                            style={{
                                              color: '#0f172a',
                                              fontSize: 13,
                                            }}
                                          >
                                            {medicine?.medicine_type === 'Injection'
                                              ? <Syringe size={16} style={{ verticalAlign: 'middle' }} />
                                              : <Pill size={16} style={{ verticalAlign: 'middle' }} />} {' '}
                                            {medicine?.medicine_name ||
                                              'Medicine'}
                                          </strong>

                                          <span
                                            style={{
                                              fontSize: 12,
                                              color: '#475569',
                                            }}
                                          >
                                            Dosage:{' '}
                                            <strong>
                                              {medicine?.dosage || '—'}
                                            </strong>
                                          </span>

                                          <span
                                            style={{
                                              fontSize: 12,
                                              color: '#475569',
                                            }}
                                          >
                                            Frequency:{' '}
                                            <strong>
                                              {medicine?.frequency || '—'}
                                            </strong>
                                          </span>

                                          <span
                                            style={{
                                              fontSize: 12,
                                              color: '#475569',
                                            }}
                                          >
                                            Duration:{' '}
                                            <strong>
                                              {medicine?.duration || '—'}
                                            </strong>
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      background: '#fff',
                                      border:
                                        '1px solid #e2e8f0',
                                      borderRadius: 10,
                                      padding: 14,
                                      color: '#94a3b8',
                                      fontSize: 13,
                                    }}
                                  >
                                    No medicines prescribed.
                                  </div>
                                )}
                              </div>

                              {/* DOCTOR INSTRUCTIONS */}
                              {prescription?.additional_instructions && (
                                <div
                                  style={{
                                    marginTop: 18,
                                    padding: 14,
                                    background: '#f8fafc',
                                    border:
                                      '1px solid #dbeafe',
                                    borderRadius: 11,
                                  }}
                                >
                                  <div
                                    style={{
                                      color: '#0f2a4a',
                                      fontWeight: 800,
                                      fontSize: 12,
                                      marginBottom: 5,
                                    }}
                                  >
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ClipboardList size={16} /> Doctor's Instructions</span>
                                  </div>

                                  <div
                                    style={{
                                      color: '#475569',
                                      fontSize: 13,
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {
                                      prescription.additional_instructions
                                    }
                                  </div>
                                </div>
                              )}

                              {/* PATIENT NOTES */}
                              {prescription?.notes_for_patient && (
                                <div
                                  style={{
                                    marginTop: 12,
                                    padding: 14,
                                    background: '#eff6ff',
                                    border:
                                      '1px solid #bfdbfe',
                                    borderRadius: 11,
                                  }}
                                >
                                  <div
                                    style={{
                                      color: '#1d4ed8',
                                      fontWeight: 800,
                                      fontSize: 12,
                                      marginBottom: 5,
                                    }}
                                  >
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FileText size={16} /> Notes for Patient</span>
                                  </div>

                                  <div
                                    style={{
                                      color: '#475569',
                                      fontSize: 13,
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {prescription.notes_for_patient}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          4. APPOINTMENT HISTORY
      ======================================================== */}

      <div
        className="table-box"
        style={{
          marginBottom: 28,
          overflow: 'hidden',
        }}
      >
        <div className="table-header">
          <div>
            <h2><CalendarDays size={20} /> Appointment History</h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#94a3b8',
                fontSize: 13,
              }}
            >
              Your appointment and visit history
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Appointment Type</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <span className="empty-icon"><CalendarDays size={42} /></span>
                      No appointments yet.
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.slice(0, 10).map((appointment, index) => {
                  const appointmentId =
                    appointment?.id ||
                    appointment?._id ||
                    `appointment-${index}`;

                  const status =
                    appointment?.status || 'Pending';

                  return (
                    <tr key={appointmentId}>
                      <td>
                        <div
                          style={{
                            fontWeight: 700,
                            color: '#0f172a',
                            fontSize: 13,
                          }}
                        >
                          {appointment?.doctor_name || 'Doctor'}
                        </div>

                        {appointment?.specialization && (
                          <div
                            style={{
                              fontSize: 11,
                              color: '#94a3b8',
                              marginTop: 3,
                            }}
                          >
                            {appointment.specialization}
                          </div>
                        )}
                      </td>

                      <td
                        style={{
                          fontSize: 13,
                          color: '#475569',
                        }}
                      >
                        {appointment?.type || 'General'}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            status === 'Completed'
                              ? 'badge-completed'
                              : status === 'Cancelled'
                              ? 'badge-cancelled'
                              : 'badge-pending'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td
                        style={{
                          fontSize: 12,
                          color: '#64748b',
                        }}
                      >
                        {appointment?.appointment_date
                          ? formatDate(
                              appointment.appointment_date
                            )
                          : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          5. MEDICINE HISTORY
      ======================================================== */}

      <div
        className="table-box"
        style={{
          marginBottom: 28,
          overflow: 'hidden',
        }}
      >
        <div className="table-header">
          <div>
            <h2><Pill size={20} /> Medicine History</h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#94a3b8',
                fontSize: 13,
              }}
            >
              All medicines prescribed during consultations
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Type</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Prescribed By</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {allMedicines.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <span className="empty-icon"><Pill size={42} /></span>
                      No medicines prescribed yet.
                    </div>
                  </td>
                </tr>
              ) : (
                allMedicines.slice(0, 20).map((medicine, index) => (
                  <tr
                    key={
                      medicine?.id ||
                      medicine?._id ||
                      `medicine-${index}`
                    }
                  >
                    <td
                      style={{
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      {medicine?.medicine_type === 'Injection'
                        ? <Syringe size={16} style={{ verticalAlign: 'middle' }} />
                        : <Pill size={16} style={{ verticalAlign: 'middle' }} />}{' '}
                      {medicine?.medicine_name || 'Medicine'}
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 12,
                          background: '#eff6ff',
                          color: '#0f2a4a',
                        }}
                      >
                        {medicine?.medicine_type || 'Tablet'}
                      </span>
                    </td>

                    <td
                      style={{
                        fontSize: 13,
                        color: '#475569',
                      }}
                    >
                      {medicine?.dosage || '—'}
                    </td>

                    <td
                      style={{
                        fontSize: 13,
                        color: '#475569',
                      }}
                    >
                      {medicine?.frequency || '—'}
                    </td>

                    <td
                      style={{
                        fontSize: 13,
                        color: '#475569',
                      }}
                    >
                      {medicine?.duration || '—'}
                    </td>

                    <td
                      style={{
                        fontSize: 13,
                        color: '#64748b',
                      }}
                    >
                      {medicine?.doctor || '—'}
                    </td>

                    <td
                      style={{
                        fontSize: 12,
                        color: '#64748b',
                      }}
                    >
                      {medicine?.date
                        ? formatDate(medicine.date)
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          6. BILLING / PAYMENT HISTORY
      ======================================================== */}

      <div
        className="table-box"
        style={{
          marginBottom: 10,
          overflow: 'hidden',
        }}
      >
        <div className="table-header">
          <div>
            <h2><CreditCard size={20} /> Billing & Payment History</h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#94a3b8',
                fontSize: 13,
              }}
            >
              Consultation fees and payment records
            </p>
          </div>

          <div
            style={{
              background: '#eff6ff',
              color: '#0f2a4a',
              padding: '7px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Paid: ₹{paidAmount.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {bills.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <span className="empty-icon"><CreditCard size={42} /></span>
                      No billing records yet.
                    </div>
                  </td>
                </tr>
              ) : (
                bills.slice(0, 10).map((bill, index) => {
                  const billId =
                    bill?.id ||
                    bill?._id ||
                    `bill-${index}`;

                  const paymentStatus =
                    bill?.payment_status || 'Pending';

                  return (
                    <tr key={billId}>
                      <td>
                        <strong>
                          {bill?.doctor_name || 'Doctor'}
                        </strong>
                      </td>

                      <td
                        style={{
                          fontWeight: 800,
                          color: '#0f172a',
                        }}
                      >
                        ₹
                        {Number(bill?.amount || 0).toLocaleString(
                          'en-IN',
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            String(paymentStatus).toLowerCase() ===
                            'paid'
                              ? 'badge-paid'
                              : 'badge-pending'
                          }`}
                        >
                          {paymentStatus}
                        </span>
                      </td>

                      <td
                        style={{
                          fontSize: 12,
                          color: '#64748b',
                        }}
                      >
                        {bill?.created_at
                          ? formatDate(bill.created_at)
                          : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </Layout>
  );
}