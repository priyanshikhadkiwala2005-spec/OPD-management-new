import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

import { API, getToken } from '../api';

import {
  CalendarDays,
  CircleCheckBig,
  Pill,
  CreditCard,
  Stethoscope,
  UserRound,
  Zap,
  Pencil,
  Droplets,
} from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const patientName = user?.full_name || 'Patient';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/settings/patient-stats`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setStats(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout
        role="patient"
        name={patientName}
        title="Patient Dashboard"
        subtitle="Manage your health records"
      >
        <div
          style={{
            textAlign: 'center',
            padding: 80,
            color: '#64748b',
          }}
        >
          Loading...
        </div>
      </Layout>
    );
  }

  const s = stats || {
    total_appointments: 0,
    total_consultations: 0,
    total_prescriptions: 0,
    total_paid: 0,
  };

  return (
    <Layout
      role="patient"
      name={patientName}
      title="Patient Dashboard"
      subtitle="Manage your health records and appointments"
    >

      {/* =========================
          WELCOME BANNER
      ========================== */}

      <div
        className="welcome-banner"
        style={{
          background: '#0f2a4a',
          borderRadius: '16px',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          color: '#ffffff',
        }}
      >
        <div>
          <h2
            style={{
              margin: '0 0 8px',
              color: '#ffffff',
              fontSize: '26px',
              fontWeight: '700',
            }}
          >
            Welcome back, {patientName}!
          </h2>

          <p
            style={{
              margin: 0,
              color: '#dbeafe',
              fontSize: '14px',
            }}
          >
            Here's a summary of your health activity. Stay healthy!
          </p>
        </div>

        <div
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Stethoscope size={40} strokeWidth={1.7} />
        </div>
      </div>


      {/* =========================
          STATS
      ========================== */}

      <div
        className="cards-grid"
        style={{
          marginBottom: '24px',
        }}
      >

        {/* =========================
            APPOINTMENTS
        ========================== */}

        <div
          className="stat-card"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarDays size={26} strokeWidth={1.8} />
          </div>

          <div className="stat-info">
            <h2
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: '28px',
              }}
            >
              {s.total_appointments}
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#64748b',
              }}
            >
              My Appointments
            </p>
          </div>
        </div>


        {/* =========================
            CONSULTATIONS
        ========================== */}

        <div
          className="stat-card"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',

              /* SAME AS CALENDAR */
              background: '#eff6ff',
              color: '#2563eb',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircleCheckBig size={26} strokeWidth={1.8} />
          </div>

          <div className="stat-info">
            <h2
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: '28px',
              }}
            >
              {s.total_consultations}
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#64748b',
              }}
            >
              Consultations Done
            </p>
          </div>
        </div>


        {/* =========================
            PRESCRIPTIONS
        ========================== */}

        <div
          className="stat-card"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',

              /* SAME AS CALENDAR */
              background: '#eff6ff',
              color: '#2563eb',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Pill size={26} strokeWidth={1.8} />
          </div>

          <div className="stat-info">
            <h2
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: '28px',
              }}
            >
              {s.total_prescriptions}
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#64748b',
              }}
            >
              Prescriptions
            </p>
          </div>
        </div>


        {/* =========================
            TOTAL PAID
        ========================== */}

        <div
          className="stat-card"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#eff6ff',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCard size={26} strokeWidth={1.8} />
          </div>

          <div className="stat-info">
            <h2
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: '28px',
              }}
            >
              ₹{Number(s.total_paid).toLocaleString('en-IN')}
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#64748b',
              }}
            >
              Total Paid
            </p>
          </div>
        </div>

      </div>


      {/* =========================
          PROFILE + QUICK ACTIONS
      ========================== */}

      <div className="two-col">

        {/* =========================
            MY PROFILE
        ========================== */}

        <div
          className="info-card"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >

          <div
            className="info-card-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 22px',
              borderBottom: '1px solid #e2e8f0',
            }}
          >

            <h3
              style={{
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#0f172a',
              }}
            >
              <UserRound size={20} color="#2563eb" />
              My Profile
            </h3>

            <Link
              to="/patient/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#2563eb',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              <Pencil size={15} />
              Edit
            </Link>

          </div>


          <div
            className="info-body"
            style={{
              padding: '8px 22px',
            }}
          >

            {/* Full Name */}

            <div
              className="info-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 0',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <span className="info-label">
                Full Name
              </span>

              <span className="info-value">
                {user?.full_name || '—'}
              </span>
            </div>


            {/* Gender */}

            <div
              className="info-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 0',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <span className="info-label">
                Gender
              </span>

              <span className="info-value">
                {user?.gender || '—'}
              </span>
            </div>


            {/* Age */}

            <div
              className="info-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 0',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <span className="info-label">
                Age
              </span>

              <span className="info-value">
                {user?.age ? `${user.age} years` : '—'}
              </span>
            </div>


            {/* Blood Group */}

            <div
              className="info-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 0',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <span className="info-label">
                Blood Group
              </span>

              <span className="info-value">
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',

                    /* SAME AS CALENDAR */
                    background: '#eff6ff',
                    color: '#2563eb',

                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  <Droplets size={14} />
                  {user?.blood_group || '—'}
                </span>
              </span>
            </div>


            {/* Mobile */}

            <div
              className="info-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 0',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <span className="info-label">
                Mobile
              </span>

              <span className="info-value">
                {user?.mobile || '—'}
              </span>
            </div>


            {/* Email */}

            <div
              className="info-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '13px 0',
              }}
            >
              <span className="info-label">
                Email
              </span>

              <span className="info-value">
                {user?.email || '—'}
              </span>
            </div>

          </div>

        </div>


        {/* =========================
            QUICK ACTIONS
        ========================== */}

        <div
          className="info-card"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            overflow: 'hidden',
          }}
        >

          <div
            className="info-card-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '18px 22px',
              borderBottom: '1px solid #e2e8f0',
            }}
          >

            <h3
              style={{
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#0f172a',
              }}
            >
              <Zap size={20} color="#2563eb" />
              Quick Actions
            </h3>

          </div>


          <div
            className="quick-actions-grid"
            style={{
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
            }}
          >

            {/* My Appointments */}

            <Link
              to="/patient/appointments"
              className="quick-action-btn"
              style={{
                textDecoration: 'none',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '22px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <CalendarDays
                size={30}
                color="#2563eb"
                strokeWidth={1.8}
              />

              <p
                style={{
                  margin: 0,
                  color: '#0f172a',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                My Appointments
              </p>
            </Link>


            {/* Prescriptions */}

            <Link
              to="/patient/prescriptions"
              className="quick-action-btn"
              style={{
                textDecoration: 'none',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '22px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <Pill
                size={30}
                color="#e11d48"
                strokeWidth={1.8}
              />

              <p
                style={{
                  margin: 0,
                  color: '#0f172a',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Prescriptions
              </p>
            </Link>


            {/* My Bills */}

            <Link
              to="/patient/billing"
              className="quick-action-btn"
              style={{
                textDecoration: 'none',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '22px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <CreditCard
                size={30}
                color="#0284c7"
                strokeWidth={1.8}
              />

              <p
                style={{
                  margin: 0,
                  color: '#0f172a',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                My Bills
              </p>
            </Link>


            {/* Edit Profile */}

            <Link
              to="/patient/profile"
              className="quick-action-btn"
              style={{
                textDecoration: 'none',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '22px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <UserRound
                size={30}
                color="#7c3aed"
                strokeWidth={1.8}
              />

              <p
                style={{
                  margin: 0,
                  color: '#0f172a',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Edit Profile
              </p>
            </Link>

          </div>

        </div>

      </div>

    </Layout>
  );
}