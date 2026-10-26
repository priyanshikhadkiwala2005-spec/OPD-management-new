import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../data/mockData';

import { API, getToken } from '../api';

import {
  Users,
  CalendarDays,
  Stethoscope,
  IndianRupee,
  Clock3,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  CircleAlert,
  PieChart,
  Wallet,
  ReceiptText,
  Pill,
  Syringe,
  ClipboardList,
  ArrowRight,
  RefreshCw,
  BarChart3,
  UserRound,
  Activity,
} from 'lucide-react';


// ============================================================
// DESIGN CONSTANTS
// ============================================================

const NAVY = '#0f2747';
const BLUE = '#2563eb';
const LIGHT_BLUE = '#eff6ff';
const MUTED = '#64748b';
const BORDER = '#dbe4ef';
const WHITE = '#ffffff';
const SOFT_BG = '#f8fafc';

const FONT_FAMILY = 'Poppins, sans-serif';


// ============================================================
// SAFE TIME FORMATTER
// ============================================================

function displayTime(value) {
  if (!value) return '-';

  try {
    if (
      typeof value === 'string' &&
      value.includes('T')
    ) {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }

    const parts = String(value).split(':');

    if (parts.length >= 2) {
      let hour = Number(parts[0]);
      const minute = parts[1];

      if (!Number.isNaN(hour)) {
        const suffix = hour >= 12 ? 'PM' : 'AM';

        hour = hour % 12 || 12;

        return `${String(hour).padStart(2, '0')}:${minute} ${suffix}`;
      }
    }

    return String(value);
  } catch (error) {
    console.error('Time formatting error:', error);
    return String(value);
  }
}


// ============================================================
// SAFE DATE FORMATTER
// ============================================================

function displayDate(value) {
  if (!value) return '-';

  try {
    return formatDate(value);
  } catch (error) {
    console.error('Date formatting error:', error);

    try {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IN');
      }
    } catch {
      // Ignore
    }

    return String(value);
  }
}


// ============================================================
// SIMPLE HORIZONTAL BAR
// ============================================================

function BarRow({
  label,
  value,
  max,
}) {
  const safeValue = Number(value || 0);
  const safeMax = Number(max || 0);

  const pct =
    safeMax > 0
      ? Math.min(
          100,
          Math.round(
            (safeValue / safeMax) * 100
          )
        )
      : 0;

  return (
    <div
      style={{
        marginBottom: 16,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 7,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: NAVY,
          }}
        >
          {label}
        </span>

        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: NAVY,
            whiteSpace: 'nowrap',
          }}
        >
          {safeValue} ({pct}%)
        </span>
      </div>

      <div
        style={{
          background: '#e9eef5',
          borderRadius: 20,
          height: 9,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: NAVY,
            borderRadius: 20,
            transition: 'width 0.6s ease',
            minWidth: safeValue > 0 ? 6 : 0,
          }}
        />
      </div>
    </div>
  );
}


