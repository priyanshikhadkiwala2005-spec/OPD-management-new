import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

import { API, getToken } from '../api';

export default function PatientConsultations() {
  const { user } = useAuth();
  const patientName = user?.full_name || 'Patient';

  // --------------------------------------------------
  // ONLINE CONSULTATION ROOM
  // --------------------------------------------------
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get('consultationId');

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [inRoom, setInRoom] = useState(false);

  // --------------------------------------------------
  // EXISTING CONSULTATION / PRESCRIPTION LOGIC
  // --------------------------------------------------
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API}/prescriptions/my`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setPrescriptions(d.data.prescriptions);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function formatDateTime(str) {
    if (!str) return '';

    return new Date(str).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ', ' + new Date(str).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const filtered = prescriptions.filter(p =>
    !search ||
    p.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.diagnosis || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.symptoms || '').toLowerCase().includes(search.toLowerCase())
  );

  // --------------------------------------------------
  // LEAVE ONLINE CONSULTATION
  // --------------------------------------------------
  function leaveConsultation() {
    window.history.back();
  }

  // --------------------------------------------------
  // ONLINE CONSULTATION ROOM
  // --------------------------------------------------
  if (consultationId) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column'
        }}
      >

        {/* Header */}
        <div
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '18px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: '#0f172a'
              }}
            >
              Online Consultation
            </h1>

            <p
              style={{
                margin: '5px 0 0',
                fontSize: 13,
                color: '#64748b'
              }}
            >
              Secure consultation room
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: 11,
                color: '#64748b',
                marginBottom: 3
              }}
            >
              Consultation ID
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#2563eb'
              }}
            >
              {consultationId}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            padding: 28
          }}
        >
          <div
            style={{
              maxWidth: 1250,
              margin: '0 auto'
            }}
          >

            {/* Connection Status */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '12px 16px',
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: inRoom ? '#22c55e' : '#f59e0b',
                    display: 'inline-block'
                  }}
                />

                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#334155'
                  }}
                >
                  {inRoom
                    ? 'You are in the consultation room'
                    : 'Ready to join consultation'}
                </span>
              </div>

              <span
                style={{
                  fontSize: 12,
                  color: '#64748b'
                }}
              >
                Room: {consultationId}
              </span>
            </div>

            {/* Video Boxes */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 20
              }}
            >

              {/* Doctor */}
              <div
                style={{
                  minHeight: 430,
                  background: '#0f172a',
                  borderRadius: 16,
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    color: '#ffffff'
                  }}
                >
                  <div
                    style={{
                      width: 86,
                      height: 86,
                      borderRadius: '50%',
                      background: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      fontSize: 32,
                      fontWeight: 700
                    }}
                  >
                    D
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: 20,
                      fontWeight: 700
                    }}
                  >
                    Dr. Dharmesh Gohil
                  </h2>

                  <p
                    style={{
                      margin: '7px 0 0',
                      color: '#cbd5e1',
                      fontSize: 14
                    }}
                  >
                    Orthopedic
                  </p>

                  <div
                    style={{
                      marginTop: 18,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '7px 12px',
                      background: 'rgba(15, 23, 42, 0.7)',
                      borderRadius: 20,
                      fontSize: 12,
                      color: '#cbd5e1'
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        background: '#f59e0b',
                        borderRadius: '50%'
                      }}
                    />
                    Waiting for doctor
                  </div>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: 14,
                    left: 14,
                    background: 'rgba(0,0,0,0.55)',
                    color: '#ffffff',
                    padding: '7px 11px',
                    borderRadius: 7,
                    fontSize: 13
                  }}
                >
                  Doctor
                </div>
              </div>

              {/* Patient */}
              <div
                style={{
                  minHeight: 430,
                  background: '#0f172a',
                  borderRadius: 16,
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {cameraOn ? (
                  <div
                    style={{
                      textAlign: 'center',
                      color: '#ffffff'
                    }}
                  >
                    <div
                      style={{
                        width: 86,
                        height: 86,
                        borderRadius: '50%',
                        background: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: 32,
                        fontWeight: 700
                      }}
                    >
                      {patientName.charAt(0).toUpperCase()}
                    </div>

                    <h2
                      style={{
                        margin: 0,
                        fontSize: 20,
                        fontWeight: 700
                      }}
                    >
                      {patientName}
                    </h2>

                    <p
                      style={{
                        margin: '7px 0 0',
                        color: '#cbd5e1',
                        fontSize: 14
                      }}
                    >
                      Patient
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      color: '#94a3b8'
                    }}
                  >
                    <div
                      style={{
                        fontSize: 40,
                        marginBottom: 10
                      }}
                    >
                      📹
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: 14
                      }}
                    >
                      Camera is off
                    </p>
                  </div>
                )}

                <div
                  style={{
                    position: 'absolute',
                    bottom: 14,
                    left: 14,
                    background: 'rgba(0,0,0,0.55)',
                    color: '#ffffff',
                    padding: '7px 11px',
                    borderRadius: 7,
                    fontSize: 13
                  }}
                >
                  You
                </div>
              </div>

            </div>

            {/* Controls */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                marginTop: 20,
                padding: '20px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 14
                }}
              >

                {/* Microphone */}
                <button
                  onClick={() => setMicOn(prev => !prev)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    background: micOn ? '#f1f5f9' : '#fee2e2',
                    color: micOn ? '#334155' : '#dc2626',
                    fontSize: 20
                  }}
                  title={micOn ? 'Mute microphone' : 'Unmute microphone'}
                >
                  {micOn ? '🎤' : '🔇'}
                </button>

                {/* Camera */}
                <button
                  onClick={() => setCameraOn(prev => !prev)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    background: cameraOn ? '#f1f5f9' : '#fee2e2',
                    color: cameraOn ? '#334155' : '#dc2626',
                    fontSize: 20
                  }}
                  title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
                >
                  {cameraOn ? '📹' : '🚫'}
                </button>

                {/* Join */}
                {!inRoom && (
                  <button
                    onClick={() => setInRoom(true)}
                    style={{
                      height: 48,
                      padding: '0 25px',
                      borderRadius: 24,
                      border: 'none',
                      background: '#2563eb',
                      color: '#ffffff',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Join Room
                  </button>
                )}

                {/* Leave */}
                <button
                  onClick={leaveConsultation}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontSize: 20
                  }}
                  title="Leave consultation"
                >
                  ☎
                </button>

              </div>

              <p
                style={{
                  textAlign: 'center',
                  margin: '14px 0 0',
                  fontSize: 13,
                  color: '#64748b'
                }}
              >
                {inRoom
                  ? 'You have joined the consultation room.'
                  : 'Join the room when you are ready.'}
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // EXISTING MY CONSULTATIONS PAGE
  // --------------------------------------------------
  return (
    <Layout
      role="patient"
      name={patientName}
      title="My Consultations"
      subtitle="View all consultation records with doctors"
    >

      {/* Stats */}
      <div className="page-stats" style={{ marginBottom: 24 }}>

        <div
          className="stat-card blue"
          style={{
            borderRadius: 12,
            padding: '18px 22px'
          }}
        >
          <div className="stat-icon">🩺</div>

          <div className="stat-info">
            <h2>{prescriptions.length}</h2>
            <p>Total Consultations</p>
          </div>
        </div>

        <div
          className="stat-card green"
          style={{
            borderRadius: 12,
            padding: '18px 22px'
          }}
        >
          <div className="stat-icon">💊</div>

          <div className="stat-info">
            <h2>
              {prescriptions.reduce(
                (s, p) => s + p.medicines.length,
                0
              )}
            </h2>

            <p>Medicines Received</p>
          </div>
        </div>

        <div
          className="stat-card orange"
          style={{
            borderRadius: 12,
            padding: '18px 22px'
          }}
        >
          <div className="stat-icon">💰</div>

          <div className="stat-info">
            <h2>
              ₹
              {prescriptions
                .reduce(
                  (s, p) => s + Number(p.consultation_fee),
                  0
                )
                .toLocaleString('en-IN')}
            </h2>

            <p>Total Fees Paid</p>
          </div>
        </div>

      </div>

      {/* Search */}
      <div
        className="top-bar"
        style={{ marginBottom: 20 }}
      >
        <div className="search-wrap">

          <input
            type="text"
            placeholder="Search by doctor, diagnosis, symptoms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              ✕ Clear
            </button>
          )}

        </div>
      </div>

      {/* Loading */}
      {loading ? (

        <div
          style={{
            textAlign: 'center',
            padding: 60,
            color: '#64748b'
          }}
        >
          ⏳ Loading...
        </div>

      ) : filtered.length === 0 ? (

        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e2e8f0'
          }}
        >
          <div
            style={{
              fontSize: 60,
              marginBottom: 14
            }}
          >
            🩺
          </div>

          <p
            style={{
              color: '#64748b',
              fontSize: 15
            }}
          >
            No consultations found.
          </p>
        </div>

      ) : (

        filtered.map(pr => (

          <div
            className="consult-card"
            key={pr.id}
          >

            <div className="consult-header">

              <div className="patient-left">

                <div
                  className="pat-av"
                  style={{
                    background:
                      'linear-gradient(135deg,#10b981,#0ea5e9)'
                  }}
                >
                  👨‍⚕️
                </div>

                <div>

                  <div className="c-pat-name">
                    {pr.doctor_name}
                  </div>

                  <div className="c-pat-meta">
                    {pr.specialization} • {pr.medicines.length} medicine(s)
                  </div>

                </div>

              </div>

              <div className="consult-right">

                <span className="fee-tag">
                  ₹
                  {Number(pr.consultation_fee).toLocaleString(
                    'en-IN',
                    {
                      minimumFractionDigits: 2
                    }
                  )}
                </span>

                <span className="date-tag">
                  🕒 {formatDateTime(pr.created_at)}
                </span>

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

                  <h4>
                    💊 Prescribed Medicines ({pr.medicines.length})
                  </h4>

                  <div className="med-tags">

                    {pr.medicines.map(m => (

                      <div
                        key={m.id}
                        className={`med-tag${
                          m.medicine_type === 'Injection'
                            ? ' injection'
                            : ''
                        }`}
                      >

                        <div className="mname">
                          {m.medicine_type === 'Injection'
                            ? '💉 '
                            : '💊 '}

                          {m.medicine_name}
                        </div>

                        <div className="mdetail">
                          {m.dosage} • {m.frequency} • {m.duration}
                        </div>

                      </div>

                    ))}

                  </div>

                </div>
              )}

              {(pr.notes_for_patient ||
                pr.additional_instructions) && (

                <div className="notes-section">

                  <label>
                    📝 Doctor's Instructions
                  </label>

                  {pr.additional_instructions && (
                    <p>
                      {pr.additional_instructions}
                    </p>
                  )}

                  {pr.notes_for_patient && (
                    <p style={{ marginTop: 4 }}>
                      {pr.notes_for_patient}
                    </p>
                  )}

                </div>
              )}

            </div>

          </div>

        ))
      )}

    </Layout>
  );
}