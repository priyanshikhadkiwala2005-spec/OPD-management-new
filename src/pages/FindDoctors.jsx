import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

import { API, getToken } from '../api';

import {
  Search,
  X,
  Stethoscope,
  Phone,
  Mail,
  CalendarDays,
  Hospital,
  UserRound,
  HeartPulse,
  Bone,
  Brain,
  Baby,
  Eye,
  Ear,
  FlaskConical,
  Sparkles,
  UsersRound,
} from 'lucide-react';


// Specialization icons
const SPEC_ICONS = {
  'general physician': Stethoscope,
  'cardiologist': HeartPulse,
  'orthopedic': Bone,
  'dentist': Sparkles,
  'neurologist': Brain,
  'dermatologist': Sparkles,
  'pediatrician': Baby,
  'gynecologist': UserRound,
  'ophthalmologist': Eye,
  'psychiatrist': Brain,
  'urologist': FlaskConical,
  'ent': Ear,
  'default': Stethoscope,
};


// Get specialization icon
function getSpecIcon(spec) {
  if (!spec) return SPEC_ICONS.default;

  const key = spec.toLowerCase();

  for (const [k, Icon] of Object.entries(SPEC_ICONS)) {
    if (key.includes(k)) return Icon;
  }

  return SPEC_ICONS.default;
}


