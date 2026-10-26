import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime } from '../data/mockData';

import { API, getToken } from '../api';

import {
  CalendarDays,
  Bell,
  Stethoscope,
  Phone,
  Clock3,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  UserRound,
  ClipboardList,
  Video,
} from 'lucide-react';

export default function PatientAppointments() {
  const { user } = useAuth();

  const patientName = user?.full_name || 'Patient';

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [upcomingReminder, setUpcomingReminder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    type: 'General',
    consultation_type: 'In-person',
  });

  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // ============================================================
  // FLASH MESSAGE
  // ============================================================

  function flash(msg, isError = false) {
    if (isError) {
      setError(msg);

      setTimeout(() => {
        setError('');
      }, 3000);
    } else {
      setSuccess(msg);

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    }
  }

  // ============================================================
  // LOAD PATIENT APPOINTMENTS
  // ============================================================

  async function loadAppointments(showLoader = true) {
    try {
      if (showLoader) {
        setLoading(true);
        setError('');
      }

      const token = getToken();

      if (!token) {
        if (showLoader) {
          setError(
            'Patient login token not found. Please login again.'
          );
          setLoading(false);
        }

        return;
      }

      const res = await fetch(`${API}/appointments/my`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || 'Failed to load appointments.'
        );
      }

      if (data.success) {
        const appointmentList =
          data.data?.appointments || [];

        setAppointments(appointmentList);

        checkAppointmentReminder(appointmentList);
      } else {
        if (showLoader) {
          setError(
            data.message || 'Unable to load appointments.'
          );
        }
      }
    } catch (err) {
      console.error('Patient appointments error:', err);

      if (showLoader) {
        setError(
          err.message || 'Unable to connect to server.'
        );
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }

  // ============================================================
  // CHECK APPOINTMENT REMINDER
  // ============================================================

  function checkAppointmentReminder(list) {
    const savedNotifications = localStorage.getItem(
      'patientNotificationSettings'
    );

    let settings = {
      appointment_reminders: true,
    };

    if (savedNotifications) {
      try {
        settings = JSON.parse(savedNotifications);
      } catch (error) {
        console.error(
          'Failed to read notification settings:',
          error
        );
      }
    }

    if (!settings.appointment_reminders) {
      setUpcomingReminder(null);
      return;
    }

    const now = new Date();

    const upcoming = list
      .filter(appointment => {
        if (
          !appointment.appointment_date ||
          !appointment.appointment_time
        ) {
          return false;
        }

        if (
          appointment.status === 'Cancelled' ||
          appointment.status === 'Completed'
        ) {
          return false;
        }

        const appointmentDateTime = new Date(
          `${appointment.appointment_date}T${appointment.appointment_time}`
        );

        return appointmentDateTime > now;
      })
      .sort((a, b) => {
        const dateA = new Date(
          `${a.appointment_date}T${a.appointment_time}`
        );

        const dateB = new Date(
          `${b.appointment_date}T${b.appointment_time}`
        );

        return dateA - dateB;
      });

    if (upcoming.length > 0) {
      setUpcomingReminder(upcoming[0]);
    } else {
      setUpcomingReminder(null);
    }
  }

  // ============================================================
  // LOAD DOCTORS
  // ============================================================

  async function loadDoctors() {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const res = await fetch(
        `${API}/patients/doctors-list`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || 'Failed to load doctors.'
        );
      }

      if (data.success) {
        setDoctors(
          data.data?.doctors || []
        );
      } else {
        setError(
          data.message || 'Unable to load doctors.'
        );
      }
    } catch (err) {
      console.error('Doctors loading error:', err);

      setError(
        err.message || 'Unable to load doctors.'
      );
    }
  }

  // ============================================================
  // LOAD DATA WHEN PAGE OPENS
  // ============================================================

  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, []);

  // ============================================================
  // ONLINE CONSULTATION STATUS POLLING
  // ============================================================
  //
  // Waiting  -> Doctor has not started / Meet not ready
  // Started  -> Real Google Meet link available
  // Ended    -> Consultation ended
  //
  // ============================================================

  useEffect(() => {
    const interval = setInterval(() => {
      loadAppointments(false);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ============================================================
  // SELECT DOCTOR
  // ============================================================

  function selectDoctor(doc) {
    setSelectedDoctor(doc);

    setForm(prev => ({
      ...prev,
      doctor_id: doc.id,
    }));

    setStep(2);
  }

  // ============================================================
  // BOOK APPOINTMENT
  // ============================================================

  async function handleBook(e) {
    e.preventDefault();

    if (
      !form.doctor_id ||
      !form.appointment_date ||
      !form.appointment_time
    ) {
      flash(
        'Please fill all required fields.',
        true
      );
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        flash(
          'Your login session has expired. Please login again.',
          true
        );
        return;
      }

      const res = await fetch(
        `${API}/appointments/book`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            doctor_id: form.doctor_id,
            appointment_date:
              form.appointment_date,
            appointment_time:
              form.appointment_time,
            type: form.type,

            consultation_type:
              form.consultation_type,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || 'Failed to book appointment.'
        );
      }

      if (data.success) {
        flash(
          'Appointment booked successfully!'
        );

        setForm({
          doctor_id: '',
          appointment_date: '',
          appointment_time: '',
          type: 'General',
          consultation_type: 'In-person',
        });

        setSelectedDoctor(null);
        setStep(1);

        await loadAppointments();
      } else {
        flash(
          data.message ||
            'Failed to book appointment.',
          true
        );
      }
    } catch (err) {
      flash(
        err.message ||
          'Server error. Please try again.',
        true
      );
    }
  }

  // ============================================================
  // OPEN REAL GOOGLE MEET CONSULTATION
  // ============================================================

  function openConsultation(appointment) {
    const consultationStatus =
      appointment?.consultation_status || 'Waiting';

    const meetingUrl =
      appointment?.meeting_url || null;

    // ----------------------------------------------------------
    // CONSULTATION ENDED
    // ----------------------------------------------------------

    if (consultationStatus === 'Ended') {
      flash(
        'This consultation has already ended.',
        true
      );
      return;
    }

    // ----------------------------------------------------------
    // DOCTOR HAS NOT STARTED
    // ----------------------------------------------------------

    if (consultationStatus === 'Waiting') {
      flash(
        'Please wait. The doctor has not started the consultation yet.',
        true
      );
      return;
    }

    // ----------------------------------------------------------
    // GOOGLE MEET LINK NOT READY
    // ----------------------------------------------------------

    if (
      consultationStatus === 'Started' &&
      !meetingUrl
    ) {
      flash(
        'Google Meet link is not available yet. Please wait a moment.',
        true
      );
      return;
    }

    // ----------------------------------------------------------
    // OPEN REAL GOOGLE MEET
    // ----------------------------------------------------------

    if (
      consultationStatus === 'Started' &&
      meetingUrl
    ) {
      window.open(
        meetingUrl,
        '_blank',
        'noopener,noreferrer'
      );
    }
  }

  // ============================================================
  // CONSULTATION UI
  // ============================================================

  function consultationContent(appointment) {
    const consultationStatus =
      appointment?.consultation_status ||
      'Waiting';

    const meetingUrl =
      appointment?.meeting_url || null;

    // ----------------------------------------------------------
    // CONSULTATION ENDED
    // ----------------------------------------------------------

    if (consultationStatus === 'Ended') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 10px',
            borderRadius: 7,
            background: '#f1f5f9',
            color: '#64748b',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <Check size={14} />
          Consultation Ended
        </span>
      );
    }

    // ----------------------------------------------------------
    // REAL GOOGLE MEET LINK AVAILABLE
    // ----------------------------------------------------------
    // IMPORTANT:
    // Join Consultation will ONLY appear when
    // meeting_url actually exists.
    // ----------------------------------------------------------

    if (meetingUrl) {
      return (
        <button
          type="button"
          onClick={() =>
            openConsultation(appointment)
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #2563eb',
            background: '#2563eb',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Video size={15} />
          Join Consultation
        </button>
      );
    }

    // ----------------------------------------------------------
    // NO GOOGLE MEET LINK YET
    // ----------------------------------------------------------
    // Whether backend status is Waiting or Started,
    // if meeting_url is missing, patient stays in
    // Waiting for Doctor state.
    // ----------------------------------------------------------

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 10px',
          borderRadius: 7,
          background: '#eff6ff',
          color: '#2563eb',
          border: '1px solid #bfdbfe',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <Clock3 size={14} />
        Waiting for Doctor
      </span>
    );
  }

  // ============================================================
  // STATUS BADGE
  // ============================================================

  function statusBadge(status) {
    const map = {
      Pending: 'badge-pending',
      Completed: 'badge-completed',
      Cancelled: 'badge-cancelled',
      'In Progress': 'badge-inprogress',
    };

    return (
      <span
        className={`badge ${
          map[status] || 'badge-pending'
        }`}
      >
        {status}
      </span>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Layout
      role="patient"
      name={patientName}
      title="My Appointments"
      subtitle="Book and track your appointments"
    >

      {/* ======================================================
          ALERTS
      ====================================================== */}

      {success && (
        <div
          className="alert alert-success"
          style={{
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          <Check size={17} />
          {success}
        </div>
      )}

      {error && (
        <div
          className="alert alert-error"
          style={{
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          <X size={17} />
          {error}
        </div>
      )}

      {/* ======================================================
          UPCOMING REMINDER
      ====================================================== */}

      {upcomingReminder && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dbe4ee',
            borderLeft: '4px solid #0f2a4a',
            borderRadius: 14,
            padding: '17px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow:
              '0 2px 8px rgba(15,42,74,0.05)',
          }}
        >

          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: '#0f2a4a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Bell
              size={22}
              strokeWidth={1.8}
            />
          </div>

          <div style={{ flex: 1 }}>

            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#0f2a4a',
                marginBottom: 5,
              }}
            >
              Upcoming Appointment
            </div>

            <div
              style={{
                fontSize: 13,
                color: '#64748b',
              }}
            >
              Your appointment with{' '}
              <strong
                style={{
                  color: '#334155',
                }}
              >
                Dr.{' '}
                {upcomingReminder.doctor_name ||
                  'Doctor'}
              </strong>{' '}
              is scheduled for{' '}
              <strong
                style={{
                  color: '#334155',
                }}
              >
                {formatDate(
                  upcomingReminder.appointment_date
                )}
              </strong>{' '}
              at{' '}
              <strong
                style={{
                  color: '#334155',
                }}
              >
                {formatTime(
                  upcomingReminder.appointment_time
                )}
              </strong>.
            </div>

          </div>

          <Clock3
            size={22}
            color="#0f2a4a"
            strokeWidth={1.7}
          />

        </div>
      )}

      {/* ======================================================
          BOOK NEW APPOINTMENT
      ====================================================== */}

      <div
        className="form-card"
        style={{
          marginBottom: 24,
          background: '#ffffff',
          border: '1px solid #dbe4ee',
          borderRadius: 14,
          boxShadow:
            '0 2px 8px rgba(15,42,74,0.04)',
        }}
      >

        {/* Header */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom:
              '1px solid #e5eaf0',
          }}
        >

          <h3
            style={{
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              fontSize: 17,
              fontWeight: 700,
              color: '#0f2a4a',
            }}
          >
            <CalendarDays
              size={20}
              color="#0f2a4a"
              strokeWidth={1.8}
            />

            Book New Appointment
          </h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
            }}
          >

            {[
              {
                n: 1,
                label: 'Select Doctor',
              },
              {
                n: 2,
                label: 'Choose Date & Time',
              },
            ].map((s, i) => (

              <div
                key={s.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >

                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      step >= s.n
                        ? '#0f2a4a'
                        : '#e8edf3',
                    color:
                      step >= s.n
                        ? '#ffffff'
                        : '#94a3b8',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {s.n}
                </div>

                <span
                  style={{
                    fontSize: 12,
                    color:
                      step >= s.n
                        ? '#0f2a4a'
                        : '#94a3b8',
                    fontWeight: 600,
                  }}
                >
                  {s.label}
                </span>

                {i < 1 && (
                  <ArrowRight
                    size={16}
                    color="#cbd5e1"
                  />
                )}

              </div>

            ))}

          </div>

        </div>

        {/* ====================================================
            STEP 1 — SELECT DOCTOR
        ==================================================== */}

        {step === 1 && (
          <>

            <p
              style={{
                fontSize: 13,
                color: '#64748b',
                margin: '0 0 17px',
              }}
            >
              Select a doctor to book your appointment:
            </p>

            {doctors.length === 0 ? (

              <div
                style={{
                  textAlign: 'center',
                  padding: 35,
                  color: '#94a3b8',
                }}
              >
                Loading doctors...
              </div>

            ) : (

              <div className="doctor-cards-grid">

                {doctors.map((doc) => (

                  <div
                    key={doc.id}
                    className="doctor-card"
                    style={{
                      position: 'relative',
                      cursor: 'pointer',
                      background: '#ffffff',
                      border:
                        '1px solid #dbe4ee',
                      borderRadius: 13,
                      boxShadow:
                        '0 2px 7px rgba(15,42,74,0.04)',
                    }}
                    onClick={() =>
                      selectDoctor(doc)
                    }
                  >

                    <div
                      className="doctor-avatar"
                      style={{
                        background: '#0f2a4a',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {doc.full_name?.charAt(0)}
                    </div>

                    <h4
                      style={{
                        color: '#0f2a4a',
                      }}
                    >
                      Dr. {doc.full_name}
                    </h4>

                    <div
                      className="spec"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#64748b',
                      }}
                    >
                      <Stethoscope
                        size={15}
                        color="#0f2a4a"
                      />

                      {doc.specialization ||
                        'General Physician'}
                    </div>

                    {doc.mobile && (
                      <div
                        className="mobile"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#64748b',
                        }}
                      >
                        <Phone
                          size={14}
                          color="#0f2a4a"
                        />

                        {doc.mobile}
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: 12,
                        padding: '8px 0 0',
                        borderTop:
                          '1px solid #e8edf3',
                        fontSize: 12,
                        color: '#0f2a4a',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          'space-between',
                      }}
                    >
                      <span>
                        Book Appointment
                      </span>

                      <ArrowRight
                        size={15}
                        color="#0f2a4a"
                      />
                    </div>

                  </div>

                ))}

              </div>

            )}

          </>
        )}

        {/* ====================================================
            STEP 2 — DATE & TIME
        ==================================================== */}

        {step === 2 && selectedDoctor && (
          <>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: '#f8fafc',
                border:
                  '1px solid #dbe4ee',
                borderRadius: 11,
                padding: '13px 16px',
                marginBottom: 20,
              }}
            >

              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#0f2a4a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: 18,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {selectedDoctor.full_name?.charAt(0)}
              </div>

              <div style={{ flex: 1 }}>

                <div
                  style={{
                    fontWeight: 700,
                    color: '#0f2a4a',
                    fontSize: 14,
                  }}
                >
                  Dr. {selectedDoctor.full_name}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    color: '#64748b',
                    marginTop: 3,
                  }}
                >
                  <Stethoscope
                    size={14}
                    color="#0f2a4a"
                  />

                  {selectedDoctor.specialization ||
                    'General Physician'}
                </div>

              </div>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setSelectedDoctor(null);
                  setForm(prev => ({
                    ...prev,
                    doctor_id: '',
                  }));
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: '#ffffff',
                  border:
                    '1px solid #dbe4ee',
                  color: '#0f2a4a',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '7px 11px',
                  borderRadius: 7,
                }}
              >
                <X size={14} />
                Change
              </button>

            </div>

            <form onSubmit={handleBook}>

              <div className="form-row">

                <div className="form-group">

                  <label
                    style={{
                      color: '#334155',
                      fontWeight: 600,
                    }}
                  >
                    Appointment Type
                  </label>

                  <select
                    className="form-control"
                    value={form.type}
                    onChange={e =>
                      setForm({
                        ...form,
                        type: e.target.value,
                      })
                    }
                  >
                    <option>General</option>
                    <option>Follow-up</option>
                    <option>Emergency</option>
                    <option>Review</option>
                  </select>

                </div>

                <div className="form-group">

                  <label
                    style={{
                      color: '#334155',
                      fontWeight: 600,
                    }}
                  >
                    Consultation Mode *
                  </label>

                  <select
                    className="form-control"
                    value={
                      form.consultation_type
                    }
                    onChange={e =>
                      setForm({
                        ...form,
                        consultation_type:
                          e.target.value,
                      })
                    }
                    required
                  >
                    <option value="In-person">
                      In-person
                    </option>

                    <option value="Online">
                      Online Consultation
                    </option>
                  </select>

                </div>

                <div className="form-group">

                  <label
                    style={{
                      color: '#334155',
                      fontWeight: 600,
                    }}
                  >
                    Preferred Date *
                  </label>

                  <input
                    type="date"
                    className="form-control"
                    min={
                      new Date()
                        .toISOString()
                        .split('T')[0]
                    }
                    value={
                      form.appointment_date
                    }
                    onChange={e =>
                      setForm({
                        ...form,
                        appointment_date:
                          e.target.value,
                      })
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label
                    style={{
                      color: '#334155',
                      fontWeight: 600,
                    }}
                  >
                    Preferred Time *
                  </label>

                  <input
                    type="time"
                    className="form-control"
                    value={
                      form.appointment_time
                    }
                    onChange={e =>
                      setForm({
                        ...form,
                        appointment_time:
                          e.target.value,
                      })
                    }
                    required
                  />

                </div>

              </div>

              {/* ONLINE INFO */}

              {form.consultation_type === 'Online' && (
                <div
                  style={{
                    marginTop: 14,
                    padding: '12px 14px',
                    borderRadius: 9,
                    background: '#eff6ff',
                    border:
                      '1px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    color: '#1e3a8a',
                    fontSize: 13,
                  }}
                >
                  <Video
                    size={17}
                    color="#2563eb"
                  />

                  <span>
                    This appointment will be conducted
                    through Google Meet. The doctor will
                    start the consultation and the Meet
                    link will then become available here.
                  </span>
                </div>
              )}

              {/* Buttons */}

              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  marginTop: 8,
                }}
              >

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSelectedDoctor(null);
                    setForm(prev => ({
                      ...prev,
                      doctor_id: '',
                    }));
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    padding: '11px 22px',
                    background: '#f8fafc',
                    color: '#475569',
                    border:
                      '1px solid #dbe4ee',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: '#0f2a4a',
                    border:
                      '1px solid #0f2a4a',
                  }}
                >
                  <Check size={17} />
                  Confirm Appointment
                </button>

              </div>

            </form>

          </>
        )}

      </div>

      {/* ======================================================
          MY APPOINTMENTS
      ====================================================== */}

      <div
        className="table-box"
        style={{
          background: '#ffffff',
          border:
            '1px solid #dbe4ee',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow:
            '0 2px 8px rgba(15,42,74,0.04)',
        }}
      >

        <div
          className="table-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '18px 22px',
            borderBottom:
              '1px solid #e5eaf0',
            background: '#ffffff',
          }}
        >

          <h2
            style={{
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              color: '#0f2a4a',
              fontSize: 18,
            }}
          >

            <ClipboardList
              size={20}
              color="#0f2a4a"
              strokeWidth={1.8}
            />

            My Appointments

            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#64748b',
                marginLeft: 3,
              }}
            >
              ({appointments.length} total)
            </span>

          </h2>

        </div>

        <table>

          <thead>

            <tr
              style={{
                background: '#0f2a4a',
              }}
            >

              <th style={{ color: '#ffffff' }}>
                #
              </th>

              <th style={{ color: '#ffffff' }}>
                Doctor
              </th>

              <th style={{ color: '#ffffff' }}>
                Date &amp; Time
              </th>

              <th style={{ color: '#ffffff' }}>
                Type
              </th>

              <th style={{ color: '#ffffff' }}>
                Consultation
              </th>

              <th style={{ color: '#ffffff' }}>
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan={6}
                  style={{
                    textAlign: 'center',
                    padding: 40,
                    color: '#64748b',
                  }}
                >
                  Loading...
                </td>

              </tr>

            ) : appointments.length === 0 ? (

              <tr>

                <td colSpan={6}>

                  <div
                    className="empty-box"
                    style={{
                      border: 'none',
                      padding:
                        '45px 20px',
                    }}
                  >

                    <div
                      style={{
                        width: 55,
                        height: 55,
                        borderRadius: 14,
                        background: '#eff4f8',
                        color: '#0f2a4a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin:
                          '0 auto 14px',
                      }}
                    >

                      <CalendarDays
                        size={27}
                        strokeWidth={1.7}
                      />

                    </div>

                    <h3
                      style={{
                        color: '#0f2a4a',
                      }}
                    >
                      No appointments yet
                    </h3>

                    <p
                      style={{
                        color: '#64748b',
                      }}
                    >
                      Book your first appointment
                      with a doctor above.
                    </p>

                  </div>

                </td>

              </tr>

            ) : (

              appointments.map(
                (appointment, i) => (

                  <tr
                    key={appointment.id}
                  >

                    {/* Number */}

                    <td
                      style={{
                        color: '#94a3b8',
                        fontWeight: 600,
                      }}
                    >
                      {i + 1}
                    </td>

                    {/* Doctor */}

                    <td>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                        }}
                      >

                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background:
                              '#eff4f8',
                            color: '#0f2a4a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent:
                              'center',
                            flexShrink: 0,
                          }}
                        >
                          <UserRound
                            size={17}
                            strokeWidth={1.7}
                          />
                        </div>

                        <div>

                          <div
                            style={{
                              fontWeight: 700,
                              color: '#0f2a4a',
                            }}
                          >
                            Dr.{' '}
                            {appointment.doctor_name ||
                              '-'}
                          </div>

                          <div
                            style={{
                              fontSize: 12,
                              color: '#64748b',
                              marginTop: 2,
                            }}
                          >
                            {appointment.specialization ||
                              ''}
                          </div>

                        </div>

                      </div>

                    </td>

                    {/* Date & Time */}

                    <td>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontWeight: 600,
                          color: '#334155',
                        }}
                      >

                        <CalendarDays
                          size={15}
                          color="#0f2a4a"
                        />

                        {appointment.appointment_date
                          ? formatDate(
                              appointment.appointment_date
                            )
                          : '-'}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          color: '#64748b',
                          marginTop: 4,
                        }}
                      >

                        <Clock3
                          size={14}
                          color="#64748b"
                        />

                        {appointment.appointment_time
                          ? formatTime(
                              appointment.appointment_time
                            )
                          : '-'}

                      </div>

                    </td>

                    {/* Type */}

                    <td
                      style={{
                        fontSize: 13,
                        color: '#475569',
                      }}
                    >
                      {appointment.type ||
                        '-'}
                    </td>

                    {/* Consultation */}

                    <td>
                      {appointment.consultation_type ===
                      'Online'
                        ? consultationContent(
                            appointment
                          )
                        : (
                          <span
                            style={{
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              padding:
                                '6px 10px',
                              borderRadius: 7,
                              background:
                                '#f1f5f9',
                              color:
                                '#64748b',
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            In-person
                          </span>
                        )}
                    </td>

                    {/* Status */}

                    <td>
                      {statusBadge(
                        appointment.status ||
                          'Pending'
                      )}
                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>

    </Layout>
  );
}