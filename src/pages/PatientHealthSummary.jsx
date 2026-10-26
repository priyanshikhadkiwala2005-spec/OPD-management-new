import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../data/mockData';

import { API, getToken } from '../api';

import {
  HeartPulse,
  CalendarDays,
  CircleCheckBig,
  Pill,
  FlaskConical,
  Scale,
  Droplets,
  Stethoscope,
  ArrowRight,
  UserRound,
} from 'lucide-react';

// Blood group info
const BLOOD_INFO = {
  'A+':  { donateTo: 'A+, AB+',           receiveFrom: 'A+, A-, O+, O-' },
  'A-':  { donateTo: 'A+, A-, AB+, AB-',  receiveFrom: 'A-, O-' },
  'B+':  { donateTo: 'B+, AB+',           receiveFrom: 'B+, B-, O+, O-' },
  'B-':  { donateTo: 'B+, B-, AB+, AB-',  receiveFrom: 'B-, O-' },
  'AB+': { donateTo: 'AB+',               receiveFrom: 'All Blood Groups' },
  'AB-': { donateTo: 'AB+, AB-',          receiveFrom: 'A-, B-, AB-, O-' },
  'O+':  { donateTo: 'A+, B+, AB+, O+',   receiveFrom: 'O+, O-' },
  'O-':  { donateTo: 'All Blood Groups',   receiveFrom: 'O-' },
};

