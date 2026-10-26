import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import {
  Users,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  UserPlus,
  Pill,
  CreditCard,
  Moon,
  Sun,
  Sunrise,
  CalendarX2,
  CalendarCheck2,
  X,
  ClipboardList,
} from 'lucide-react';

import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime } from '../data/mockData';
import { API, getToken } from '../api';


const COLORS = [
  'color-blue',
  'color-green',
  'color-orange',
  'color-purple',
  'color-red',
];


// ============================================================
// TODAY
// ============================================================

function getTodayString() {
  const d = new Date();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const TODAY_STR = getTodayString();


// ============================================================
// GREETING
// ============================================================

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return {
      text: 'Good Morning',
      Icon: Sunrise,
    };
  }

  if (hour < 17) {
    return {
      text: 'Good Afternoon',
      Icon: Sun,
    };
  }

  return {
    text: 'Good Evening',
    Icon: Moon,
  };
}


// ============================================================
// DATE HELPERS
// ============================================================

function toYMD(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}


function getDateRange(filter) {
  const today = new Date();

  if (filter === 'tomorrow') {
    const tomorrow = new Date(today);

    tomorrow.setDate(today.getDate() + 1);

    const date = `${tomorrow.getFullYear()}-${String(
      tomorrow.getMonth() + 1
    ).padStart(2, '0')}-${String(
      tomorrow.getDate()
    ).padStart(2, '0')}`;

    return {
      from: date,
      to: date,
      label: "Tomorrow's",
    };
  }

  if (filter === 'week') {
    const end = new Date(today);

    end.setDate(today.getDate() + 6);

    const endDate = `${end.getFullYear()}-${String(
      end.getMonth() + 1
    ).padStart(2, '0')}-${String(
      end.getDate()
    ).padStart(2, '0')}`;

    return {
      from: TODAY_STR,
      to: endDate,
      label: "This Week's",
    };
  }

  return {
    from: TODAY_STR,
    to: TODAY_STR,
    label: "Today's",
  };
}


// ============================================================
// MINI CALENDAR
// ============================================================

