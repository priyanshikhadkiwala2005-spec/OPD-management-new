import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
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

export default function DoctorLogin() {
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
      const res = await fetch(`${API}/auth/doctor-login`, {
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
          role: 'doctor',
          ...data.data.doctor,
        });

        navigate('/doctor/dashboard');
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
      <div className="doctor-login-page">

        {/* =====================================================
            LEFT INFORMATION PANEL
        ===================================================== */}

        <div className="doctor-info-panel">

          {/* BRAND */}

          <div className="doctor-brand">

            <div className="doctor-brand-icon">

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

            <div className="doctor-brand-text">

              <h1>
                Med<span>Care</span> OPD
              </h1>

              <p>
                Outpatient Department Management System
              </p>

            </div>

          </div>


          {/* =================================================
              INFORMATION CONTENT
          ================================================= */}

          <div className="doctor-info-content">

            {/* BADGE */}

            <div className="doctor-small-badge">

              <Stethoscope
                size={16}
                strokeWidth={2.2}
              />

              Doctor Care

            </div>


            {/* MAIN HEADING */}

            <h2>
              Better Care.
              <br />
              <span>Better Health.</span>
            </h2>


            {/* DESCRIPTION */}

            <p className="doctor-info-description">
              Manage your patients, appointments, prescriptions,
              and healthcare services in one secure place.
            </p>


            {/* =================================================
                FEATURES
            ================================================= */}

            <div className="doctor-features">

              {/* FEATURE 1 */}

              <div className="doctor-feature">

                <div className="doctor-feature-icon">

                  <CalendarDays
                    size={19}
                    strokeWidth={2}
                  />

                </div>

                <div className="doctor-feature-text">

                  <strong>
                    Easy Appointment Management
                  </strong>

                  <span>
                    Manage and track your appointments easily
                  </span>

                </div>

              </div>


              {/* FEATURE 2 */}

              <div className="doctor-feature">

                <div className="doctor-feature-icon">

                  <ShieldCheck
                    size={19}
                    strokeWidth={2}
                  />

                </div>

                <div className="doctor-feature-text">

                  <strong>
                    Secure & Reliable
                  </strong>

                  <span>
                    Keep patient information safe and protected
                  </span>

                </div>

              </div>


              {/* FEATURE 3 */}

              <div className="doctor-feature">

                <div className="doctor-feature-icon">

                  <HeartPulse
                    size={19}
                    strokeWidth={2}
                  />

                </div>

                <div className="doctor-feature-text">

                  <strong>
                    Better Patient Care
                  </strong>

                  <span>
                    Stay connected with your patients
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              IMAGE OVERLAY
          ================================================= */}

          <div className="doctor-image-overlay"></div>


          {/* =================================================
              DECORATION
          ================================================= */}

          <div className="doctor-panel-decoration">

            <div className="doctor-decoration-circle doctor-circle-one"></div>

            <div className="doctor-decoration-circle doctor-circle-two"></div>

          </div>

        </div>


        {/* =====================================================
            RIGHT LOGIN PANEL
        ===================================================== */}

        <div className="doctor-login-panel">

          <div className="doctor-login-card">

            {/* =================================================
                DOCTOR PORTAL
            ================================================= */}

            <div className="doctor-portal-wrapper">

              <span className="doctor-portal-badge">

                <UserRound
                  size={16}
                  strokeWidth={2.3}
                />

                Doctor Portal

              </span>

            </div>


            {/* =================================================
                TITLE
            ================================================= */}

            <div className="doctor-login-title">

              <h2>
                Welcome Back
              </h2>

              <p>
                Sign in to your doctor account
              </p>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="doctor-error">

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

              <div className="doctor-form-group">

                <label htmlFor="email">
                  Registered Email
                </label>

                <div className="doctor-input-wrapper">

                  <Mail
                    className="doctor-input-icon"
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

              <div className="doctor-form-group">

                <label htmlFor="password">
                  Password
                </label>

                <div className="doctor-input-wrapper">

                  <LockKeyhole
                    className="doctor-input-icon"
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
                className="doctor-signin-button"
              >

                {loading
                  ? 'Signing in...'
                  : 'Sign In as Doctor'}

              </button>

            </form>


            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="doctor-divider">

              <span></span>

              <p>
                or
              </p>

              <span></span>

            </div>


            {/* =================================================
                DOCTOR REGISTER
            ================================================= */}

            <p className="doctor-bottom-link">

              New Doctor?{' '}

              <Link to="/register?type=doctor">
                Register Here
              </Link>

            </p>


            {/* =================================================
                PATIENT LOGIN
            ================================================= */}

            <p className="doctor-bottom-link doctor-switch">

              Are you a Patient?{' '}

              <Link to="/">
                Patient Login
              </Link>

            </p>

          </div>

        </div>

      </div>


      {/* =========================================================
          CSS
      ========================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }


        /* =====================================================
           MAIN PAGE
        ===================================================== */

        .doctor-login-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          background: #ffffff;
          font-family: Poppins, sans-serif;
          overflow: hidden;
        }


        /* =====================================================
           LEFT PANEL
        ===================================================== */

        .doctor-info-panel {
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

        .doctor-brand {
          display: flex;
          align-items: center;
          gap: 13px;
          position: relative;
          z-index: 10;
          flex-shrink: 0;
        }


        .doctor-brand-icon {
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
          overflow: hidden;
        }


        .doctor-brand-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          border-radius: 12px;
        }


        .doctor-brand-text {
          position: relative;
          z-index: 10;
        }


        .doctor-brand h1 {
          margin: 0;
          font-size: 24px;
          line-height: 1.1;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: #ffffff;
        }


        .doctor-brand h1 span {
          color: #3b82f6;
        }


        .doctor-brand p {
          margin: 5px 0 0;
          font-size: 11px;
          font-weight: 400;
          color: rgba(255,255,255,0.78);
          letter-spacing: 0.1px;
        }


        /* =====================================================
           INFORMATION CONTENT
        ===================================================== */

        .doctor-info-content {
          position: relative;
          z-index: 8;
          margin-top: auto;
          margin-bottom: auto;
          max-width: 500px;
        }


        /* =====================================================
           BADGE
        ===================================================== */

        .doctor-small-badge {
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


        .doctor-small-badge svg {
          color: #60a5fa;
        }


        /* =====================================================
           MAIN HEADING
        ===================================================== */

        .doctor-info-content h2 {
          margin: 0;
          font-size: clamp(34px, 3.5vw, 52px);
          line-height: 1.08;
          font-weight: 750;
          letter-spacing: -1.5px;
          color: #ffffff;
        }


        .doctor-info-content h2 span {
          color: #60a5fa;
        }


        /* =====================================================
           DESCRIPTION
        ===================================================== */

        .doctor-info-description {
          margin: 22px 0 30px;
          max-width: 440px;
          font-size: 15px;
          line-height: 1.75;
          font-weight: 400;
          color: rgba(255,255,255,0.78);
        }


        /* =====================================================
           FEATURES
        ===================================================== */

        .doctor-features {
          display: flex;
          flex-direction: column;
          gap: 19px;
        }


        .doctor-feature {
          display: flex;
          align-items: center;
          gap: 13px;
        }


        .doctor-feature-icon {
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


        .doctor-feature-icon svg {
          color: #3b82f6;
        }


        .doctor-feature-text {
          position: relative;
          z-index: 8;
        }


        /* =====================================================
           FEATURE FONT
           SAME SCALE AS PATIENT LOGIN
        ===================================================== */

        .doctor-feature strong {
          display: block;
          font-size: 13px;
          font-weight: 650;
          line-height: 1.35;
          color: #ffffff;
        }


        .doctor-feature span {
          display: block;
          margin-top: 3px;
          font-size: 11.5px;
          line-height: 1.4;
          font-weight: 400;
          color: rgba(255,255,255,0.62);
        }


        /* =====================================================
           DOCTOR IMAGE
        ===================================================== */

        .doctor-image {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 30%;
          z-index: 2;
          overflow: hidden;
          pointer-events: none;
        }


        .doctor-image img {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
          display: block;
        }


        /* =====================================================
           IMAGE OVERLAY
        ===================================================== */

        .doctor-image-overlay {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 30%;
          z-index: 3;
          pointer-events: none;

          background: linear-gradient(
            to bottom,
            rgba(15,42,74,0.05),
            rgba(15,42,74,0.42)
          );
        }


        /* =====================================================
           DECORATION
        ===================================================== */

        .doctor-panel-decoration {
          position: absolute;
          left: -100px;
          right: -100px;
          bottom: -180px;
          height: 370px;
          border-radius: 50% 50% 0 0;
          background: rgba(255,255,255,0.08);
          z-index: 1;
          pointer-events: none;
        }


        .doctor-decoration-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.08);
        }


        .doctor-circle-one {
          width: 310px;
          height: 310px;
          left: 80px;
          top: -50px;
        }


        .doctor-circle-two {
          width: 420px;
          height: 420px;
          left: 10px;
          top: -100px;
        }


        /* =====================================================
           RIGHT PANEL
        ===================================================== */

        .doctor-login-panel {
          width: 52%;
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 45px 55px;
        }


        /* =====================================================
           LOGIN CARD
        ===================================================== */

        .doctor-login-card {
          width: 100%;
          max-width: 520px;
        }


        /* =====================================================
           PORTAL
        ===================================================== */

        .doctor-portal-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 23px;
        }


        .doctor-portal-badge {
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


        .doctor-portal-badge svg {
          color: #60a5fa;
        }


        /* =====================================================
           TITLE
        ===================================================== */

        .doctor-login-title {
          text-align: center;
          margin-bottom: 38px;
        }


        .doctor-login-title h2 {
          margin: 0;
          color: #0f2a4a;
          font-size: 31px;
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -0.7px;
        }


        .doctor-login-title p {
          margin: 10px 0 0;
          color: #52627a;
          font-size: 15px;
          font-weight: 400;
        }


        /* =====================================================
           ERROR
        ===================================================== */

        .doctor-error {
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
           FORM GROUP
        ===================================================== */

        .doctor-form-group {
          margin-bottom: 22px;
        }


        .doctor-form-group label {
          display: block;
          margin-bottom: 9px;
          color: #0f2a4a;
          font-size: 13.5px;
          font-weight: 700;
        }


        /* =====================================================
           INPUT
        ===================================================== */

        .doctor-input-wrapper {
          position: relative;
          width: 100%;
        }


        .doctor-input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #2563eb;
          pointer-events: none;
          z-index: 2;
        }


        .doctor-input-wrapper input {
          width: 100%;
          height: 56px;
          box-sizing: border-box;
          border: 1px solid #d5deeb;
          border-radius: 9px;
          background: #f8fbff;
          color: #0f2a4a;
          font-family: Poppins, sans-serif;
          font-size: 15px;
          font-weight: 400;
          outline: none;
          padding: 0 15px 0 48px;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }


        .doctor-input-wrapper input::placeholder {
          color: #91a0b5;
          font-weight: 400;
        }


        .doctor-input-wrapper input:focus {
          border-color: #2563eb;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
        }


        /* =====================================================
           SIGN IN BUTTON
        ===================================================== */

        .doctor-signin-button {
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


        .doctor-signin-button:hover:not(:disabled) {
          background: #0b2039;
        }


        .doctor-signin-button:active:not(:disabled) {
          transform: translateY(1px);
        }


        .doctor-signin-button:disabled {
          background: #64748b;
          cursor: not-allowed;
        }


        /* =====================================================
           DIVIDER
        ===================================================== */

        .doctor-divider {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 30px 0 27px;
        }


        .doctor-divider span {
          flex: 1;
          height: 1px;
          background: #dce3ec;
        }


        .doctor-divider p {
          margin: 0;
          color: #0f2a4a;
          font-size: 13px;
          font-weight: 400;
        }


        /* =====================================================
           BOTTOM LINKS
        ===================================================== */

        .doctor-bottom-link {
          margin: 0;
          color: #263b56;
          font-size: 15px;
          line-height: 1.9;
          font-weight: 400;
        }


        .doctor-bottom-link a {
          color: #0f2a4a;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.2s ease;
        }


        .doctor-bottom-link a:hover {
          color: #2563eb;
        }


        .doctor-switch {
          margin-top: 2px;
        }


        /* =====================================================
           LARGE TABLET
        ===================================================== */

        @media (max-width: 1100px) {

          .doctor-info-panel {
            width: 46%;
            padding: 40px 40px;
          }


          .doctor-login-panel {
            width: 54%;
            padding: 40px 40px;
          }


          .doctor-info-content {
            margin-top: auto;
            margin-bottom: auto;
          }


          .doctor-info-content h2 {
            font-size: 40px;
          }


          .doctor-info-description {
            font-size: 14px;
          }


          .doctor-feature strong {
            font-size: 13px;
          }


          .doctor-feature span {
            font-size: 11px;
          }

        }


        /* =====================================================
           SMALL TABLET
        ===================================================== */

        @media (max-width: 900px) {

          .doctor-info-panel {
            width: 42%;
            padding: 35px 30px;
          }


          .doctor-login-panel {
            width: 58%;
            padding: 35px;
          }


          .doctor-brand h1 {
            font-size: 20px;
          }


          .doctor-brand p {
            font-size: 9px;
          }


          .doctor-info-content {
            margin-top: auto;
            margin-bottom: auto;
          }


          .doctor-small-badge {
            font-size: 12px;
          }


          .doctor-info-content h2 {
            font-size: 36px;
          }


          .doctor-info-description {
            font-size: 13px;
            line-height: 1.65;
            margin-top: 16px;
            margin-bottom: 24px;
          }


          .doctor-features {
            gap: 13px;
          }


          .doctor-feature {
            gap: 10px;
          }


          .doctor-feature-icon {
            width: 35px;
            height: 35px;
            min-width: 35px;
          }


          .doctor-feature strong {
            font-size: 12px;
          }


          .doctor-feature span {
            font-size: 10.5px;
          }


          .doctor-login-title h2 {
            font-size: 30px;
          }


          .doctor-bottom-link {
            font-size: 14px;
          }

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          .doctor-login-page {
            display: block;
            overflow: visible;
          }


          .doctor-info-panel {
            width: 100%;
            min-height: auto;
            height: 560px;
            padding: 28px 25px 35px;
          }


          .doctor-brand h1 {
            font-size: 22px;
          }


          .doctor-brand p {
            font-size: 10px;
          }


          .doctor-info-content {
            margin-top: 42px;
            margin-bottom: 0;
            max-width: 500px;
          }


          .doctor-small-badge {
            margin-bottom: 14px;
          }


          .doctor-info-content h2 {
            font-size: 35px;
          }


          .doctor-info-description {
            margin-top: 14px;
            margin-bottom: 20px;
            font-size: 12px;
            line-height: 1.6;
          }


          .doctor-features {
            gap: 10px;
          }


          .doctor-feature-icon {
            width: 34px;
            height: 34px;
            min-width: 34px;
          }


          .doctor-feature strong {
            font-size: 11px;
          }


          .doctor-feature span {
            display: none;
          }


          .doctor-image {
            height: 31%;
          }


          .doctor-image-overlay {
            height: 31%;
          }


          .doctor-login-panel {
            width: 100%;
            min-height: auto;
            padding: 45px 25px;
          }


          .doctor-login-title {
            margin-bottom: 30px;
          }


          .doctor-login-title h2 {
            font-size: 28px;
          }

        }


        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 420px) {

          .doctor-info-panel {
            height: 520px;
            padding: 25px 20px 30px;
          }


          .doctor-brand h1 {
            font-size: 19px;
          }


          .doctor-brand p {
            font-size: 9px;
          }


          .doctor-info-content {
            margin-top: 35px;
          }


          .doctor-info-content h2 {
            font-size: 31px;
          }


          .doctor-info-description {
            font-size: 11px;
            margin-top: 13px;
            margin-bottom: 17px;
          }


          .doctor-feature strong {
            font-size: 10px;
          }


          .doctor-image {
            height: 30%;
          }


          .doctor-image-overlay {
            height: 30%;
          }


          .doctor-login-panel {
            padding: 35px 20px;
          }


          .doctor-login-title h2 {
            font-size: 26px;
          }

        }

      `}</style>
    </>
  );
}