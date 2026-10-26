import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  UserRound,
  Stethoscope,
  Hospital,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  LockKeyhole,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Droplets,
} from 'lucide-react';

import { API } from '../api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const typeFromQuery = searchParams.get('type') || 'patient';

  const [type, setType] = useState(typeFromQuery);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [patientId, setPatientId] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    gender: '',
    age: '',
    dob: '',
    specialization: '',
    blood_group: '',
    mobile: '',
    email: '',
    address: '',
    password: '',
    confirm_password: '',
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // ==========================================
  // COPY PATIENT ID
  // ==========================================
  async function handleCopyPatientId() {
    if (!patientId) return;

    try {
      await navigator.clipboard.writeText(patientId);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);

      try {
        const textArea = document.createElement('textarea');
        textArea.value = patientId;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';

        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (fallbackError) {
        setError(
          'Unable to copy Patient ID. Please copy it manually.'
        );
      }
    }
  }

  // ==========================================
  // REGISTER
  // ==========================================
  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setSuccess('');
    setCopied(false);

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          type,
          fullName: form.full_name,
          email: form.email,
          password: form.password,
          mobile: form.mobile,
          gender: form.gender,
          age: form.age,
          dob: form.dob,
          specialization: form.specialization,
          bloodGroup: form.blood_group,
          address: form.address,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // ==========================================
        // PATIENT REGISTRATION SUCCESS
        // ==========================================
        if (type === 'patient') {
          const generatedPatientId = data.data?.patientId;

          if (!generatedPatientId) {
            setError(
              'Registration completed, but Patient ID was not received from the server.'
            );
            return;
          }

          setPatientId(generatedPatientId);
          setSuccess('Registration Successful!');
        }

        // ==========================================
        // DOCTOR REGISTRATION SUCCESS
        // ==========================================
        else {
          setSuccess(
            'Registration Successful! Redirecting to doctor login...'
          );

          setTimeout(() => {
            navigate('/doctor-login');
          }, 1500);
        }
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration error:', error);

      setError(
        'Cannot connect to server. Make sure Node.js backend is running.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="auth-bg"
      style={{
        alignItems: 'flex-start',
        paddingTop: '30px',
      }}
    >
      <div className="auth-wrapper">

        {/* ==========================================
            BRAND LOGO
        ========================================== */}
        <div
          className="brand-logo"
          style={{
            textAlign: 'center',
          }}
        >

          {/* ==========================================
              MEDCARE LOGO
              SAME AS DOCTOR / PATIENT LOGIN + SIDEBAR
          ========================================== */}
          <div
            className="logo-icon"
            style={{
              width: '48px',
              height: '48px',
              minWidth: '48px',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              // WHITE BORDER - SAME STYLE AS LOGIN + SIDEBAR
              border: '2px solid #ffffff',

              overflow: 'hidden',
              boxSizing: 'border-box',
              margin: '0 auto',
            }}
          >
            <img
              src="/Logo.png"
              alt="MedCare Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                borderRadius: '12px',
              }}
            />
          </div>

          <h1>
            Med<span style={{ color: '#2563eb' }}>Care</span> OPD
          </h1>

          <p>
            Create your account to get started
          </p>

        </div>

        <div className="auth-box">

          {/* ==========================================
              PATIENT / DOCTOR TYPE BUTTONS
          ========================================== */}
          <div className="type-buttons">

            <button
              type="button"
              className={`type-btn ${
                type === 'patient' ? 'active' : ''
              }`}
              onClick={() => {
                setType('patient');
                setPatientId('');
                setSuccess('');
                setError('');
                setCopied(false);
              }}
              style={{
                color:
                  type === 'patient'
                    ? '#ffffff'
                    : '#0f2a4a',
                background:
                  type === 'patient'
                    ? '#0f2a4a'
                    : '#ffffff',
                borderColor:
                  type === 'patient'
                    ? '#0f2a4a'
                    : '#d9e2ec',
              }}
            >
              <UserRound
                size={17}
                strokeWidth={2}
              />
              Patient
            </button>

            <button
              type="button"
              className={`type-btn ${
                type === 'doctor' ? 'active' : ''
              }`}
              onClick={() => {
                setType('doctor');
                setPatientId('');
                setSuccess('');
                setError('');
                setCopied(false);
              }}
              style={{
                color:
                  type === 'doctor'
                    ? '#ffffff'
                    : '#0f2a4a',
                background:
                  type === 'doctor'
                    ? '#0f2a4a'
                    : '#ffffff',
                borderColor:
                  type === 'doctor'
                    ? '#0f2a4a'
                    : '#d9e2ec',
              }}
            >
              <Stethoscope
                size={17}
                strokeWidth={2}
              />
              Doctor
            </button>

          </div>

          {/* ==========================================
              TITLE
          ========================================== */}
          <div className="box-title">

            <h2 style={{ color: '#0f2a4a' }}>
              {type === 'doctor'
                ? 'Doctor Registration'
                : 'Patient Registration'}
            </h2>

            <p>
              Fill in the details below to create your account
            </p>

          </div>

          {/* ==========================================
              ERROR
          ========================================== */}
          {error && (
            <div
              className="alert alert-error"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* ==========================================
              SUCCESS MESSAGE
          ========================================== */}
          {success && !patientId && (
            <div
              className="alert alert-success"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          {/* ==========================================
              PATIENT SUCCESS SCREEN
          ========================================== */}
          {type === 'patient' && patientId ? (

            <div
              style={{
                marginTop: '25px',
                padding: '30px 20px',
                borderRadius: '14px',
                background: '#f0f7ff',
                border: '2px solid #2563eb',
                textAlign: 'center',
              }}
            >

              {/* SUCCESS ICON */}
              <div
                style={{
                  fontSize: '42px',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#0f2a4a',
                }}
              >
                <CheckCircle2
                  size={45}
                  strokeWidth={1.8}
                />
              </div>

              {/* SUCCESS TITLE */}
              <h2
                style={{
                  margin: '0 0 12px',
                  color: '#0f2a4a',
                }}
              >
                Registration Successful!
              </h2>

              <p
                style={{
                  margin: '0 0 8px',
                  color: '#555',
                  fontSize: '16px',
                }}
              >
                Your Patient ID is:
              </p>

              {/* PATIENT ID + COPY BUTTON */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                  margin: '10px 0 18px',
                }}
              >

                {/* PATIENT ID */}
                <div
                  style={{
                    display: 'inline-block',
                    padding: '12px 22px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '2px dashed #2563eb',
                    color: '#0f2a4a',
                    fontSize: '28px',
                    fontWeight: '700',
                    letterSpacing: '2px',
                  }}
                >
                  {patientId}
                </div>

                {/* COPY BUTTON */}
                <button
                  type="button"
                  onClick={handleCopyPatientId}
                  style={{
                    padding: '13px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: copied
                      ? '#16a34a'
                      : '#0f2a4a',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minWidth: '105px',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                  }}
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy ID
                    </>
                  )}
                </button>

              </div>

              {/* INSTRUCTION */}
              <p
                style={{
                  margin: '0 auto 22px',
                  maxWidth: '430px',
                  color: '#555',
                  lineHeight: '1.6',
                }}
              >
                Please save this Patient ID safely.
                You will need to give this ID to your doctor
                when you want to be added to the doctor's patient list.
              </p>

              {/* CONTINUE TO LOGIN */}
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate('/')}
                style={{
                  background: '#0f2a4a',
                  color: '#ffffff',
                }}
              >
                Continue to Patient Login

                <ArrowRight
                  size={17}
                  style={{
                    marginLeft: '7px',
                    verticalAlign: 'middle',
                  }}
                />
              </button>

            </div>

          ) : (

            /* ==========================================
               REGISTRATION FORM
            ========================================== */

            <form
              onSubmit={handleSubmit}
              autoComplete="off"
            >

              {/* PERSONAL INFORMATION */}
              <div
                className="section-label"
                style={{
                  color: '#0f2a4a',
                }}
              >
                <UserRound
                  size={16}
                  style={{
                    marginRight: '7px',
                    verticalAlign: 'middle',
                  }}
                />
                Personal Information
              </div>

              {/* FULL NAME */}
              <div className="form-group">

                <label>Full Name</label>

                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <UserRound
                    size={17}
                    color="#64748b"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                    }}
                  />

                  <input
                    type="text"
                    name="full_name"
                    className="form-control"
                    placeholder="e.g. Rahul Sharma"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    style={{
                      paddingLeft: '39px',
                    }}
                  />
                </div>

              </div>

              {/* GENDER + AGE */}
              <div className="form-row">

                <div className="form-group">

                  <label>Gender</label>

                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <UserRound
                      size={17}
                      color="#64748b"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />

                    <select
                      name="gender"
                      className="form-control"
                      value={form.gender}
                      onChange={handleChange}
                      required
                      style={{
                        paddingLeft: '39px',
                      }}
                    >
                      <option value="">
                        Select Gender
                      </option>

                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>

                  </div>

                </div>

                <div className="form-group">

                  <label>Age</label>

                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <CalendarDays
                      size={17}
                      color="#64748b"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />

                    <input
                      type="number"
                      name="age"
                      className="form-control"
                      placeholder="Age"
                      min="1"
                      max="120"
                      value={form.age}
                      onChange={handleChange}
                      required
                      style={{
                        paddingLeft: '39px',
                      }}
                    />

                  </div>

                </div>

              </div>

              {/* DATE OF BIRTH */}
              <div className="form-group">

                <label>Date of Birth</label>

                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <CalendarDays
                    size={17}
                    color="#64748b"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                    }}
                  />

                  <input
                    type="date"
                    name="dob"
                    className="form-control"
                    value={form.dob}
                    onChange={handleChange}
                    required
                    style={{
                      paddingLeft: '39px',
                    }}
                  />

                </div>

              </div>

              {/* DOCTOR SPECIALIZATION */}
              {type === 'doctor' && (

                <div className="form-group">

                  <label>Specialization</label>

                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <Stethoscope
                      size={17}
                      color="#64748b"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />

                    <input
                      type="text"
                      name="specialization"
                      className="form-control"
                      placeholder="e.g. Cardiologist, Orthopedic"
                      value={form.specialization}
                      onChange={handleChange}
                      required
                      style={{
                        paddingLeft: '39px',
                      }}
                    />

                  </div>

                </div>

              )}

              {/* PATIENT BLOOD GROUP */}
              {type === 'patient' && (

                <div className="form-group">

                  <label>Blood Group</label>

                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <Droplets
                      size={17}
                      color="#64748b"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />

                    <select
                      name="blood_group"
                      className="form-control"
                      value={form.blood_group}
                      onChange={handleChange}
                      required
                      style={{
                        paddingLeft: '39px',
                      }}
                    >
                      <option value="">
                        Select Blood Group
                      </option>

                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}

                    </select>

                  </div>

                </div>

              )}

              {/* CONTACT INFORMATION */}
              <div
                className="section-label"
                style={{
                  color: '#0f2a4a',
                }}
              >
                <Phone
                  size={16}
                  style={{
                    marginRight: '7px',
                    verticalAlign: 'middle',
                  }}
                />
                Contact Information
              </div>

              {/* MOBILE + EMAIL */}
              <div className="form-row">

                <div className="form-group">

                  <label>Mobile Number</label>

                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <Phone
                      size={17}
                      color="#64748b"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />

                    <input
                      type="text"
                      name="mobile"
                      className="form-control"
                      placeholder="10-digit mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      required
                      style={{
                        paddingLeft: '39px',
                      }}
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label>Email Address</label>

                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <Mail
                      size={17}
                      color="#64748b"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />

                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      style={{
                        paddingLeft: '39px',
                      }}
                    />

                  </div>

                </div>

              </div>

              {/* ADDRESS */}
              <div className="form-group">

                <label>Address</label>

                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <MapPin
                    size={17}
                    color="#64748b"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '13px',
                      pointerEvents: 'none',
                    }}
                  />

                  <textarea
                    name="address"
                    className="form-control"
                    placeholder="Enter your full address"
                    value={form.address}
                    onChange={handleChange}
                    style={{
                      paddingLeft: '39px',
                    }}
                  />

                </div>

              </div>

              {/* SECURITY */}
              <div
                className="section-label"
                style={{
                  color: '#0f2a4a',
                }}
              >
                <LockKeyhole
                  size={16}
                  style={{
                    marginRight: '7px',
                    verticalAlign: 'middle',
                  }}
                />
                Security
              </div>

              {/* PASSWORD + CONFIRM PASSWORD */}
              <div className="form-row">

                <div className="form-group">

                  <label>Password</label>

                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <LockKeyhole
                      size={17}
                      color="#64748b"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />

                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Create password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      style={{
                        paddingLeft: '39px',
                      }}
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label>Confirm Password</label>

                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <LockKeyhole
                      size={17}
                      color="#64748b"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />

                    <input
                      type="password"
                      name="confirm_password"
                      className="form-control"
                      placeholder="Re-enter password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      required
                      style={{
                        paddingLeft: '39px',
                      }}
                    />

                  </div>

                </div>

              </div>

              {/* CREATE ACCOUNT BUTTON */}
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  background: loading
                    ? '#64748b'
                    : '#0f2a4a',
                  color: '#ffffff',
                }}
              >
                {loading
                  ? 'Creating Account...'
                  : 'Create Account'}

                {!loading && (
                  <ArrowRight
                    size={17}
                    style={{
                      marginLeft: '7px',
                      verticalAlign: 'middle',
                    }}
                  />
                )}

              </button>

            </form>
          )}

          {/* ==========================================
              SIGN IN LINK
          ========================================== */}
          {!patientId && (

            <p style={{ marginTop: '18px' }}>

              Already have an account?{' '}

              <Link
                to={
                  type === 'doctor'
                    ? '/doctor-login'
                    : '/'
                }
                style={{
                  color: '#0f2a4a',
                  fontWeight: '600',
                }}
              >
                Sign In
              </Link>

            </p>

          )}

        </div>
      </div>
    </div>
  );
}