import { useEffect, useState } from 'react';
import { todayFormatted } from '../data/mockData';
import { API, getToken } from '../api';
import { useAuth } from '../context/AuthContext';

import {
  Bell,
  CalendarDays,
  Pill
} from 'lucide-react';

export default function Header({
  title,
  subtitle,
  role = 'doctor',
  name = '',
  profileImage = ''
}) {
  const { user } = useAuth();

  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const today = todayFormatted();

  // ============================================================
  // DOCTOR PROFILE IMAGE
  // ============================================================

  const doctorProfileImage =
    profileImage ||
    user?.profile_image ||
    user?.profileImage ||
    '';

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ============================================================
  // LOAD NOTIFICATIONS
  // ============================================================

  useEffect(() => {
    if (role !== 'patient') return;

    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 3000);

    return () => clearInterval(interval);
  }, [role]);

  // ============================================================
  // LOAD REAL APPOINTMENT + MEDICINE NOTIFICATIONS
  // ============================================================

  async function loadNotifications() {
    try {
      const token = getToken();

      if (!token) return;

      // ========================================================
      // PATIENT NOTIFICATION SETTINGS
      // ========================================================

      const savedSettings = localStorage.getItem(
        'patientNotificationSettings'
      );

      let appointmentReminderEnabled = true;
      let medicineReminderEnabled = true;

      if (savedSettings) {
        try {
          const settings = JSON.parse(
            savedSettings
          );

          appointmentReminderEnabled =
            settings.appointment_reminders !== false;

          medicineReminderEnabled =
            settings.medicine_reminders !== false;
        } catch (error) {
          console.error(
            'Failed to read notification settings:',
            error
          );
        }
      }

      // ========================================================
      // GET APPOINTMENTS
      // ========================================================

      let appointmentNotifications = [];

      if (appointmentReminderEnabled) {
        try {
          const appointmentResponse = await fetch(
            `${API}/appointments/my`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          const appointmentData =
            await appointmentResponse.json();

          if (
            appointmentResponse.ok &&
            appointmentData.success
          ) {
            const appointments =
              appointmentData.data?.appointments || [];

            const now = new Date();

            appointmentNotifications =
              appointments
                .filter((appointment) => {
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

                  const appointmentDateTime =
                    parseAppointmentDateTime(
                      appointment.appointment_date,
                      appointment.appointment_time
                    );

                  if (!appointmentDateTime) {
                    return false;
                  }

                  const difference =
                    appointmentDateTime.getTime() -
                    now.getTime();

                  const hoursUntil =
                    difference /
                    (1000 * 60 * 60);

                  // Next 24 hours
                  return (
                    hoursUntil >= 0 &&
                    hoursUntil <= 24
                  );
                })
                .sort((a, b) => {
                  const dateA =
                    parseAppointmentDateTime(
                      a.appointment_date,
                      a.appointment_time
                    );

                  const dateB =
                    parseAppointmentDateTime(
                      b.appointment_date,
                      b.appointment_time
                    );

                  if (!dateA || !dateB) return 0;

                  return dateA - dateB;
                })
                .map((appointment) => {
                  const appointmentDateTime =
                    parseAppointmentDateTime(
                      appointment.appointment_date,
                      appointment.appointment_time
                    );

                  if (!appointmentDateTime) {
                    return null;
                  }

                  const timeText =
                    appointmentDateTime.toLocaleTimeString(
                      'en-IN',
                      {
                        hour: '2-digit',
                        minute: '2-digit'
                      }
                    );

                  const dateText =
                    appointmentDateTime.toLocaleDateString(
                      'en-IN',
                      {
                        day: 'numeric',
                        month: 'short'
                      }
                    );

                  const doctorName =
                    appointment.doctor_name ||
                    'Doctor';

                  return {
                    id:
                      `appointment-${String(
                        appointment.id ||
                        appointment._id ||
                        `${appointment.appointment_date}-${appointment.appointment_time}`
                      )}`,

                    type: 'appointment',

                    title: 'Appointment Reminder',

                    message:
                      `Your appointment with Dr. ${doctorName} ` +
                      `is on ${dateText} at ${timeText}.`
                  };
                })
                .filter(Boolean);
          }
        } catch (error) {
          console.error(
            'Appointment notification error:',
            error
          );
        }
      }

      // ========================================================
      // GET REAL PRESCRIPTIONS / MEDICINES
      // ========================================================

      let medicineNotifications = [];

      if (medicineReminderEnabled) {
        try {
          const prescriptionResponse =
            await fetch(
              `${API}/prescriptions/my`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

          const prescriptionData =
            await prescriptionResponse.json();

          if (
            prescriptionResponse.ok &&
            prescriptionData.success
          ) {
            const prescriptions =
              prescriptionData.data?.prescriptions || [];

            medicineNotifications =
              createMedicineNotifications(
                prescriptions
              );
          }
        } catch (error) {
          console.error(
            'Medicine notification error:',
            error
          );
        }
      }

      // ========================================================
      // COMBINE
      // ========================================================

      const reminderList = [
        ...appointmentNotifications,
        ...medicineNotifications
      ];

      setNotifications(reminderList);

      // ========================================================
      // READ / UNREAD
      // ========================================================

      const savedReadNotifications =
        localStorage.getItem(
          'readPatientNotifications'
        );

      let readNotificationIds = [];

      if (savedReadNotifications) {
        try {
          readNotificationIds =
            JSON.parse(
              savedReadNotifications
            );
        } catch (error) {
          readNotificationIds = [];
        }
      }

      const unreadNotifications =
        reminderList.filter(
          (notification) =>
            !readNotificationIds.includes(
              String(notification.id)
            )
        );

      setUnreadCount(
        unreadNotifications.length
      );

    } catch (error) {
      console.error(
        'Notification loading error:',
        error
      );
    }
  }

  // ============================================================
  // PARSE APPOINTMENT DATE + TIME
  // Supports:
  // 10:30
  // 10:30 AM
  // 14:30
  // ============================================================

  function parseAppointmentDateTime(
    appointmentDate,
    appointmentTime
  ) {
    if (
      !appointmentDate ||
      !appointmentTime
    ) {
      return null;
    }

    let time = String(
      appointmentTime
    ).trim();

    // --------------------------------------------
    // 12 hour format
    // Example: 10:30 AM
    // --------------------------------------------

    const amPmMatch =
      time.match(
        /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
      );

    if (amPmMatch) {
      let hour =
        Number(amPmMatch[1]);

      const minute =
        Number(amPmMatch[2]);

      const period =
        amPmMatch[3].toUpperCase();

      if (period === 'PM' && hour !== 12) {
        hour += 12;
      }

      if (period === 'AM' && hour === 12) {
        hour = 0;
      }

      time =
        `${String(hour).padStart(2, '0')}:${String(
          minute
        ).padStart(2, '0')}`;
    }

    // --------------------------------------------
    // 24 hour format
    // --------------------------------------------

    const dateTime =
      new Date(
        `${appointmentDate}T${time}`
      );

    if (
      Number.isNaN(
        dateTime.getTime()
      )
    ) {
      return null;
    }

    return dateTime;
  }

  // ============================================================
  // CREATE REAL MEDICINE NOTIFICATIONS
  // ============================================================

  function createMedicineNotifications(
    prescriptions
  ) {
    if (!Array.isArray(prescriptions)) {
      return [];
    }

    const notifications = [];

    prescriptions.forEach(
      (prescription) => {
        const medicines =
          Array.isArray(
            prescription.medicines
          )
            ? prescription.medicines
            : [];

        medicines.forEach(
          (medicine, index) => {
            if (
              !medicine ||
              !medicine.medicine_name
            ) {
              return;
            }

            const medicineName =
              medicine.medicine_name;

            const dosage =
              medicine.dosage || '';

            const frequency =
              medicine.frequency || '';

            const duration =
              medicine.duration || '';

            let message =
              `Take ${medicineName}`;

            if (dosage) {
              message += ` (${dosage})`;
            }

            if (frequency) {
              message += ` — ${frequency}`;
            }

            if (duration) {
              message += ` for ${duration}`;
            }

            notifications.push({
              id:
                `medicine-${String(
                  prescription.id ||
                  prescription._id ||
                  prescription.created_at ||
                  'prescription'
                )}-${String(
                  medicine.id ||
                  medicine._id ||
                  index
                )}`,

              type: 'medicine',

              title: 'Medicine Reminder',

              message
            });
          }
        );
      }
    );

    return notifications;
  }

  // ============================================================
  // BELL CLICK
  // ============================================================

  function handleNotificationClick() {
    const willOpen =
      !showNotifications;

    setShowNotifications(
      willOpen
    );

    // ----------------------------------------------------------
    // OPEN POPUP = MARK CURRENT NOTIFICATIONS AS READ
    // ----------------------------------------------------------

    if (
      willOpen &&
      notifications.length > 0
    ) {
      const savedReadNotifications =
        localStorage.getItem(
          'readPatientNotifications'
        );

      let readNotificationIds = [];

      if (savedReadNotifications) {
        try {
          readNotificationIds =
            JSON.parse(
              savedReadNotifications
            );
        } catch (error) {
          readNotificationIds = [];
        }
      }

      const currentNotificationIds =
        notifications.map(
          (notification) =>
            String(notification.id)
        );

      const updatedReadIds = [
        ...new Set([
          ...readNotificationIds,
          ...currentNotificationIds
        ])
      ];

      localStorage.setItem(
        'readPatientNotifications',
        JSON.stringify(
          updatedReadIds
        )
      );

      // Remove red count immediately
      setUnreadCount(0);
    }
  }

  // ============================================================
  // ICON BASED ON NOTIFICATION TYPE
  // ============================================================

  function getNotificationIcon(
    type
  ) {
    if (type === 'medicine') {
      return (
        <Pill
          size={20}
          strokeWidth={2}
        />
      );
    }

    return (
      <CalendarDays
        size={20}
        strokeWidth={2}
      />
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="top-header">

      {/* ======================================================
          HEADER LEFT
      ====================================================== */}

      <div className="header-left">
        <h1>{title}</h1>

        {subtitle && (
          <p>{subtitle}</p>
        )}
      </div>

      {/* ======================================================
          HEADER RIGHT
      ====================================================== */}

      <div className="header-right">

        {/* ====================================================
            DATE
        ==================================================== */}

        <span
          className="date-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',

            background: '#eff6ff',
            color: '#0f2a4a',

            border:
              '1px solid #bfdbfe',

            borderRadius: '20px',

            padding:
              '8px 14px',

            fontSize: '14px',

            fontWeight: '600',

            whiteSpace:
              'nowrap'
          }}
        >
          <CalendarDays
            size={16}
            strokeWidth={2}
            color="#0f2a4a"
          />

          {today}
        </span>

        {/* ====================================================
            NOTIFICATION
        ==================================================== */}

        {role === 'patient' && (
          <div
            className="notification-wrapper"
            style={{
              position: 'relative'
            }}
          >

            {/* ================================================
                BELL
            ================================================= */}

            <button
              type="button"
              className="notification-btn"
              title="Notifications"
              onClick={
                handleNotificationClick
              }
              style={{
                position: 'relative',

                width: '40px',
                height: '40px',

                borderRadius: '10px',

                border:
                  '1px solid #bfdbfe',

                background:
                  '#eff6ff',

                color:
                  '#0f2a4a',

                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',

                cursor: 'pointer',

                padding: 0
              }}
            >

              <Bell
                size={21}
                strokeWidth={2}
                color="#0f2a4a"
              />

              {/* ============================================
                  RED COUNT
              ============================================ */}

              {unreadCount > 0 && (
                <span
                  className="notification-badge"
                  style={{
                    position:
                      'absolute',

                    top: '-6px',
                    right: '-6px',

                    minWidth: '19px',
                    height: '19px',

                    padding:
                      '0 5px',

                    borderRadius:
                      '999px',

                    background:
                      '#dc2626',

                    color:
                      '#ffffff',

                    border:
                      '2px solid #ffffff',

                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',

                    fontSize:
                      '10px',

                    fontWeight:
                      '700',

                    lineHeight: 1
                  }}
                >
                  {unreadCount > 9
                    ? '9+'
                    : unreadCount}
                </span>
              )}

            </button>

            {/* =================================================
                NOTIFICATION POPUP
            ================================================= */}

            {showNotifications && (
              <div
                className="notification-dropdown"
                style={{
                  position:
                    'absolute',

                  top: 'calc(100% + 12px)',

                  right: 0,

                  width: '360px',

                  maxWidth:
                    'calc(100vw - 30px)',

                  background:
                    '#ffffff',

                  border:
                    '1px solid #e2e8f0',

                  borderRadius:
                    '14px',

                  boxShadow:
                    '0 12px 35px rgba(15, 42, 74, 0.16)',

                  overflow:
                    'hidden',

                  zIndex: 9999
                }}
              >

                {/* =========================================
                    POPUP HEADER
                ========================================== */}

                <div
                  className="notification-header"
                  style={{
                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'space-between',

                    padding:
                      '15px 17px',

                    borderBottom:
                      '1px solid #e2e8f0',

                    background:
                      '#ffffff'
                  }}
                >
                  <h3
                    style={{
                      margin: 0,

                      color:
                        '#0f2a4a',

                      fontSize:
                        '16px',

                      fontWeight:
                        '700'
                    }}
                  >
                    Notifications
                  </h3>

                  {notifications.length >
                    0 && (
                    <span
                      style={{
                        color:
                          '#64748b',

                        fontSize:
                          '12px',

                        fontWeight:
                          '600'
                      }}
                    >
                      {notifications.length}
                    </span>
                  )}
                </div>

                {/* =========================================
                    EMPTY STATE
                ========================================== */}

                {notifications.length ===
                0 ? (
                  <div
                    className="notification-empty"
                    style={{
                      padding:
                        '35px 20px',

                      textAlign:
                        'center',

                      color:
                        '#64748b'
                    }}
                  >
                    <Bell
                      size={25}
                      strokeWidth={1.8}
                      color="#94a3b8"
                    />

                    <p
                      style={{
                        margin:
                          '10px 0 0',

                        fontSize:
                          '13px',

                        color:
                          '#64748b'
                      }}
                    >
                      No new notifications
                    </p>
                  </div>
                ) : (

                  /* ========================================
                     NOTIFICATION LIST
                  ========================================= */

                  <div
                    className="notification-list"
                    style={{
                      maxHeight:
                        '390px',

                      overflowY:
                        'auto'
                    }}
                  >

                    {notifications.map(
                      (notification) => (
                        <div
                          className="notification-item"
                          key={
                            notification.id
                          }
                          style={{
                            display:
                              'flex',

                            gap:
                              '12px',

                            padding:
                              '14px 16px',

                            borderBottom:
                              '1px solid #f1f5f9',

                            background:
                              '#ffffff'
                          }}
                        >

                          {/* =================================
                              ICON
                          ================================== */}

                          <div
                            className="notification-icon"
                            style={{
                              width:
                                '40px',

                              height:
                                '40px',

                              minWidth:
                                '40px',

                              borderRadius:
                                '10px',

                              background:
                                '#eff6ff',

                              color:
                                '#0f2a4a',

                              display:
                                'flex',

                              alignItems:
                                'center',

                              justifyContent:
                                'center'
                            }}
                          >
                            {getNotificationIcon(
                              notification.type
                            )}
                          </div>

                          {/* =================================
                              TEXT
                          ================================== */}

                          <div
                            className="notification-content"
                            style={{
                              flex: 1,
                              minWidth: 0
                            }}
                          >

                            <h4
                              style={{
                                margin:
                                  '0 0 5px',

                                color:
                                  '#0f2a4a',

                                fontSize:
                                  '13px',

                                fontWeight:
                                  '700'
                              }}
                            >
                              {
                                notification.title
                              }
                            </h4>

                            <p
                              style={{
                                margin: 0,

                                color:
                                  '#475569',

                                fontSize:
                                  '12px',

                                lineHeight:
                                  '1.5'
                              }}
                            >
                              {
                                notification.message
                              }
                            </p>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ====================================================
            PROFILE AVATAR
        ==================================================== */}

        <div
          className={`avatar avatar-${role}`}
          title={name}
          style={
            role === 'doctor'
              ? {
                  background: '#0f2a4a',
                  backgroundColor: '#0f2a4a',
                  color: '#ffffff',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              : role === 'patient'
                ? {
                    background: '#0f2a4a',
                    backgroundColor: '#0f2a4a',
                    color: '#ffffff'
                  }
                : undefined
          }
        >
          {role === 'doctor' && doctorProfileImage ? (
            <img
              src={doctorProfileImage}
              alt={name || 'Doctor'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            initial
          )}
        </div>

      </div>
    </div>
  );
}