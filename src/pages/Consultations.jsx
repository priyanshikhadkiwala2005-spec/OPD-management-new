import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import PrintPrescription from '../components/PrintPrescription';

import { API, getToken } from '../api';

// ============================================================
// COLORS
// ============================================================

const NAVY = '#0f2a52';
const BLUE = '#2563eb';
const LIGHT_BLUE = '#eef3f8';
const TEXT = '#334155';
const MUTED = '#64748b';
const BORDER = '#dbe4ef';
const RED = '#dc2626';

// ============================================================
// ICONS
// ============================================================

function ClipboardIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2h6v2" />
      <path d="M9 9h6" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  );
}

function PillIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 4.5a4.95 4.95 0 0 1 7 7L11.5 15.5a4.95 4.95 0 1 1-7-7l4-4Z" />
      <path d="m8 8 8 8" />
    </svg>
  );
}

function MoneyIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M15 8.5c-.7-.7-1.7-1.1-3-1.1-1.5 0-2.6.8-2.6 1.9 0 1.2 1 1.7 2.7 2.1 1.8.4 2.8.9 2.8 2.2 0 1.2-1.1 2-2.8 2-1.3 0-2.4-.5-3.1-1.3" />
      <path d="M12 6.2v11.6" />
    </svg>
  );
}

function CalendarIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 9h18" />
    </svg>
  );
}

function ClockIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function PrinterIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9V3h12v6" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v7H6z" />
      <path d="M18 12h.01" />
    </svg>
  );
}

function TrashIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function StethoscopeIcon({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3v5a4 4 0 0 0 8 0V3" />
      <path d="M4 3h4M12 3h4" />
      <path d="M14 12v2a4 4 0 0 0 8 0v-1" />
      <circle cx="22" cy="12" r="1" />
    </svg>
  );
}

function NoteIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h6" />
    </svg>
  );
}

// ============================================================
// DEFAULT STATS
// ============================================================

const DEFAULT_STATS = {
  total_rx: 0,
  total_meds: 0,
  total_rev: 0,
};

// ============================================================
// CONSULTATIONS PAGE
// ============================================================

