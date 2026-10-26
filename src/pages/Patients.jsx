import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../data/mockData';
import ConfirmModal from '../components/ConfirmModal';
import { UserRound, UserRoundCheck } from 'lucide-react';

import { API, getToken } from '../api';

/* ============================================================
   PROFESSIONAL MEDICAL ICONS
   ============================================================ */

function Icon({
  name,
  size = 18,
  strokeWidth = 2,
  className = '',
  style = {}
}) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    style,
    'aria-hidden': true
  };

  switch (name) {
    case 'users':
      return (
        <svg {...commonProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case 'male':
      return (
        <svg {...commonProps}>
          <circle cx="10" cy="14" r="5" />
          <path d="M15 9l6-6" />
          <path d="M16 3h5v5" />
          <path d="M10 9v10" />
          <path d="M6 14h8" />
        </svg>
      );

    case 'female':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="8" r="5" />
          <path d="M12 13v8" />
          <path d="M8 18h8" />
        </svg>
      );

    case 'userPlus':
      return (
        <svg {...commonProps}>
          <path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8" cy="7" r="4" />
          <path d="M19 8v6" />
          <path d="M16 11h6" />
        </svg>
      );

    case 'hash':
      return (
        <svg {...commonProps}>
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
      );

    case 'search':
      return (
        <svg {...commonProps}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    case 'x':
      return (
        <svg {...commonProps}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );

    case 'check':
      return (
        <svg {...commonProps}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case 'alert':
      return (
        <svg {...commonProps}>
          <path d="M10.3 3.3 2.1 17a2 2 0 0 0 1.7 3h16.4a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      );

    case 'copy':
      return (
        <svg {...commonProps}>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );

    case 'trash':
      return (
        <svg {...commonProps}>
          <path d="M3 6h18" />
          <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
          <path d="M19 6l-1 15H6L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      );

    case 'prescription':
      return (
        <svg {...commonProps}>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M9 6h6" />
          <path d="M9 10h6" />
          <path d="m9 14 6 5" />
          <path d="m15 14-6 5" />
        </svg>
      );

    default:
      return null;
  }
}

export default function Patients() {
  const { user } = useAuth();
  const doctorName =
    user?.full_name ||
    user?.fullName ||
    'Doctor';

  const [patients, setPatients] = useState([]);
const [allPatientTokens, setAllPatientTokens] = useState([]);
  const [stats, setStats] = useState({
    total_all: 0,
    total_male: 0,
    total_female: 0
  });

  // Existing patient search
  const [search, setSearch] = useState('');

  // ============================================================
  // TOKEN SEARCH
  // ============================================================

  const [patientId, setPatientId] = useState('');
  const [searchedPatient, setSearchedPatient] = useState(null);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [assigningPatient, setAssigningPatient] = useState(false);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [copiedToken, setCopiedToken] = useState('');

  // ============================================================
  // GET PATIENT TOKEN
  // IMPORTANT:
  // Patient ID generated during registration is the token.
  // ============================================================
function getPatientToken(patient) {
  if (!patient) {
    return '';
  }

  return patient.patient_id || patient.token || '';
}
  // ============================================================
  // FETCH PATIENTS
  // ============================================================

  async function fetchPatients(q = '') {
    setLoading(true);
    setError('');

    try {
      const url = q
        ? `${API}/patients?search=${encodeURIComponent(q)}`
        : `${API}/patients`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      const data = await res.json();

      if (data.success) {
        const fetchedPatients = Array.isArray(
          data.data?.patients
        )
          ? data.data.patients
          : [];

        setPatients(fetchedPatients);

        if (!q) {
          setStats({
            total_all: Number(
              data.data?.total_all || 0
            ),
            total_male: Number(
              data.data?.total_male || 0
            ),
            total_female: Number(
              data.data?.total_female || 0
            )
          });
        }
      } else {
        setError(
          data.message ||
            'Unable to load patients.'
        );
      }
    } catch (err) {
      console.error(
        'Fetch patients error:',
        err
      );

      setError(
        'Unable to connect to server.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllPatientTokens() {
  try {
    const res = await fetch(
      `${API}/patients/tokens`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    );

    const data = await res.json();

    if (data.success) {
      setAllPatientTokens(
        Array.isArray(data.data?.patients)
          ? data.data.patients
          : []
      );
    } else {
      console.error(
        'Unable to load patient tokens:',
        data.message
      );
    }
  } catch (err) {
    console.error(
      'Fetch patient tokens error:',
      err
    );
  }
}

  useEffect(() => {
  fetchPatients();
  fetchAllPatientTokens();
}, []);

  // ============================================================
  // ALL PATIENT TOKENS
  // ============================================================

  const patientTokens = useMemo(() => {
  return allPatientTokens
    .map((patient) => {
      const token =
        patient.patient_id ||
        patient.token ||
        '';

      if (!token) {
        return null;
      }

      return {
        token: String(token),

        patientId:
          patient.patient_id ||
          patient.token ||
          '-',

        patientName:
          patient.full_name ||
          patient.fullName ||
          'Unknown Patient',

        patientDbId:
          patient.id ||
          patient._id ||
          patient.patient_id
      };
    })
    .filter(Boolean);
}, [allPatientTokens]);

  // ============================================================
  // COPY TOKEN
  // ============================================================

  async function copyToken(token) {
    try {
      await navigator.clipboard.writeText(
        String(token)
      );

      setCopiedToken(String(token));

      setTimeout(() => {
        setCopiedToken('');
      }, 2000);
    } catch (err) {
      console.error(
        'Unable to copy token:',
        err
      );

      setError(
        'Unable to copy token.'
      );

      setTimeout(() => {
        setError('');
      }, 2500);
    }
  }

  // ============================================================
  // EXISTING PATIENT SEARCH
  // ============================================================

  function handleSearch(e) {
    e.preventDefault();

    setError('');

    fetchPatients(search);
  }

  function clearSearch() {
    setSearch('');
    setError('');

    fetchPatients('');
  }

  // ============================================================
  // SEARCH PATIENT BY TOKEN
  // ============================================================
  // IMPORTANT:
  // This is NOT /patients/search/:id anymore.
  // Patient registration ID is searched as a token.
  // ============================================================

  async function handleTokenSearch(e) {
    e.preventDefault();

    setError('');
    setSuccess('');
    setSearchedPatient(null);

    const cleanToken =
      patientId.trim().toUpperCase();

    if (!cleanToken) {
      setError(
        'Please enter a Patient Token.'
      );
      return;
    }

    setSearchingPatient(true);

    try {
      const res = await fetch(
        `${API}/patients/search/${encodeURIComponent(
          cleanToken
        )}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      const data = await res.json();

      if (
        data.success &&
        data.data?.patient
      ) {
        setSearchedPatient(
          data.data.patient
        );
      } else {
        setError(
          data.message ||
            'Patient not found for this token.'
        );
      }
    } catch (err) {
      console.error(
        'Token search error:',
        err
      );

      setError(
        'Unable to search patient. Please try again.'
      );
    } finally {
      setSearchingPatient(false);
    }
  }

  // ============================================================
  // ASSIGN PATIENT TO DOCTOR
  // ============================================================

  async function handleAssignPatient() {
    if (!searchedPatient) {
      return;
    }

    setAssigningPatient(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        `${API}/patients/assign`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            patientId:
              searchedPatient.patient_id ||
              searchedPatient.id
          })
        }
      );

      const data = await res.json();

      if (data.success) {
        setSuccess(
          data.message ||
            'Patient added successfully to your patient list.'
        );

        setSearchedPatient(null);
        setPatientId('');

      await fetchPatients('');
await fetchAllPatientTokens();
        setTimeout(() => {
          setSuccess('');
        }, 4000);
      } else {
        if (data.data?.patient) {
          setSearchedPatient(
            data.data.patient
          );
        }

        setError(
          data.message ||
            'Unable to add patient.'
        );
      }
    } catch (err) {
      console.error(
        'Assign patient error:',
        err
      );

      setError(
        'Unable to connect to server.'
      );
    } finally {
      setAssigningPatient(false);
    }
  }

  // ============================================================
  // CLEAR TOKEN SEARCH
  // ============================================================

  function clearPatientIdSearch() {
    setPatientId('');
    setSearchedPatient(null);
    setError('');
    setSuccess('');
  }

  // ============================================================
  // DELETE PATIENT
  // ============================================================

  function handleDelete(id, name) {
    setDeleteTarget({
      id,
      name
    });

    setConfirmOpen(true);
  }

  async function doDelete() {
    setConfirmOpen(false);

    if (!deleteTarget) {
      return;
    }

    try {
      const res = await fetch(
        `${API}/patients/${deleteTarget.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      const data = await res.json();

      if (data.success) {
        setPatients((prev) =>
          prev.filter(
            (p) =>
              p.id !== deleteTarget.id &&
              p._id !== deleteTarget.id
          )
        );
 await fetchAllPatientTokens();
        setStats((prev) => ({
          ...prev,
          total_all: Math.max(
            0,
            prev.total_all - 1
          )
        }));

        setSuccess(
          data.message ||
            'Patient removed successfully!'
        );

        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(
          data.message ||
            'Unable to remove patient.'
        );
      }
    } catch (err) {
      console.error(
        'Delete patient error:',
        err
      );

      setError(
        'Unable to connect to server.'
      );
    }

    setDeleteTarget(null);
  }

  // ============================================================
  // UI HELPERS
  // ============================================================

  function avatarClass() {
    return 'pat-avatar';
  }

  function genderBadge(gender) {
    if (gender === 'Male') {
      return (
        <span className="badge badge-male">
          Male
        </span>
      );
    }

    if (gender === 'Female') {
      return (
        <span className="badge badge-female">
          Female
        </span>
      );
    }

    return (
      <span className="badge badge-other">
        Other
      </span>
    );
  }

  // ============================================================
  // NAVY ICON
  // ============================================================

  const navyIconStyle = {
    color: '#0f2a52',
    fontSize: 18,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    verticalAlign: 'middle'
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Layout
      role="doctor"
      name={doctorName}
      title="Patients"
      subtitle="View and manage your patients"
    >
      {/* ======================================================
          ALERTS
      ====================================================== */}

      {success && (
        <div
          className="alert alert-success"
          style={{
            borderLeft:
              '4px solid #0f2a52'
          }}
        >
          <span style={navyIconStyle}>
            <Icon
              name="check"
              size={18}
            />
          </span>{' '}
          {success}
        </div>
      )}

      {error && (
        <div
          className="alert"
          style={{
            background: '#f8fafc',
            color: '#0f2a52',
            border:
              '1px solid #cbd5e1',
            borderLeft:
              '4px solid #0f2a52',
            marginBottom: 16
          }}
        >
          <span style={navyIconStyle}>
            <Icon
              name="alert"
              size={18}
            />
          </span>{' '}
          {error}
        </div>
      )}

      {/* ======================================================
          STATS
      ====================================================== */}

      <div className="page-stats">
        <div
          className="stat-card blue"
          style={{
            borderRadius: 12,
            padding: '20px 24px',
            borderTop:
              '3px solid #0f2a52'
          }}
        >
          <div
            className="stat-icon"
            style={{
              color: '#0f2a52',
              background: '#eef3f8'
            }}
          >
            <Icon
              name="users"
              size={21}
            />
          </div>

          <div className="stat-info">
            <h2
              style={{
                color: '#0f2a52'
              }}
            >
              {stats.total_all}
            </h2>

            <p>My Patients</p>
          </div>
        </div>

        <div
          className="stat-card green"
          style={{
            borderRadius: 12,
            padding: '20px 24px',
            borderTop:
              '3px solid #0f2a52'
          }}
        >
          <div
            className="stat-icon"
            style={{
              color: '#0f2a52',
              background: '#eef3f8'
            }}
          >
            <UserRound
              size={22}
              strokeWidth={2}
            />
          </div>

          <div className="stat-info">
            <h2
              style={{
                color: '#0f2a52'
              }}
            >
              {stats.total_male}
            </h2>

            <p>Male Patients</p>
          </div>
        </div>

        <div
          className="stat-card purple"
          style={{
            borderRadius: 12,
            padding: '20px 24px',
            borderTop:
              '3px solid #0f2a52'
          }}
        >
          <div
            className="stat-icon"
            style={{
              color: '#0f2a52',
              background: '#eef3f8'
            }}
          >
            <UserRoundCheck
              size={22}
              strokeWidth={2}
            />
          </div>

          <div className="stat-info">
            <h2
              style={{
                color: '#0f2a52'
              }}
            >
              {stats.total_female}
            </h2>

            <p>Female Patients</p>
          </div>
        </div>
      </div>

      {/* ======================================================
          ADD EXISTING PATIENT / SEARCH TOKEN
      ====================================================== */}

      <div
        style={{
          background: '#ffffff',
          border:
            '1px solid #dbe3ec',
          borderRadius: 14,
          padding: 24,
          marginBottom: 24,
          boxShadow:
            '0 2px 8px rgba(15, 23, 42, 0.04)'
        }}
      >
        <div
          style={{
            marginBottom: 16
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              color: '#0f2a52',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span
              style={{
                color: '#0f2a52',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              <Icon
                name="userPlus"
                size={20}
              />
            </span>

            Add Existing Patient
          </h2>

          <p
            style={{
              margin:
                '6px 0 0',
              color: '#64748b',
              fontSize: 13
            }}
          >
            Search using the Patient Token provided after registration.
          </p>
        </div>

        <form
          onSubmit={handleTokenSearch}
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <input
            type="text"
            value={patientId}
            onChange={(e) =>
              setPatientId(
                e.target.value
              )
            }
            placeholder="Enter Patient Token e.g. PAT-862934"
            style={{
              flex: 1,
              minWidth: 260,
              height: 44,
              padding: '0 14px',
              border:
                '1px solid #cbd5e1',
              borderRadius: 8,
              outline: 'none',
              fontSize: 14,
              color: '#0f2a52'
            }}
          />

          <button
            type="submit"
            className="btn-search"
            disabled={
              searchingPatient
            }
            style={{
              height: 44,
              padding:
                '0 20px',
              borderRadius: 8,
              border: 'none',
              background: '#0f2a52',
              color: '#ffffff',
              cursor:
                searchingPatient
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                searchingPatient
                  ? 0.7
                  : 1,
              display:
                'inline-flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              gap: 7
            }}
          >
            <Icon
              name="search"
              size={16}
            />

            {searchingPatient
              ? 'Searching...'
              : 'Search Token'}
          </button>

          {(patientId ||
            searchedPatient) && (
            <button
              type="button"
              onClick={
                clearPatientIdSearch
              }
              style={{
                height: 44,
                padding:
                  '0 14px',
                background:
                  'none',
                border: 'none',
                color: '#0f2a52',
                fontWeight: 600,
                cursor: 'pointer',
                display:
                  'inline-flex',
                alignItems:
                  'center',
                gap: 5
              }}
            >
              <Icon
                name="x"
                size={15}
              />
              Clear
            </button>
          )}
        </form>

        {/* ==================================================
            SEARCHED PATIENT RESULT
        ================================================== */}

        {searchedPatient && (
          <div
            style={{
              marginTop: 20,
              padding: 18,
              borderRadius: 12,
              background:
                '#f8fafc',
              border:
                '1px solid #cbd8e6'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'flex-start',
                gap: 20,
                flexWrap:
                  'wrap'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: 14
                }}
              >
                <div
                  className={avatarClass()}
                  style={{
                    width: 52,
                    height: 52,
                    fontSize: 20,
                    background:
                      '#0f2a52',
                    color:
                      '#ffffff',
                    border: 'none'
                  }}
                >
                  {(
                    searchedPatient.full_name ||
                    searchedPatient.fullName ||
                    searchedPatient.name ||
                    ''
                  )
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color:
                        '#0f2a52'
                    }}
                  >
                    {searchedPatient.full_name ||
                      searchedPatient.fullName ||
                      searchedPatient.name ||
                      'Unknown Patient'}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color:
                        '#64748b',
                      marginTop: 3
                    }}
                  >
                    Patient Token:{' '}
                    <strong
                      style={{
                        color:
                          '#0f2a52'
                      }}
                    >
                      {getPatientToken(
                        searchedPatient
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  handleAssignPatient
                }
                disabled={
                  assigningPatient
                }
                style={{
                  background:
                    '#0f2a52',
                  color:
                    '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding:
                    '11px 18px',
                  fontWeight: 700,
                  cursor:
                    assigningPatient
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    assigningPatient
                      ? 0.7
                      : 1,
                  display:
                    'inline-flex',
                  alignItems:
                    'center',
                  gap: 7
                }}
              >
                <Icon
                  name="userPlus"
                  size={16}
                />

                {assigningPatient
                  ? 'Adding...'
                  : 'Add to My Patients'}
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 12,
                marginTop: 18
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color:
                      '#94a3b8'
                  }}
                >
                  Email
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color:
                      '#334155'
                  }}
                >
                  {searchedPatient.email ||
                    '-'}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    color:
                      '#94a3b8'
                  }}
                >
                  Mobile
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color:
                      '#334155'
                  }}
                >
                  {searchedPatient.mobile ||
                    searchedPatient.phone ||
                    '-'}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    color:
                      '#94a3b8'
                  }}
                >
                  Gender
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color:
                      '#334155'
                  }}
                >
                  {searchedPatient.gender ||
                    '-'}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    color:
                      '#94a3b8'
                  }}
                >
                  Age
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color:
                      '#334155'
                  }}
                >
                  {searchedPatient.age ??
                    '-'}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    color:
                      '#94a3b8'
                  }}
                >
                  Blood Group
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color:
                      '#334155'
                  }}
                >
                  {searchedPatient.blood_group ||
                    searchedPatient.bloodGroup ||
                    '-'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          PATIENT TOKENS
      ====================================================== */}

      <div
        style={{
          background: '#ffffff',
          border:
            '1px solid #dbe3ec',
          borderRadius: 14,
          padding: 24,
          marginBottom: 24,
          boxShadow:
            '0 2px 8px rgba(15, 23, 42, 0.04)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
            flexWrap: 'wrap'
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                color: '#0f2a52',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span
                style={{
                  color: '#0f2a52',
                  display:
                    'inline-flex',
                  alignItems:
                    'center'
                }}
              >
                <Icon
                  name="hash"
                  size={20}
                />
              </span>

              Patient Tokens
            </h2>

            <p
              style={{
                margin:
                  '6px 0 0',
                color:
                  '#64748b',
                fontSize: 13
              }}
            >
              All generated patient tokens are kept here.
            </p>
          </div>

          <div
            style={{
              background:
                '#eef3f8',
              color:
                '#0f2a52',
              padding:
                '7px 12px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              border:
                '1px solid #d7e0ea'
            }}
          >
            {patientTokens.length}{' '}
            Token
            {patientTokens.length !==
            1
              ? 's'
              : ''}
          </div>
        </div>

        {patientTokens.length ===
        0 ? (
          <div
            style={{
              textAlign: 'center',
              padding:
                '28px 20px',
              borderRadius: 10,
              background:
                '#f8fafc',
              border:
                '1px dashed #cbd5e1',
              color:
                '#64748b',
              fontSize: 14
            }}
          >
            <span
              style={{
                color:
                  '#0f2a52',
                fontWeight: 700,
                marginRight: 6,
                display:
                  'inline-flex',
                verticalAlign:
                  'middle'
              }}
            >
              <Icon
                name="hash"
                size={16}
              />
            </span>

            No patient tokens available yet.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 12
            }}
          >
            {patientTokens.map(
              (item, index) => (
                <div
                  key={`${item.patientDbId}-${item.token}-${index}`}
                  style={{
                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'space-between',
                    gap: 14,
                    padding:
                      '14px 16px',
                    background:
                      '#f8fafc',
                    border:
                      '1px solid #e2e8f0',
                    borderRadius: 10
                  }}
                >
                  <div
                    style={{
                      minWidth: 0
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color:
                          '#94a3b8',
                        marginBottom:
                          4
                      }}
                    >
                      Token #
                      {index + 1}
                    </div>

                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color:
                          '#0f2a52',
                        letterSpacing:
                          0.5
                      }}
                    >
                      {item.token}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color:
                          '#475569',
                        marginTop: 4,
                        whiteSpace:
                          'nowrap',
                        overflow:
                          'hidden',
                        textOverflow:
                          'ellipsis'
                      }}
                      title={
                        item.patientName
                      }
                    >
                      {item.patientName}
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color:
                          '#94a3b8',
                        marginTop: 2
                      }}
                    >
                      {item.patientId}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      copyToken(
                        item.token
                      )
                    }
                    style={{
                      flexShrink: 0,
                      height: 38,
                      padding:
                        '0 13px',
                      borderRadius: 8,
                      border:
                        '1px solid #b8c7d8',
                      background:
                        copiedToken ===
                        item.token
                          ? '#e8eef4'
                          : '#eef3f8',
                      color:
                        '#0f2a52',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor:
                        'pointer',
                      display:
                        'inline-flex',
                      alignItems:
                        'center',
                      gap: 6
                    }}
                  >
                    {copiedToken ===
                    item.token ? (
                      <>
                        <Icon
                          name="check"
                          size={14}
                        />
                        Copied
                      </>
                    ) : (
                      <>
                        <Icon
                          name="copy"
                          size={14}
                        />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ======================================================
          EXISTING PATIENT SEARCH
      ====================================================== */}

      <div className="top-bar">
        <form
          className="search-wrap"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            placeholder="Search my patients by name, email or mobile..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

          <button
            type="submit"
            className="btn-search"
            style={{
              background:
                '#0f2a52',
              display:
                'inline-flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              gap: 7
            }}
          >
            <Icon
              name="search"
              size={16}
            />
            Search
          </button>

          {search && (
            <button
              type="button"
              onClick={
                clearSearch
              }
              style={{
                background:
                  'none',
                border: 'none',
                color:
                  '#0f2a52',
                fontWeight: 600,
                cursor:
                  'pointer',
                fontSize: 13,
                display:
                  'inline-flex',
                alignItems:
                  'center',
                gap: 5
              }}
            >
              <Icon
                name="x"
                size={14}
              />
              Clear
            </button>
          )}
        </form>
      </div>

      {/* ======================================================
          PATIENT TABLE
      ====================================================== */}

      <div className="table-box">
        <div className="table-header">
          <h2
            style={{
              color:
                '#0f2a52'
            }}
          >
            My Patients{' '}
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color:
                  '#64748b',
                marginLeft: 8
              }}
            >
              ({patients.length}{' '}
              {search
                ? 'found'
                : 'total'})
            </span>
          </h2>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Token</th>
              <th>Gender</th>
              <th>Age</th>
              <th>Blood Group</th>
              <th>Mobile</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    textAlign:
                      'center',
                    padding: 40,
                    color:
                      '#64748b'
                  }}
                >
                  Loading patients...
                </td>
              </tr>
            ) : patients.length ===
              0 ? (
              <tr>
                <td colSpan={10}>
                  <div className="empty-state">
                    <span
                      className="empty-icon"
                      style={{
                        color:
                          '#0f2a52',
                        display:
                          'inline-flex',
                        verticalAlign:
                          'middle'
                      }}
                    >
                      <Icon
                        name="users"
                        size={32}
                      />
                    </span>

                    {search
                      ? `No patients found for "${search}"`
                      : 'No patients added yet. Search a Patient Token above to add one.'}
                  </div>
                </td>
              </tr>
            ) : (
              patients.map(
                (p, i) => {
                  const token =
                    getPatientToken(
                      p
                    );

                  const patientName =
                    p.full_name ||
                    p.fullName ||
                    p.name ||
                    '-';

                  const patientEmail =
                    p.email || '-';

                  const patientMobile =
                    p.mobile ||
                    p.phone ||
                    '-';

                  const patientBloodGroup =
                    p.blood_group ||
                    p.bloodGroup ||
                    '—';

                  const patientDbId =
                    p.id ||
                    p._id ||
                    p.patient_id;

                  return (
                    <tr
                      key={
                        patientDbId
                      }
                    >
                      {/* NUMBER */}
                      <td
                        style={{
                          color:
                            '#94a3b8',
                          fontWeight: 600,
                          whiteSpace:
                            'nowrap'
                        }}
                      >
                        {i + 1}
                      </td>

                      {/* PATIENT */}
                      <td>
                        <div
                          className="pat-info"
                          style={{
                            minWidth:
                              180
                          }}
                        >
                          <div
                            className={avatarClass()}
                            style={{
                              background:
                                '#0f2a52',
                              color:
                                '#ffffff',
                              border:
                                'none',
                              flexShrink:
                                0
                            }}
                          >
                            {patientName
                              ?.charAt(
                                0
                              )
                              ?.toUpperCase()}
                          </div>

                          <div
                            style={{
                              minWidth:
                                0
                            }}
                          >
                            <div
                              className="pat-name"
                              style={{
                                color:
                                  '#0f2a52',
                                whiteSpace:
                                  'nowrap',
                                overflow:
                                  'hidden',
                                textOverflow:
                                  'ellipsis',
                                maxWidth:
                                  180
                              }}
                              title={
                                patientName
                              }
                            >
                              {patientName}
                            </div>

                            <div
                              className="pat-email"
                              style={{
                                whiteSpace:
                                  'nowrap',
                                overflow:
                                  'hidden',
                                textOverflow:
                                  'ellipsis',
                                maxWidth:
                                  180
                              }}
                              title={
                                patientEmail
                              }
                            >
                              {patientEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* TOKEN */}
                      <td
                        style={{
                          whiteSpace:
                            'nowrap',
                          minWidth:
                            90
                        }}
                      >
                        {token ? (
                          <div
                            style={{
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              gap: 6,
                              whiteSpace:
                                'nowrap'
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 800,
                                color:
                                  '#0f2a52',
                                fontSize:
                                  13
                              }}
                            >
                              {token}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                copyToken(
                                  token
                                )
                              }
                              title="Copy Token"
                              style={{
                                width: 30,
                                height: 28,
                                padding: 0,
                                border:
                                  '1px solid #b8c7d8',
                                background:
                                  copiedToken ===
                                  String(
                                    token
                                  )
                                    ? '#e8eef4'
                                    : '#eef3f8',
                                color:
                                  '#0f2a52',
                                borderRadius:
                                  6,
                                cursor:
                                  'pointer',
                                display:
                                  'inline-flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'center',
                                flexShrink:
                                  0
                              }}
                            >
                              {copiedToken ===
                              String(
                                token
                              ) ? (
                                <Icon
                                  name="check"
                                  size={13}
                                />
                              ) : (
                                <Icon
                                  name="copy"
                                  size={13}
                                />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span
                            style={{
                              color:
                                '#94a3b8',
                              fontSize:
                                12,
                              fontWeight:
                                500
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>

                      {/* GENDER */}
                      <td
                        style={{
                          whiteSpace:
                            'nowrap'
                        }}
                      >
                        {genderBadge(
                          p.gender
                        )}
                      </td>

                      {/* AGE */}
                      <td
                        style={{
                          fontWeight:
                            600,
                          color:
                            '#475569',
                          whiteSpace:
                            'nowrap'
                        }}
                      >
                        {p.age !==
                          null &&
                        p.age !==
                          undefined &&
                        p.age !==
                          ''
                          ? `${p.age} yrs`
                          : '—'}
                      </td>

                      {/* BLOOD GROUP */}
                      <td
                        style={{
                          whiteSpace:
                            'nowrap'
                        }}
                      >
                        <span className="badge badge-blood">
                          {patientBloodGroup}
                        </span>
                      </td>

                      {/* MOBILE */}
                      <td
                        style={{
                          color:
                            '#475569',
                          whiteSpace:
                            'nowrap'
                        }}
                      >
                        {patientMobile}
                      </td>

                      {/* REGISTERED */}
                      <td
                        style={{
                          color:
                            '#64748b',
                          fontSize:
                            13,
                          whiteSpace:
                            'nowrap'
                        }}
                      >
                        {p.created_at ||
                        p.createdAt
                          ? formatDate(
                              p.created_at ||
                                p.createdAt
                            )
                          : '—'}
                      </td>

                      {/* ACTIONS */}
                      <td
                        style={{
                          whiteSpace:
                            'nowrap',
                          minWidth:
                            145
                        }}
                      >
                        <div
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'flex-start',
                            gap: 8,
                            flexWrap:
                              'nowrap',
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {/* PRESCRIBE */}
                          <Link
                            to="/doctor/prescriptions"
                            className="btn-sm btn-view"
                            style={{
                              margin: 0,
                              color:
                                '#0f2a52',
                              borderColor:
                                '#b8c7d8',
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'center',
                              gap: 5,
                              whiteSpace:
                                'nowrap',
                              flexShrink:
                                0,
                              minWidth:
                                88
                            }}
                          >
                            <Icon
                              name="prescription"
                              size={14}
                            />

                            Prescribe
                          </Link>

                          {/* DELETE */}
                          <button
                            type="button"
                            className="btn-sm btn-del"
                            onClick={() =>
                              handleDelete(
                                patientDbId,
                                patientName
                              )
                            }
                            title="Remove Patient"
                            aria-label="Remove Patient"
                            style={{
                              margin: 0,
                              width: 34,
                              height: 34,
                              padding: 0,
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'center',
                              flexShrink:
                                0,
                              borderRadius:
                                7
                            }}
                          >
                            <Icon
                              name="trash"
                              size={15}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================
          DELETE CONFIRM MODAL
      ====================================================== */}

      <ConfirmModal
        isOpen={confirmOpen}
        title="Remove Patient?"
        message={`Are you sure you want to remove "${deleteTarget?.name}" from your patient list?`}
        confirmText="Yes, Remove"
        confirmColor="#ef4444"
        onConfirm={doDelete}
        onCancel={() =>
          setConfirmOpen(false)
        }
      />
    </Layout>
  );
}