import { useState, useEffect } from 'react';
import {
  UserRound,
  CheckCircle2,
  Droplets,
  CalendarDays,
  HeartPulse,
  Scale,
  Phone,
  Mail,
  MapPin,
  Save,
  Clock3,
  LockKeyhole,
  Stethoscope,
  ClipboardList,
} from 'lucide-react';

import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

import { API, getToken } from '../api';

export default function PatientProfile() {
  const { user, login } = useAuth();
  const patientName = user?.full_name || 'Patient';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    mobile: '',
    gender: '',
    age: 0,
    blood_group: '',
    address: '',
  });

  useEffect(() => {
    fetch(`${API}/patients/profile`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const p = d.data.profile;

          setProfile({
            full_name: p.full_name || '',
            email: p.email || '',
            mobile: p.mobile || '',
            gender: p.gender || '',
            age: p.age || 0,
            blood_group: p.blood_group || '',
            address: p.address || '',
          });
        }
      })
      .catch(() => {
        setError('Unable to load your profile.');
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API}/patients/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Profile updated successfully!');

        login({
          ...user,
          full_name: profile.full_name,
          email: profile.email,
          mobile: profile.mobile,
          age: profile.age,
          gender: profile.gender,
          blood_group: profile.blood_group,
        });

        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile.');
      }
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function updateField(field, value) {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  }

  const completionFields = [
    profile.full_name,
    profile.email,
    profile.mobile,
    profile.gender,
    profile.age,
    profile.blood_group,
    profile.address,
  ];

  const completedFields = completionFields.filter(Boolean).length;

  const completion = Math.round(
    (completedFields / completionFields.length) * 100
  );

  const bloodColors = {
    'A+': '#ef4444',
    'A-': '#ef4444',
    'B+': '#f97316',
    'B-': '#f97316',
    'AB+': '#8b5cf6',
    'AB-': '#8b5cf6',
    'O+': '#2563eb',
    'O-': '#2563eb',
  };

  const bloodColor =
    bloodColors[profile.blood_group] || '#64748b';

  if (loading) {
    return (
      <Layout
        role="patient"
        name={patientName}
        title="My Profile"
        subtitle="Manage your account"
      >
        <div
          style={{
            textAlign: 'center',
            padding: 80,
            color: '#64748b',
            fontSize: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Clock3 size={17} color="#0f2a4a" />
            Loading your profile...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      role="patient"
      name={patientName}
      title="My Profile"
      subtitle="Manage your account information"
    >
      {/* =====================================================
          ALERTS
      ====================================================== */}

      {success && (
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto 18px',
            padding: '13px 18px',
            borderRadius: 10,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            fontSize: 13.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
          }}
        >
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}

      {error && (
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto 18px',
            padding: '13px 18px',
            borderRadius: 10,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: 13.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
          }}
        >
          <CircleAlertIcon size={17} />
          {error}
        </div>
      )}

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        {/* =====================================================
            PROFILE HERO
        ====================================================== */}

        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 18,
            padding: '26px 30px',
            marginBottom: 22,

            /* SOLID NAVY BLUE */
            background: '#0f2a4a',

            boxShadow:
              '0 10px 30px rgba(15,42,74,0.16)',
          }}
        >
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            {/* LEFT SIDE */}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
              }}
            >
              {/* Avatar */}

              <div
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  background:
                    'rgba(255,255,255,0.12)',

                  border:
                    '1px solid rgba(255,255,255,0.2)',

                  color: '#fff',
                  fontSize: 30,
                  fontWeight: 800,

                  boxShadow:
                    '0 8px 25px rgba(0,0,0,0.18)',
                }}
              >
                {profile.full_name
                  ? profile.full_name
                      .charAt(0)
                      .toUpperCase()
                  : 'P'}
              </div>

              {/* Profile Details */}

              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 10px',
                    borderRadius: 20,

                    background:
                      'rgba(255,255,255,0.1)',

                    color: '#bfdbfe',
                    fontSize: 10.5,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  <CheckCircle2 size={13} />
                  PATIENT PROFILE
                </div>

                <h2
                  style={{
                    margin: 0,
                    color: '#fff',
                    fontSize: 25,
                    fontWeight: 800,
                  }}
                >
                  {profile.full_name || 'Patient'}
                </h2>

                <p
                  style={{
                    margin: '5px 0 0',
                    color:
                      'rgba(255,255,255,0.65)',
                    fontSize: 12.5,
                  }}
                >
                  Manage your personal and health
                  information
                </p>
              </div>
            </div>

            {/* BLOOD GROUP */}

            <div
              style={{
                minWidth: 130,
                padding: '13px 18px',
                borderRadius: 13,

                background:
                  'rgba(255,255,255,0.08)',

                border:
                  '1px solid rgba(255,255,255,0.12)',

                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,

                  color:
                    'rgba(255,255,255,0.55)',

                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                <Droplets size={13} />
                Blood Group
              </div>

              <div
                style={{
                  color:
                    
                     '#fff',

                  fontSize: 23,
                  fontWeight: 800,
                }}
              >
                {profile.blood_group || 'Not Set'}
              </div>
            </div>
          </div>

          {/* PROFILE MINI STATS */}

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 28,
              marginTop: 22,
              paddingTop: 18,
              borderTop:
                '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <MiniProfileStat
              icon={<CalendarDays size={15} />}
              label="Age"
              value={
                profile.age
                  ? `${profile.age} yrs`
                  : 'Not set'
              }
            />

            <MiniProfileStat
              icon={<UserRound size={15} />}
              label="Gender"
              value={
                profile.gender || 'Not set'
              }
            />

            <MiniProfileStat
              icon={<Phone size={15} />}
              label="Mobile"
              value={
                profile.mobile || 'Not set'
              }
            />

            <MiniProfileStat
              icon={<Mail size={15} />}
              label="Email"
              value={
                profile.email || 'Not set'
              }
            />
          </div>
        </div>

        {/* =====================================================
            TOP CARDS
        ====================================================== */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 18,
            marginBottom: 22,
          }}
        >
          {/* PROFILE COMPLETION */}

          <div
            style={{
              background: '#fff',
              border:
                '1px solid #e2e8f0',
              borderRadius: 15,
              padding: 20,
              boxShadow:
                '0 3px 12px rgba(15,23,42,0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 13,
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#0f2a4a',
                  }}
                >
                  <ClipboardList
                    size={17}
                    color="#0f2a4a"
                  />

                  Profile Completion
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: '#64748b',
                    marginTop: 3,
                  }}
                >
                  Keep your information up to date
                </div>
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#0f2a4a',
                }}
              >
                {completion}%
              </div>
            </div>

            <div
              style={{
                height: 9,
                borderRadius: 20,
                background: '#e2e8f0',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${completion}%`,
                  height: '100%',
                  borderRadius: 20,
                  background: '#2563eb',
                  transition:
                    'width 0.4s ease',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                marginTop: 9,
                fontSize: 11.5,
                color: '#64748b',
              }}
            >
              <span>
                {completedFields} of{' '}
                {completionFields.length}{' '}
                sections filled
              </span>

              {completion === 100 ? (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: '#059669',
                    fontWeight: 700,
                  }}
                >
                  <CheckCircle2 size={13} />
                  Complete
                </span>
              ) : (
                <span
                  style={{
                    color: '#0f2a4a',
                    fontWeight: 600,
                  }}
                >
                  Complete your profile
                </span>
              )}
            </div>
          </div>

          {/* HEALTH OVERVIEW */}

          <div
            style={{
              background: '#fff',
              border:
                '1px solid #e2e8f0',
              borderRadius: 15,
              padding: 20,
              boxShadow:
                '0 3px 12px rgba(15,23,42,0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 800,
                color: '#0f2a4a',
                marginBottom: 15,
              }}
            >
              <HeartPulse
                size={17}
                color="#0f2a4a"
              />

              Health Overview
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(3, 1fr)',
                gap: 10,
              }}
            >
              <HealthMiniCard
                icon={
                  <Droplets size={18} />
                }
                label="Blood"
                value={
                  profile.blood_group || '—'
                }
                color={bloodColor}
              />

              <HealthMiniCard
                icon={
                  <CalendarDays size={18} />
                }
                label="Age"
                value={
                  profile.age
                    ? `${profile.age}`
                    : '—'
                }
                color="#0f2a4a"
              />

              <HealthMiniCard
                icon={
                  <Scale size={18} />
                }
                label="BMI"
                value="—"
                color="#0f2a4a"
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            PERSONAL INFORMATION
        ====================================================== */}

        <div
          style={{
            background: '#fff',
            border:
              '1px solid #e2e8f0',
            borderRadius: 16,
            padding: '24px 26px',
            boxShadow:
              '0 3px 12px rgba(15,23,42,0.05)',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 22,
            }}
          >
            <SectionIcon
              icon={
                <UserRound size={19} />
              }
            />

            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#0f2a4a',
                }}
              >
                Personal Information
              </h3>

              <p
                style={{
                  margin: '3px 0 0',
                  fontSize: 12,
                  color: '#64748b',
                }}
              >
                Your basic account information
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '18px 20px',
              }}
            >
              <ProfileField
                label="Full Name"
                required
                value={profile.full_name}
                onChange={e =>
                  updateField(
                    'full_name',
                    e.target.value
                  )
                }
              />

              <ProfileField
                label="Email"
                required
                type="email"
                value={profile.email}
                onChange={e =>
                  updateField(
                    'email',
                    e.target.value
                  )
                }
              />

              <ProfileField
                label="Mobile Number"
                value={profile.mobile}
                placeholder="Enter mobile number"
                onChange={e =>
                  updateField(
                    'mobile',
                    e.target.value
                  )
                }
              />

              <ProfileSelect
                label="Gender"
                value={profile.gender}
                onChange={e =>
                  updateField(
                    'gender',
                    e.target.value
                  )
                }
                options={[
                  'Male',
                  'Female',
                  'Other',
                ]}
              />

              <ProfileField
                label="Age"
                type="number"
                min="1"
                max="120"
                value={
                  profile.age || ''
                }
                placeholder="Enter age"
                onChange={e =>
                  updateField(
                    'age',
                    parseInt(
                      e.target.value
                    ) || 0
                  )
                }
              />

              <ProfileSelect
                label="Blood Group"
                value={
                  profile.blood_group
                }
                onChange={e =>
                  updateField(
                    'blood_group',
                    e.target.value
                  )
                }
                options={[
                  'A+',
                  'A-',
                  'B+',
                  'B-',
                  'AB+',
                  'AB-',
                  'O+',
                  'O-',
                ]}
              />
            </div>

            {/* ADDRESS */}

            <div
              style={{
                marginTop: 18,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: 7,
                }}
              >
                <MapPin
                  size={14}
                  color="#0f2a4a"
                />

                Address
              </label>

              <textarea
                value={profile.address}
                placeholder="Enter your complete address"
                onChange={e =>
                  updateField(
                    'address',
                    e.target.value
                  )
                }
                rows={3}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  padding: '11px 13px',
                  border:
                    '1px solid #dbe3ee',
                  borderRadius: 9,
                  fontSize: 13.5,
                  color: '#0f172a',
                  outline: 'none',
                  fontFamily: 'inherit',
                  background: '#fff',
                }}
              />
            </div>

            {/* SAVE BUTTON */}

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'flex-end',
                marginTop: 22,
                paddingTop: 18,
                borderTop:
                  '1px solid #f1f5f9',
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 25px',
                  background: '#0f2a4a',
                  color: '#fff',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: saving
                    ? 'not-allowed'
                    : 'pointer',
                  opacity: saving
                    ? 0.7
                    : 1,
                  boxShadow:
                    '0 5px 15px rgba(15,42,74,0.2)',
                  transition:
                    'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {saving ? (
                  <>
                    <Clock3 size={16} />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* =====================================================
            ACCOUNT INFORMATION
        ====================================================== */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '1fr 1fr',
            gap: 18,
            marginBottom: 24,
          }}
        >
          {/* MEDICAL IDENTITY */}

          <div
            style={{
              background: '#fff',
              border:
                '1px solid #e2e8f0',
              borderRadius: 15,
              padding: 20,
              boxShadow:
                '0 3px 12px rgba(15,23,42,0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 15,
              }}
            >
              <SectionIcon
                icon={
                  <Stethoscope size={18} />
                }
              />

              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#0f2a4a',
                  }}
                >
                  Medical Identity
                </div>

                <div
                  style={{
                    fontSize: 11.5,
                    color: '#64748b',
                  }}
                >
                  Quick reference information
                </div>
              </div>
            </div>

            <InfoLine
              icon={
                <UserRound size={14} />
              }
              label="Patient Name"
              value={
                profile.full_name ||
                'Not set'
              }
            />

            <InfoLine
              icon={
                <Droplets size={14} />
              }
              label="Blood Group"
              value={
                profile.blood_group ||
                'Not set'
              }
              valueColor={
                profile.blood_group
                  ? bloodColor
                  : '#64748b'
              }
            />

            <InfoLine
              icon={
                <UserRound size={14} />
              }
              label="Gender"
              value={
                profile.gender ||
                'Not set'
              }
            />

            <InfoLine
              icon={
                <CalendarDays size={14} />
              }
              label="Age"
              value={
                profile.age
                  ? `${profile.age} years`
                  : 'Not set'
              }
              last
            />
          </div>

          {/* CONTACT */}

          <div
            style={{
              background: '#fff',
              border:
                '1px solid #e2e8f0',
              borderRadius: 15,
              padding: 20,
              boxShadow:
                '0 3px 12px rgba(15,23,42,0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 15,
              }}
            >
              <SectionIcon
                icon={<Phone size={18} />}
              />

              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#0f2a4a',
                  }}
                >
                  Contact Information
                </div>

                <div
                  style={{
                    fontSize: 11.5,
                    color: '#64748b',
                  }}
                >
                  Your registered contact details
                </div>
              </div>
            </div>

            <InfoLine
              icon={
                <Mail size={14} />
              }
              label="Email"
              value={
                profile.email ||
                'Not set'
              }
            />

            <InfoLine
              icon={
                <Phone size={14} />
              }
              label="Mobile"
              value={
                profile.mobile ||
                'Not set'
              }
            />

            <InfoLine
              icon={
                <MapPin size={14} />
              }
              label="Address"
              value={
                profile.address ||
                'Not set'
              }
              last
            />
          </div>
        </div>

        {/* BOTTOM NOTE */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            textAlign: 'center',
            padding: '8px 0 20px',
            color: '#94a3b8',
            fontSize: 11.5,
          }}
        >
          <LockKeyhole size={13} />

          Your personal information is used only
          for your MedCare account and healthcare
          services.
        </div>
      </div>
    </Layout>
  );
}

/* ============================================================
   SMALL REUSABLE UI COMPONENTS
============================================================ */

function MiniProfileStat({
  icon,
  label,
  value,
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 7,
      }}
    >
      <div
        style={{
          color: '#93c5fd',
          marginTop: 1,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color:
              'rgba(255,255,255,0.48)',
            fontSize: 9.5,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            marginBottom: 3,
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: '#fff',
            fontSize: 12.5,
            fontWeight: 700,
            maxWidth: 180,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function SectionIcon({ icon }) {
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#eff6ff',
        color: '#0f2a4a',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
  );
}

function HealthMiniCard({
  icon,
  label,
  value,
  color,
}) {
  return (
    <div
      style={{
        background: '#f8fafc',
        borderRadius: 10,
        padding: '11px 10px',
        textAlign: 'center',
        border:
          '1px solid #eef2f7',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#0f2a4a',
          marginBottom: 4,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: 10,
          color: '#94a3b8',
          marginBottom: 2,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ProfileField({
  label,
  required,
  type = 'text',
  value,
  onChange,
  placeholder,
  min,
  max,
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 12.5,
          fontWeight: 700,
          color: '#334155',
          marginBottom: 7,
        }}
      >
        {label}{' '}
        {required && (
          <span
            style={{
              color: '#ef4444',
            }}
          >
            *
          </span>
        )}
      </label>

      <input
        type={type}
        min={min}
        max={max}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '11px 13px',
          border:
            '1px solid #dbe3ee',
          borderRadius: 9,
          fontSize: 13.5,
          color: '#0f172a',
          outline: 'none',
          background: '#fff',
        }}
      />
    </div>
  );
}

function ProfileSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 12.5,
          fontWeight: 700,
          color: '#334155',
          marginBottom: 7,
        }}
      >
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '11px 13px',
          border:
            '1px solid #dbe3ee',
          borderRadius: 9,
          fontSize: 13.5,
          color: '#0f172a',
          outline: 'none',
          background: '#fff',
          cursor: 'pointer',
        }}
      >
        <option value="">
          Select
        </option>

        {options.map(option => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function InfoLine({
  icon,
  label,
  value,
  valueColor = '#0f172a',
  last = false,
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent:
          'space-between',
        alignItems: 'flex-start',
        gap: 15,
        padding: '10px 0',
        borderBottom: last
          ? 'none'
          : '1px solid #e5e7eb',
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11.5,
          color: '#64748b',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: '#0f2a4a',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </span>

        {label}
      </span>

      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: valueColor,
          textAlign: 'right',
          maxWidth: '65%',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   SMALL ALERT ICON
============================================================ */

function CircleAlertIcon({
  size = 18,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
      />

      <line
        x1="12"
        y1="8"
        x2="12"
        y2="12"
      />

      <line
        x1="12"
        y1="16"
        x2="12.01"
        y2="16"
      />
    </svg>
  );
}