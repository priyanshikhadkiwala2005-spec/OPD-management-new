import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { API, getToken, removeToken } from '../api';

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  Pill,
  CreditCard,
  ChartNoAxesCombined,
  Settings,
  User,
  Hospital,
  Search,
  ClipboardList,
  LogOut,
} from 'lucide-react';


// ============================================================
// DOCTOR NAVIGATION
// ============================================================

const DOCTOR_NAV = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    to: '/doctor/dashboard',
  },

  {
    icon: Users,
    label: 'Patients',
    to: '/doctor/patients',
  },

  {
    icon: CalendarDays,
    label: 'Appointments',
    to: '/doctor/appointments',
    badge: true,
  },

  {
    icon: Stethoscope,
    label: 'Consultations',
    to: '/doctor/consultations',
  },

  {
    icon: Pill,
    label: 'Prescriptions',
    to: '/doctor/prescriptions',
  },

  {
    icon: CreditCard,
    label: 'Billing',
    to: '/doctor/billing',
  },
];


// ============================================================
// DOCTOR OTHER
// ============================================================

const DOCTOR_OTHER = [
  {
    icon: ChartNoAxesCombined,
    label: 'Reports',
    to: '/doctor/reports',
  },

  {
    icon: Settings,
    label: 'Settings',
    to: '/doctor/settings',
  },
];


// ============================================================
// PATIENT NAVIGATION
// ============================================================

const PATIENT_NAV = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    to: '/patient/dashboard',
  },

  {
    icon: CalendarDays,
    label: 'My Appointments',
    to: '/patient/appointments',
  },

  {
    icon: Hospital,
    label: 'Health Summary',
    to: '/patient/health-summary',
  },

  {
    icon: Search,
    label: 'Find Doctors',
    to: '/patient/find-doctors',
  },

  {
    icon: CreditCard,
    label: 'Billing',
    to: '/patient/billing',
  },

  {
    icon: ClipboardList,
    label: 'Medical Records',
    to: '/patient/medical-records',
  },
];


// ============================================================
// PATIENT ACCOUNT
// ============================================================

const PATIENT_ACCOUNT = [
  {
    icon: User,
    label: 'My Profile',
    to: '/patient/profile',
  },

  {
    icon: Settings,
    label: 'Settings',
    to: '/patient/settings',
  },
];


// ============================================================
// NAV ITEM
// ============================================================

function NavItem({ item, pendingCount }) {
  const Icon = item.icon;

  if (item.to === '#') {
    return (
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
      >
        <span className="nav-icon">
          <Icon
            size={20}
            strokeWidth={1.8}
          />
        </span>

        <span className="nav-text">
          {item.label}
        </span>
      </a>
    );
  }

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        isActive ? 'active' : ''
      }
    >
      <span className="nav-icon">
        <Icon
          size={20}
          strokeWidth={1.8}
        />
      </span>

      <span className="nav-text">
        {item.label}
      </span>

      {item.badge && pendingCount > 0 && (
        <span className="nav-badge">
          {pendingCount}
        </span>
      )}
    </NavLink>
  );
}


// ============================================================
// SIDEBAR
// ============================================================

export default function Sidebar({ role = 'doctor' }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [pendingCount, setPendingCount] = useState(0);


  // ============================================================
  // LOAD PENDING APPOINTMENTS
  // ============================================================

  useEffect(() => {
    if (role !== 'doctor') return;

    fetch(`${API}/appointments`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPendingCount(
            d.data.stats?.pending || 0
          );
        }
      })
      .catch(() => {});
  }, [role]);


  const mainNav =
    role === 'doctor'
      ? DOCTOR_NAV
      : PATIENT_NAV;

  const otherNav =
    role === 'doctor'
      ? DOCTOR_OTHER
      : PATIENT_ACCOUNT;

  const otherLabel =
    role === 'doctor'
      ? 'Other'
      : 'Account';


  // ============================================================
  // LOGOUT
  // ============================================================

  async function handleLogout(e) {
    e.preventDefault();

    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
    } catch {}

    removeToken();
    logout();
    navigate('/');
  }


  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="sidebar">

      {/* ======================================================
          BRAND
      ====================================================== */}

      <div className="sidebar-brand">

        {/* ====================================================
            MEDCARE LOGO
            SAME AS DOCTOR + PATIENT LOGIN
        ==================================================== */}

        <div
          className="brand-icon"
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
            border: '1px solid rgba(255,255,255,0.35)',
            boxSizing: 'border-box',
            overflow: 'hidden',
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


        {/* ====================================================
            BRAND NAME
        ==================================================== */}

        <h2>
          Med<span>Care</span>
        </h2>

      </div>


      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <nav className="sidebar-nav">

        <div className="nav-label">
          Main Menu
        </div>

        {mainNav.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            pendingCount={pendingCount}
          />
        ))}


        <div className="nav-label">
          {otherLabel}
        </div>

        {otherNav.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            pendingCount={0}
          />
        ))}

      </nav>


      {/* ======================================================
          LOGOUT
      ====================================================== */}

      <div className="sidebar-footer sidebar-nav">

        <a
          href="#"
          onClick={handleLogout}
        >

          <span className="nav-icon">

            <LogOut
              size={20}
              strokeWidth={1.8}
            />

          </span>

          <span className="nav-text logout-text">
            Logout
          </span>

        </a>

      </div>

    </div>
  );
}