
import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime } from '../data/mockData';
import { API, getToken } from '../api';

export default function Appointments() {
  const { user } = useAuth();

  const doctorName = user?.full_name || 'Doctor';

  const [appointments, setAppointments] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inprogress: 0,
    completed: 0,
    cancelled: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');

  const [rowStatus, setRowStatus] = useState({});

  // ============================================================
  // FLASH MESSAGE
  // ============================================================

  const flash = useCallback((message, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess('');

      setTimeout(() => {
        setError('');
      }, 3000);
    } else {
      setSuccess(message);
      setError('');

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    }
  }, []);

  // ============================================================
  // SAFE JSON RESPONSE
  // ============================================================

  const getResponseData = async (response) => {
    try {
      const text = await response.text();

      if (!text) {
        return {};
      }

      try {
        return JSON.parse(text);
      } catch (jsonError) {
        console.error('Invalid JSON response:', text);

        return {
          success: false,
          message: text || 'Invalid server response.',
        };
      }
    } catch (error) {
      console.error('Response reading error:', error);

      return {
        success: false,
        message: 'Unable to read server response.',
      };
    }
  };

  // ============================================================
  // NORMALIZE STATUS
  // ============================================================

  const normalizeStatus = (status) => {
    if (!status) {
      return 'Pending';
    }

    const value = String(status).trim().toLowerCase();

    switch (value) {
      case 'pending':
        return 'Pending';

      case 'in progress':
      case 'in-progress':
      case 'in_progress':
      case 'inprogress':
        return 'In Progress';

      case 'completed':
      case 'complete':
        return 'Completed';

      case 'cancelled':
      case 'canceled':
        return 'Cancelled';

      default:
        return String(status);
    }
  };

  // ============================================================
  // GET APPOINTMENT ID
  // ============================================================

  const getAppointmentId = (appointment) => {
    if (!appointment) {
      return null;
    }

    return (
      appointment.id ??
      appointment._id ??
      appointment.appointment_id ??
      null
    );
  };

  // ============================================================
  // LOAD ALL APPOINTMENTS
  // ============================================================

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const token = getToken();

      if (!token) {
        setError('Please login again.');
        setAppointments([]);
        setLoading(false);
        return;
      }

      if (!API) {
        throw new Error('API URL is not configured.');
      }

      const response = await fetch(`${API}/appointments`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Failed to load appointments. (${response.status})`
        );
      }

      if (data?.success === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            'Unable to load appointments.'
        );
      }

      let list = [];

      if (Array.isArray(data?.data?.appointments)) {
        list = data.data.appointments;
      } else if (Array.isArray(data?.appointments)) {
        list = data.appointments;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      }

      setAppointments(list);

      // --------------------------------------------------------
      // STATS
      // --------------------------------------------------------

      const apiStats = data?.data?.stats || data?.stats || {};

      const calculatedStats = {
        total: list.length,
        pending: 0,
        inprogress: 0,
        completed: 0,
        cancelled: 0,
      };

      list.forEach((appointment) => {
        const status = normalizeStatus(appointment?.status);

        if (status === 'Pending') {
          calculatedStats.pending += 1;
        } else if (status === 'In Progress') {
          calculatedStats.inprogress += 1;
        } else if (status === 'Completed') {
          calculatedStats.completed += 1;
        } else if (status === 'Cancelled') {
          calculatedStats.cancelled += 1;
        }
      });

      setStats({
        total: Number(
          apiStats?.total ??
            calculatedStats.total
        ),

        pending: Number(
          apiStats?.pending ??
            calculatedStats.pending
        ),

        inprogress: Number(
          apiStats?.inprogress ??
            apiStats?.in_progress ??
            calculatedStats.inprogress
        ),

        completed: Number(
          apiStats?.completed ??
            calculatedStats.completed
        ),

        cancelled: Number(
          apiStats?.cancelled ??
            calculatedStats.cancelled
        ),
      });

      // --------------------------------------------------------
      // STATUS MAP
      // --------------------------------------------------------

      const statusMap = {};

      list.forEach((appointment) => {
        const appointmentId =
          getAppointmentId(appointment);

        if (
          appointmentId !== undefined &&
          appointmentId !== null &&
          appointmentId !== ''
        ) {
          statusMap[appointmentId] =
            normalizeStatus(
              appointment?.status
            );
        }
      });

      setRowStatus(statusMap);
    } catch (err) {
      console.error(
        'Load appointments error:',
        err
      );

      setAppointments([]);

      setError(
        err?.message ||
          'Unable to connect to server.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // LOAD WHEN PAGE OPENS
  // ============================================================

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // ============================================================
  // UPDATE APPOINTMENT STATUS
  // ============================================================

  const handleStatusUpdate = async (
    appointmentId,
    newStatus
  ) => {
    if (
      appointmentId === undefined ||
      appointmentId === null ||
      appointmentId === ''
    ) {
      flash('Appointment ID is missing.', true);
      return;
    }

    if (!newStatus) {
      flash('Please select a status.', true);
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        flash('Please login again.', true);
        return;
      }

      const normalizedStatus =
        normalizeStatus(newStatus);

      const response = await fetch(
        `${API}/appointments/${appointmentId}`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: normalizedStatus,
          }),
        }
      );

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            'Failed to update appointment.'
        );
      }

      if (data?.success === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            'Unable to update appointment.'
        );
      }

      setAppointments((previous) =>
        previous.map((appointment) => {
          const id =
            getAppointmentId(appointment);

          return String(id) ===
            String(appointmentId)
            ? {
                ...appointment,
                status: normalizedStatus,
              }
            : appointment;
        })
      );

      setRowStatus((previous) => ({
        ...previous,
        [appointmentId]: normalizedStatus,
      }));

      flash(
        `Appointment status updated to ${normalizedStatus}.`
      );

      await loadAppointments();
    } catch (err) {
      console.error(
        'Update appointment error:',
        err
      );

      flash(
        err?.message ||
          'Server error. Please try again.',
        true
      );
    }
  };

  // ============================================================
  // DELETE APPOINTMENT
  // ============================================================

  const handleDelete = async (appointmentId) => {
    if (
      appointmentId === undefined ||
      appointmentId === null ||
      appointmentId === ''
    ) {
      flash('Appointment ID is missing.', true);
      return;
    }

    const confirmed = window.confirm(
      'Delete this appointment?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        flash('Please login again.', true);
        return;
      }

      const response = await fetch(
        `${API}/appointments/${appointmentId}`,
        {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            'Failed to delete appointment.'
        );
      }

      if (data?.success === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            'Unable to delete appointment.'
        );
      }

      setAppointments((previous) =>
        previous.filter((appointment) => {
          const id =
            getAppointmentId(appointment);

          return (
            String(id) !==
            String(appointmentId)
          );
        })
      );

      setRowStatus((previous) => {
        const updated = { ...previous };

        delete updated[appointmentId];

        return updated;
      });

      flash(
        'Appointment deleted successfully.'
      );

      await loadAppointments();
    } catch (err) {
      console.error(
        'Delete appointment error:',
        err
      );

      flash(
        err?.message ||
          'Server error. Please try again.',
        true
      );
    }
  };

  // ============================================================
  // CONNECT DOCTOR GOOGLE ACCOUNT
  // ============================================================

  const connectGoogleAccount = async () => {
    try {
      const token = getToken();

      if (!token) {
        flash('Please login again.', true);
        return false;
      }

      if (!API) {
        flash('API URL is not configured.', true);
        return false;
      }

      const response = await fetch(
        `${API}/auth/google`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await getResponseData(response);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            'Unable to connect Google account.'
        );
      }

      if (!data?.url) {
        throw new Error(
          'Google authorization URL was not generated.'
        );
      }

      window.location.href = data.url;

      return true;

    } catch (error) {
      console.error(
        'Google connection error:',
        error
      );

      flash(
        error?.message ||
          'Unable to connect Google account.',
        true
      );

      return false;
    }
  };

  // ============================================================
  // OPEN / START ONLINE CONSULTATION
  // ============================================================

  const openConsultation = async (appointment) => {
    const appointmentId =
      getAppointmentId(appointment);

    const consultationId =
      appointment?.consultation_id;

    const consultationStatus =
      appointment?.consultation_status || 'Waiting';

    if (!appointmentId) {
      flash(
        'Appointment ID is missing.',
        true
      );
      return;
    }

    if (!consultationId) {
      flash(
        'Online consultation room is not available for this appointment.',
        true
      );
      return;
    }

    // ----------------------------------------------------------
    // IF ALREADY ENDED
    // ----------------------------------------------------------

    if (consultationStatus === 'Ended') {
      flash(
        'This consultation has already ended.',
        true
      );
      return;
    }

    // ----------------------------------------------------------
    // IF ALREADY STARTED
    // OPEN EXISTING MEETING DIRECTLY
    // ----------------------------------------------------------

    if (
      consultationStatus === 'Started' &&
      appointment?.meeting_url
    ) {
      window.location.href =
        appointment.meeting_url;

      return;
    }

    try {
      const token = getToken();

      if (!token) {
        flash(
          'Please login again.',
          true
        );
        return;
      }

      const response = await fetch(
        `${API}/appointments/${appointmentId}/consultation/start`,
        {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await getResponseData(response);

      // ========================================================
      // GOOGLE ACCOUNT NOT CONNECTED
      // ========================================================

      if (!response.ok) {
        const message =
          data?.message ||
          data?.error ||
          'Unable to start consultation.';

        if (
          message
            .toLowerCase()
            .includes(
              'doctor google account is not connected'
            )
        ) {
          flash(
            'Please connect your Google account first. Opening Google...',
            true
          );

          const connected =
            await connectGoogleAccount();

          if (connected) {
            return;
          }

          return;
        }

        throw new Error(message);
      }

      if (data?.success === false) {
        const message =
          data?.message ||
          data?.error ||
          'Unable to start consultation.';

        if (
          message
            .toLowerCase()
            .includes(
              'doctor google account is not connected'
            )
        ) {
          flash(
            'Please connect your Google account first. Opening Google...',
            true
          );

          const connected =
            await connectGoogleAccount();

          if (connected) {
            return;
          }

          return;
        }

        throw new Error(message);
      }

      // ========================================================
      // GET REAL GOOGLE MEET URL
      // ========================================================

      const meetingUrl =
        data?.data?.meeting_url ||
        data?.meeting_url ||
        appointment?.meeting_url ||
        null;

      if (!meetingUrl) {
        throw new Error(
          'Google Meet link was not generated.'
        );
      }

      // ========================================================
      // UPDATE LOCAL CONSULTATION STATUS
      // ========================================================

      setAppointments((previous) =>
        previous.map((item) => {
          const id =
            getAppointmentId(item);

          return String(id) ===
            String(appointmentId)
            ? {
                ...item,
                consultation_status:
                  'Started',
                meeting_url:
                  meetingUrl,
              }
            : item;
        })
      );

      flash(
        'Consultation started successfully.'
      );

      // ========================================================
      // OPEN GOOGLE MEET
      // ========================================================

      window.location.href =
        meetingUrl;

    } catch (err) {
      console.error(
        'Start consultation error:',
        err
      );

      flash(
        err?.message ||
          'Unable to start consultation. Please try again.',
        true
      );
    }
  };

  // ============================================================
  // END ONLINE CONSULTATION
  // ============================================================

  const endConsultation = async (appointment) => {
    const appointmentId =
      getAppointmentId(appointment);

    if (!appointmentId) {
      flash(
        'Appointment ID is missing.',
        true
      );
      return;
    }

    if (
      appointment?.consultation_status !==
      'Started'
    ) {
      flash(
        'This consultation is not currently active.',
        true
      );
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to end this consultation?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = getToken();

      if (!token) {
        flash(
          'Please login again.',
          true
        );
        return;
      }

      const response = await fetch(
        `${API}/appointments/${appointmentId}/consultation/end`,
        {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            'Unable to end consultation.'
        );
      }

      if (data?.success === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            'Unable to end consultation.'
        );
      }

      // ========================================================
      // UPDATE LOCAL STATE
      // ========================================================

      setAppointments((previous) =>
        previous.map((item) => {
          const id =
            getAppointmentId(item);

          return String(id) ===
            String(appointmentId)
            ? {
                ...item,
                consultation_status:
                  'Ended',
              }
            : item;
        })
      );

      flash(
        'Consultation ended successfully.'
      );

      // Refresh from backend so UI has exact server state
      await loadAppointments();

    } catch (err) {
      console.error(
        'End consultation error:',
        err
      );

      flash(
        err?.message ||
          'Unable to end consultation. Please try again.',
        true
      );
    }
  };

  // ============================================================
  // FILTER
  // ============================================================

  const visibleAppointments =
    statusFilter === 'all'
      ? appointments
      : appointments.filter((appointment) => {
          const appointmentStatus =
            normalizeStatus(
              appointment?.status
            );

          return (
            appointmentStatus ===
            statusFilter
          );
        });

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const statusBadge = (status) => {
    const safeStatus =
      normalizeStatus(status);

    const classes = {
      Pending: 'badge-pending',
      'In Progress': 'badge-inprogress',
      Completed: 'badge-completed',
      Cancelled: 'badge-cancelled',
    };

    return (
      <span
        className={`badge ${
          classes[safeStatus] ||
          'badge-pending'
        }`}
      >
        {safeStatus}
      </span>
    );
  };

  // ============================================================
  // CONSULTATION BADGE
  // ============================================================

  const consultationStatusBadge = (
    status
  ) => {
    if (status === 'Started') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 10px',
            borderRadius: 7,
            background: '#dcfce7',
            color: '#166534',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          ● Live
        </span>
      );
    }

    if (status === 'Ended') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 10px',
            borderRadius: 7,
            background: '#f1f5f9',
            color: '#64748b',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Ended
        </span>
      );
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '6px 10px',
          borderRadius: 7,
          background: '#eff6ff',
          color: '#2563eb',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        Waiting
      </span>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Layout
      role="doctor"
      name={doctorName}
      title="Appointments"
      subtitle="View and manage patient appointments"
    >

      {/* ALERTS */}

      {success && (
        <div className="alert alert-success">
          <span
            style={{
              color: '#0f2a52',
              fontWeight: 700,
              marginRight: 5,
            }}
          >
            ✓
          </span>

          {success}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span
            style={{
              color: '#0f2a52',
              fontWeight: 700,
              marginRight: 5,
            }}
          >
            !
          </span>

          {error}
        </div>
      )}

      {/* ========================================================
          STATS
      ======================================================== */}

      <div className="appt-stats">

        <div
          className="stat-card blue"
          style={{
            borderRadius: 12,
            padding: '18px 20px',
          }}
        >
          <div
            className="stat-icon"
            style={{
              color: '#2563eb',
              background: '#eef3f8',
            }}
          >
            ▣
          </div>

          <div className="stat-info">
            <h2 style={{ color: '#0f2a52' }}>
              {stats.total}
            </h2>
            <p>Total</p>
          </div>
        </div>

        <div
          className="stat-card orange"
          style={{
            borderRadius: 12,
            padding: '18px 20px',
          }}
        >
          <div
            className="stat-icon"
            style={{
              color: '#2563eb',
              background: '#eef3f8',
            }}
          >
            ◷
          </div>

          <div className="stat-info">
            <h2 style={{ color: '#0f2a52' }}>
              {stats.pending}
            </h2>
            <p>Pending</p>
          </div>
        </div>

        <div
          className="stat-card blue"
          style={{
            borderRadius: 12,
            padding: '18px 20px',
          }}
        >
          <div
            className="stat-icon"
            style={{
              color: '#2563eb',
              background: '#eef3f8',
            }}
          >
            ↻
          </div>

          <div className="stat-info">
            <h2 style={{ color: '#0f2a52' }}>
              {stats.inprogress}
            </h2>
            <p>In Progress</p>
          </div>
        </div>

        <div
          className="stat-card green"
          style={{
            borderRadius: 12,
            padding: '18px 20px',
          }}
        >
          <div
            className="stat-icon"
            style={{
              color: '#2563eb',
              background: '#eef3f8',
            }}
          >
            ✓
          </div>

          <div className="stat-info">
            <h2 style={{ color: '#0f2a52' }}>
              {stats.completed}
            </h2>
            <p>Completed</p>
          </div>
        </div>

        <div
          className="stat-card red"
          style={{
            borderRadius: 12,
            padding: '18px 20px',
          }}
        >
          <div
            className="stat-icon"
            style={{
              color: '#2563eb',
              background: '#eef3f8',
            }}
          >
            ×
          </div>

          <div className="stat-info">
            <h2 style={{ color: '#0f2a52' }}>
              {stats.cancelled}
            </h2>
            <p>Cancelled</p>
          </div>
        </div>

      </div>

      {/* ========================================================
          APPOINTMENTS TABLE
      ======================================================== */}

      <div className="table-box">

        <div className="table-header">

          <h2
            style={{
              color: '#0f2a52',
            }}
          >
            All Appointments

            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#64748b',
                marginLeft: 8,
              }}
            >
              ({stats.total} total)
            </span>
          </h2>

          <div className="filter-bar">

            <span
              style={{
                fontSize: 13,
                color: '#64748b',
              }}
            >
              Filter:
            </span>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Status
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>

          </div>

        </div>

        <table>

          <thead>

            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date &amp; Time</th>
              <th>Type</th>
              <th>Consultation</th>
              <th>Status</th>
              <th>Update Status</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan={9}
                  style={{
                    textAlign: 'center',
                    padding: 40,
                    color: '#64748b',
                  }}
                >
                  Loading appointments...
                </td>

              </tr>

            ) : visibleAppointments.length === 0 ? (

              <tr>

                <td colSpan={9}>

                  <div className="empty-state">

                    <span
                      className="empty-icon"
                      style={{
                        color: '#0f2a52',
                      }}
                    >
                      ▣
                    </span>

                    No appointments found.

                  </div>

                </td>

              </tr>

            ) : (

              visibleAppointments.map(
                (appointment, index) => {

                  const appointmentId =
                    getAppointmentId(
                      appointment
                    );

                  const serverStatus =
                    normalizeStatus(
                      appointment?.status
                    );

                  const currentStatus =
                    rowStatus[appointmentId] ??
                    serverStatus ??
                    'Pending';

                  const consultationStatus =
                    appointment?.consultation_status ||
                    'Waiting';

                  return (

                    <tr
                      key={
                        appointmentId ??
                        `appointment-${index}`
                      }
                    >

                      {/* NUMBER */}

                      <td
                        style={{
                          color: '#94a3b8',
                          fontWeight: 600,
                        }}
                      >
                        {index + 1}
                      </td>

                      {/* PATIENT */}

                      <td>

                        <div
                          style={{
                            fontWeight: 700,
                            color: '#0f2a52',
                          }}
                        >
                          {appointment?.patient_name ||
                            '-'}
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            color: '#64748b',
                          }}
                        >
                          <span
                            style={{
                              color: '#0f2a52',
                              fontWeight: 700,
                            }}
                          >
                            ☎
                          </span>{' '}

                          {appointment?.patient_mobile ||
                            '-'}

                        </div>

                      </td>

                      {/* DOCTOR */}

                      <td>

                        <div
                          style={{
                            fontWeight: 700,
                            color: '#0f2a52',
                          }}
                        >
                          {appointment?.doctor_name ||
                            '-'}
                        </div>

                        {appointment?.specialization && (
                          <div
                            style={{
                              fontSize: 12,
                              color: '#64748b',
                            }}
                          >
                            {
                              appointment.specialization
                            }
                          </div>
                        )}

                      </td>

                      {/* DATE & TIME */}

                      <td>

                        <div
                          style={{
                            fontWeight: 600,
                            color: '#0f2a52',
                          }}
                        >
                          <span
                            style={{
                              color: '#0f2a52',
                              fontWeight: 700,
                            }}
                          >
                            ▣
                          </span>{' '}

                          {appointment?.appointment_date
                            ? formatDate(
                                appointment.appointment_date
                              )
                            : '-'}

                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            color: '#64748b',
                          }}
                        >
                          <span
                            style={{
                              color: '#0f2a52',
                              fontWeight: 700,
                            }}
                          >
                            ◷
                          </span>{' '}

                          {appointment?.appointment_time
                            ? formatTime(
                                appointment.appointment_time
                              )
                            : '-'}

                        </div>

                      </td>

                      {/* TYPE */}

                      <td
                        style={{
                          fontSize: 13,
                          color: '#475569',
                        }}
                      >
                        {appointment?.type || '-'}
                      </td>

                      {/* =================================================
                          CONSULTATION
                      ================================================= */}

                      <td>

                        {appointment?.consultation_type ===
                        'Online' ? (

                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              gap: 8,
                            }}
                          >

                            {consultationStatusBadge(
                              consultationStatus
                            )}

                            {/* WAITING */}

                            {consultationStatus ===
                              'Waiting' && (
                              <button
                                type="button"
                                onClick={() =>
                                  openConsultation(
                                    appointment
                                  )
                                }
                                disabled={
                                  !appointment?.consultation_id
                                }
                                style={{
                                  display:
                                    'inline-flex',
                                  alignItems:
                                    'center',
                                  justifyContent:
                                    'center',
                                  gap: 7,
                                  padding:
                                    '8px 12px',
                                  borderRadius: 8,
                                  border:
                                    '1px solid #2563eb',
                                  background:
                                    appointment?.consultation_id
                                      ? '#2563eb'
                                      : '#cbd5e1',
                                  color:
                                    '#ffffff',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor:
                                    appointment?.consultation_id
                                      ? 'pointer'
                                      : 'not-allowed',
                                }}
                              >
                                Start Consultation
                              </button>
                            )}

                            {/* STARTED */}

                            {consultationStatus ===
                              'Started' && (
                              <div
                                style={{
                                  display:
                                    'flex',
                                  gap: 7,
                                  flexWrap:
                                    'wrap',
                                }}
                              >

                                <button
                                  type="button"
                                  onClick={() =>
                                    openConsultation(
                                      appointment
                                    )
                                  }
                                  style={{
                                    display:
                                      'inline-flex',
                                    alignItems:
                                      'center',
                                    justifyContent:
                                      'center',
                                    gap: 7,
                                    padding:
                                      '8px 12px',
                                    borderRadius: 8,
                                    border:
                                      '1px solid #2563eb',
                                    background:
                                      '#2563eb',
                                    color:
                                      '#ffffff',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor:
                                      'pointer',
                                  }}
                                >
                                  Join Consultation
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    endConsultation(
                                      appointment
                                    )
                                  }
                                  style={{
                                    display:
                                      'inline-flex',
                                    alignItems:
                                      'center',
                                    justifyContent:
                                      'center',
                                    gap: 7,
                                    padding:
                                      '8px 12px',
                                    borderRadius: 8,
                                    border:
                                      '1px solid #dc2626',
                                    background:
                                      '#ffffff',
                                    color:
                                      '#dc2626',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor:
                                      'pointer',
                                  }}
                                >
                                  End Consultation
                                </button>

                              </div>
                            )}

                            {/* ENDED */}

                            {consultationStatus ===
                              'Ended' && (
                              <span
                                style={{
                                  fontSize: 12,
                                  color:
                                    '#64748b',
                                  fontWeight: 600,
                                }}
                              >
                                Consultation completed
                              </span>
                            )}

                          </div>

                        ) : (

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

                      {/* STATUS */}

                      <td>
                        {statusBadge(
                          currentStatus
                        )}
                      </td>

                      {/* UPDATE STATUS */}

                      <td>

                        <div className="action-wrap">

                          <select
                            value={currentStatus}
                            onChange={(event) => {

                              const selectedStatus =
                                normalizeStatus(
                                  event.target.value
                                );

                              setRowStatus(
                                (previous) => ({
                                  ...previous,
                                  [appointmentId]:
                                    selectedStatus,
                                })
                              );

                            }}
                          >

                            <option value="Pending">
                              Pending
                            </option>

                            <option value="In Progress">
                              In Progress
                            </option>

                            <option value="Completed">
                              Completed
                            </option>

                            <option value="Cancelled">
                              Cancelled
                            </option>

                          </select>

                          <button
                            type="button"
                            className="btn-update-sm"
                            onClick={() =>
                              handleStatusUpdate(
                                appointmentId,
                                currentStatus
                              )
                            }
                          >
                            Update
                          </button>

                        </div>

                      </td>

                      {/* DELETE */}

                      <td>

                        <button
                          type="button"
                          className="btn-sm btn-del"
                          onClick={() =>
                            handleDelete(
                              appointmentId
                            )
                          }
                        >

                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              marginRight: 4,
                              flexShrink: 0,
                            }}
                            aria-hidden="true"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>

                          Delete

                        </button>

                      </td>

                    </tr>

                  );
                }
              )

            )}

          </tbody>

        </table>

      </div>

    </Layout>
  );
}