// BMI Calculator
function calcBMI(weight, height) {
  if (!weight || !height) return null;
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

function bmiStatus(bmi) {
  if (!bmi) return null;
  const b = parseFloat(bmi);

  if (b < 18.5)
    return { label: 'Underweight', color: '#f59e0b', bg: '#fff7ed' };

  if (b < 25)
    return { label: 'Normal', color: '#10b981', bg: '#f0fdf4' };

  if (b < 30)
    return { label: 'Overweight', color: '#f59e0b', bg: '#fff7ed' };

  return { label: 'Obese', color: '#ef4444', bg: '#fef2f2' };
}

export default function PatientHealthSummary() {
  const { user } = useAuth();
  const patientName = user?.full_name || 'Patient';

  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // BMI state
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${API}/prescriptions/my`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }).then(r => r.json()),

      fetch(`${API}/appointments/my`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }).then(r => r.json())
    ])
      .then(([pres, appt]) => {
        if (pres.success) {
          setPrescriptions(pres.data.prescriptions || []);
        }

        if (appt.success) {
          setAppointments(appt.data.appointments || []);
        }
      })
      .catch(error => {
        console.error('Health summary data error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const bmi = calcBMI(weight, height);
  const bmiInfo = bmiStatus(bmi);
  const bloodInfo = BLOOD_INFO[user?.blood_group];

  // Latest prescription
  const latestRx = prescriptions[0];

  // Upcoming appointments
  const today = new Date().toISOString().split('T')[0];

  const upcoming = appointments.filter(
    a => a.appointment_date >= today && a.status === 'Pending'
  );

  // All medicines ever prescribed (unique)
  const allMeds = [
    ...new Set(
      prescriptions.flatMap(p =>
        p.medicines.map(m => m.medicine_name)
      )
    )
  ];

  // Completed consultations
  const completed = appointments.filter(
    a => a.status === 'Completed'
  ).length;

  if (loading) {
    return (
      <Layout
        role="patient"
        name={patientName}
        title="Health Summary"
        subtitle="Your complete health overview"
      >
        <div
          style={{
            textAlign: 'center',
            padding: 80,
            color: '#64748b'
          }}
        >
          Loading your health data...
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      role="patient"
      name={patientName}
      title="Health Summary"
      subtitle="Your complete health overview at a glance"
    >

      {/* ================= HERO BANNER ================= */}
      <div
        style={{
          background: '#0f2a4a',
          borderRadius: 16,
          padding: '28px 32px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fff'
        }}
      >
        <div>
          <div
            style={{
              color: '#bfdbfe',
              fontSize: 13,
              marginBottom: 6,
              fontWeight: 600
            }}
          >
            HEALTH CARD
          </div>

          <div
            style={{
              color: '#fff',
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 12
            }}
          >
            {patientName}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 24,
              flexWrap: 'wrap'
            }}
          >
            {[
              {
                label: 'Age',
                value: user?.age ? `${user.age} yrs` : '—'
              },
              {
                label: 'Gender',
                value: user?.gender || '—'
              },
              {
                label: 'Blood Group',
                value: user?.blood_group || '—'
              }
            ].map(item => (
              <div key={item.label}>
                <div
                  style={{
                    color: '#93c5fd',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 15,
                    marginTop: 3
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <HeartPulse size={40} strokeWidth={1.7} />
        </div>
      </div>


      {/* ================= QUICK STATS ================= */}
      <div
        className="cards-grid"
        style={{
          marginBottom: 24
        }}
      >

        {/* Total Visits */}
        <div
          className="stat-card"
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: '#eff6ff',
              color: '#0f2a4a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CalendarDays size={26} strokeWidth={1.8} />
          </div>

          <div className="stat-info">
            <h2
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: 28
              }}
            >
              {appointments.length}
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#64748b'
              }}
            >
              Total Visits
            </p>
          </div>
        </div>


        {/* Completed */}
        <div
          className="stat-card"
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: '#eff6ff',
              color: '#0f2a4a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CircleCheckBig size={26} strokeWidth={1.8} />
          </div>

          <div className="stat-info">
            <h2
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: 28
              }}
            >
              {completed}
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#64748b'
              }}
            >
              Completed
            </p>
          </div>
        </div>


        {/* Prescriptions */}
        <div
          className="stat-card"
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: '#eff6ff',
              color: '#0f2a4a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Pill size={26} strokeWidth={1.8} />
          </div>

          <div className="stat-info">
            <h2
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: 28
              }}
            >
              {prescriptions.length}
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#64748b'
              }}
            >
              Prescriptions
            </p>
          </div>
        </div>


        {/* Medicines */}
        <div
          className="stat-card"
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: '#eff6ff',
              color: '#0f2a4a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FlaskConical size={26} strokeWidth={1.8} />
          </div>

          <div className="stat-info">
            <h2
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: 28
              }}
            >
              {allMeds.length}
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#64748b'
              }}
            >
              Medicines Received
            </p>
          </div>
        </div>

      </div>


      {/* ================= BMI + BLOOD GROUP ================= */}
      <div
        className="two-col"
        style={{
          marginBottom: 24
        }}
      >

        {/* ================= BMI CALCULATOR ================= */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            padding: '22px 24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#0f2a4a',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Scale size={20} color="#0f2a4a" />
            BMI Calculator
          </h3>

          <p
            style={{
              fontSize: 12.5,
              color: '#64748b',
              marginBottom: 18
            }}
          >
            Check your Body Mass Index
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginBottom: 14
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: 6
                }}
              >
                Weight (kg)
              </label>

              <input
                type="number"
                className="form-control"
                placeholder="e.g. 65"
                value={weight}
                onChange={e => setWeight(e.target.value)}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: 6
                }}
              >
                Height (cm)
              </label>

              <input
                type="number"
                className="form-control"
                placeholder="e.g. 170"
                value={height}
                onChange={e => setHeight(e.target.value)}
              />
            </div>
          </div>


          {bmi && bmiInfo ? (
            <div
              style={{
                background: bmiInfo.bg,
                borderRadius: 10,
                padding: '16px 18px',
                border: `1.5px solid ${bmiInfo.color}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#64748b',
                    marginBottom: 2
                  }}
                >
                  Your BMI
                </div>

                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: bmiInfo.color
                  }}
                >
                  {bmi}
                </div>
              </div>

              <div
                style={{
                  textAlign: 'right'
                }}
              >
                <span
                  style={{
                    background: bmiInfo.color,
                    color: '#fff',
                    padding: '4px 14px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700
                  }}
                >
                  {bmiInfo.label}
                </span>

                <div
                  style={{
                    fontSize: 11.5,
                    color: '#64748b',
                    marginTop: 8
                  }}
                >
                  {bmiInfo.label === 'Normal'
                    ? 'Great! Maintain it.'
                    : bmiInfo.label === 'Underweight'
                    ? 'Eat more nutritious food.'
                    : bmiInfo.label === 'Overweight'
                    ? 'Exercise regularly.'
                    : 'Consult your doctor.'}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: '#f8fafc',
                borderRadius: 10,
                padding: 16,
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: 13,
                border: '1px dashed #e2e8f0'
              }}
            >
              Enter weight and height to calculate BMI
            </div>
          )}


          {/* BMI Scale */}
          <div
            style={{
              marginTop: 16
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: '#94a3b8',
                marginBottom: 4
              }}
            >
              <span>Underweight</span>
              <span>Normal</span>
              <span>Overweight</span>
              <span>Obese</span>
            </div>

            <div
              style={{
                height: 8,
                borderRadius: 20,
                background:
                  'linear-gradient(90deg, #60a5fa, #10b981, #f59e0b, #ef4444)',
                position: 'relative'
              }}
            >
              {bmi && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${Math.min(
                      Math.max(
                        ((parseFloat(bmi) - 15) / 25) * 100,
                        0
                      ),
                      100
                    )}%`,
                    top: -4,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: bmiInfo.color,
                    border: '3px solid #fff',
                    transform: 'translateX(-50%)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                />
              )}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: '#94a3b8',
                marginTop: 3
              }}
            >
              <span>&lt;18.5</span>
              <span>18.5-24.9</span>
              <span>25-29.9</span>
              <span>&gt;30</span>
            </div>
          </div>
        </div>


        {/* ================= BLOOD GROUP INFO ================= */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            padding: '22px 24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#0f2a4a',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Droplets size={20} color="#0f2a4a" />
            Blood Group Info
          </h3>

          <p
            style={{
              fontSize: 12.5,
              color: '#64748b',
              marginBottom: 18
            }}
          >
            Donation & compatibility guide
          </p>


          {user?.blood_group ? (
            <>
              {/* Big Blood Group */}
              <div
                style={{
                  background: '#eff6ff',
                  borderRadius: 12,
                  padding: 18,
                  textAlign: 'center',
                  marginBottom: 18,
                  border: '1px solid #bfdbfe'
                }}
              >
                <Droplets
                  size={32}
                  color="#0f2a4a"
                  strokeWidth={1.7}
                  style={{
                    marginBottom: 6
                  }}
                />

                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 900,
                    color: '#0f2a4a',
                    lineHeight: 1
                  }}
                >
                  {user.blood_group}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: '#2563eb',
                    fontWeight: 600,
                    marginTop: 6
                  }}
                >
                  Your Blood Group
                </div>
              </div>


              {bloodInfo && (
                <>
                  {/* Donate */}
                  <div
                    style={{
                      marginBottom: 14,
                      padding: '12px 14px',
                      background: '#eff6ff',
                      borderRadius: 10,
                      border: '1px solid #bfdbfe'
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#0f2a4a',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        marginBottom: 4
                      }}
                    >
                      Can Donate To
                    </div>

                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: '#1e40af'
                      }}
                    >
                      {bloodInfo.donateTo}
                    </div>
                  </div>


                  {/* Receive */}
                  <div
                    style={{
                      padding: '12px 14px',
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#0f2a4a',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        marginBottom: 4
                      }}
                    >
                      Can Receive From
                    </div>

                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: '#1e40af'
                      }}
                    >
                      {bloodInfo.receiveFrom}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '30px 0'
              }}
            >
              <Droplets
                size={40}
                color="#0f2a4a"
                strokeWidth={1.6}
                style={{
                  marginBottom: 10
                }}
              />

              <p
                style={{
                  color: '#94a3b8',
                  fontSize: 13
                }}
              >
                Blood group not set.
              </p>

              <Link
                to="/patient/profile"
                style={{
                  color: '#0f2a4a',
                  fontWeight: 600,
                  fontSize: 13,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                Update Profile
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>


      {/* ================= NEXT APPOINTMENT + LATEST PRESCRIPTION ================= */}
      <div
        className="two-col"
        style={{
          marginBottom: 24
        }}
      >

        {/* Next Appointment */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            padding: '22px 24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#0f2a4a',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <CalendarDays size={20} color="#0f2a4a" />
            Next Appointment
          </h3>


          {upcoming.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              {upcoming.slice(0, 3).map((a, i) => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    background: i === 0 ? '#eff6ff' : '#f8fafc',
                    border: `1.5px solid ${
                      i === 0 ? '#bfdbfe' : '#e2e8f0'
                    }`,
                    borderRadius: 10,
                    padding: '12px 16px'
                  }}
                >

                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      flexShrink: 0,
                      background: '#0f2a4a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CalendarDays
                      size={22}
                      color="#fff"
                      strokeWidth={1.7}
                    />
                  </div>


                  <div
                    style={{
                      flex: 1
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: '#0f172a'
                      }}
                    >
                      Dr. {a.doctor_name}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: '#64748b',
                        marginTop: 2
                      }}
                    >
                      {a.specialization} • {formatDate(a.appointment_date)}
                    </div>
                  </div>


                  {i === 0 && (
                    <span
                      style={{
                        background: '#0f2a4a',
                        color: '#fff',
                        padding: '4px 11px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700
                      }}
                    >
                      Next
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '30px 0'
              }}
            >
              <CalendarDays
                size={38}
                color="#0f2a4a"
                strokeWidth={1.6}
                style={{
                  marginBottom: 10
                }}
              />

              <p
                style={{
                  color: '#94a3b8',
                  fontSize: 13
                }}
              >
                No upcoming appointments.
              </p>

              <Link
                to="/patient/appointments"
                style={{
                  color: '#0f2a4a',
                  fontWeight: 600,
                  fontSize: 13,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                Book Now
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>


        {/* Latest Prescription */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            padding: '22px 24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#0f2a4a',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Pill size={20} color="#0f2a4a" />
            Latest Prescription
          </h3>


          {latestRx ? (
            <div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 14,
                  paddingBottom: 12,
                  borderBottom: '1px solid #f1f5f9'
                }}
              >

                {/* Doctor Avatar - Same Navy */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#0f2a4a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}
                >
                  <Stethoscope size={20} strokeWidth={1.7} />
                </div>

                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: '#0f172a'
                    }}
                  >
                    Dr. {latestRx.doctor_name}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: '#64748b'
                    }}
                  >
                    {formatDate(latestRx.created_at)}
                  </div>
                </div>
              </div>


              {latestRx.diagnosis && (
                <div
                  style={{
                    background: '#eff6ff',
                    borderRadius: 8,
                    padding: '8px 12px',
                    marginBottom: 12,
                    fontSize: 13,
                    border: '1px solid #dbeafe'
                  }}
                >
                  <span
                    style={{
                      color: '#64748b'
                    }}
                  >
                    Diagnosis:{' '}
                  </span>

                  <strong
                    style={{
                      color: '#0f2a4a'
                    }}
                  >
                    {latestRx.diagnosis}
                  </strong>
                </div>
              )}


              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8
                }}
              >
                {latestRx.medicines.slice(0, 4).map((m, i) => (
                  <span
                    key={i}
                    style={{
                      background:
                        m.medicine_type === 'Injection'
                          ? '#f8fafc'
                          : '#eff6ff',
                      color: '#0f2a4a',
                      border: '1px solid #bfdbfe',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5
                    }}
                  >
                    {m.medicine_type === 'Injection' ? (
                      <Droplets size={13} />
                    ) : (
                      <Pill size={13} />
                    )}

                    {m.medicine_name}
                  </span>
                ))}

                {latestRx.medicines.length > 4 && (
                  <span
                    style={{
                      background: '#f1f5f9',
                      color: '#64748b',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12
                    }}
                  >
                    +{latestRx.medicines.length - 4} more
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '30px 0'
              }}
            >
              <Pill
                size={40}
                color="#0f2a4a"
                strokeWidth={1.6}
                style={{
                  marginBottom: 10
                }}
              />

              <p
                style={{
                  color: '#94a3b8',
                  fontSize: 13
                }}
              >
                No prescriptions yet.
              </p>
            </div>
          )}
        </div>
      </div>


      {/* ================= MEDICINE HISTORY ================= */}
      {allMeds.length > 0 && (
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            padding: '22px 24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#0f2a4a',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <FlaskConical size={20} color="#0f2a4a" />
            Medicine History ({allMeds.length} unique)
          </h3>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10
            }}
          >
            {allMeds.map((m, i) => (
              <span
                key={i}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#475569',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <Pill size={13} color="#0f2a4a" />
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

    </Layout>
  );
}