export default function FindDoctors() {

  const { user } = useAuth();
  const navigate = useNavigate();

  const patientName = user?.full_name || 'Patient';

  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [activeSpec, setActiveSpec] = useState('All');
  const [specializations, setSpecializations] = useState(['All']);


  // Fetch doctors
  useEffect(() => {

    fetch(`${API}/patients/doctors-list`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    })
      .then(r => r.json())
      .then(d => {

        if (d.success) {

          setDoctors(d.data.doctors);
          setFiltered(d.data.doctors);

          // Unique specializations
          const uniqueSpecs = new Map();

          d.data.doctors.forEach(doc => {

            if (doc.specialization) {

              const original = doc.specialization.trim();
              const normalized = original.toLowerCase();

              if (!uniqueSpecs.has(normalized)) {
                uniqueSpecs.set(normalized, original);
              }

            }

          });

          const specs = ['All', ...uniqueSpecs.values()];

          setSpecializations(specs);
        }

      })
      .catch(() => {})
      .finally(() => setLoading(false));

  }, []);


  // Filter logic
  useEffect(() => {

    let result = doctors;

    if (activeSpec !== 'All') {
      result = result.filter(
        d => d.specialization === activeSpec
      );
    }

    if (search.trim()) {

      const q = search.toLowerCase();

      result = result.filter(d =>
        d.full_name.toLowerCase().includes(q) ||
        (d.specialization || '').toLowerCase().includes(q)
      );

    }

    setFiltered(result);

  }, [search, activeSpec, doctors]);


  // Book appointment
  function handleBookNow(doctorId) {

    navigate('/patient/appointments', {
      state: {
        preselect: doctorId
      }
    });

  }


  return (

    <Layout
      role="patient"
      name={patientName}
      title="Find Doctors"
      subtitle="Browse and book appointments with our specialists"
    >


      {/* ================= SEARCH HERO ================= */}

      <div
        style={{
          background: '#0f2a4a',
          borderRadius: 16,
          padding: '28px 32px',
          marginBottom: 24,
          boxShadow: '0 8px 28px rgba(15,42,74,0.16)'
        }}
      >

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 7
          }}
        >

          <Search
            size={22}
            color="#bfdbfe"
            strokeWidth={2}
          />

          <h2
            style={{
              color: '#fff',
              fontSize: 20,
              fontWeight: 800,
              margin: 0
            }}
          >
            Find the Right Doctor
          </h2>

        </div>


        <p
          style={{
            color: '#bfdbfe',
            fontSize: 13,
            margin: '0 0 18px'
          }}
        >
          Search by name or specialization and book instantly
        </p>


        {/* Search Input */}

        <div
          style={{
            display: 'flex',
            gap: 10
          }}
        >

          <div
            style={{
              flex: 1,
              position: 'relative'
            }}
          >

            <Search
              size={18}
              color="#94a3b8"
              style={{
                position: 'absolute',
                left: 15,
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            />

            <input
              type="text"
              placeholder="Search doctor name or specialization..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 44px',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                outline: 'none',
                color: '#0f172a',
                background: '#fff'
              }}
            />


            {search && (

              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >

                <X size={15} />

              </button>

            )}

          </div>


          {search && (

            <button
              onClick={() => setSearch('')}
              style={{
                padding: '0 18px',
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >

              <X size={15} />

              Clear

            </button>

          )}

        </div>

      </div>


      {/* ================= SPECIALIZATION FILTER ================= */}

      <div
        style={{
          display: 'flex',
          gap: 9,
          flexWrap: 'wrap',
          marginBottom: 22
        }}
      >

        {specializations.map(spec => {

          const SpecIcon =
            spec === 'All'
              ? Hospital
              : getSpecIcon(spec);

          const isActive = activeSpec === spec;

          return (

            <button
              key={spec}
              onClick={() => setActiveSpec(spec)}
              style={{
                padding: '8px 15px',
                borderRadius: 20,
                border: isActive
                  ? '1px solid #0f2a4a'
                  : '1px solid #e2e8f0',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: isActive
                  ? '#0f2a4a'
                  : '#fff',
                color: isActive
                  ? '#fff'
                  : '#475569',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: isActive
                  ? '0 4px 10px rgba(15,42,74,0.18)'
                  : 'none'
              }}
            >

              <SpecIcon size={15} strokeWidth={1.8} />

              {spec === 'All' ? 'All Doctors' : spec}

            </button>

          );

        })}

      </div>


      {/* ================= RESULTS INFO ================= */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          flexWrap: 'wrap',
          fontSize: 13,
          color: '#64748b',
          marginBottom: 18,
          fontWeight: 500
        }}
      >

        <UsersRound
          size={16}
          color="#0f2a4a"
        />

        <span>
          Showing
        </span>

        <strong
          style={{
            color: '#0f2a4a'
          }}
        >
          {filtered.length}
        </strong>

        <span>
          doctor{filtered.length !== 1 ? 's' : ''}
        </span>


        {activeSpec !== 'All' && (

          <span>
            in{' '}

            <strong
              style={{
                color: '#0f2a4a'
              }}
            >
              {activeSpec}
            </strong>
          </span>

        )}


        {search && (

          <span>
            matching "{search}"
          </span>

        )}

      </div>


      {/* ================= LOADING ================= */}

      {loading ? (

        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: 60,
            textAlign: 'center',
            color: '#64748b'
          }}
        >

          <Stethoscope
            size={38}
            color="#0f2a4a"
            strokeWidth={1.5}
            style={{
              marginBottom: 12
            }}
          />

          <div
            style={{
              fontSize: 14
            }}
          >
            Loading doctors...
          </div>

        </div>


      ) : filtered.length === 0 ? (

        /* ================= EMPTY STATE ================= */

        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '60px 20px',
            textAlign: 'center'
          }}
        >

          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto 14px',
              borderRadius: '50%',
              background: '#eff6ff',
              color: '#0f2a4a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >

            <Search
              size={30}
              strokeWidth={1.7}
            />

          </div>


          <h3
            style={{
              margin: '0 0 6px',
              color: '#0f2a4a',
              fontSize: 17
            }}
          >
            No doctors found
          </h3>


          <p
            style={{
              margin: 0,
              color: '#94a3b8',
              fontSize: 13
            }}
          >
            Try a different search or clear the filter.
          </p>

        </div>


      ) : (

        /* ================= DOCTOR CARDS ================= */

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20
          }}
        >

          {filtered.map(doc => {

            const SpecIcon =
              getSpecIcon(doc.specialization);

            return (

              <div
                key={doc.id}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}

                onMouseEnter={e => {

                  e.currentTarget.style.transform =
                    'translateY(-3px)';

                  e.currentTarget.style.boxShadow =
                    '0 10px 25px rgba(15,42,74,0.10)';

                }}

                onMouseLeave={e => {

                  e.currentTarget.style.transform =
                    'translateY(0)';

                  e.currentTarget.style.boxShadow =
                    '0 2px 10px rgba(0,0,0,0.05)';

                }}
              >


                {/* ================= CARD HEADER ================= */}

                <div
                  style={{
                    background: '#0f2a4a',
                    padding: '22px 22px 20px'
                  }}
                >

                  {/* Doctor Avatar */}

                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.12)',
                      border: '2px solid rgba(255,255,255,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      marginBottom: 12,
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >

                    {/* Existing fallback remains visible if image
                        is missing or fails to load. */}

                    <Stethoscope
                      size={28}
                      strokeWidth={1.6}
                    />

                    {doc.profile_image && (
                      <img
                        src={doc.profile_image}
                        alt={doc.full_name || 'Doctor'}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}

                  </div>


                  {/* Doctor Name */}

                  <div
                    style={{
                      color: '#fff',
                      fontSize: 17,
                      fontWeight: 800
                    }}
                  >
                    Dr. {doc.full_name}
                  </div>


                  {/* Specialization */}

                  <div
                    style={{
                      color: '#bfdbfe',
                      fontSize: 12.5,
                      marginTop: 5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >

                    <SpecIcon
                      size={15}
                      strokeWidth={1.7}
                    />

                    {doc.specialization || 'General Physician'}

                  </div>

                </div>


                {/* ================= CARD BODY ================= */}

                <div
                  style={{
                    padding: '18px 22px'
                  }}
                >

                  {/* Mobile */}

                  {doc.mobile && (

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                        marginBottom: 11
                      }}
                    >

                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: '#eff6ff',
                          color: '#0f2a4a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >

                        <Phone
                          size={15}
                          strokeWidth={1.8}
                        />

                      </div>

                      <span
                        style={{
                          fontSize: 13,
                          color: '#475569',
                          fontWeight: 500
                        }}
                      >
                        {doc.mobile}
                      </span>

                    </div>

                  )}


                  {/* Email */}

                  {doc.email && (

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                        marginBottom: 15
                      }}
                    >

                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: '#eff6ff',
                          color: '#0f2a4a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >

                        <Mail
                          size={15}
                          strokeWidth={1.8}
                        />

                      </div>

                      <span
                        style={{
                          fontSize: 13,
                          color: '#475569',
                          fontWeight: 500,
                          wordBreak: 'break-all'
                        }}
                      >
                        {doc.email}
                      </span>

                    </div>

                  )}


                  {/* Specialization Badge */}

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#eff6ff',
                      color: '#0f2a4a',
                      padding: '6px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 17
                    }}
                  >

                    <SpecIcon
                      size={14}
                      strokeWidth={1.8}
                    />

                    {doc.specialization || 'General Physician'}

                  </div>


                  {/* Book Button */}

                  <button
                    onClick={() => handleBookNow(doc.id)}
                    style={{
                      width: '100%',
                      padding: '11px',
                      background: '#0f2a4a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'opacity 0.2s'
                    }}

                    onMouseEnter={e => {
                      e.currentTarget.style.opacity = '0.88';
                    }}

                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >

                    <CalendarDays
                      size={17}
                      strokeWidth={1.8}
                    />

                    Book Appointment

                  </button>

                </div>

              </div>

            );

          })}

        </div>

      )}

    </Layout>

  );
}