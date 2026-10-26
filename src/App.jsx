import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import PatientLogin from './pages/PatientLogin';
import DoctorLogin from './pages/DoctorLogin';
import Register from './pages/Register';

// Doctor pages
import DoctorDashboard from './pages/DoctorDashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Consultations from './pages/Consultations';
import Prescriptions from './pages/Prescriptions';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Patient pages
import PatientDashboard from './pages/PatientDashboard';
import PatientAppointments from './pages/PatientAppointments';
import PatientConsultations from './pages/PatientConsultations';
import PatientPrescriptions from './pages/PatientPrescriptions';
import PatientBilling from './pages/PatientBilling';
import PatientProfile from './pages/PatientProfile';
import PatientMedicalRecords from './pages/PatientMedicalRecords';
import PatientHealthSummary from './pages/PatientHealthSummary';
import FindDoctors from './pages/FindDoctors';
import PatientSettings from './pages/PatientSettings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Auth ── */}
        <Route
          path="/"
          element={<PatientLogin />}
        />

        <Route
          path="/doctor-login"
          element={<DoctorLogin />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ── Doctor pages ── */}

        <Route
          path="/doctor/dashboard"
          element={<DoctorDashboard />}
        />

        <Route
          path="/doctor/patients"
          element={<Patients />}
        />

        <Route
          path="/doctor/appointments"
          element={<Appointments />}
        />

        <Route
          path="/doctor/consultations"
          element={<Consultations />}
        />

        <Route
          path="/doctor/prescriptions"
          element={<Prescriptions />}
        />

        <Route
          path="/doctor/billing"
          element={<Billing />}
        />

        <Route
          path="/doctor/reports"
          element={<Reports />}
        />

        <Route
          path="/doctor/settings"
          element={<Settings />}
        />


        {/* ── Patient pages ── */}

        <Route
          path="/patient/dashboard"
          element={<PatientDashboard />}
        />

        <Route
          path="/patient/appointments"
          element={<PatientAppointments />}
        />

        <Route
          path="/patient/consultations"
          element={<PatientConsultations />}
        />

        <Route
          path="/patient/prescriptions"
          element={<PatientPrescriptions />}
        />

        <Route
          path="/patient/billing"
          element={<PatientBilling />}
        />

        <Route
          path="/patient/profile"
          element={<PatientProfile />}
        />

        <Route
          path="/patient/medical-records"
          element={<PatientMedicalRecords />}
        />

        <Route
          path="/patient/health-summary"
          element={<PatientHealthSummary />}
        />

        <Route
          path="/patient/find-doctors"
          element={<FindDoctors />}
        />

        <Route
          path="/patient/settings"
          element={<PatientSettings />}
        />


        {/* ── Fallback ── */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}