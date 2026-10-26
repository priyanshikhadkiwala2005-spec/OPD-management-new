import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ShieldCheck,
  KeyRound,
  Stethoscope,
  LockKeyhole,
  FolderOpen,
  Download,
  LogOut,
  Trash2,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ChevronRight,
} from 'lucide-react';

import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

import { API, getToken } from '../api';

export default function PatientSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const patientName = user?.full_name || 'Patient';

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const [notifications, setNotifications] = useState({
    appointment_reminders: true,
    medicine_reminders: true,
  });

  useEffect(() => {
    const savedNotifications = localStorage.getItem(
      'patientNotificationSettings'
    );

    if (savedNotifications) {
      try {
        const saved = JSON.parse(savedNotifications);

        setNotifications({
          appointment_reminders:
            saved.appointment_reminders !== false,
          medicine_reminders:
            saved.medicine_reminders !== false,
        });
      } catch (error) {
        console.error(
          'Failed to load notification settings:',
          error
        );
      }
    }
  }, []);

  // ============================================================
  // PASSWORD
  // ============================================================

  const [password, setPassword] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [passwordLoading, setPasswordLoading] = useState(false);

  // ============================================================
  // UI STATES
  // ============================================================

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  function flash(message, isError = false) {
    if (isError) {
      setError(message);
      setSuccess('');

      setTimeout(() => setError(''), 4000);
    } else {
      setSuccess(message);
      setError('');

      setTimeout(() => setSuccess(''), 4000);
    }
  }

  // ============================================================
  // TOGGLE NOTIFICATION
  // ============================================================

  function toggleNotification(key) {
    setNotifications(prev => {
      const updated = {
        ...prev,
        [key]: !prev[key],
      };

      localStorage.setItem(
        'patientNotificationSettings',
        JSON.stringify(updated)
      );

      return updated;
    });

    flash('Notification preference updated.');
  }

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  async function handlePasswordChange(e) {
    e.preventDefault();

    if (!password.current_password) {
      flash(
        'Please enter your current password.',
        true
      );
      return;
    }

    if (!password.new_password) {
      flash(
        'Please enter a new password.',
        true
      );
      return;
    }

    if (password.new_password.length < 6) {
      flash(
        'New password must be at least 6 characters.',
        true
      );
      return;
    }

    if (
      password.new_password !==
      password.confirm_password
    ) {
      flash(
        'New password and confirm password do not match.',
        true
      );
      return;
    }

    setPasswordLoading(true);

    try {
      const token = getToken();

      const res = await fetch(
        `${API}/settings/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password:
              password.current_password,
            new_password:
              password.new_password,
            confirm_password:
              password.confirm_password,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        flash('Password changed successfully!');

        setPassword({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        flash(
          data.message ||
            data.error ||
            'Failed to change password.',
          true
        );
      }
    } catch (err) {
      console.error(
        'Password change error:',
        err
      );

      flash(
        'Server error. Please try again.',
        true
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  // ============================================================
  // DOWNLOAD HEALTH INFORMATION
  // ============================================================

  async function handleDownloadData() {
    try {
      const token = getToken();

      const res = await fetch(
        `${API}/patients/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!data.success) {
        flash(
          'Unable to download health information.',
          true
        );
        return;
      }

      const healthData = {
        patient: data.data.profile,
        downloaded_at:
          new Date().toISOString(),
      };

      const blob = new Blob(
        [
          JSON.stringify(
            healthData,
            null,
            2
          ),
        ],
        {
          type: 'application/json',
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const a =
        document.createElement('a');

      a.href = url;
      a.download =
        'my-health-information.json';

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);

      flash(
        'Health information downloaded successfully!'
      );
    } catch (err) {
      console.error(
        'Download error:',
        err
      );

      flash(
        'Unable to download health information.',
        true
      );
    }
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/');
  }

  // ============================================================
  // DELETE ACCOUNT
  // ============================================================

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    flash(
      'Account deletion requires server-side account deletion support. This option is currently disabled.',
      true
    );
  }

  // ============================================================
  // TOGGLE COMPONENT
  // ============================================================

  function Toggle({ enabled, onClick }) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Toggle notification"
        style={{
          width: 48,
          height: 26,
          borderRadius: 20,
          border: 'none',
          padding: 3,
          cursor: 'pointer',
          background: enabled
            ? '#0f2a4a'
            : '#cbd5e1',
          transition: 'all 0.2s ease',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: 'block',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#fff',
            transform: enabled
              ? 'translateX(22px)'
              : 'translateX(0)',
            transition:
              'transform 0.2s ease',
            boxShadow:
              '0 1px 4px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    );
  }

  return (
    <Layout
      role="patient"
      name={patientName}
      title="Settings"
      subtitle="Manage your preferences and account"
    >
      {/* ======================================================
          ALERTS
      ====================================================== */}

      {success && (
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto 18px',
            padding: '13px 16px',
            borderRadius: 10,
            background: '#f0fdf4',
            border:
              '1px solid #bbf7d0',
            color: '#166534',
            fontSize: 13,
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
            maxWidth: 900,
            margin: '0 auto 18px',
            padding: '13px 16px',
            borderRadius: 10,
            background: '#fef2f2',
            border:
              '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
          }}
        >
          <CircleAlert size={17} />
          {error}
        </div>
      )}

      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {/* ======================================================
            1. NOTIFICATIONS
        ====================================================== */}

        <div
          style={{
            background: '#fff',
            border:
              '1px solid #e2e8f0',
            borderRadius: 15,
            marginBottom: 24,
            overflow: 'hidden',
            boxShadow:
              '0 3px 12px rgba(15,23,42,0.05)',
          }}
        >
          <div
            style={{
              padding: '22px 24px 17px',
              borderBottom:
                '1px solid #e2e8f0',
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: '#0f2a4a',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 9,
              }}
            >
              <SectionIcon>
                <Bell size={17} />
              </SectionIcon>

              Notifications
            </h3>

            <p
              style={{
                fontSize: 12.5,
                color: '#64748b',
                margin: '8px 0 0',
              }}
            >
              Choose which notifications you want to receive.
            </p>
          </div>

          {[
            {
              key: 'appointment_reminders',
              title: 'Appointment Reminders',
              description:
                'Get reminders before your upcoming appointments.',
              icon: <Clock3 size={16} />,
            },
            {
              key: 'medicine_reminders',
              title: 'Medicine Reminders',
              description:
                'Receive reminders about your prescribed medicines.',
              icon: <Stethoscope size={16} />,
            },
          ].map((item, index) => (
            <div
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                gap: 20,
                padding: '17px 24px',
                borderBottom:
                  index !== 1
                    ? '1px solid #f1f5f9'
                    : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: '#eff6ff',
                    color: '#0f2a4a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'center',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#0f172a',
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: '#64748b',
                      marginTop: 3,
                    }}
                  >
                    {item.description}
                  </div>
                </div>
              </div>

              <Toggle
                enabled={
                  notifications[item.key]
                }
                onClick={() =>
                  toggleNotification(
                    item.key
                  )
                }
              />
            </div>
          ))}
        </div>

        {/* ======================================================
            2. SECURITY
        ====================================================== */}

        <div
          style={{
            background: '#fff',
            border:
              '1px solid #e2e8f0',
            borderRadius: 15,
            marginBottom: 24,
            padding: 24,
            boxShadow:
              '0 3px 12px rgba(15,23,42,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 8,
            }}
          >
            <SectionIcon>
              <ShieldCheck size={18} />
            </SectionIcon>

            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#0f2a4a',
                  margin: 0,
                }}
              >
                Security
              </h3>

              <p
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  margin: '3px 0 0',
                }}
              >
                Keep your account secure
              </p>
            </div>
          </div>

          <p
            style={{
              fontSize: 12.5,
              color: '#64748b',
              marginBottom: 20,
            }}
          >
            Keep your account secure by regularly updating your password.
          </p>

          <form
            onSubmit={handlePasswordChange}
          >
            <div className="form-group">
              <label
                style={{
                  display: 'block',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: 7,
                }}
              >
                Current Password *
              </label>

              <input
                type="password"
                className="form-control"
                placeholder="Enter current password"
                value={
                  password.current_password
                }
                onChange={e =>
                  setPassword({
                    ...password,
                    current_password:
                      e.target.value,
                  })
                }
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 13px',
                  border:
                    '1px solid #dbe3ee',
                  borderRadius: 9,
                  fontSize: 13.5,
                  color: '#0f172a',
                  background: '#fff',
                  outline: 'none',
                }}
              />
            </div>

            <div
              className="form-row"
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: 18,
              }}
            >
              <div className="form-group">
                <label
                  style={{
                    display: 'block',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: 7,
                  }}
                >
                  New Password *
                </label>

                <input
                  type="password"
                  className="form-control"
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  value={
                    password.new_password
                  }
                  onChange={e =>
                    setPassword({
                      ...password,
                      new_password:
                        e.target.value,
                    })
                  }
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 13px',
                    border:
                      '1px solid #dbe3ee',
                    borderRadius: 9,
                    fontSize: 13.5,
                    color: '#0f172a',
                    background: '#fff',
                    outline: 'none',
                  }}
                />
              </div>

              <div className="form-group">
                <label
                  style={{
                    display: 'block',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: 7,
                  }}
                >
                  Confirm New Password *
                </label>

                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  minLength={6}
                  value={
                    password.confirm_password
                  }
                  onChange={e =>
                    setPassword({
                      ...password,
                      confirm_password:
                        e.target.value,
                    })
                  }
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 13px',
                    border:
                      '1px solid #dbe3ee',
                    borderRadius: 9,
                    fontSize: 13.5,
                    color: '#0f172a',
                    background: '#fff',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              style={{
                marginTop: 6,
                border: 'none',
                borderRadius: 9,
                padding: '11px 18px',
                background: '#0f2a4a',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor:
                  passwordLoading
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  passwordLoading
                    ? 0.7
                    : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow:
                  '0 5px 14px rgba(15,42,74,0.18)',
              }}
            >
              {passwordLoading ? (
                <>
                  <Clock3 size={16} />
                  Changing...
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  Change Password
                </>
              )}
            </button>
          </form>
        </div>

        {/* ======================================================
            3. PRIVACY & DATA
        ====================================================== */}

        <div
          style={{
            background: '#fff',
            border:
              '1px solid #e2e8f0',
            borderRadius: 15,
            marginBottom: 24,
            padding: 24,
            boxShadow:
              '0 3px 12px rgba(15,23,42,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 8,
            }}
          >
            <SectionIcon>
              <LockKeyhole size={18} />
            </SectionIcon>

            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#0f2a4a',
                  margin: 0,
                }}
              >
                Privacy & Data
              </h3>

              <p
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  margin: '3px 0 0',
                }}
              >
                Manage your healthcare information
              </p>
            </div>
          </div>

          <p
            style={{
              fontSize: 12.5,
              color: '#64748b',
              marginBottom: 18,
            }}
          >
            Manage and access your personal healthcare information.
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={() =>
                navigate(
                  '/patient/medical-records'
                )
              }
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#fff',
                border:
                  '1px solid #e2e8f0',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                cursor: 'pointer',
                textAlign: 'left',
                transition:
                  'all 0.2s ease',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: '#eff6ff',
                    color: '#0f2a4a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'center',
                  }}
                >
                  <FolderOpen size={17} />
                </span>

                <span>
                  <strong
                    style={{
                      display: 'block',
                      color: '#0f172a',
                      fontSize: 13.5,
                    }}
                  >
                    Manage Medical Data
                  </strong>

                  <small
                    style={{
                      color: '#64748b',
                      fontSize: 11.5,
                    }}
                  >
                    View your medical records
                  </small>
                </span>
              </span>

              <ChevronRight
                size={18}
                color="#0f2a4a"
              />
            </button>

            <button
              type="button"
              onClick={handleDownloadData}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: '#fff',
                border:
                  '1px solid #e2e8f0',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                cursor: 'pointer',
                textAlign: 'left',
                transition:
                  'all 0.2s ease',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: '#eff6ff',
                    color: '#0f2a4a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'center',
                  }}
                >
                  <Download size={17} />
                </span>

                <span>
                  <strong
                    style={{
                      display: 'block',
                      color: '#0f172a',
                      fontSize: 13.5,
                    }}
                  >
                    Download Health Information
                  </strong>

                  <small
                    style={{
                      color: '#64748b',
                      fontSize: 11.5,
                    }}
                  >
                    Download your available profile information
                  </small>
                </span>
              </span>

              <Download
                size={18}
                color="#0f2a4a"
              />
            </button>
          </div>
        </div>

        {/* ======================================================
            4. ACCOUNT
        ====================================================== */}

        <div
          style={{
            background: '#fff',
            border:
              '1px solid #e2e8f0',
            borderRadius: 15,
            marginBottom: 30,
            padding: 24,
            boxShadow:
              '0 3px 12px rgba(15,23,42,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#f8fafc',
                color: '#0f2a4a',
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={18} />
            </div>

            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#0f2a4a',
                  margin: 0,
                }}
              >
                Account
              </h3>

              <p
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  margin: '3px 0 0',
                }}
              >
                Manage your account session and status
              </p>
            </div>
          </div>

          <p
            style={{
              fontSize: 12.5,
              color: '#64748b',
              marginBottom: 18,
            }}
          >
            Manage your account session and account status.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: '10px 18px',
                background: '#fff',
                color: '#0f2a4a',
                border:
                  '1px solid #cbd5e1',
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <LogOut size={16} />
              Logout
            </button>

            <button
              type="button"
              onClick={handleDeleteAccount}
              style={{
                padding: '10px 18px',
                background: '#fff',
                color: '#475569',
                border:
                  '1px solid #cbd5e1',
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Trash2 size={16} />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ============================================================
   SECTION ICON
============================================================ */

function SectionIcon({ children }) {
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: '#eff6ff',
        color: '#0f2a4a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}