function MiniCalendar({
  allAppts,
  selectedDate,
  onSelectDate,
}) {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();

  const todayNum = now.getDate();

  const monthName = now.toLocaleDateString(
    'en-IN',
    {
      month: 'long',
      year: 'numeric',
    }
  );

  const firstDow = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();


  // ==========================================================
  // COUNT APPOINTMENTS PER DAY
  // ==========================================================

  const countByDay = useMemo(() => {
    const map = {};

    allAppts.forEach((appointment) => {
      if (!appointment.appointment_date) {
        return;
      }

      const parts =
        appointment.appointment_date.split('-');

      if (parts.length !== 3) {
        return;
      }

      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);

      if (
        y === year &&
        m === month
      ) {
        map[d] = (map[d] || 0) + 1;
      }
    });

    return map;
  }, [
    allAppts,
    year,
    month,
  ]);


  // ==========================================================
  // SELECTED DAY
  // ==========================================================

  const selectedDay = useMemo(() => {
    if (!selectedDate) {
      return null;
    }

    const parts =
      selectedDate.split('-');

    if (parts.length !== 3) {
      return null;
    }

    const selectedYear =
      parseInt(parts[0], 10);

    const selectedMonth =
      parseInt(parts[1], 10) - 1;

    const selectedDayNumber =
      parseInt(parts[2], 10);

    if (
      selectedYear === year &&
      selectedMonth === month
    ) {
      return selectedDayNumber;
    }

    return null;
  }, [
    selectedDate,
    year,
    month,
  ]);


  // ==========================================================
  // CALENDAR CELLS
  // ==========================================================

  const cells = [];

  for (
    let i = 0;
    i < firstDow;
    i++
  ) {
    cells.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    cells.push(day);
  }


  return (
    <div className="mini-cal">

      <div className="cal-nav">
        <span className="cal-month">
          {monthName}
        </span>
      </div>


      <div className="cal-grid">

        {[
          'S',
          'M',
          'T',
          'W',
          'T',
          'F',
          'S',
        ].map((day, index) => (
          <div
            key={index}
            className="cal-dow"
          >
            {day}
          </div>
        ))}


        {cells.map((day, index) => {

          if (!day) {
            return (
              <div
                key={index}
                className="cal-day empty"
              />
            );
          }

          const isToday =
            day === todayNum;

          const count =
            countByDay[day] || 0;

          const hasAppointment =
            count > 0;

          const isSelected =
            day === selectedDay;


          return (
            <div
              key={index}
              title={
                hasAppointment
                  ? `${count} appointment${
                      count > 1
                        ? 's'
                        : ''
                    }`
                  : ''
              }

              /*
               * IMPORTANT:
               * Selected calendar date gets navy color.
               * Inline style + !important-compatible CSS class
               * are both handled here.
               */
              style={{
                cursor: hasAppointment
                  ? 'pointer'
                  : 'default',

                backgroundColor: isSelected
                  ? '#0f2a52'
                  : undefined,

                color: isSelected
                  ? '#ffffff'
                  : undefined,

                border: isSelected
                  ? '1px solid #0f2a52'
                  : undefined,

                borderRadius: isSelected
                  ? '10px'
                  : undefined,

                boxShadow: isSelected
                  ? '0 2px 6px rgba(15, 42, 82, 0.20)'
                  : undefined,

                position: 'relative',
              }}

              className={[
                'cal-day',

                /*
                 * Today should not override selected.
                 */
                isToday && !isSelected
                  ? 'today'
                  : '',

                /*
                 * Selected date.
                 */
                isSelected
                  ? 'selected'
                  : '',

                hasAppointment
                  ? 'has-appt'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}

              onClick={() => {

                if (!hasAppointment) {
                  return;
                }

                const dateString =
                  toYMD(
                    year,
                    month,
                    day
                  );

                onSelectDate(
                  (previous) =>
                    previous === dateString
                      ? null
                      : dateString
                );
              }}
            >

              {day}

              {hasAppointment && (
                <span
                  className="dot"
                  style={{
                    backgroundColor:
                      isSelected
                        ? '#ffffff'
                        : undefined,
                  }}
                />
              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}


// ============================================================
// MAIN DOCTOR DASHBOARD
// ============================================================

export default function DoctorDashboard() {

  const { user } = useAuth();

  const doctorName =
    (user?.full_name || 'Doctor')
      .replace(/^Dr\.?\s*/i, '')
      .trim();


  // ==========================================================
  // FILTERS
  // ==========================================================

  const [filter, setFilter] =
    useState('today');

  const [tabFilter, setTabFilter] =
    useState('all');


  // ==========================================================
  // APPOINTMENTS
  // ==========================================================

  const [allAppts, setAllAppts] =
    useState([]);

  const [panelLoading, setPanelLoading] =
    useState(true);


  // ==========================================================
  // CALENDAR
  // ==========================================================

  const [calDate, setCalDate] =
    useState(null);


  // ==========================================================
  // STATS
  // ==========================================================

  const [stats, setStats] = useState({
    total_patients: 0,
    total_appointments: 0,
    total_completed: 0,
    total_revenue: 0,
  });


  // ==========================================================
  // LOAD ALL APPOINTMENTS
  // ==========================================================

  async function loadAppointments() {

    setPanelLoading(true);

    try {

      const token = getToken();

      const response = await fetch(
        `${API}/appointments`,
        {
          method: 'GET',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to load appointments.'
        );
      }


      if (
        data.success &&
        data.data
      ) {

        const appointments =
          Array.isArray(
            data.data.appointments
          )
            ? data.data.appointments
            : [];


        setAllAppts(
          appointments
        );


        // ======================================================
        // CALCULATE DASHBOARD STATS
        // ======================================================

        const uniquePatients =
          new Set(
            appointments
              .map(
                (appointment) =>
                  appointment.patient_id
              )
              .filter(Boolean)
          );


        const completed =
          appointments.filter(
            (appointment) =>
              appointment.status ===
              'Completed'
          ).length;


        setStats({
          total_patients:
            uniquePatients.size,

          total_appointments:
            appointments.length,

          total_completed:
            completed,

          total_revenue:
            data.data?.stats
              ?.total_revenue ||
            0,
        });

      } else {

        setAllAppts([]);

        setStats({
          total_patients: 0,
          total_appointments: 0,
          total_completed: 0,
          total_revenue: 0,
        });
      }

    } catch (error) {

      console.error(
        'Doctor Dashboard appointment error:',
        error
      );

      setAllAppts([]);

    } finally {

      setPanelLoading(false);

    }
  }


  // ==========================================================
  // LOAD WHEN DASHBOARD OPENS
  // ==========================================================

  useEffect(() => {
    loadAppointments();
  }, []);


  // ==========================================================
  // FILTER DATE
  // ==========================================================

  const {
    from,
    to,
    label,
  } = getDateRange(filter);


  // ==========================================================
  // FILTER PATIENT APPOINTMENTS
  // ==========================================================

  const filtered = useMemo(() => {

    return allAppts.filter(
      (appointment) => {

        if (
          !appointment.appointment_date
        ) {
          return false;
        }

        return (
          appointment.appointment_date >=
            from &&
          appointment.appointment_date <=
            to
        );
      }
    );

  }, [
    allAppts,
    from,
    to,
  ]);


  // ==========================================================
  // STATUS COUNTS
  // ==========================================================

  const counts = useMemo(() => {

    return {

      all:
        filtered.length,

      Pending:
        filtered.filter(
          (appointment) =>
            appointment.status ===
            'Pending'
        ).length,

      'In Progress':
        filtered.filter(
          (appointment) =>
            appointment.status ===
            'In Progress'
        ).length,

      Completed:
        filtered.filter(
          (appointment) =>
            appointment.status ===
            'Completed'
        ).length,

      Cancelled:
        filtered.filter(
          (appointment) =>
            appointment.status ===
            'Cancelled'
        ).length,
    };

  }, [filtered]);


  // ==========================================================
  // VISIBLE APPOINTMENTS
  // ==========================================================

  const visible =
    tabFilter === 'all'
      ? filtered
      : filtered.filter(
          (appointment) =>
            appointment.status ===
            tabFilter
        );


  // ==========================================================
  // SELECTED CALENDAR DATE APPOINTMENTS
  // ==========================================================

  const calDayAppts =
    useMemo(() => {

      if (!calDate) {
        return [];
      }

      return allAppts
        .filter(
          (appointment) =>
            appointment.appointment_date ===
            calDate
        )
        .sort(
          (a, b) =>
            (
              a.appointment_time || ''
            ).localeCompare(
              b.appointment_time || ''
            )
        );

    }, [
      calDate,
      allAppts,
    ]);


  // ==========================================================
  // UPCOMING APPOINTMENTS
  // ==========================================================

  const upcomingAppts =
    useMemo(() => {

      return allAppts
        .filter(
          (appointment) =>
            appointment.appointment_date &&
            appointment.appointment_date >=
              TODAY_STR
        )
        .sort(
          (a, b) =>
            (
              a.appointment_date || ''
            ).localeCompare(
              b.appointment_date || ''
            ) ||
            (
              a.appointment_time || ''
            ).localeCompare(
              b.appointment_time || ''
            )
        )
        .slice(0, 6);

    }, [allAppts]);


  // ==========================================================
  // STATUS BADGE
  // ==========================================================

  function statusBadge(status) {

    const badgeClasses = {

      Pending:
        'badge-pending',

      'In Progress':
        'badge-inprogress',

      Completed:
        'badge-completed',

      Cancelled:
        'badge-cancelled',
    };


    return (
      <span
        className={`badge ${
          badgeClasses[status] ||
          'badge-pending'
        }`}
      >
        {status === 'Pending'
          ? 'Waiting'
          : status}
      </span>
    );
  }


  // ==========================================================
  // DISPLAY DATE
  // ==========================================================

  function fmtDisplayDate(
    dateString
  ) {

    if (!dateString) {
      return '';
    }

    const parts =
      dateString.split('-');

    if (parts.length !== 3) {
      return dateString;
    }

    const year =
      Number(parts[0]);

    const month =
      Number(parts[1]) - 1;

    const day =
      Number(parts[2]);


    return new Date(
      year,
      month,
      day
    ).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    );
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <Layout
      role="doctor"
      name={doctorName}
      title="Doctor Dashboard"
      subtitle={`Welcome, Dr. ${doctorName}`}
    >

      {/* ======================================================
          GREETING
      ====================================================== */}

      {(() => {

        const greeting =
          getGreeting();

        const GreetingIcon =
          greeting.Icon;

        return (

          <div className="greeting-banner">

            <div className="greeting-left">

              <h2 className="dashboard-greeting-title">

                <span className="greeting-title-icon">
                  <GreetingIcon
                    size={22}
                    strokeWidth={2}
                  />
                </span>

                {greeting.text}, Dr.{' '}
                {doctorName}!

              </h2>

              <p>
                Here's your practice
                overview for today.
                Have a great day!
              </p>

            </div>


            <div className="greeting-icon">

              <GreetingIcon
                size={25}
                strokeWidth={2}
              />

            </div>

          </div>
        );

      })()}


      {/* ======================================================
          STATS
      ====================================================== */}

      <div className="cards-grid">


        {/* TOTAL PATIENTS */}

        <div className="stat-card blue">

          <div className="stat-icon">

            <Users
              size={22}
              strokeWidth={2}
            />

          </div>

          <div className="stat-info">

            <h2>
              {stats.total_patients}
            </h2>

            <p>
              Total Patients
            </p>

          </div>

        </div>


        {/* TOTAL APPOINTMENTS */}

        <div className="stat-card green">

          <div className="stat-icon">

            <CalendarDays
              size={22}
              strokeWidth={2}
            />

          </div>

          <div className="stat-info">

            <h2>
              {stats.total_appointments}
            </h2>

            <p>
              Appointments
            </p>

          </div>

        </div>


        {/* COMPLETED */}

        <div className="stat-card orange">

          <div className="stat-icon">

            <CheckCircle2
              size={22}
              strokeWidth={2}
            />

          </div>

          <div className="stat-info">

            <h2>
              {stats.total_completed}
            </h2>

            <p>
              Completed
            </p>

          </div>

        </div>


        {/* REVENUE */}

        <div className="stat-card purple">

          <div className="stat-icon">

            <IndianRupee
              size={22}
              strokeWidth={2}
            />

          </div>

          <div className="stat-info">

            <h2>
              ₹
              {Number(
                stats.total_revenue || 0
              ).toLocaleString(
                'en-IN'
              )}
            </h2>

            <p>
              Total Revenue
            </p>

          </div>

        </div>

      </div>


      {/* ======================================================
          QUICK ACTIONS
      ====================================================== */}

      <div className="quick-grid">


        <Link
          to="/register?type=patient"
          className="quick-item"
        >

          <div className="quick-action-icon quick-action-icon-center">

            <UserPlus
              size={22}
              strokeWidth={2}
            />

          </div>

          <div className="quick-item-content">

            <h3>
              Add Patient
            </h3>

            <p>
              Register a new patient
            </p>

          </div>

        </Link>


        <Link
          to="/doctor/appointments"
          className="quick-item"
        >

          <div className="quick-action-icon quick-action-icon-center">

            <CalendarDays
              size={22}
              strokeWidth={2}
            />

          </div>

          <div className="quick-item-content">

            <h3>
              Appointment
            </h3>

            <p>
              Manage appointments
            </p>

          </div>

        </Link>


        <Link
          to="/doctor/prescriptions"
          className="quick-item"
        >

          <div className="quick-action-icon quick-action-icon-center">

            <Pill
              size={22}
              strokeWidth={2}
            />

          </div>

          <div className="quick-item-content">

            <h3>
              Prescription
            </h3>

            <p>
              Write a prescription
            </p>

          </div>

        </Link>


        <Link
          to="/doctor/billing"
          className="quick-item"
        >

          <div className="quick-action-icon quick-action-icon-center">

            <CreditCard
              size={22}
              strokeWidth={2}
            />

          </div>

          <div className="quick-item-content">

            <h3>
              Billing
            </h3>

            <p>
              Generate patient bills
            </p>

          </div>

        </Link>

      </div>


      {/* ======================================================
          BOTTOM SECTION
      ====================================================== */}

      <div className="dashboard-bottom">


        {/* ====================================================
            LEFT — TODAY'S PATIENTS
        ==================================================== */}

        <div className="today-box">


          <div className="today-header">

            <h2>
              {label} Patients
            </h2>


            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >

              <select
                value={filter}
                className="filter-select"
                onChange={(event) => {

                  setFilter(
                    event.target.value
                  );

                  setTabFilter(
                    'all'
                  );

                }}
              >

                <option value="today">
                  Today
                </option>

                <option value="tomorrow">
                  Tomorrow
                </option>

                <option value="week">
                  This Week
                </option>

              </select>


              <Link
                to="/doctor/appointments"
                style={{
                  fontSize: 13,
                  color: '#0f2a52',
                  fontWeight: 600,
                }}
              >
                View All →
              </Link>

            </div>

          </div>


          {/* STATUS TABS */}

          <div className="filter-tabs">

            {[
              {
                key: 'all',
                label: 'All',
              },
              {
                key: 'Pending',
                label: 'Waiting',
              },
              {
                key: 'In Progress',
                label: 'In Progress',
              },
              {
                key: 'Completed',
                label: 'Completed',
              },
              {
                key: 'Cancelled',
                label: 'Cancelled',
              },
            ].map((tab) => (

              <button
                key={tab.key}
                className={
                  tabFilter === tab.key
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setTabFilter(
                    tab.key
                  )
                }
              >

                {tab.label}{' '}

                <span
                  style={{
                    opacity: 0.7,
                  }}
                >
                  (
                  {tab.key === 'all'
                    ? counts.all
                    : counts[
                        tab.key
                      ] || 0}
                  )
                </span>

              </button>

            ))}

          </div>


          {/* TABLE HEADER */}

          <div
            className="patient-row header-row"
            style={{
              marginTop: 12,
            }}
          >

            <span>
              Name
            </span>

            <span>
              Type
            </span>

            <span>
              Time
            </span>

            <span>
              Status
            </span>

            <span>
              Action
            </span>

          </div>


          {/* LOADING */}

          {panelLoading ? (

            <div className="empty-today">
              Loading...
            </div>

          ) : visible.length === 0 ? (

            <div className="empty-today">

              <div
                style={{
                  fontSize: 36,
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >

                <CalendarX2
                  size={38}
                  strokeWidth={1.8}
                />

              </div>

              No appointments scheduled.{' '}

              <Link
                to="/doctor/appointments"
                style={{
                  color: '#0f2a52',
                  fontWeight: 600,
                }}
              >
                + Book Appointment
              </Link>

            </div>

          ) : (

            visible.map((appointment) => (

              <div
                className="patient-row"
                key={appointment.id}
              >


                {/* PATIENT */}

                <div className="pat-info">

                  <div className="pat-avatar">

                    {(
                      appointment.patient_name ||
                      'P'
                    ).charAt(0)}

                  </div>


                  <div>

                    <div className="pat-name">
                      {appointment.patient_name ||
                        'Unknown Patient'}
                    </div>

                    <div className="pat-email">
                      {appointment.patient_mobile ||
                        '-'}
                    </div>

                  </div>

                </div>


                {/* TYPE */}

                <div
                  style={{
                    fontSize: 13,
                    color: '#475569',
                    fontWeight: 500,
                  }}
                >

                  {appointment.type ||
                    'General'}

                </div>


                {/* TIME */}

                <div
                  style={{
                    fontSize: 13,
                    color: '#475569',
                    fontWeight: 500,
                  }}
                >

                  {appointment.appointment_time
                    ? formatTime(
                        appointment.appointment_time
                      )
                    : '-'}

                </div>


                {/* STATUS */}

                <div>

                  {statusBadge(
                    appointment.status ||
                      'Pending'
                  )}

                </div>


                {/* ACTION */}

                <div>

                  <Link
                    to="/doctor/prescriptions"
                    className="btn-sm btn-green"
                    title="Write Prescription"
                  >

                    <Pill
                      size={16}
                      strokeWidth={2}
                    />

                  </Link>

                </div>

              </div>

            ))
          )}

        </div>


        {/* ====================================================
            RIGHT — CALENDAR + SCHEDULE
        ==================================================== */}

        <div className="schedule-box">


          <div className="schedule-header">

            <h2 className="schedule-title-with-icon">

              <CalendarDays
                size={19}
                strokeWidth={2}
              />

              Schedules

            </h2>

            <Link
              to="/doctor/appointments"
              style={{
                fontSize: 13,
                color: '#0f2a52',
                fontWeight: 600,
              }}
            >
              View All
            </Link>

          </div>


          {/* CALENDAR */}

          <MiniCalendar
            allAppts={allAppts}
            selectedDate={calDate}
            onSelectDate={
              setCalDate
            }
          />


          {/* SCHEDULE LIST */}

          <div className="schedule-list">


            {/* SELECTED DATE */}

            {calDate ? (

              <>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'space-between',
                    padding:
                      '10px 20px 4px',
                  }}
                >

                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >

                    <CalendarCheck2
                      size={15}
                      strokeWidth={2}
                    />

                    {fmtDisplayDate(
                      calDate
                    )}

                  </span>


                  <button
                    onClick={() =>
                      setCalDate(null)
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      fontSize: 13,
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >

                    <X
                      size={14}
                    />

                    Clear

                  </button>

                </div>


                {calDayAppts.length === 0 ? (

                  <div className="no-schedule">

                    <ClipboardList
                      size={28}
                      strokeWidth={1.8}
                    />

                    <span>
                      No appointments
                      on this date.
                    </span>

                  </div>

                ) : (

                  calDayAppts.map(
                    (appointment, index) => (

                      <div
                        key={appointment.id}
                        className={`schedule-item ${
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }`}
                      >

                        <div className="sch-time">

                          {appointment.appointment_time
                            ? formatTime(
                                appointment.appointment_time
                              )
                            : '-'}

                          <div
                            style={{
                              fontSize: 10,
                              color: '#94a3b8',
                              marginTop: 1,
                            }}
                          >

                            {appointment.appointment_date
                              ? formatDate(
                                  appointment.appointment_date
                                )
                              : ''}

                          </div>

                        </div>


                        <div className="sch-info">

                          <div className="title">

                            {appointment.type ||
                              'General'}

                          </div>

                          <div className="sub">

                            {appointment.patient_name ||
                              'Unknown Patient'}{' '}

                            •{' '}

                            {appointment.status ===
                            'Pending'
                              ? 'Waiting'
                              : appointment.status ||
                                'Pending'}

                          </div>

                        </div>

                      </div>

                    )
                  )
                )}

              </>

            ) : (

              /* =================================================
                 DEFAULT UPCOMING
                 ================================================= */

              upcomingAppts.length === 0 ? (

                <div className="no-schedule">

                  <ClipboardList
                    size={28}
                    strokeWidth={1.8}
                  />

                  <span>
                    No upcoming
                    schedule.
                  </span>

                  <br />

                  <Link
                    to="/doctor/appointments"
                    style={{
                      color: '#0f2a52',
                      fontWeight: 600,
                    }}
                  >
                    Book now →
                  </Link>

                </div>

              ) : (

                upcomingAppts.map(
                  (appointment, index) => (

                    <div
                      key={appointment.id}
                      className={`schedule-item ${
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }`}
                    >

                      <div className="sch-time">

                        {appointment.appointment_time
                          ? formatTime(
                              appointment.appointment_time
                            )
                          : '-'}

                        <div
                          style={{
                            fontSize: 10,
                            color: '#94a3b8',
                            marginTop: 1,
                          }}
                        >

                          {appointment.appointment_date
                            ? formatDate(
                                appointment.appointment_date
                              )
                            : ''}

                        </div>

                      </div>


                      <div className="sch-info">

                        <div className="title">

                          {appointment.type ||
                            'General'}

                        </div>

                        <div className="sub">

                          {appointment.patient_name ||
                            'Unknown Patient'}

                          {' • '}

                          {appointment.status ===
                          'Pending'
                            ? 'Waiting'
                            : appointment.status ||
                              'Pending'}

                        </div>

                      </div>

                    </div>

                  )
                )

              )

            )}

          </div>

        </div>

      </div>

    </Layout>
  );
}