export default function Consultations() {
  const { user } = useAuth();

  const doctorName =
    user?.full_name ||
    user?.fullName ||
    'Doctor';

  // ============================================================
  // STATE
  // ============================================================

  const [records, setRecords] = useState([]);

  const [stats, setStats] = useState({
    ...DEFAULT_STATS,
  });

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [clinicInfo, setClinicInfo] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [printOpen, setPrintOpen] = useState(false);
  const [printRx, setPrintRx] = useState(null);

  // ============================================================
  // AUTH HEADERS
  // ============================================================

  function getAuthHeaders() {
    const token = getToken();

    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  }

  // ============================================================
  // SAFE JSON RESPONSE
  // ============================================================

  async function getResponseData(response) {
    try {
      const text = await response.text();

      if (!text) {
        return {};
      }

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error(
          'Invalid JSON response:',
          parseError
        );

        console.error(
          'Response text:',
          text
        );

        return {
          message: text,
        };
      }
    } catch (error) {
      console.error(
        'Failed to read response:',
        error
      );

      return {};
    }
  }

  // ============================================================
  // NORMALIZE MEDICINE
  // ============================================================

  function normalizeMedicine(medicine, index = 0) {
    if (!medicine || typeof medicine !== 'object') {
      return null;
    }

    const medicineId =
      medicine.id ||
      medicine._id ||
      medicine.medicine_id ||
      medicine.medicineId ||
      `medicine-${index}-${Date.now()}`;

    return {
      id: String(medicineId),

      medicine_name:
        medicine.medicine_name ||
        medicine.medicineName ||
        medicine.name ||
        medicine.medication_name ||
        medicine.medicationName ||
        '',

      medicine_type:
        medicine.medicine_type ||
        medicine.medicineType ||
        medicine.type ||
        'Medicine',

      dosage:
        medicine.dosage ||
        '',

      frequency:
        medicine.frequency ||
        '',

      duration:
        medicine.duration ||
        '',
    };
  }

  // ============================================================
  // NORMALIZE CONSULTATION / PRESCRIPTION
  // ============================================================

  function normalizeRecord(record, index = 0) {
    if (!record || typeof record !== 'object') {
      return null;
    }

    const patient =
      record.patient &&
      typeof record.patient === 'object'
        ? record.patient
        : {};

    const patientIdObject =
      record.patientId &&
      typeof record.patientId === 'object'
        ? record.patientId
        : {};

    const medicinesSource =
      record.medicines ||
      record.medications ||
      record.prescription_medicines ||
      record.prescriptionMedicines ||
      record.items ||
      [];

    const medicines = Array.isArray(
      medicinesSource
    )
      ? medicinesSource
          .map((medicine, medicineIndex) =>
            normalizeMedicine(
              medicine,
              medicineIndex
            )
          )
          .filter(Boolean)
      : [];

    const patientName =
      record.patient_name ||
      record.patientName ||
      record.patient_full_name ||
      record.patientFullName ||
      record.patient?.full_name ||
      record.patient?.fullName ||
      record.patient?.name ||
      record.patientId?.full_name ||
      record.patientId?.fullName ||
      record.patientId?.name ||
      patient.full_name ||
      patient.fullName ||
      patient.name ||
      'Unknown Patient';

    const age =
      record.age ??
      record.patient_age ??
      record.patientAge ??
      record.patient?.age ??
      record.patientId?.age ??
      patient.age ??
      '';

    const gender =
      record.gender ||
      record.patient_gender ||
      record.patientGender ||
      record.patient?.gender ||
      record.patientId?.gender ||
      patient.gender ||
      '';

    const bloodGroup =
      record.blood_group ||
      record.bloodGroup ||
      record.patient?.blood_group ||
      record.patient?.bloodGroup ||
      record.patientId?.blood_group ||
      record.patientId?.bloodGroup ||
      patient.blood_group ||
      patient.bloodGroup ||
      '';

    const recordId =
      record.id ||
      record._id ||
      record.prescription_id ||
      record.prescriptionId ||
      record.consultation_id ||
      record.consultationId ||
      `consultation-${index}-${Date.now()}`;

    const patientId =
      record.patient_id ||
      record.patientId?._id ||
      record.patientId?.id ||
      record.patient?._id ||
      record.patient?.id ||
      patientIdObject._id ||
      patientIdObject.id ||
      (
        typeof record.patientId === 'string'
          ? record.patientId
          : ''
      );

    const consultationFee = Number(
      record.consultation_fee ??
        record.consultationFee ??
        record.fee ??
        record.amount ??
        0
    );

    const createdAt =
      record.created_at ||
      record.createdAt ||
      record.date ||
      record.created_on ||
      record.createdOn ||
      record.consultation_date ||
      record.consultationDate ||
      '';

    return {
      id: String(recordId),

      patient_id:
        patientId
          ? String(patientId)
          : '',

      patient_name: String(
        patientName
      ),

      age:
        age !== null &&
        age !== undefined
          ? age
          : '',

      gender:
        gender
          ? String(gender)
          : '',

      blood_group:
        bloodGroup
          ? String(bloodGroup)
          : '',

      consultation_fee:
        Number.isFinite(
          consultationFee
        )
          ? consultationFee
          : 0,

      symptoms:
        record.symptoms ||
        '',

      diagnosis:
        record.diagnosis ||
        '',

      additional_instructions:
        record.additional_instructions ||
        record.additionalInstructions ||
        record.instructions ||
        '',

      notes_for_patient:
        record.notes_for_patient ||
        record.notesForPatient ||
        record.patient_notes ||
        record.patientNotes ||
        '',

      created_at: createdAt,

      medicines,
    };
  }

  // ============================================================
  // EXTRACT RECORDS
  // ============================================================

  function extractRecords(data) {
    console.log(
      'FULL PRESCRIPTIONS API RESPONSE:',
      data
    );

    if (!data) {
      return [];
    }

    if (
      data.data &&
      Array.isArray(
        data.data.consultations
      )
    ) {
      return data.data.consultations;
    }

    if (
      data.data &&
      Array.isArray(
        data.data.prescriptions
      )
    ) {
      return data.data.prescriptions;
    }

    if (
      data.data &&
      Array.isArray(
        data.data.records
      )
    ) {
      return data.data.records;
    }

    if (
      data.data &&
      Array.isArray(
        data.data.items
      )
    ) {
      return data.data.items;
    }

    if (Array.isArray(data.data)) {
      return data.data;
    }

    if (
      Array.isArray(
        data.consultations
      )
    ) {
      return data.consultations;
    }

    if (
      Array.isArray(
        data.prescriptions
      )
    ) {
      return data.prescriptions;
    }

    if (
      Array.isArray(
        data.records
      )
    ) {
      return data.records;
    }

    if (
      Array.isArray(
        data.items
      )
    ) {
      return data.items;
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  }

  // ============================================================
  // CALCULATE STATS
  // ============================================================

  function calculateStats(list) {
    const safeList =
      Array.isArray(list)
        ? list
        : [];

    const totalRx =
      safeList.length;

    const totalMeds =
      safeList.reduce(
        (total, record) => {
          const medicineCount =
            Array.isArray(
              record?.medicines
            )
              ? record.medicines.length
              : 0;

          return (
            total + medicineCount
          );
        },
        0
      );

    const totalRevenue =
      safeList.reduce(
        (total, record) => {
          const fee =
            Number(
              record?.consultation_fee
            ) || 0;

          return total + fee;
        },
        0
      );

    return {
      total_rx: totalRx,
      total_meds: totalMeds,
      total_rev: totalRevenue,
    };
  }

  // ============================================================
  // LOAD CONSULTATIONS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function loadConsultations() {
      setLoading(true);
      setError('');

      const token = getToken();

      if (!token) {
        if (!cancelled) {
          setRecords([]);
          setStats({
            ...DEFAULT_STATS,
          });

          setError(
            'Please login again.'
          );

          setLoading(false);
        }

        return;
      }

      try {
        const response =
          await fetch(
            `${API}/prescriptions`,
            {
              method: 'GET',
              headers:
                getAuthHeaders(),
            }
          );

        const data =
          await getResponseData(
            response
          );

        console.log(
          'GET /prescriptions status:',
          response.status
        );

        console.log(
          'GET /prescriptions response:',
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Unable to load consultations. Server returned ${response.status}.`
          );
        }

        if (
          data?.success === false
        ) {
          throw new Error(
            data?.message ||
              'Unable to load consultations.'
          );
        }

        const rawRecords =
          extractRecords(data);

        console.log(
          'Raw consultation records:',
          rawRecords
        );

        const normalizedRecords =
          rawRecords
            .map(
              (
                record,
                index
              ) =>
                normalizeRecord(
                  record,
                  index
                )
            )
            .filter(Boolean);

        console.log(
          'Normalized consultation records:',
          normalizedRecords
        );

        normalizedRecords.sort(
          (a, b) => {
            const dateA =
              a?.created_at
                ? new Date(
                    a.created_at
                  ).getTime()
                : 0;

            const dateB =
              b?.created_at
                ? new Date(
                    b.created_at
                  ).getTime()
                : 0;

            return (
              dateB - dateA
            );
          }
        );

        const calculatedStats =
          calculateStats(
            normalizedRecords
          );

        const backendStats =
          data?.data?.stats ||
          data?.stats ||
          null;

        let finalStats =
          calculatedStats;

        if (
          backendStats &&
          typeof backendStats ===
            'object'
        ) {
          const backendRx =
            backendStats.total_rx ??
            backendStats.totalRx;

          const backendMeds =
            backendStats.total_meds ??
            backendStats.totalMeds;

          const backendRevenue =
            backendStats.total_rev ??
            backendStats.totalRev ??
            backendStats.total_revenue ??
            backendStats.totalRevenue;

          finalStats = {
            total_rx:
              backendRx !==
                undefined &&
              backendRx !== null
                ? Number(
                    backendRx
                  ) || 0
                : calculatedStats.total_rx,

            total_meds:
              backendMeds !==
                undefined &&
              backendMeds !== null
                ? Number(
                    backendMeds
                  ) || 0
                : calculatedStats.total_meds,

            total_rev:
              backendRevenue !==
                undefined &&
              backendRevenue !== null
                ? Number(
                    backendRevenue
                  ) || 0
                : calculatedStats.total_rev,
          };
        }

        if (!cancelled) {
          setRecords(
            normalizedRecords
          );

          setStats(
            finalStats
          );
        }
      } catch (err) {
        console.error(
          'Load consultations error:',
          err
        );

        if (!cancelled) {
          setRecords([]);

          setStats({
            ...DEFAULT_STATS,
          });

          setError(
            err?.message ||
              'Unable to load consultations.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadConsultations();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // LOAD CLINIC / DOCTOR INFO
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function loadClinicInfo() {
      const token = getToken();

      if (!token) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API}/settings`,
            {
              method: 'GET',
              headers:
                getAuthHeaders(),
            }
          );

        const data =
          await getResponseData(
            response
          );

        console.log(
          'GET /settings response:',
          data
        );

        if (
          !cancelled &&
          response.ok &&
          data?.success
        ) {
          const clinic =
            data?.data?.clinic &&
            typeof data.data.clinic ===
              'object'
              ? data.data.clinic
              : {};

          const profile =
            data?.data?.profile &&
            typeof data.data.profile ===
              'object'
              ? data.data.profile
              : {};

          setClinicInfo({
            ...clinic,
            ...profile,
          });
        }
      } catch (err) {
        console.error(
          'Clinic info error:',
          err
        );
      }
    }

    loadClinicInfo();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // DELETE
  // ============================================================

  function askDelete(id) {
    if (!id) {
      setError(
        'Unable to delete this consultation because its ID is missing.'
      );

      return;
    }

    setDeleteTarget(
      String(id)
    );

    setConfirmOpen(true);
  }

  // ============================================================
  // DELETE CONSULTATION
  // ============================================================

  async function doDelete() {
    if (!deleteTarget) {
      setConfirmOpen(false);
      return;
    }

    const targetId =
      String(deleteTarget);

    setConfirmOpen(false);
    setError('');
    setSuccess('');

    try {
      const response =
        await fetch(
          `${API}/prescriptions?id=${encodeURIComponent(
            targetId
          )}`,
          {
            method: 'DELETE',
            headers:
              getAuthHeaders(),
          }
        );

      const data =
        await getResponseData(
          response
        );

      console.log(
        'Delete prescription response:',
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to delete consultation. Server returned ${response.status}.`
        );
      }

      if (
        data?.success === false
      ) {
        throw new Error(
          data?.message ||
            'Failed to delete consultation.'
        );
      }

      const updatedRecords =
        records.filter(
          (record) =>
            String(record.id) !==
            targetId
        );

      setRecords(
        updatedRecords
      );

      setStats(
        calculateStats(
          updatedRecords
        )
      );

      setDeleteTarget(null);

      setSuccess(
        'Consultation deleted successfully!'
      );

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error(
        'Delete consultation error:',
        err
      );

      setError(
        err?.message ||
          'Unable to delete consultation.'
      );

      setTimeout(() => {
        setError('');
      }, 4000);
    }
  }

  // ============================================================
  // PRINT
  // ============================================================

  function openPrint(rx) {
    if (!rx) {
      return;
    }

    setPrintRx(rx);
    setPrintOpen(true);
  }

  function closePrint() {
    setPrintOpen(false);
    setPrintRx(null);
  }

  // ============================================================
  // DATE FORMAT
  // ============================================================

  function formatDateTime(value) {
    if (!value) {
      return '';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value);
    }

    return (
      date.toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      ) +
      ', ' +
      date.toLocaleTimeString(
        'en-IN',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      )
    );
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Layout
        role="doctor"
        name={doctorName}
        title="Consultations"
        subtitle="All patient prescriptions"
      >
        <div
          style={{
            textAlign: 'center',
            padding: 60,
            color: MUTED,
            fontSize: 15,
            fontFamily:
              "'Poppins', sans-serif",
          }}
        >
          Loading consultations...
        </div>
      </Layout>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Layout
      role="doctor"
      name={doctorName}
      title="Consultations"
      subtitle="All patient prescriptions and consultation records"
    >
      <div
        style={{
          fontFamily:
            "'Poppins', sans-serif",
          color: NAVY,
        }}
      >
        {/* ======================================================
            SUCCESS
        ====================================================== */}

        {success && (
          <div
            className="alert alert-success"
            style={{
              fontFamily:
                "'Poppins', sans-serif",
            }}
          >
            <span
              style={{
                color: BLUE,
                fontWeight: 700,
                marginRight: 6,
              }}
            >
              ✓
            </span>
            {success}
          </div>
        )}

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div
            className="alert alert-error"
            style={{
              fontFamily:
                "'Poppins', sans-serif",
            }}
          >
            <span
              style={{
                color: RED,
                fontWeight: 700,
                marginRight: 6,
              }}
            >
              !
            </span>
            {error}
          </div>
        )}

        {/* ======================================================
            STATS
        ====================================================== */}

        <div
          className="page-stats"
          style={{
            marginBottom: 26,
          }}
        >
          {/* TOTAL CONSULTATIONS */}

          <div
            className="stat-card blue"
            style={{
              borderRadius: 12,
              padding:
                '18px 22px',
              border:
                `1px solid ${BORDER}`,
              background: '#ffffff',
              boxShadow:
                '0 5px 16px rgba(15,42,82,0.06)',
            }}
          >
            <div
              className="stat-icon"
              style={{
                width: 52,
                height: 52,
                minWidth: 52,
                borderRadius: 12,
                background:
                  LIGHT_BLUE,
                color: BLUE,
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
              }}
            >
              <ClipboardIcon
                size={23}
              />
            </div>

            <div
              className="stat-info"
            >
              <h2
                style={{
                  color: NAVY,
                  fontFamily:
                    "'Poppins', sans-serif",
                  fontWeight: 700,
                }}
              >
                {stats.total_rx}
              </h2>

              <p
                style={{
                  color: NAVY,
                  fontFamily:
                    "'Poppins', sans-serif",
                }}
              >
                Total Consultations
              </p>
            </div>
          </div>

          {/* MEDICINES */}

          <div
            className="stat-card orange"
            style={{
              borderRadius: 12,
              padding:
                '18px 22px',
              border:
                `1px solid ${BORDER}`,
              background: '#ffffff',
              boxShadow:
                '0 5px 16px rgba(15,42,82,0.06)',
            }}
          >
            <div
              className="stat-icon"
              style={{
                width: 52,
                height: 52,
                minWidth: 52,
                borderRadius: 12,
                background:
                  LIGHT_BLUE,
                color: BLUE,
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
              }}
            >
              <PillIcon
                size={23}
              />
            </div>

            <div
              className="stat-info"
            >
              <h2
                style={{
                  color: NAVY,
                  fontFamily:
                    "'Poppins', sans-serif",
                  fontWeight: 700,
                }}
              >
                {stats.total_meds}
              </h2>

              <p
                style={{
                  color: NAVY,
                  fontFamily:
                    "'Poppins', sans-serif",
                }}
              >
                Medicines Prescribed
              </p>
            </div>
          </div>

          {/* REVENUE */}

          <div
            className="stat-card green"
            style={{
              borderRadius: 12,
              padding:
                '18px 22px',
              border:
                `1px solid ${BORDER}`,
              background: '#ffffff',
              boxShadow:
                '0 5px 16px rgba(15,42,82,0.06)',
            }}
          >
            <div
              className="stat-icon"
              style={{
                width: 52,
                height: 52,
                minWidth: 52,
                borderRadius: 12,
                background:
                  LIGHT_BLUE,
                color: BLUE,
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
              }}
            >
              <MoneyIcon
                size={23}
              />
            </div>

            <div
              className="stat-info"
            >
              <h2
                style={{
                  color: NAVY,
                  fontFamily:
                    "'Poppins', sans-serif",
                  fontWeight: 700,
                }}
              >
                ₹
                {Number(
                  stats.total_rev || 0
                ).toLocaleString(
                  'en-IN'
                )}
              </h2>

              <p
                style={{
                  color: NAVY,
                  fontFamily:
                    "'Poppins', sans-serif",
                }}
              >
                Consultation Revenue
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {records.length === 0 ? (
          <div
            className="empty-box"
            style={{
              fontFamily:
                "'Poppins', sans-serif",
            }}
          >
            <span
              className="empty-emoji"
              style={{
                color: BLUE,
                display: 'flex',
                justifyContent:
                  'center',
              }}
            >
              <StethoscopeIcon
                size={38}
              />
            </span>

            <h3
              style={{
                color: NAVY,
              }}
            >
              No consultations yet
            </h3>

            <p>
              Write your first
              prescription to get
              started.
            </p>

            <Link
              to="/doctor/prescriptions"
              style={{
                display:
                  'inline-block',
                marginTop: 16,
                color: BLUE,
                fontWeight: 600,
                textDecoration:
                  'none',
              }}
            >
              + Write First
              Prescription →
            </Link>
          </div>
        ) : (
          /* ====================================================
             CONSULTATION RECORDS
          ==================================================== */

          records.map((r) => (
            <div
              className="consult-card"
              key={r.id}
              style={{
                background:
                  '#ffffff',
                border:
                  `1px solid ${BORDER}`,
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow:
                  '0 5px 18px rgba(15,42,82,0.06)',
                marginBottom: 20,
                fontFamily:
                  "'Poppins', sans-serif",
              }}
            >
              {/* =================================================
                  HEADER
              ================================================= */}

              <div
                className="consult-header"
                style={{
                  padding:
                    '20px 26px',
                  background:
                    '#fbfcfe',
                  borderBottom:
                    `1px solid #e5ebf2`,
                }}
              >
                <div
                  className="patient-left"
                >
                  <div
                    className="pat-av"
                    style={{
                      background:
                        NAVY,
                      color:
                        '#ffffff',
                      fontWeight: 700,
                      fontFamily:
                        "'Poppins', sans-serif",
                    }}
                  >
                    {r.patient_name
                      ? r.patient_name
                          .charAt(0)
                          .toUpperCase()
                      : 'P'}
                  </div>

                  <div>
                    <div
                      className="c-pat-name"
                      style={{
                        color: NAVY,
                        fontWeight: 700,
                        fontFamily:
                          "'Poppins', sans-serif",
                      }}
                    >
                      {r.patient_name}
                    </div>

                    <div
                      className="c-pat-meta"
                      style={{
                        color: TEXT,
                        fontFamily:
                          "'Poppins', sans-serif",
                      }}
                    >
                      {r.age !== ''
                        ? `${r.age} yrs`
                        : ''}

                      {r.gender
                        ? ` • ${r.gender}`
                        : ''}

                      {r.blood_group
                        ? ` • Blood: ${r.blood_group}`
                        : ''}

                      {` • ${
                        Array.isArray(
                          r.medicines
                        )
                          ? r.medicines.length
                          : 0
                      } medicine(s)`}
                    </div>
                  </div>
                </div>

                <div
                  className="consult-right"
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'center',
                    gap: 10,
                    flexWrap:
                      'wrap',
                  }}
                >
                  {/* FEE */}

                  <span
                    className="fee-tag"
                    style={{
                      color: NAVY,
                      background:
                        '#eff6ff',
                      border:
                        '1px solid #bfdbfe',
                      fontWeight: 700,
                      fontFamily:
                        "'Poppins', sans-serif",
                    }}
                  >
                    ₹
                    {Number(
                      r.consultation_fee ||
                        0
                    ).toLocaleString(
                      'en-IN',
                      {
                        minimumFractionDigits: 2,
                      }
                    )}
                  </span>

                  {/* DATE */}

                  <span
                    className="date-tag"
                    style={{
                      color: TEXT,
                      fontFamily:
                        "'Poppins', sans-serif",
                      display: 'flex',
                      alignItems:
                        'center',
                      gap: 5,
                    }}
                  >
                    <ClockIcon
                      size={14}
                    />

                    {formatDateTime(
                      r.created_at
                    )}
                  </span>

                  {/* PRINT */}

                  <button
                    type="button"
                    onClick={() =>
                      openPrint(r)
                    }
                    style={{
                      display:
                        'inline-flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      gap: 6,
                      padding:
                        '7px 13px',
                      background:
                        '#eff6ff',
                      color:
                        NAVY,
                      border:
                        '1px solid #bfdbfe',
                      borderRadius: 7,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor:
                        'pointer',
                      fontFamily:
                        "'Poppins', sans-serif",
                    }}
                  >
                    <PrinterIcon
                      size={14}
                    />
                    Print
                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    className="btn-sm btn-del"
                    onClick={() =>
                      askDelete(r.id)
                    }
                    title="Delete consultation"
                    style={{
                      width: 38,
                      height: 34,
                      padding: 0,
                      display:
                        'inline-flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      background:
                        '#fffafa',
                      color: RED,
                      border:
                        '1px solid #fecaca',
                      borderRadius: 7,
                      cursor:
                        'pointer',
                    }}
                  >
                    <TrashIcon
                      size={16}
                    />
                  </button>
                </div>
              </div>

              {/* =================================================
                  BODY
              ================================================= */}

              <div
                className="consult-body"
                style={{
                  padding:
                    '22px 26px',
                }}
              >
                {/* =================================================
                    SYMPTOMS / DIAGNOSIS
                ================================================= */}

                {(r.symptoms ||
                  r.diagnosis) && (
                  <div
                    className="info-grid"
                    style={{
                      marginBottom: 20,
                    }}
                  >
                    {r.symptoms && (
                      <div
                        className="info-block"
                      >
                        <label
                          style={{
                            color:
                              '#7185a1',
                            fontWeight:
                              700,
                            fontSize: 12,
                            textTransform:
                              'uppercase',
                            letterSpacing:
                              '0.6px',
                            fontFamily:
                              "'Poppins', sans-serif",
                          }}
                        >
                          Symptoms
                        </label>

                        <p
                          style={{
                            color:
                              NAVY,
                            fontFamily:
                              "'Poppins', sans-serif",
                          }}
                        >
                          {r.symptoms}
                        </p>
                      </div>
                    )}

                    {r.diagnosis && (
                      <div
                        className="info-block"
                      >
                        <label
                          style={{
                            color:
                              '#7185a1',
                            fontWeight:
                              700,
                            fontSize: 12,
                            textTransform:
                              'uppercase',
                            letterSpacing:
                              '0.6px',
                            fontFamily:
                              "'Poppins', sans-serif",
                          }}
                        >
                          Diagnosis
                        </label>

                        <p
                          style={{
                            color:
                              NAVY,
                            fontFamily:
                              "'Poppins', sans-serif",
                          }}
                        >
                          {r.diagnosis}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* =================================================
                    MEDICINES
                ================================================= */}

                {Array.isArray(
                  r.medicines
                ) &&
                  r.medicines.length >
                    0 && (
                    <div
                      className="medicines-section"
                    >
                      <h4
                        style={{
                          color:
                            NAVY,
                          fontFamily:
                            "'Poppins', sans-serif",
                          display:
                            'flex',
                          alignItems:
                            'center',
                          gap: 7,
                        }}
                      >
                        <span
                          style={{
                            color:
                              BLUE,
                            display:
                              'flex',
                          }}
                        >
                          <PillIcon
                            size={17}
                          />
                        </span>

                        Prescribed
                        Medicines (
                        {
                          r
                            .medicines
                            .length
                        }
                        )
                      </h4>

                      <div
                        className="med-tags"
                      >
                        {r.medicines.map(
                          (
                            m,
                            index
                          ) => {
                            const isInjection =
                              String(
                                m.medicine_type ||
                                  ''
                              ).toLowerCase() ===
                              'injection';

                            return (
                              <div
                                key={`${m.id}-${index}`}
                                className={`med-tag${
                                  isInjection
                                    ? ' injection'
                                    : ''
                                }`}
                                style={{
                                  border:
                                    `1px solid ${BORDER}`,
                                  background:
                                    '#f8fafc',
                                  borderRadius: 9,
                                }}
                              >
                                <div
                                  className="mname"
                                  style={{
                                    color:
                                      NAVY,
                                    fontWeight:
                                      700,
                                    fontFamily:
                                      "'Poppins', sans-serif",
                                    display:
                                      'flex',
                                    alignItems:
                                      'center',
                                    gap: 6,
                                  }}
                                >
                                  <span
                                    style={{
                                      color:
                                        BLUE,
                                      display:
                                        'flex',
                                    }}
                                  >
                                    <PillIcon
                                      size={
                                        15
                                      }
                                    />
                                  </span>

                                  {m.medicine_name ||
                                    'Unnamed Medicine'}
                                </div>

                                <div
                                  className="mdetail"
                                  style={{
                                    color:
                                      MUTED,
                                    fontFamily:
                                      "'Poppins', sans-serif",
                                  }}
                                >
                                  {m.dosage ||
                                    '-'}

                                  {' • '}

                                  {m.frequency ||
                                    '-'}

                                  {' • '}

                                  {m.duration ||
                                    '-'}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                {/* =================================================
                    NOTES
                ================================================= */}

                {(r.notes_for_patient ||
                  r.additional_instructions) && (
                  <div
                    className="notes-section"
                    style={{
                      borderLeft:
                        `3px solid ${NAVY}`,
                      background:
                        '#eff6ff',
                      borderRadius:
                        '0 9px 9px 0',
                      padding:
                        '13px 16px',
                      marginTop: 18,
                    }}
                  >
                    <label
                      style={{
                        color:
                          NAVY,
                        fontWeight:
                          700,
                        fontSize: 12,
                        textTransform:
                          'uppercase',
                        letterSpacing:
                          '0.5px',
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap: 6,
                        fontFamily:
                          "'Poppins', sans-serif",
                      }}
                    >
                      <span
                        style={{
                          color:
                            NAVY,
                          display:
                            'flex',
                        }}
                      >
                        <NoteIcon
                          size={14}
                        />
                      </span>

                      Notes &
                      Instructions
                    </label>

                    {r.additional_instructions && (
                      <p
                        style={{
                          color:
                            NAVY,
                          fontFamily:
                            "'Poppins', sans-serif",
                        }}
                      >
                        {
                          r.additional_instructions
                        }
                      </p>
                    )}

                    {r.notes_for_patient && (
                      <p
                        style={{
                          marginTop: 4,
                          color:
                            NAVY,
                          fontFamily:
                            "'Poppins', sans-serif",
                        }}
                      >
                        {
                          r.notes_for_patient
                        }
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* ======================================================
            DELETE MODAL
        ====================================================== */}

        <ConfirmModal
          isOpen={confirmOpen}
          title="Delete Consultation?"
          message="This will permanently delete the consultation record and all associated medicines."
          confirmText="Yes, Delete"
          confirmColor="#ef4444"
          onConfirm={doDelete}
          onCancel={() => {
            setConfirmOpen(false);
            setDeleteTarget(null);
          }}
        />

        {/* ======================================================
            PRINT MODAL
        ====================================================== */}

        {printOpen && printRx && (
          <PrintPrescription
            prescription={printRx}
            doctorInfo={{
              full_name:
                user?.full_name ||
                user?.fullName ||
                doctorName,

              specialization:
                user?.specialization ||
                '',

              mobile:
                user?.mobile ||
                user?.phone ||
                '',
            }}
            clinicInfo={
              clinicInfo
            }
            onClose={
              closePrint
            }
          />
        )}
      </div>
    </Layout>
  );
}