// ============================================================
// DONUT CHART
// ============================================================
function DonutChart({ segments = [] }) {
  const total = segments.reduce(
    (sum, segment) =>
      sum + Number(segment?.value || 0),
    0
  );

  if (total === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 30,
          color: '#94a3b8',
          fontFamily: FONT_FAMILY,
        }}
      >
        <PieChart
          size={34}
          strokeWidth={1.6}
          color="#cbd5e1"
          style={{ marginBottom: 8 }}
        />

        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          No data available
        </div>
      </div>
    );
  }

  // Total patients = Male + Female + Other
  // Navy portion = actual data
  // White portion = remaining part
  const circumference = 2 * Math.PI * 65;

  return (
    <div
      style={{
        width: 180,
        height: 180,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        style={{
          transform: 'rotate(-90deg)',
        }}
      >
        {/* WHITE BACKGROUND / REMAINING PART */}
        <circle
          cx="90"
          cy="90"
          r="65"
          fill="none"
          stroke="#ffffff"
          strokeWidth="22"
        />

        {/* NAVY DATA PART */}
        <circle
          cx="90"
          cy="90"
          r="65"
          fill="none"
          stroke={NAVY}
          strokeWidth="22"
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.5} ${circumference}`}
        />
      </svg>

      {/* CENTER NUMBER */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT_FAMILY,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: NAVY,
          }}
        >
          {total}
        </div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: '#64748b',
          }}
        >
          Patients
        </div>
      </div>
    </div>
  );

  const r = 50;
  const cx = 60;
  const cy = 60;
  const strokeW = 18;

  let cumulative = 0;

  const slices = segments.map((segment) => {
    const value = Number(segment?.value || 0);
    const pct = value / total;

    const start = cumulative;

    cumulative += pct;

    return {
      ...segment,
      value,
      pct,
      start,
    };
  });

  function describeArc(startPct, pct) {
    const startAngle =
      startPct * 2 * Math.PI - Math.PI / 2;

    const endAngle =
      (startPct + pct) * 2 * Math.PI -
      Math.PI / 2;

    const x1 =
      cx + r * Math.cos(startAngle);

    const y1 =
      cy + r * Math.sin(startAngle);

    const x2 =
      cx + r * Math.cos(endAngle);

    const y2 =
      cy + r * Math.sin(endAngle);

    const large = pct > 0.5 ? 1 : 0;

    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        flexWrap: 'wrap',
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 120,
          height: 120,
          flexShrink: 0,
        }}
      >
        <svg
          width={120}
          height={120}
          viewBox="0 0 120 120"
        >
          {slices.map(
            (slice, index) =>
              slice.value > 0 && (
                <path
                  key={index}
                  d={describeArc(
                    slice.start,
                    slice.pct
                  )}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={strokeW}
                  strokeLinecap="butt"
                />
              )
          )}

          <text
            x={cx}
            y={cy + 5}
            textAnchor="middle"
            fontSize={14}
            fontWeight={700}
            fill={NAVY}
            fontFamily="Poppins, sans-serif"
          >
            {total}
          </text>

          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            fontSize={9}
            fill="#94a3b8"
            fontFamily="Poppins, sans-serif"
          >
            TOTAL
          </text>
        </svg>
      </div>

      <div>
        {segments.map((segment, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 9,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: segment.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />

            <span
              style={{
                fontSize: 13,
                color: NAVY,
                fontWeight: 500,
              }}
            >
              {segment.label}
            </span>

            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: segment.color,
                marginLeft: 4,
              }}
            >
              {segment.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


// ============================================================
// DEFAULT REPORT DATA
// ============================================================

const DEFAULT_REPORT_DATA = {
  summary: {
    total_patients: 0,
    total_appointments: 0,
    total_consultations: 0,
    total_revenue: 0,
    pending_revenue: 0,
    total_bills: 0,
  },

  appointment_status: {
    completed: 0,
    pending: 0,
    inprogress: 0,
    cancelled: 0,
  },

  patient_gender: {
    male: 0,
    female: 0,
    other: 0,
  },

  top_medicines: [],

  recent_appointments: [],
};


// ============================================================
// NORMALIZE REPORT DATA
// ============================================================

function normalizeReportData(raw) {
  const source = raw || {};

  const summarySource =
    source.summary || {};

  const appointmentSource =
    source.appointment_status ||
    source.appointmentStatus ||
    {};

  const genderSource =
    source.patient_gender ||
    source.patientGender ||
    {};

  const medicinesSource =
    source.top_medicines ||
    source.topMedicines ||
    [];

  const appointmentsSource =
    source.recent_appointments ||
    source.recentAppointments ||
    [];

  return {
    summary: {
      total_patients: Number(
        summarySource.total_patients ??
          summarySource.totalPatients ??
          0
      ),

      total_appointments: Number(
        summarySource.total_appointments ??
          summarySource.totalAppointments ??
          0
      ),

      total_consultations: Number(
        summarySource.total_consultations ??
          summarySource.totalConsultations ??
          0
      ),

      total_revenue: Number(
        summarySource.total_revenue ??
          summarySource.totalRevenue ??
          0
      ),

      pending_revenue: Number(
        summarySource.pending_revenue ??
          summarySource.pendingRevenue ??
          0
      ),

      total_bills: Number(
        summarySource.total_bills ??
          summarySource.totalBills ??
          0
      ),
    },

    appointment_status: {
      completed: Number(
        appointmentSource.completed ?? 0
      ),

      pending: Number(
        appointmentSource.pending ?? 0
      ),

      inprogress: Number(
        appointmentSource.inprogress ??
          appointmentSource.inProgress ??
          0
      ),

      cancelled: Number(
        appointmentSource.cancelled ?? 0
      ),
    },

    patient_gender: {
      male: Number(
        genderSource.male ?? 0
      ),

      female: Number(
        genderSource.female ?? 0
      ),

      other: Number(
        genderSource.other ?? 0
      ),
    },

    top_medicines: Array.isArray(
      medicinesSource
    )
      ? medicinesSource.map((medicine) => ({
          medicine_name:
            medicine?.medicine_name ||
            medicine?.medicineName ||
            medicine?.name ||
            'Unknown Medicine',

          medicine_type:
            medicine?.medicine_type ||
            medicine?.medicineType ||
            medicine?.type ||
            'Medicine',

          count: Number(
            medicine?.count ??
              medicine?.total ??
              0
          ),
        }))
      : [],

    recent_appointments:
      Array.isArray(appointmentsSource)
        ? appointmentsSource.map(
            (appointment, index) => ({
              id:
                appointment?.id ||
                appointment?._id ||
                `appointment-${index}`,

              patient_name:
                appointment?.patient_name ||
                appointment?.patientName ||
                appointment?.patient?.fullName ||
                appointment?.patient?.full_name ||
                appointment?.patient?.name ||
                'Unknown Patient',

              appointment_date:
                appointment?.appointment_date ||
                appointment?.appointmentDate ||
                '',

              appointment_time:
                appointment?.appointment_time ||
                appointment?.appointmentTime ||
                '',

              type:
                appointment?.type ||
                'General',

              status:
                appointment?.status ||
                'Pending',
            })
          )
        : [],
  };
}


// ============================================================
// REPORTS PAGE
// ============================================================

export default function Reports() {
  const { user } = useAuth();

  const doctorName =
    user?.full_name ||
    user?.fullName ||
    'Doctor';

  const [data, setData] = useState(
    DEFAULT_REPORT_DATA
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  // ============================================================
  // LOAD REPORTS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      setLoading(true);
      setError('');

      const token = getToken();

      if (!token) {
        if (!cancelled) {
          setError(
            'Authentication token not found. Please login again.'
          );

          setLoading(false);
        }

        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const endpoints = [
        `${API}/settings/reports`,
        `${API}/reports`,
      ];

      let lastError =
        'Failed to load reports.';

      for (const endpoint of endpoints) {
        try {
          console.log(
            'Loading reports from:',
            endpoint
          );

          const response =
            await fetch(endpoint, {
              method: 'GET',
              headers,
            });

          let result = null;

          try {
            result =
              await response.json();
          } catch (jsonError) {
            console.error(
              'Invalid JSON response:',
              jsonError
            );
          }

          console.log(
            'Reports API response:',
            endpoint,
            response.status,
            result
          );

          if (
            response.ok &&
            result?.success
          ) {
            const rawData =
              result?.data ||
              result?.report ||
              result?.reports ||
              result ||
              {};

            const normalized =
              normalizeReportData(
                rawData
              );

            if (!cancelled) {
              setData(normalized);
              setError('');
              setLoading(false);
            }

            return;
          }

          lastError =
            result?.message ||
            `Reports API failed (${response.status}).`;
        } catch (requestError) {
          console.error(
            'Reports endpoint error:',
            endpoint,
            requestError
          );

          lastError =
            requestError?.message ||
            'Failed to load reports.';
        }
      }

      if (!cancelled) {
        setError(
          `${lastError} Please check the reports API on the server.`
        );

        setLoading(false);
      }
    }

    loadReports();

    return () => {
      cancelled = true;
    };
  }, []);


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Layout
        role="doctor"
        name={doctorName}
        title="Reports"
        subtitle="Practice analytics and insights"
      >
        <div
          style={{
            textAlign: 'center',
            padding: 80,
            color: MUTED,
            fontSize: 15,
            fontFamily: FONT_FAMILY,
          }}
        >
          <LoaderCircle
            size={30}
            color={BLUE}
            strokeWidth={2}
            style={{
              animation:
                'reports-spin 1s linear infinite',
              marginBottom: 12,
            }}
          />

          <div>
            Loading reports...
          </div>

          <style>
            {`
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

              @keyframes reports-spin {
                from {
                  transform: rotate(0deg);
                }

                to {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
        </div>
      </Layout>
    );
  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <Layout
        role="doctor"
        name={doctorName}
        title="Reports"
        subtitle="Practice analytics and insights"
      >
        <div
          style={{
            fontFamily: FONT_FAMILY,
          }}
        >
          <div
            className="alert alert-error"
            style={{
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 9,
            }}
          >
            <CircleAlert
              size={18}
              strokeWidth={2}
            />

            <span>{error}</span>
          </div>

          <div
            className="form-card"
            style={{
              textAlign: 'center',
              padding: 40,
              background: WHITE,
              border: `1px solid ${BORDER}`,
            }}
          >
            <BarChart3
              size={48}
              color={BLUE}
              strokeWidth={1.5}
              style={{
                marginBottom: 14,
              }}
            />

            <h3
              style={{
                marginBottom: 8,
                color: NAVY,
                fontFamily: FONT_FAMILY,
              }}
            >
              Reports could not be loaded
            </h3>

            <p
              style={{
                color: MUTED,
                marginBottom: 20,
                fontFamily: FONT_FAMILY,
                fontSize: 13,
              }}
            >
              Please make sure the backend reports
              API is running and the doctor is logged
              in.
            </p>

            <button
              type="button"
              className="btn-generate"
              onClick={() =>
                window.location.reload()
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <RefreshCw
                size={16}
                strokeWidth={2}
              />

              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }


  // ============================================================
  // SAFE DATA
  // ============================================================

  const safeData =
    data || DEFAULT_REPORT_DATA;

  const summary =
    safeData.summary ||
    DEFAULT_REPORT_DATA.summary;

  const appointment_status =
    safeData.appointment_status ||
    DEFAULT_REPORT_DATA.appointment_status;

  const patient_gender =
    safeData.patient_gender ||
    DEFAULT_REPORT_DATA.patient_gender;

  const top_medicines =
    Array.isArray(
      safeData.top_medicines
    )
      ? safeData.top_medicines
      : [];

  const recent_appointments =
    Array.isArray(
      safeData.recent_appointments
    )
      ? safeData.recent_appointments
      : [];

  const totalApptStatus =
    Object.values(
      appointment_status
    ).reduce(
      (sum, value) =>
        sum + Number(value || 0),
      0
    );


  // ============================================================
  // APPOINTMENT STATUS BADGE
  // ============================================================

  function apptStatusBadge(status) {
    const normalizedStatus =
      String(status || 'Pending');

    const map = {
      Pending: {
        className: 'badge-pending',
        icon: Clock3,
      },

      Completed: {
        className: 'badge-completed',
        icon: CheckCircle2,
      },

      Cancelled: {
        className: 'badge-cancelled',
        icon: XCircle,
      },

      'In Progress': {
        className: 'badge-inprogress',
        icon: LoaderCircle,
      },

      InProgress: {
        className: 'badge-inprogress',
        icon: LoaderCircle,
      },

      completed: {
        className: 'badge-completed',
        icon: CheckCircle2,
      },

      pending: {
        className: 'badge-pending',
        icon: Clock3,
      },

      cancelled: {
        className: 'badge-cancelled',
        icon: XCircle,
      },

      inprogress: {
        className: 'badge-inprogress',
        icon: LoaderCircle,
      },
    };

    const config =
      map[normalizedStatus] ||
      map.Pending;

    const StatusIcon =
      config.icon;

    return (
      <span
        className={`badge ${config.className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: FONT_FAMILY,
          color: NAVY,
          background: '#f8fafc',
          border: `1px solid ${BORDER}`,
        }}
      >
        <StatusIcon
          size={13}
          strokeWidth={2}
        />

        {normalizedStatus}
      </span>
    );
  }


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Layout
      role="doctor"
      name={doctorName}
      title="Reports"
      subtitle="Practice analytics and insights"
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

          .reports-page,
          .reports-page * {
            font-family: 'Poppins', sans-serif;
          }

          /* =====================================================
             GLOBAL REPORT CARD STYLE
          ===================================================== */

          .reports-page .stat-card,
          .reports-page .form-card,
          .reports-page .table-box {
            background: #ffffff !important;
            border: 1px solid #dbe4ef !important;
            box-shadow: 0 4px 18px rgba(15, 39, 71, 0.06) !important;
          }

          .reports-page .stat-card:hover,
          .reports-page .form-card:hover,
          .reports-page .table-box:hover {
            box-shadow: 0 8px 24px rgba(15, 39, 71, 0.10) !important;
          }

          /* =====================================================
             SUMMARY CARDS
          ===================================================== */

          .reports-page .stat-card.blue,
          .reports-page .stat-card.green,
          .reports-page .stat-card.orange,
          .reports-page .stat-card.purple {
            background: #ffffff !important;
            border-color: #dbe4ef !important;
          }

          .reports-page .stat-info h2 {
            color: #0f2747 !important;
          }

          .reports-page .stat-info p {
            color: #64748b !important;
          }

          /* =====================================================
             STAT ICON CONTAINER
          ===================================================== */

          .reports-page .stat-icon {
            background: #eff6ff !important;
            border: 1px solid #dbeafe !important;
          }

          /* =====================================================
             STATUS BADGES
          ===================================================== */

          .reports-page .badge,
          .reports-page .badge-pending,
          .reports-page .badge-completed,
          .reports-page .badge-cancelled,
          .reports-page .badge-inprogress {
            color: #0f2747 !important;
            background: #f8fafc !important;
            border-color: #dbe4ef !important;
          }

          /* =====================================================
             TABLE
          ===================================================== */

          .reports-page .table-header h2 {
            color: #0f2747 !important;
          }

          .reports-page table th {
            color: #0f2747 !important;
          }

          .reports-page table td {
            color: #475569;
          }

          .reports-page .table-header a {
            color: #2563eb !important;
          }

          /* =====================================================
             STAT ICON HOVER
          ===================================================== */

          .reports-page .report-stat-icon {
            transition: transform 0.2s ease;
          }

          .reports-page .stat-card:hover .report-stat-icon {
            transform: scale(1.06);
          }

          /* =====================================================
             NAVY SUMMARY BOXES
          ===================================================== */

          .reports-page .navy-summary-box {
            background: #0f2747 !important;
            color: #ffffff !important;
            border: 1px solid #0f2747 !important;
          }

          .reports-page .navy-summary-box * {
            color: #ffffff !important;
          }

          /* =====================================================
             NAVY REVENUE BOXES
          ===================================================== */

          .reports-page .navy-revenue-box {
            background: #0f2747 !important;
            color: #ffffff !important;
            border: 1px solid #0f2747 !important;
          }

          .reports-page .navy-revenue-box * {
            color: #ffffff !important;
          }

          /* =====================================================
             NAVY MINI BOX
          ===================================================== */

          .reports-page .navy-mini-box {
            background: #0f2747 !important;
            color: #ffffff !important;
            border: 1px solid #0f2747 !important;
          }

          .reports-page .navy-mini-box * {
            color: #ffffff !important;
          }

          /* =====================================================
             RESPONSIVE
          ===================================================== */

          @media (max-width: 768px) {
            .reports-page .two-col {
              grid-template-columns: 1fr !important;
            }

            .reports-page .cards-grid {
              grid-template-columns: 1fr 1fr !important;
            }
          }

          @media (max-width: 520px) {
            .reports-page .cards-grid {
              grid-template-columns: 1fr !important;
            }

            .reports-page .two-col {
              grid-template-columns: 1fr !important;
            }

            .reports-page table {
              min-width: 720px;
            }

            .reports-page .table-box {
              overflow-x: auto;
            }
          }
        `}
      </style>

      <div
        className="reports-page"
        style={{
          color: NAVY,
          fontFamily: FONT_FAMILY,
        }}
      >

        {/* ======================================================
            SUMMARY CARDS
        ====================================================== */}

        <div
          className="cards-grid"
          style={{
            marginBottom: 26,
          }}
        >

          {/* TOTAL PATIENTS */}

          <div
            className="stat-card blue"
            style={{
              position: 'relative',
            }}
          >
            <div
              className="stat-icon report-stat-icon"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users
                size={23}
                strokeWidth={2}
                color={BLUE}
              />
            </div>

            <div className="stat-info">
              <h2
                style={{
                  color: NAVY,
                  fontFamily: FONT_FAMILY,
                }}
              >
                {summary.total_patients}
              </h2>

              <p
                style={{
                  fontFamily: FONT_FAMILY,
                }}
              >
                Total Patients
              </p>
            </div>
          </div>


          {/* APPOINTMENTS */}

          <div
            className="stat-card green"
          >
            <div
              className="stat-icon report-stat-icon"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarDays
                size={23}
                strokeWidth={2}
                color={BLUE}
              />
            </div>

            <div className="stat-info">
              <h2
                style={{
                  color: NAVY,
                  fontFamily: FONT_FAMILY,
                }}
              >
                {summary.total_appointments}
              </h2>

              <p
                style={{
                  fontFamily: FONT_FAMILY,
                }}
              >
                Appointments
              </p>
            </div>
          </div>


          {/* CONSULTATIONS */}

          <div
            className="stat-card orange"
          >
            <div
              className="stat-icon report-stat-icon"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stethoscope
                size={23}
                strokeWidth={2}
                color={BLUE}
              />
            </div>

            <div className="stat-info">
              <h2
                style={{
                  color: NAVY,
                  fontFamily: FONT_FAMILY,
                }}
              >
                {summary.total_consultations}
              </h2>

              <p
                style={{
                  fontFamily: FONT_FAMILY,
                }}
              >
                Consultations
              </p>
            </div>
          </div>


          {/* REVENUE */}

          <div
            className="stat-card purple"
          >
            <div
              className="stat-icon report-stat-icon"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IndianRupee
                size={23}
                strokeWidth={2}
                color={BLUE}
              />
            </div>

            <div className="stat-info">
              <h2
                style={{
                  color: NAVY,
                  fontFamily: FONT_FAMILY,
                }}
              >
                ₹
                {Number(
                  summary.total_revenue || 0
                ).toLocaleString('en-IN')}
              </h2>

              <p
                style={{
                  fontFamily: FONT_FAMILY,
                }}
              >
                Revenue Collected
              </p>
            </div>
          </div>

        </div>


        {/* ======================================================
            ROW 1
        ====================================================== */}

        <div
          className="two-col"
          style={{
            marginBottom: 24,
          }}
        >

          {/* APPOINTMENT STATUS */}

          <div
            className="form-card"
            style={{
              marginBottom: 0,
              fontFamily: FONT_FAMILY,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: NAVY,
                marginBottom: 22,
                display: 'flex',
                alignItems: 'center',
                gap: 9,
              }}
            >
              <CalendarDays
                size={18}
                color={BLUE}
                strokeWidth={2}
              />

              Appointment Status
            </h3>

            <BarRow
              label="Completed"
              value={
                appointment_status.completed
              }
              max={totalApptStatus}
            />

            <BarRow
              label="Pending / Waiting"
              value={
                appointment_status.pending
              }
              max={totalApptStatus}
            />

            <BarRow
              label="In Progress"
              value={
                appointment_status.inprogress
              }
              max={totalApptStatus}
            />

            <BarRow
              label="Cancelled"
              value={
                appointment_status.cancelled
              }
              max={totalApptStatus}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(4, 1fr)',
                gap: 8,
                marginTop: 20,
                paddingTop: 16,
                borderTop:
                  `1px solid ${BORDER}`,
              }}
            >
              {[
                {
                  label: 'Total',
                  value: totalApptStatus,
                },

                {
                  label: 'Completed',
                  value:
                    appointment_status.completed,
                },

                {
                  label: 'Pending',
                  value:
                    appointment_status.pending,
                },

                {
                  label: 'Cancelled',
                  value:
                    appointment_status.cancelled,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="navy-summary-box"
                  style={{
                    borderRadius: 10,
                    padding: '11px 8px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: WHITE,
                    }}
                  >
                    {item.value}
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      color: WHITE,
                      marginTop: 3,
                      fontWeight: 500,
                      opacity: 0.92,
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* PATIENT GENDER */}

          <div
            className="form-card"
            style={{
              marginBottom: 0,
              fontFamily: FONT_FAMILY,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: NAVY,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 9,
              }}
            >
              <Users
                size={18}
                color={BLUE}
                strokeWidth={2}
              />

              Patient Distribution
            </h3>

            <DonutChart
  segments={[
    {
      label: 'Male',
      value: patient_gender.male,
      color: NAVY,
    },
    {
      label: 'Female',
      value: patient_gender.female,
      color: NAVY,
    },
    {
      label: 'Other',
      value: patient_gender.other,
      color: NAVY,
    },
  ]}
/>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(3, 1fr)',
                gap: 10,
                marginTop: 22,
                paddingTop: 16,
                borderTop:
                  `1px solid ${BORDER}`,
              }}
            >
              {[
                {
                  label: 'Male',
                  value:
                    patient_gender.male,
                },

                {
                  label: 'Female',
                  value:
                    patient_gender.female,
                },

                {
                  label: 'Other',
                  value:
                    patient_gender.other,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="navy-summary-box"
                  style={{
                    borderRadius: 10,
                    padding: '11px 8px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: WHITE,
                    }}
                  >
                    {item.value}
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      color: WHITE,
                      marginTop: 3,
                      fontWeight: 500,
                      opacity: 0.92,
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>


        {/* ======================================================
            ROW 2
        ====================================================== */}

        <div
          className="two-col"
          style={{
            marginBottom: 24,
          }}
        >

          {/* REVENUE */}

          <div
            className="form-card"
            style={{
              marginBottom: 0,
              fontFamily: FONT_FAMILY,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: NAVY,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 9,
              }}
            >
              <Wallet
                size={18}
                color={BLUE}
                strokeWidth={2}
              />

              Revenue Summary
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: 14,
                marginBottom: 22,
              }}
            >

              {/* COLLECTED */}

              <div
                className="navy-revenue-box"
                style={{
                  borderRadius: 14,
                  padding: '19px 18px',
                  color: WHITE,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    fontSize: 11,
                    fontWeight: 700,
                    opacity: 0.92,
                    marginBottom: 7,
                    textTransform:
                      'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  <CheckCircle2
                    size={14}
                    strokeWidth={2}
                  />

                  Collected
                </div>

                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: WHITE,
                  }}
                >
                  ₹
                  {Number(
                    summary.total_revenue || 0
                  ).toLocaleString(
                    'en-IN',
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </div>
              </div>


              {/* PENDING */}

              <div
                className="navy-revenue-box"
                style={{
                  borderRadius: 14,
                  padding: '19px 18px',
                  color: WHITE,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    fontSize: 11,
                    fontWeight: 700,
                    opacity: 0.92,
                    marginBottom: 7,
                    textTransform:
                      'uppercase',
                    letterSpacing: 0.8,
                  }}
                >
                  <Clock3
                    size={14}
                    strokeWidth={2}
                  />

                  Pending
                </div>

                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: WHITE,
                  }}
                >
                  ₹
                  {Number(
                    summary.pending_revenue || 0
                  ).toLocaleString(
                    'en-IN',
                    {
                      minimumFractionDigits: 2,
                    }
                  )}
                </div>
              </div>

            </div>


            {/* COLLECTION RATE */}

            {(() => {
              const totalRev =
                Number(
                  summary.total_revenue || 0
                ) +
                Number(
                  summary.pending_revenue || 0
                );

              const collectedPct =
                totalRev > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (Number(
                          summary.total_revenue ||
                            0
                        ) /
                          totalRev) *
                          100
                      )
                    )
                  : 0;

              return (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      marginBottom: 8,
                      fontSize: 13,
                      color: NAVY,
                    }}
                  >
                    <span>
                      Collection Rate
                    </span>

                    <span
                      style={{
                        fontWeight: 700,
                        color: NAVY,
                      }}
                    >
                      {collectedPct}%
                    </span>
                  </div>

                  <div
                    style={{
                      background:
                        '#e9eef5',
                      borderRadius: 20,
                      height: 10,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${collectedPct}%`,
                        height: '100%',
                        background: NAVY,
                        borderRadius: 20,
                        transition:
                          'width 0.6s ease',
                        minWidth:
                          Number(
                            summary.total_revenue ||
                              0
                          ) > 0
                            ? 8
                            : 0,
                      }}
                    />
                  </div>
                </>
              );
            })()}


            {/* TOTAL BILLS / CONSULTATIONS */}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: 10,
                marginTop: 18,
                paddingTop: 16,
                borderTop:
                  `1px solid ${BORDER}`,
              }}
            >
              {[
                {
                  label: 'Total Bills',
                  value:
                    summary.total_bills,
                  Icon: ReceiptText,
                },

                {
                  label: 'Consultations',
                  value:
                    summary.total_consultations,
                  Icon: Stethoscope,
                },
              ].map((item) => {
                const ItemIcon =
                  item.Icon;

                return (
                  <div
                    key={item.label}
                    className="navy-mini-box"
                    style={{
                      borderRadius: 10,
                      padding: 12,
                      textAlign: 'center',
                    }}
                  >
                    <ItemIcon
                      size={17}
                      color={WHITE}
                      strokeWidth={2}
                      style={{
                        marginBottom: 4,
                      }}
                    />

                    <div
                      style={{
                        fontSize: 21,
                        fontWeight: 800,
                        color: WHITE,
                      }}
                    >
                      {item.value}
                    </div>

                    <div
                      style={{
                        fontSize: 10,
                        color: WHITE,
                        marginTop: 2,
                        fontWeight: 500,
                        opacity: 0.92,
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* TOP MEDICINES */}

          <div
            className="form-card"
            style={{
              marginBottom: 0,
              fontFamily: FONT_FAMILY,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: NAVY,
                marginBottom: 17,
                display: 'flex',
                alignItems: 'center',
                gap: 9,
              }}
            >
              <Pill
                size={18}
                color={BLUE}
                strokeWidth={2}
              />

              Top Prescribed Medicines
            </h3>

            {top_medicines.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '32px 0',
                  color: '#94a3b8',
                }}
              >
                <Pill
                  size={36}
                  color="#cbd5e1"
                  strokeWidth={1.5}
                  style={{
                    marginBottom: 9,
                  }}
                />

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  No prescriptions yet.
                </div>
              </div>
            ) : (
              top_medicines.map(
                (medicine, index) => {
                  const maxCount =
                    Number(
                      top_medicines[0]?.count ||
                        0
                    );

                  const medicineCount =
                    Number(
                      medicine?.count || 0
                    );

                  const pct =
                    maxCount > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (medicineCount /
                              maxCount) *
                              100
                          )
                        )
                      : 0;

                  const isInjection =
                    String(
                      medicine?.medicine_type ||
                        ''
                    ).toLowerCase() ===
                    'injection';

                  return (
                    <div
                      key={`${medicine?.medicine_name || 'medicine'}-${index}`}
                      style={{
                        marginBottom: 13,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'space-between',
                          gap: 10,
                          marginBottom: 5,
                        }}
                      >

                        <div
                          style={{
                            display: 'flex',
                            alignItems:
                              'center',
                            gap: 8,
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              width: 27,
                              height: 27,
                              borderRadius:
                                '8px',
                              background:
                                '#eff6ff',
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'center',
                              flexShrink: 0,
                            }}
                          >
                            {isInjection ? (
                              <Syringe
                                size={14}
                                color="#a855f7"
                                strokeWidth={2}
                              />
                            ) : (
                              <Pill
                                size={14}
                                color={BLUE}
                                strokeWidth={2}
                              />
                            )}
                          </span>

                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: NAVY,
                              overflow:
                                'hidden',
                              textOverflow:
                                'ellipsis',
                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {
                              medicine?.medicine_name
                            }
                          </span>

                          {isInjection && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                padding:
                                  '2px 7px',
                                background:
                                  '#f8fafc',
                                color:
                                  NAVY,
                                borderRadius: 10,
                                border:
                                  `1px solid ${BORDER}`,
                                flexShrink: 0,
                              }}
                            >
                              Injection
                            </span>
                          )}
                        </div>

                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: NAVY,
                            flexShrink: 0,
                          }}
                        >
                          {medicineCount}x
                        </span>
                      </div>

                      <div
                        style={{
                          background:
                            '#e9eef5',
                          borderRadius: 20,
                          height: 6,
                          overflow:
                            'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: NAVY,
                            borderRadius: 20,
                            transition:
                              'width 0.6s ease',
                            minWidth:
                              medicineCount >
                              0
                                ? 6
                                : 0,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>

        </div>


        {/* ======================================================
            RECENT APPOINTMENTS
        ====================================================== */}

        <div
          className="table-box"
          style={{
            fontFamily: FONT_FAMILY,
          }}
        >
          <div className="table-header">
            <h2
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                color: NAVY,
                fontFamily: FONT_FAMILY,
              }}
            >
              <ClipboardList
                size={19}
                color={BLUE}
                strokeWidth={2}
              />

              Recent Appointments
            </h2>

            <a
              href="/doctor/appointments"
              style={{
                fontSize: 12,
                color: BLUE,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontFamily: FONT_FAMILY,
              }}
              onClick={(event) => {
                event.preventDefault();

                window.location.href =
                  '/doctor/appointments';
              }}
            >
              View All

              <ArrowRight
                size={14}
                strokeWidth={2}
              />
            </a>
          </div>


          <table>
            <thead>
              <tr>
                <th>#</th>

                <th>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <UserRound
                      size={13}
                      color={BLUE}
                    />

                    Patient
                  </span>
                </th>

                <th>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <CalendarDays
                      size={13}
                      color={BLUE}
                    />

                    Date
                  </span>
                </th>

                <th>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Clock3
                      size={13}
                      color={BLUE}
                    />

                    Time
                  </span>
                </th>

                <th>
                  Type
                </th>

                <th>
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {recent_appointments.length ===
              0 ? (
                <tr>
                  <td colSpan={6}>
                    <div
                      className="empty-state"
                      style={{
                        fontFamily:
                          FONT_FAMILY,
                      }}
                    >
                      <span
                        className="empty-icon"
                        style={{
                          display: 'inline-flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                        }}
                      >
                        <CalendarDays
                          size={30}
                          color="#94a3b8"
                          strokeWidth={1.6}
                        />
                      </span>

                      No appointments yet.
                    </div>
                  </td>
                </tr>
              ) : (
                recent_appointments.map(
                  (
                    appointment,
                    index
                  ) => (
                    <tr
                      key={
                        appointment?.id ||
                        `appointment-${index}`
                      }
                    >
                      <td
                        style={{
                          color:
                            '#94a3b8',
                          fontWeight: 600,
                        }}
                      >
                        {index + 1}
                      </td>

                      <td
                        style={{
                          fontWeight: 700,
                          color: NAVY,
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems:
                              'center',
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius:
                                '50%',
                              background:
                                LIGHT_BLUE,
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'center',
                              flexShrink: 0,
                            }}
                          >
                            <UserRound
                              size={14}
                              color={BLUE}
                              strokeWidth={
                                2
                              }
                            />
                          </span>

                          {
                            appointment?.patient_name
                          }
                        </span>
                      </td>

                      <td
                        style={{
                          color:
                            '#475569',
                        }}
                      >
                        {appointment?.appointment_date
                          ? displayDate(
                              appointment.appointment_date
                            )
                          : '-'}
                      </td>

                      <td
                        style={{
                          color:
                            '#475569',
                        }}
                      >
                        {appointment?.appointment_time
                          ? displayTime(
                              appointment.appointment_time
                            )
                          : '-'}
                      </td>

                      <td>
                        <span
                          style={{
                            display:
                              'inline-flex',
                            alignItems:
                              'center',
                            gap: 5,
                            fontSize: 11,
                            fontWeight: 600,
                            background:
                              '#f8fafc',
                            color:
                              NAVY,
                            padding:
                              '4px 10px',
                            borderRadius:
                              20,
                            border:
                              `1px solid ${BORDER}`,
                          }}
                        >
                          <Activity
                            size={11}
                            color={BLUE}
                            strokeWidth={
                              2
                            }
                          />

                          {
                            appointment?.type ||
                            'General'
                          }
                        </span>
                      </td>

                      <td>
                        {apptStatusBadge(
                          appointment?.status
                        )}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

      </div>
    </Layout>
  );
}