import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  LockKeyhole,
  AlertCircle,
  CalendarDays,
  ShieldCheck,
  HeartPulse,
  UserRound,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { API, saveToken } from '../api';

export default function PatientLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/patient-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        saveToken(data.token);

        login({
          role: 'patient',
          ...data.data.patient,
        });

        navigate('/patient/dashboard');
      } else {
        setError(
          data.message || 'Invalid email or password.'
        );
      }
    } catch {
      setError(
        'Cannot connect to server. Make sure Node.js backend is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* =========================================================
          PATIENT LOGIN PAGE
      ========================================================= */}

      <div className="patient-login-page">

        {/* =====================================================
            LEFT INFORMATION PANEL
        ===================================================== */}

        <div className="patient-info-panel">

          {/* BRAND */}

          <div className="patient-brand">

            <div className="patient-brand-icon">

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

            <div>

              <h1>
                Med<span>Care</span> OPD
              </h1>

              <p>
                Outpatient Department Management System
              </p>

            </div>

          </div>


          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="patient-info-content">

            <div className="patient-small-badge">

              <HeartPulse
                size={16}
                strokeWidth={2.2}
              />

              Patient Care

            </div>


            <h2>
              Your Health.
              <br />
              <span>Our Priority.</span>
            </h2>


            <p className="patient-info-description">
              Manage your appointments, connect with doctors,
              and keep your healthcare journey organized in
              one secure place.
            </p>


            {/* =================================================
                FEATURES
            ================================================= */}

            <div className="patient-features">

              {/* FEATURE 1 */}

              <div className="patient-feature">

                <div className="patient-feature-icon">

                  <CalendarDays
                    size={19}
                    strokeWidth={2}
                  />

                </div>

                <div>

                  <strong>
                    Easy Appointment Booking
                  </strong>

                  <span>
                    Book and manage your appointments easily
                  </span>

                </div>

              </div>


              {/* FEATURE 2 */}

              <div className="patient-feature">

                <div className="patient-feature-icon">

                  <ShieldCheck
                    size={19}
                    strokeWidth={2}
                  />

                </div>

                <div>

                  <strong>
                    Secure & Reliable
                  </strong>

                  <span>
                    Your healthcare information stays protected
                  </span>

                </div>

              </div>


              {/* FEATURE 3 */}

              <div className="patient-feature">

                <div className="patient-feature-icon">

                  <HeartPulse
                    size={19}
                    strokeWidth={2}
                  />

                </div>

                <div>

                  <strong>
                    Better Health Care
                  </strong>

                  <span>
                    Stay connected with your doctor
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              BOTTOM DECORATION
          ================================================= */}

          <div className="patient-panel-decoration">

            <div className="decoration-circle circle-one"></div>

            <div className="decoration-circle circle-two"></div>

          </div>

        </div>


        {/* =====================================================
            RIGHT LOGIN PANEL
        ===================================================== */}

        <div className="patient-login-panel">

          <div className="patient-login-card">

            {/* =================================================
                PATIENT PORTAL
            ================================================= */}

            <div className="patient-portal-wrapper">

              <span className="patient-portal-badge">

                <UserRound
                  size={16}
                  strokeWidth={2.3}
                />

                Patient Portal

              </span>

            </div>


            {/* =================================================
                TITLE
            ================================================= */}

            <div className="patient-login-title">

              <h2>
                Welcome Back
              </h2>

              <p>
                Sign in to your patient account
              </p>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="patient-error">

                <AlertCircle
                  size={18}
                  strokeWidth={2.2}
                />

                <span>
                  {error}
                </span>

              </div>

            )}


            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              autoComplete="off"
            >

              {/* EMAIL */}

              <div className="patient-form-group">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="patient-input-wrapper">

                  <Mail
                    className="patient-input-icon"
                    size={20}
                    strokeWidth={2}
                  />

                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="patient-form-group">

                <label htmlFor="password">
                  Password
                </label>

                <div className="patient-input-wrapper">

                  <LockKeyhole
                    className="patient-input-icon"
                    size={20}
                    strokeWidth={2}
                  />

                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* SIGN IN */}

              <button
                type="submit"
                disabled={loading}
                className="patient-signin-button"
              >

                {loading
                  ? 'Signing in...'
                  : 'Sign In'}

              </button>

            </form>


            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="patient-divider">

              <span></span>

              <p>
                or
              </p>

              <span></span>

            </div>


            {/* =================================================
                REGISTER
            ================================================= */}

            <p className="patient-bottom-link">

              New Patient?{' '}

              <Link to="/register?type=patient">
                Create Account
              </Link>

            </p>


            {/* =================================================
                DOCTOR LOGIN
            ================================================= */}

            <p className="patient-bottom-link doctor-switch">

              Are you a Doctor?{' '}

              <Link to="/doctor-login">
                Doctor Login
              </Link>

            </p>

          </div>

        </div>

      </div>


      {/* =========================================================
          PAGE CSS
      ========================================================= */}

      <style>{`

        /* =====================================================
           MAIN PAGE
        ===================================================== */

        .patient-login-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          background: #ffffff;
          font-family: Poppins, sans-serif;
          overflow: hidden;
        }


        /* =====================================================
           LEFT NAVY PANEL
        ===================================================== */

        .patient-info-panel {
          width: 48%;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: #0f2a4a;
          color: #ffffff;
          padding: 48px 55px;
          display: flex;
          flex-direction: column;
        }


        /* =====================================================
           BRAND
        ===================================================== */

        .patient-brand {
          display: flex;
          align-items: center;
          gap: 13px;
          position: relative;
          z-index: 10;
          flex-shrink: 0;
        }


        /* =====================================================
           LOGO
           EXACT SAME AS DOCTOR LOGIN
        ===================================================== */

        .patient-brand-icon {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 12px;
          background: #ffffff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.35);
          box-sizing: border-box;
          overflow: hidden;
        }


        .patient-brand-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          border-radius: 12px;
        }


        .patient-brand h1 {
          margin: 0;
          font-size: 24px;
          line-height: 1.1;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: #ffffff;
        }


        .patient-brand h1 span {
          color: #3b82f6;
        }


        .patient-brand p {
          margin: 5px 0 0;
          font-size: 11px;
          font-weight: 400;
          color: rgba(255,255,255,0.78);
          letter-spacing: 0.1px;
        }


        /* =====================================================
           LEFT CONTENT
        ===================================================== */

        .patient-info-content {
          position: relative;
          z-index: 5;
          margin-top: auto;
          margin-bottom: auto;
          max-width: 500px;
        }


        /* =====================================================
           BADGE
        ===================================================== */

        .patient-small-badge {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 13px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.10);
          color: #ffffff;
          font-size: 12px;
          font-weight: 650;
          margin-bottom: 20px;
        }


        /* =====================================================
           MAIN HEADING
        ===================================================== */

        .patient-info-content h2 {
          margin: 0;
          font-size: clamp(34px, 3.5vw, 52px);
          line-height: 1.08;
          font-weight: 750;
          letter-spacing: -1.5px;
          color: #ffffff;
        }


        .patient-info-content h2 span {
          color: #60a5fa;
        }


        /* =====================================================
           DESCRIPTION
        ===================================================== */

        .patient-info-description {
          margin: 22px 0 30px;
          max-width: 440px;
          font-size: 15px;
          line-height: 1.75;
          color: rgba(255,255,255,0.78);
        }


        /* =====================================================
           FEATURES
        ===================================================== */

        .patient-features {
          display: flex;
          flex-direction: column;
          gap: 19px;
        }


        .patient-feature {
          display: flex;
          align-items: center;
          gap: 13px;
        }


        .patient-feature-icon {
          width: 38px;
          height: 38px;
          min-width: 38px;
          border-radius: 10px;
          background: rgba(255,255,255,0.11);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.12);
        }


        .patient-feature strong {
          display: block;
          font-size: 13px;
          font-weight: 650;
          color: #ffffff;
        }


        .patient-feature span {
          display: block;
          margin-top: 3px;
          font-size: 11.5px;
          color: rgba(255,255,255,0.62);
        }


        /* =====================================================
           LEFT DECORATION
        ===================================================== */

        .patient-panel-decoration {
          position: absolute;
          left: -100px;
          right: -100px;
          bottom: -180px;
          height: 370px;
          border-radius: 50% 50% 0 0;
          background: rgba(255,255,255,0.08);
          z-index: 1;
        }


        .decoration-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.08);
        }


        .circle-one {
          width: 310px;
          height: 310px;
          left: 80px;
          top: -50px;
        }


        .circle-two {
          width: 420px;
          height: 420px;
          left: 10px;
          top: -100px;
        }


        /* =====================================================
           RIGHT PANEL
        ===================================================== */

        .patient-login-panel {
          width: 52%;
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 45px 55px;
          box-sizing: border-box;
        }


        /* =====================================================
           LOGIN CARD
        ===================================================== */

        .patient-login-card {
          width: 100%;
          max-width: 520px;
          box-sizing: border-box;
        }


        /* =====================================================
           PORTAL
        ===================================================== */

        .patient-portal-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 23px;
        }


        .patient-portal-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #0f2a4a;
          color: #ffffff;
          border: 1px solid #0f2a4a;
          border-radius: 24px;
          padding: 8px 17px;
          font-size: 12.5px;
          font-weight: 700;
        }


        /* =====================================================
           TITLE
        ===================================================== */

        .patient-login-title {
          text-align: center;
          margin-bottom: 38px;
        }


        .patient-login-title h2 {
          margin: 0;
          color: #0f2a4a;
          font-size: 31px;
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -0.7px;
        }


        .patient-login-title p {
          margin: 10px 0 0;
          color: #52627a;
          font-size: 15px;
        }


        /* =====================================================
           ERROR
        ===================================================== */

        .patient-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 13px;
          margin-bottom: 20px;
          border-radius: 9px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          font-size: 13px;
        }


        /* =====================================================
           FORM
        ===================================================== */

        .patient-form-group {
          margin-bottom: 22px;
        }


        .patient-form-group label {
          display: block;
          margin-bottom: 9px;
          color: #0f2a4a;
          font-size: 13.5px;
          font-weight: 700;
        }


        /* =====================================================
           INPUT
        ===================================================== */

        .patient-input-wrapper {
          position: relative;
          width: 100%;
        }


        .patient-input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #2563eb;
          pointer-events: none;
        }


        .patient-input-wrapper input {
          width: 100%;
          height: 56px;
          box-sizing: border-box;
          border: 1px solid #d5deeb;
          border-radius: 9px;
          background: #f8fbff;
          color: #0f2a4a;
          font-family: Poppins, sans-serif;
          font-size: 15px;
          outline: none;
          padding: 0 15px 0 48px;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }


        .patient-input-wrapper input::placeholder {
          color: #91a0b5;
        }


        .patient-input-wrapper input:focus {
          border-color: #2563eb;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
        }


        /* =====================================================
           SIGN IN BUTTON
        ===================================================== */

        .patient-signin-button {
          width: 100%;
          height: 56px;
          border: none;
          border-radius: 9px;
          background: #0f2a4a;
          color: #ffffff;
          font-family: Poppins, sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;

          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }


        .patient-signin-button:hover:not(:disabled) {
          background: #0b2039;
        }


        .patient-signin-button:active:not(:disabled) {
          transform: translateY(1px);
        }


        .patient-signin-button:disabled {
          background: #64748b;
          cursor: not-allowed;
        }


        /* =====================================================
           DIVIDER
        ===================================================== */

        .patient-divider {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 30px 0 27px;
        }


        .patient-divider span {
          flex: 1;
          height: 1px;
          background: #dce3ec;
        }


        .patient-divider p {
          margin: 0;
          color: #0f2a4a;
          font-size: 13px;
        }


        /* =====================================================
           BOTTOM LINKS
        ===================================================== */

        .patient-bottom-link {
          margin: 0;
          color: #263b56;
          font-size: 15px;
          line-height: 1.9;
        }


        .patient-bottom-link a {
          color: #0f2a4a;
          font-weight: 700;
          text-decoration: none;
        }


        .patient-bottom-link a:hover {
          color: #2563eb;
        }


        .doctor-switch {
          margin-top: 2px;
        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 900px) {

          .patient-info-panel {
            width: 42%;
            padding: 35px 30px;
          }


          .patient-login-panel {
            width: 58%;
            padding: 35px 35px;
          }


          .patient-brand h1 {
            font-size: 20px;
          }


          .patient-info-content h2 {
            font-size: 36px;
          }


          .patient-info-description {
            font-size: 13px;
          }

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          .patient-login-page {
            display: block;
            overflow: visible;
          }


          .patient-info-panel {
            width: 100%;
            min-height: auto;
            padding: 28px 25px 35px;
          }


          .patient-info-content {
            margin-top: 45px;
            margin-bottom: 10px;
          }


          .patient-info-content h2 {
            font-size: 35px;
          }


          .patient-info-description {
            margin-top: 16px;
            margin-bottom: 24px;
          }


          .patient-features {
            gap: 13px;
          }


          .patient-feature span {
            display: none;
          }


          .patient-login-panel {
            width: 100%;
            min-height: auto;
            padding: 45px 25px;
          }


          .patient-login-title {
            margin-bottom: 30px;
          }


          .patient-login-title h2 {
            font-size: 28px;
          }

        }


        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 420px) {

          .patient-info-panel {
            padding: 25px 20px 30px;
          }


          .patient-brand h1 {
            font-size: 19px;
          }


          .patient-brand p {
            font-size: 9px;
          }


          .patient-info-content h2 {
            font-size: 31px;
          }


          .patient-login-panel {
            padding: 35px 20px;
          }


          .patient-login-title h2 {
            font-size: 26px;
          }

        }

      `}</style>
    </>
  );
}