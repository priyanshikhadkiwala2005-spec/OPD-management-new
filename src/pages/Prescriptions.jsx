import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import {
  MEDICINE_CATEGORIES,
  INJECTIONS,
} from '../data/mockData';

import { API, getToken } from '../api';

// ============================================================
// FEE RULES
// ============================================================

const FEE_BY_TYPE = {
  General: 400,
  Emergency: 800,
  'Follow-up': 300,
  Review: 300,
};

// ============================================================
// NAVY COLORS
// ============================================================

/*
  Main navy used throughout this page.
  This matches the dark navy shown in your screenshot.
*/
const NAVY = '#0f2a52';
const NAVY_DARK = '#0a1f3d';
const NAVY_LIGHT = '#eef3f9';
const NAVY_BORDER = '#d4dfec';

// ============================================================
// ICONS
// ============================================================

function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  className = '',
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `rx-icon ${className}`.trim(),
    'aria-hidden': true,
  };

  switch (name) {
    case 'patient':
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="17" rx="3" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
        </svg>
      );

    case 'wallet':
      return (
        <svg {...common}>
          <path d="M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
          <path d="M3 7h16a2 2 0 0 1 2 2v2H16a2 2 0 0 0 0 4h5" />
          <path d="M16 13h.01" />
        </svg>
      );

    case 'activity':
      return (
        <svg {...common}>
          <path d="M3 12h4l3-8 4 16 3-8h4" />
        </svg>
      );

    case 'stethoscope':
      return (
        <svg {...common}>
          <path d="M6 3v5a6 6 0 0 0 12 0V3" />
          <path d="M3 3h6" />
          <path d="M15 3h6" />
          <path d="M12 14v3a4 4 0 0 0 8 0v-1" />
          <circle cx="20" cy="14" r="1.5" />
        </svg>
      );

    case 'pill':
      return (
        <svg {...common}>
          <path d="M7.05 20.95a5.5 5.5 0 0 1 0-7.78L13.17 7.05a5.5 5.5 0 0 1 7.78 7.78l-6.12 6.12a5.5 5.5 0 0 1-7.78 0Z" />
          <path d="m9.5 11.5 3 3" />
        </svg>
      );

    case 'syringe':
      return (
        <svg {...common}>
          <path d="M20.5 3.5 22 2" />
          <path d="m18.5 5.5 4 4" />
          <path d="m17 7 3 3" />
          <path d="m5 19 12-12 4 4L9 23H5Z" />
          <path d="m9 15 4 4" />
          <path d="m12 10 2 2" />
          <path d="m15 7 2 2" />
          <path d="m3 21 4-4" />
          <path d="m2 22 2-2" />
        </svg>
      );

    case 'clipboard':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="17" rx="2" />
          <path d="M9 4V2h6v2" />
          <path d="M8 10h8" />
          <path d="M8 14h8" />
          <path d="M8 18h5" />
        </svg>
      );

    case 'file':
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8" />
          <path d="M8 17h6" />
        </svg>
      );

    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );

    case 'x':
      return (
        <svg {...common}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );

    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case 'save':
      return (
        <svg {...common}>
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
          <path d="M17 21v-8H7v8" />
          <path d="M7 3v5h8" />
        </svg>
      );

    case 'alert':
      return (
        <svg {...common}>
          <path d="M10.3 3.3 2.2 17a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      );

    case 'success':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      );

    case 'chevron':
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );

    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    default:
      return null;
  }
}

// ============================================================
// SAFE JSON RESPONSE
// ============================================================

async function getResponseData(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Invalid JSON response:', text);
    return {};
  }
}

// ============================================================
// PRESCRIPTIONS PAGE
// ============================================================

export default function Prescriptions() {
  const { user } = useAuth();

  const doctorName =
    user?.full_name ||
    user?.fullName ||
    'Doctor';

  // ==========================================================
  // STATE
  // ==========================================================

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] =
    useState(true);

  const [visitType, setVisitType] = useState('');
  const [feeLoading, setFeeLoading] =
    useState(false);

  const [selected, setSelected] = useState([]);

  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] =
    useState('Medicine');

  // ==========================================================
  // FORM
  // ==========================================================

  const [form, setForm] = useState({
    patient_id: '',
    consultation_fee: '400',
    symptoms: '',
    diagnosis: '',
    additional_instructions: '',
    notes_for_patient: '',
  });

  // ==========================================================
  // FLASH MESSAGE
  // ==========================================================

  const showError = (message) => {
    setError(message || 'Something went wrong.');
    setSuccess('');

    window.setTimeout(() => {
      setError('');
    }, 5000);
  };

  const showSuccess = (message) => {
    setSuccess(message || 'Success.');
    setError('');

    window.setTimeout(() => {
      setSuccess('');
    }, 5000);
  };

  // ==========================================================
  // AUTH HEADERS
  // ==========================================================

  function getAuthHeaders(includeJson = false) {
    const token = getToken();

    const headers = {
      Accept: 'application/json',
    };

    if (includeJson) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // ==========================================================
  // NORMALIZE PATIENT
  // ==========================================================

  function normalizePatient(patient) {
    if (!patient) {
      return null;
    }

    const id =
      patient.id ||
      patient._id ||
      patient.patient_id ||
      patient.patientId?._id ||
      patient.patientId?.id ||
      patient.patientId ||
      '';

    if (!id) {
      return null;
    }

    const fullName =
      patient.full_name ||
      patient.fullName ||
      patient.name ||
      patient.patient_name ||
      patient.patientName ||
      patient.patient?.fullName ||
      patient.patient?.full_name ||
      patient.patientId?.fullName ||
      patient.patientId?.full_name ||
      'Unknown Patient';

    const mobile =
      patient.mobile ||
      patient.phone ||
      patient.patient_mobile ||
      patient.patientMobile ||
      patient.patient?.mobile ||
      patient.patient?.phone ||
      patient.patientId?.mobile ||
      patient.patientId?.phone ||
      '';

    const age =
      patient.age ??
      patient.patient_age ??
      patient.patient?.age ??
      patient.patientId?.age ??
      '';

    return {
      id: String(id),
      full_name: String(fullName),
      mobile: mobile || '',
      age,
    };
  }

  // ==========================================================
  // LOAD PATIENTS
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadPatients() {
      setPatientsLoading(true);
      setError('');

      const token = getToken();

      if (!token) {
        if (!cancelled) {
          setPatients([]);
          setPatientsLoading(false);
          setError('Please login again.');
        }

        return;
      }

      try {
        let registeredPatients = [];
        let appointmentPatients = [];

        // ======================================================
        // REGISTERED PATIENTS
        // ======================================================

        try {
          const response = await fetch(
            `${API}/patients`,
            {
              method: 'GET',
              headers: getAuthHeaders(false),
            }
          );

          const data =
            await getResponseData(response);

          if (response.ok && data?.success) {
            const rawPatients =
              data?.data?.patients ??
              data?.data ??
              [];

            if (Array.isArray(rawPatients)) {
              registeredPatients =
                rawPatients
                  .map(normalizePatient)
                  .filter(Boolean);
            }
          } else if (!response.ok) {
            console.error(
              'Patients API failed:',
              data?.message
            );
          }
        } catch (err) {
          console.error(
            'Patients API error:',
            err
          );
        }

        // ======================================================
        // APPOINTMENT PATIENTS
        // ======================================================

        try {
          const response = await fetch(
            `${API}/appointments`,
            {
              method: 'GET',
              headers: getAuthHeaders(false),
            }
          );

          const data =
            await getResponseData(response);

          if (response.ok && data?.success) {
            const appointments =
              data?.data?.appointments ??
              data?.data ??
              [];

            if (Array.isArray(appointments)) {
              appointmentPatients =
                appointments
                  .map((appointment) => {
                    if (!appointment) {
                      return null;
                    }

                    const nestedPatient =
                      appointment.patient ||
                      {};

                    const nestedPatientId =
                      appointment.patientId;

                    const patientId =
                      appointment.patient_id ||
                      appointment.patientId?._id ||
                      appointment.patientId?.id ||
                      appointment.patient?._id ||
                      appointment.patient?.id ||
                      (
                        typeof nestedPatientId ===
                        'string'
                          ? nestedPatientId
                          : ''
                      );

                    if (!patientId) {
                      return null;
                    }

                    const patientName =
                      appointment.patient_name ||
                      appointment.patientName ||
                      appointment.patient?.fullName ||
                      appointment.patient?.full_name ||
                      appointment.patientId?.fullName ||
                      appointment.patientId?.full_name ||
                      nestedPatient.fullName ||
                      nestedPatient.full_name ||
                      'Unknown Patient';

                    const patientAge =
                      appointment.patient_age ??
                      appointment.patient?.age ??
                      appointment.patientId?.age ??
                      nestedPatient.age ??
                      '';

                    const patientMobile =
                      appointment.patient_mobile ||
                      appointment.patientMobile ||
                      appointment.patient?.mobile ||
                      appointment.patient?.phone ||
                      appointment.patientId?.mobile ||
                      appointment.patientId?.phone ||
                      nestedPatient.mobile ||
                      '';

                    return {
                      id: String(patientId),
                      full_name: String(patientName),
                      mobile: patientMobile || '',
                      age: patientAge,
                    };
                  })
                  .filter(Boolean);
            }
          } else if (!response.ok) {
            console.error(
              'Appointments API failed:',
              data?.message
            );
          }
        } catch (err) {
          console.error(
            'Appointments API error:',
            err
          );
        }

        // ======================================================
        // MERGE PATIENTS
        // ======================================================

        const mergedMap = new Map();

        registeredPatients.forEach(
          (patient) => {
            mergedMap.set(
              String(patient.id),
              patient
            );
          }
        );

        appointmentPatients.forEach(
          (patient) => {
            const key = String(patient.id);

            const existing =
              mergedMap.get(key);

            if (existing) {
              mergedMap.set(key, {
                ...existing,

                full_name:
                  existing.full_name ||
                  patient.full_name,

                mobile:
                  existing.mobile ||
                  patient.mobile,

                age:
                  existing.age !== '' &&
                  existing.age !== null &&
                  existing.age !== undefined
                    ? existing.age
                    : patient.age,
              });
            } else {
              mergedMap.set(
                key,
                patient
              );
            }
          }
        );

        // ======================================================
        // SORT
        // ======================================================

        const finalPatients =
          Array.from(
            mergedMap.values()
          ).sort((a, b) =>
            String(
              a.full_name
            ).localeCompare(
              String(b.full_name)
            )
          );

        if (!cancelled) {
          setPatients(finalPatients);

          if (
            finalPatients.length === 0
          ) {
            setError(
              'No patients found.'
            );
          }
        }
      } catch (err) {
        console.error(
          'Load patients error:',
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              'Unable to load patients.'
          );
        }
      } finally {
        if (!cancelled) {
          setPatientsLoading(false);
        }
      }
    }

    loadPatients();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================================
  // PATIENT CHANGE
  // ==========================================================

  async function handlePatientChange(event) {
    const patientId =
      event.target.value;

    setVisitType('');

    setForm((previous) => ({
      ...previous,
      patient_id: patientId,
      consultation_fee: String(
        FEE_BY_TYPE.General
      ),
    }));

    if (!patientId) {
      return;
    }

    const token = getToken();

    if (!token) {
      showError(
        'Please login again.'
      );
      return;
    }

    setFeeLoading(true);

    try {
      const response = await fetch(
        `${API}/prescriptions/fee/${encodeURIComponent(
          patientId
        )}`,
        {
          method: 'GET',
          headers:
            getAuthHeaders(false),
        }
      );

      const data =
        await getResponseData(response);

      console.log(
        'Prescription fee response:',
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Unable to get consultation fee.'
        );
      }

      if (
        data?.success &&
        data?.data
      ) {
        const backendType =
          data.data.type ||
          'General';

        const normalizedType =
          FEE_BY_TYPE[
            backendType
          ]
            ? backendType
            : 'General';

        const backendFee =
          Number(
            data.data.fee
          );

        const fee =
          Number.isFinite(
            backendFee
          ) &&
          backendFee > 0
            ? backendFee
            : FEE_BY_TYPE[
                normalizedType
              ] ||
              FEE_BY_TYPE.General;

        setVisitType(
          normalizedType
        );

        setForm((previous) => ({
          ...previous,
          patient_id: patientId,
          consultation_fee:
            String(fee),
        }));
      } else {
        setVisitType(
          'General'
        );

        setForm((previous) => ({
          ...previous,
          patient_id: patientId,
          consultation_fee:
            String(
              FEE_BY_TYPE.General
            ),
        }));
      }
    } catch (err) {
      console.error(
        'Fee API error:',
        err
      );

      setVisitType(
        'General'
      );

      setForm((previous) => ({
        ...previous,
        patient_id: patientId,
        consultation_fee:
          String(
            FEE_BY_TYPE.General
          ),
      }));
    } finally {
      setFeeLoading(false);
    }
  }

  // ==========================================================
  // MEDICINE TOGGLE
  // ==========================================================

  function toggleMedicine(
    name,
    type
  ) {
    if (!name) {
      return;
    }

    setSelected((previous) => {
      const exists =
        previous.some(
          (medicine) =>
            String(
              medicine.name
            ).toLowerCase() ===
            String(name).toLowerCase()
        );

      if (exists) {
        return previous.filter(
          (medicine) =>
            String(
              medicine.name
            ).toLowerCase() !==
            String(name).toLowerCase()
        );
      }

      return [
        ...previous,
        {
          name: String(name),
          type:
            type ||
            'Medicine',
          dosage: '1 tablet',
          frequency:
            'Twice daily (BD)',
          duration: '5 Days',
        },
      ];
    });
  }

  // ==========================================================
  // ADD CUSTOM MEDICINE
  // ==========================================================

  function addCustom() {
    const name =
      customName.trim();

    if (!name) {
      showError(
        'Please enter a medicine name.'
      );
      return;
    }

    const alreadyExists =
      selected.some(
        (medicine) =>
          String(
            medicine.name
          ).toLowerCase() ===
          name.toLowerCase()
      );

    if (alreadyExists) {
      showError(
        'This medicine is already selected.'
      );
      return;
    }

    setSelected((previous) => [
      ...previous,
      {
        name,
        type:
          customType ||
          'Medicine',
        dosage: '1 tablet',
        frequency:
          'Twice daily (BD)',
        duration: '5 Days',
      },
    ]);

    setCustomName('');
  }

  // ==========================================================
  // REMOVE MEDICINE
  // ==========================================================

  function removeMedicine(name) {
    setSelected((previous) =>
      previous.filter(
        (medicine) =>
          medicine.name !== name
      )
    );
  }

  // ==========================================================
  // UPDATE MEDICINE
  // ==========================================================

  function updateMed(
    name,
    field,
    value
  ) {
    setSelected((previous) =>
      previous.map(
        (medicine) =>
          medicine.name === name
            ? {
                ...medicine,
                [field]: value,
              }
            : medicine
      )
    );
  }

  // ==========================================================
  // SAVE PRESCRIPTION
  // ==========================================================

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (!form.patient_id) {
      showError(
        'Please select a patient.'
      );
      return;
    }

    const token = getToken();

    if (!token) {
      showError(
        'Please login again.'
      );
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        patient_id:
          form.patient_id,

        consultation_fee:
          Number(
            form.consultation_fee
          ) || 0,

        symptoms:
          form.symptoms?.trim() ||
          '',

        diagnosis:
          form.diagnosis?.trim() ||
          '',

        additional_instructions:
          form.additional_instructions?.trim() ||
          '',

        notes_for_patient:
          form.notes_for_patient?.trim() ||
          '',

        medicines: selected.map(
          (medicine) => ({
            name:
              medicine.name || '',
            type:
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
          })
        ),
      };

      console.log(
        'Saving prescription:',
        payload
      );

      const response =
        await fetch(
          `${API}/prescriptions`,
          {
            method: 'POST',

            headers:
              getAuthHeaders(true),

            body: JSON.stringify(
              payload
            ),
          }
        );

      const data =
        await getResponseData(
          response
        );

      console.log(
        'Save prescription response:',
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Failed to save prescription.'
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.message ||
            'Failed to save prescription.'
        );
      }

      showSuccess(
        'Prescription saved successfully! You can view it in Consultations.'
      );

      setSelected([]);

      setVisitType('');

      setForm({
        patient_id: '',
        consultation_fee: '400',
        symptoms: '',
        diagnosis: '',
        additional_instructions:
          '',
        notes_for_patient: '',
      });
    } catch (err) {
      console.error(
        'Save prescription error:',
        err
      );

      showError(
        err?.message ||
          'Cannot connect to server. Make sure the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Layout
      role="doctor"
      name={doctorName}
      title="Write Prescription"
      subtitle="Create a complete prescription for your patient"
    >
      <style>{`
        /* ======================================================
           FONT
           ====================================================== */

        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        .prescription-page,
        .prescription-page *,
        .prescription-page input,
        .prescription-page textarea,
        .prescription-page select,
        .prescription-page button {
          font-family: 'Poppins', sans-serif !important;
          box-sizing: border-box;
        }

        .prescription-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 4px 0 50px;
          color: #0f172a;
        }
          

        /* ======================================================
           ALERTS
           ====================================================== */

        .rx-alert {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px 18px;
          margin-bottom: 20px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.6;
        }

        .rx-alert-success {
          color: #166534;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .rx-alert-error {
          color: #b91c1c;
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .rx-alert-icon {
          flex: 0 0 auto;
          margin-top: 1px;
        }

        /* ======================================================
           FORM
           ====================================================== */

        .rx-form {
          width: 100%;
        }

        .rx-card {
          background: #ffffff;
          border: 1px solid #e5eaf2;
          border-radius: 20px;
          padding: 28px 30px;
          margin-bottom: 20px;
          box-shadow:
            0 4px 14px rgba(15, 23, 42, 0.035),
            0 1px 3px rgba(15, 23, 42, 0.025);
        }

        .rx-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 25px;
        }

        .rx-heading-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rx-heading-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 42px;
          border-radius: 12px;
          color: ${NAVY};
          background: ${NAVY_LIGHT};
          border: 1px solid ${NAVY_BORDER};
        }

        .rx-section-heading h3 {
          margin: 0;
          color: ${NAVY};
          font-size: 18px;
          line-height: 1.35;
          font-weight: 700;
          letter-spacing: -0.25px;
        }

        .rx-section-heading p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 12px;
          font-weight: 400;
        }

        .rx-count {
          min-width: 34px;
          height: 30px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: ${NAVY_LIGHT};
          color: ${NAVY};
          font-size: 12px;
          font-weight: 700;
          border: 1px solid ${NAVY_BORDER};
        }

        /* ======================================================
           FORM ROW
           ====================================================== */

        .rx-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
          margin-bottom: 20px;
        }

        .rx-form-row:last-child {
          margin-bottom: 0;
        }

        .rx-form-group {
          min-width: 0;
        }

        .rx-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 9px;
          color: #172033;
          font-size: 13px;
          line-height: 1.4;
          font-weight: 600;
        }

        .rx-required {
          color: #dc2626;
        }

        .rx-field-wrap {
          position: relative;
        }

        .rx-form-control {
          width: 100%;
          min-height: 50px;
          padding: 0 15px;
          border: 1px solid #dce3ed;
          border-radius: 11px;
          outline: none;
          background: #ffffff;
          color: #172033;
          font-size: 13px;
          font-weight: 500;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .rx-form-control::placeholder {
          color: #a1aec0;
          font-weight: 400;
        }

        .rx-form-control:hover {
          border-color: #b7c7df;
        }

        .rx-form-control:focus {
          border-color: ${NAVY};
          box-shadow: 0 0 0 3px rgba(15, 42, 82, 0.10);
        }

        .rx-form-control:disabled {
          cursor: not-allowed;
          opacity: 0.7;
          background: #f8fafc;
        }

        select.rx-form-control {
          appearance: none;
          cursor: pointer;
          padding-right: 42px;
        }

        .rx-select-icon {
          position: absolute;
          top: 50%;
          right: 14px;
          transform: translateY(-50%);
          color: ${NAVY};
          pointer-events: none;
        }

        .rx-textarea {
          min-height: 108px;
          padding: 14px 15px;
          resize: vertical;
          line-height: 1.6;
        }

        .rx-fee-label {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .rx-visit-badge {
          display: inline-flex;
          align-items: center;
          min-height: 25px;
          padding: 2px 9px;
          border-radius: 8px;
          background: ${NAVY_LIGHT};
          color: ${NAVY};
          border: 1px solid ${NAVY_BORDER};
          font-size: 10px;
          font-weight: 700;
        }

        .rx-loading {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 500;
        }

        .rx-patient-help {
          margin-top: 8px;
          color: #dc2626;
          font-size: 11px;
          line-height: 1.5;
        }

        /* ======================================================
           MEDICINES
           ====================================================== */

        .rx-category {
          margin-bottom: 24px;
        }

        .rx-category:last-child {
          margin-bottom: 0;
        }

        /*
          CATEGORY TEXT + VERTICAL LINE
          BOTH USE THE SAME DARK NAVY.
        */

        .rx-category-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 11px;
          color: ${NAVY};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.55px;
        }

        /*
          THIS IS THE NAVY VERTICAL LINE
          BEFORE PAIN / FEVER / PARACETAMOL ETC.
        */

        .rx-category-line {
          width: 4px;
          height: 17px;
          flex: 0 0 4px;
          border-radius: 5px;
          background: ${NAVY};
        }

        .rx-pill-container {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        /* ======================================================
           ALL MEDICINES
           ====================================================== */

        .rx-med-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 40px;
          padding: 0 14px;
          border: 1px solid #dce5f0;
          border-radius: 10px;
          background: #f8fafc;
          color: #1e293b;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition:
            color 0.18s ease,
            background 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        /*
          COMMON MEDICINE HOVER
          USES THE SAME NAVY.
        */

        .rx-med-pill:hover {
          border-color: ${NAVY};
          background: ${NAVY_LIGHT};
          color: ${NAVY};
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(15, 42, 82, 0.10);
        }

        /*
          SELECTED MEDICINE
        */

        .rx-med-pill.selected {
          color: #ffffff;
          background: ${NAVY};
          border-color: ${NAVY};
          box-shadow: 0 4px 10px rgba(15, 42, 82, 0.18);
        }

        .rx-med-pill.selected:hover {
          color: #ffffff;
          background: ${NAVY};
          border-color: ${NAVY};
          transform: translateY(-1px);
        }

        .rx-med-pill-check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
        }

        /*
          INJECTION ICON = SAME NAVY
        */

        .rx-injection-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: ${NAVY};
          width: 18px;
          height: 18px;
        }

        .rx-injection-icon .rx-icon {
          color: ${NAVY};
          stroke: ${NAVY};
        }

        /* ======================================================
           CUSTOM MEDICINE
           ====================================================== */

        .rx-custom-box {
          margin-top: 25px;
          padding-top: 24px;
          border-top: 1px solid #e8edf4;
        }

        .rx-custom-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: ${NAVY};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.55px;
        }

        .rx-custom-heading-icon {
          width: 25px;
          height: 25px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          color: ${NAVY};
          background: ${NAVY_LIGHT};
          border: 1px solid ${NAVY_BORDER};
        }

        .rx-custom-form {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 190px auto;
          gap: 10px;
        }

        .rx-add-button {
          min-width: 90px;
          min-height: 50px;
          padding: 0 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 0;
          border-radius: 11px;
          background: ${NAVY};
          color: #ffffff;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rx-add-button:hover {
          background: ${NAVY_DARK};
          transform: translateY(-1px);
          box-shadow: 0 5px 13px rgba(15, 42, 82, 0.20);
        }

        /* ======================================================
           SELECTED MEDICINES
           ====================================================== */

        .rx-empty {
          min-height: 130px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px dashed #d7e0eb;
          border-radius: 14px;
          background: #f8fafc;
          text-align: center;
          padding: 22px;
        }

        .rx-empty-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 9px;
          border-radius: 12px;
          color: ${NAVY};
          background: ${NAVY_LIGHT};
          border: 1px solid ${NAVY_BORDER};
        }

        .rx-empty-title {
          color: #475569;
          font-size: 12px;
          font-weight: 600;
        }

        .rx-empty-text {
          margin-top: 4px;
          color: #94a3b8;
          font-size: 11px;
        }

        .rx-selected-list {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .rx-selected-med {
          padding: 18px;
          border: 1px solid #dfe6ef;
          border-radius: 14px;
          background: #fbfdff;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .rx-selected-med:hover {
          border-color: #b9c9df;
          box-shadow: 0 4px 12px rgba(15, 42, 82, 0.06);
        }

        .rx-selected-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 15px;
        }

        .rx-selected-title {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          min-width: 0;
        }

        .rx-selected-name {
          color: ${NAVY};
          font-size: 14px;
          font-weight: 700;
        }

        .rx-type-badge {
          display: inline-flex;
          align-items: center;
          min-height: 23px;
          padding: 2px 9px;
          border-radius: 7px;
          color: ${NAVY};
          background: ${NAVY_LIGHT};
          border: 1px solid ${NAVY_BORDER};
          font-size: 9px;
          font-weight: 700;
        }

        .rx-type-badge.injection {
          color: ${NAVY};
          background: ${NAVY_LIGHT};
          border-color: ${NAVY_BORDER};
        }

        .rx-remove {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 0;
          background: transparent;
          color: #dc2626;
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          padding: 5px 2px;
        }

        .rx-remove:hover {
          color: #b91c1c;
        }

        .rx-med-inputs {
          display: grid;
          grid-template-columns: 1fr 1.35fr 1fr;
          gap: 10px;
        }

        .rx-med-input,
        .rx-med-select {
          width: 100%;
          height: 45px;
          padding: 0 12px;
          border: 1px solid #dce3ed;
          border-radius: 9px;
          background: #ffffff;
          color: #334155;
          outline: none;
          font-family: inherit;
          font-size: 11px;
          font-weight: 500;
        }

        .rx-med-input:focus,
        .rx-med-select:focus {
          border-color: ${NAVY};
          box-shadow: 0 0 0 3px rgba(15, 42, 82, 0.09);
        }

        .rx-med-input::placeholder {
          color: #a1aec0;
        }

        /* ======================================================
           ADDITIONAL DETAILS
           ====================================================== */

        .rx-detail-group {
          margin-bottom: 20px;
        }

        .rx-detail-group:last-child {
          margin-bottom: 0;
        }

        /* ======================================================
           SAVE
           ====================================================== */

        .rx-submit-area {
          display: flex;
          justify-content: flex-end;
          margin-top: 4px;
        }

        .rx-save-button {
          min-width: 220px;
          min-height: 52px;
          padding: 0 23px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 0;
          border-radius: 12px;
          background: ${NAVY};
          color: #ffffff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 7px 17px rgba(15, 42, 82, 0.20);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .rx-save-button:hover:not(:disabled) {
          background: ${NAVY_DARK};
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(15, 42, 82, 0.24);
        }

        .rx-save-button:disabled {
          cursor: not-allowed;
          opacity: 0.55;
          box-shadow: none;
        }

        /* ======================================================
           SPINNER
           ====================================================== */

        .rx-spin {
          animation: rxSpin 1s linear infinite;
        }

        @keyframes rxSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* ======================================================
           RESPONSIVE
           ====================================================== */

        @media (max-width: 900px) {
          .prescription-page {
            padding: 0 2px 35px;
          }

          .rx-card {
            padding: 23px 20px;
          }

          .rx-custom-form {
            grid-template-columns: 1fr 1fr;
          }

          .rx-add-button {
            width: 100%;
          }
        }

        @media (max-width: 700px) {
          .rx-form-row {
            grid-template-columns: 1fr;
            gap: 18px;
            margin-bottom: 18px;
          }

          .rx-card {
            border-radius: 16px;
            padding: 20px 16px;
            margin-bottom: 15px;
          }

          .rx-section-heading {
            margin-bottom: 20px;
          }

          .rx-section-heading h3 {
            font-size: 16px;
          }

          .rx-heading-icon {
            width: 38px;
            height: 38px;
            flex-basis: 38px;
          }

          .rx-custom-form {
            grid-template-columns: 1fr;
          }

          .rx-med-inputs {
            grid-template-columns: 1fr;
          }

          .rx-selected-header {
            align-items: flex-start;
          }

          .rx-submit-area {
            width: 100%;
          }

          .rx-save-button {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .prescription-page {
            padding-bottom: 25px;
          }

          .rx-card {
            padding: 17px 13px;
          }

          .rx-section-heading {
            align-items: flex-start;
          }

          .rx-heading-left {
            align-items: flex-start;
          }

          .rx-heading-icon {
            width: 36px;
            height: 36px;
            flex-basis: 36px;
          }

          .rx-section-heading h3 {
            font-size: 14px;
          }

          .rx-section-heading p {
            font-size: 10px;
          }

          .rx-form-control {
            min-height: 47px;
            font-size: 12px;
          }

          .rx-textarea {
            min-height: 100px;
          }

          .rx-med-pill {
            width: 100%;
            justify-content: space-between;
            min-height: 42px;
          }

          .rx-selected-med {
            padding: 14px;
          }

          .rx-selected-header {
            flex-direction: column;
            gap: 8px;
          }

          .rx-remove {
            align-self: flex-start;
          }

          .rx-save-button {
            min-height: 50px;
          }
        }
      `}</style>

      <div className="prescription-page">

        {/* ====================================================
            ALERTS
        ==================================================== */}

        {success && (
          <div className="rx-alert rx-alert-success">
            <span className="rx-alert-icon">
              <Icon
                name="success"
                size={19}
              />
            </span>

            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="rx-alert rx-alert-error">
            <span className="rx-alert-icon">
              <Icon
                name="alert"
                size={19}
              />
            </span>

            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rx-form"
        >

          {/* ==================================================
              PATIENT & VISIT
          ================================================== */}

          <div className="rx-card">

            <div className="rx-section-heading">
              <div className="rx-heading-left">

                <div className="rx-heading-icon">
                  <Icon
                    name="patient"
                    size={20}
                  />
                </div>

                <div>
                  <h3>
                    Patient &amp; Visit
                  </h3>

                  <p>
                    Select the patient and consultation details
                  </p>
                </div>

              </div>
            </div>

            <div className="rx-form-row">

              {/* PATIENT */}

              <div className="rx-form-group">

                <label className="rx-label">
                  <span>
                    Patient{' '}
                    <span className="rx-required">
                      *
                    </span>
                  </span>
                </label>

                <div className="rx-field-wrap">

                  <select
                    className="rx-form-control"
                    value={
                      form.patient_id
                    }
                    onChange={
                      handlePatientChange
                    }
                    disabled={
                      patientsLoading ||
                      loading
                    }
                    required
                  >
                    <option value="">
                      {patientsLoading
                        ? 'Loading patients...'
                        : patients.length === 0
                        ? 'No patients found'
                        : 'Select patient'}
                    </option>

                    {patients.map(
                      (patient) => (
                        <option
                          key={
                            patient.id
                          }
                          value={
                            patient.id
                          }
                        >
                          {
                            patient.full_name
                          }

                          {patient.age !==
                            '' &&
                          patient.age !==
                            null &&
                          patient.age !==
                            undefined
                            ? ` (${patient.age} yrs)`
                            : ''}
                        </option>
                      )
                    )}
                  </select>

                  <span className="rx-select-icon">
                    <Icon
                      name="chevron"
                      size={17}
                    />
                  </span>

                </div>

                {!patientsLoading &&
                  patients.length ===
                    0 && (
                    <div className="rx-patient-help">
                      No patients are available. Make sure the
                      patient has been registered or has booked
                      an appointment.
                    </div>
                  )}

              </div>

              {/* CONSULTATION FEE */}

              <div className="rx-form-group">

                <label className="rx-label">

                  <span className="rx-fee-label">

                    <span>
                      Consultation Fee (₹)
                    </span>

                    {visitType && (
                      <span className="rx-visit-badge">
                        {visitType} • ₹{form.consultation_fee}
                      </span>
                    )}

                    {feeLoading && (
                      <span className="rx-loading">
                        Loading...
                      </span>
                    )}

                  </span>

                </label>

                <div className="rx-field-wrap">

                  <input
                    type="number"
                    className="rx-form-control"
                    placeholder="Enter consultation fee"
                    min="0"
                    step="0.01"
                    value={
                      form.consultation_fee
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (previous) => ({
                          ...previous,
                          consultation_fee:
                            event.target
                              .value,
                        })
                      )
                    }
                  />

                </div>

              </div>

            </div>

            {/* SYMPTOMS + DIAGNOSIS */}

            <div className="rx-form-row">

              <div className="rx-form-group">

                <label className="rx-label">
                  Symptoms
                </label>

                <textarea
                  className="rx-form-control rx-textarea"
                  placeholder="Describe the patient's symptoms..."
                  value={
                    form.symptoms
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        symptoms:
                          event.target
                            .value,
                      })
                    )
                  }
                />

              </div>

              <div className="rx-form-group">

                <label className="rx-label">
                  Diagnosis
                </label>

                <textarea
                  className="rx-form-control rx-textarea"
                  placeholder="Enter diagnosis..."
                  value={
                    form.diagnosis
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        diagnosis:
                          event.target
                            .value,
                      })
                    )
                  }
                />

              </div>

            </div>

          </div>

          {/* ==================================================
              COMMON MEDICINES
          ================================================== */}

          <div className="rx-card">

            <div className="rx-section-heading">

              <div className="rx-heading-left">

                <div className="rx-heading-icon">
                  <Icon
                    name="pill"
                    size={20}
                  />
                </div>

                <div>
                  <h3>
                    Common Medicines
                  </h3>

                  <p>
                    Select medicines to add to this prescription
                  </p>
                </div>

              </div>

              {selected.length > 0 && (
                <span className="rx-count">
                  {selected.length}
                </span>
              )}

            </div>

            {Object.entries(
              MEDICINE_CATEGORIES || {}
            ).map(
              ([category, medicines]) => (
                <div
                  className="rx-category"
                  key={category}
                >

                  <div className="rx-category-label">

                    <span className="rx-category-line" />

                    {category}

                  </div>

                  <div className="rx-pill-container">

                    {Array.isArray(
                      medicines
                    ) &&
                      medicines.map(
                        (medicine) => {

                          const isSelected =
                            selected.some(
                              (item) =>
                                item.name ===
                                medicine
                            );

                          return (
                            <button
                              key={
                                medicine
                              }
                              type="button"
                              className={`rx-med-pill${
                                isSelected
                                  ? ' selected'
                                  : ''
                              }`}
                              onClick={() =>
                                toggleMedicine(
                                  medicine,
                                  'Medicine'
                                )
                              }
                            >

                              <span>
                                {medicine}
                              </span>

                              {isSelected && (
                                <span className="rx-med-pill-check">

                                  <Icon
                                    name="check"
                                    size={11}
                                    strokeWidth={3}
                                  />

                                </span>
                              )}

                            </button>
                          );
                        }
                      )}

                  </div>

                </div>
              )
            )}

            {/* =================================================
                INJECTIONS
            ================================================= */}

            <div className="rx-category">

              <div className="rx-category-label">

                <span className="rx-category-line" />

                <span className="rx-injection-icon">
                  <Icon
                    name="syringe"
                    size={17}
                    strokeWidth={2}
                  />
                </span>

                <span>
                  Injections
                </span>

              </div>

              <div className="rx-pill-container">

                {Array.isArray(
                  INJECTIONS
                ) &&
                  INJECTIONS.map(
                    (injection) => {

                      const isSelected =
                        selected.some(
                          (item) =>
                            item.name ===
                            injection
                        );

                      return (
                        <button
                          key={
                            injection
                          }
                          type="button"
                          className={`rx-med-pill${
                            isSelected
                              ? ' selected'
                              : ''
                          }`}
                          onClick={() =>
                            toggleMedicine(
                              injection,
                              'Injection'
                            )
                          }
                        >

                          <span>
                            {injection}
                          </span>

                          {isSelected && (
                            <span className="rx-med-pill-check">

                              <Icon
                                name="check"
                                size={11}
                                strokeWidth={3}
                              />

                            </span>
                          )}

                        </button>
                      );
                    }
                  )}

              </div>

            </div>

            {/* =================================================
                CUSTOM MEDICINE
            ================================================= */}

            <div className="rx-custom-box">

              <div className="rx-custom-heading">

                <span className="rx-custom-heading-icon">
                  <Icon
                    name="plus"
                    size={14}
                  />
                </span>

                Add Custom Medicine

              </div>

              <div className="rx-custom-form">

                <input
                  type="text"
                  className="rx-form-control"
                  placeholder="Enter medicine name"
                  value={
                    customName
                  }
                  onChange={(
                    event
                  ) =>
                    setCustomName(
                      event.target
                        .value
                    )
                  }
                />

                <div className="rx-field-wrap">

                  <select
                    className="rx-form-control"
                    value={
                      customType
                    }
                    onChange={(
                      event
                    ) =>
                      setCustomType(
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="Medicine">
                      Medicine
                    </option>

                    <option value="Injection">
                      Injection
                    </option>
                  </select>

                  <span className="rx-select-icon">
                    <Icon
                      name="chevron"
                      size={16}
                    />
                  </span>

                </div>

                <button
                  type="button"
                  className="rx-add-button"
                  onClick={
                    addCustom
                  }
                >
                  <Icon
                    name="plus"
                    size={16}
                    strokeWidth={2.5}
                  />

                  Add
                </button>

              </div>

            </div>

          </div>

          {/* ==================================================
              SELECTED MEDICINES
          ================================================== */}

          <div className="rx-card">

            <div className="rx-section-heading">

              <div className="rx-heading-left">

                <div className="rx-heading-icon">
                  <Icon
                    name="clipboard"
                    size={20}
                  />
                </div>

                <div>
                  <h3>
                    Selected Medicines
                  </h3>

                  <p>
                    Configure dosage, frequency and duration
                  </p>
                </div>

              </div>

              <span className="rx-count">
                {selected.length}
              </span>

            </div>

            {selected.length ===
            0 ? (
              <div className="rx-empty">

                <div className="rx-empty-icon">
                  <Icon
                    name="pill"
                    size={20}
                  />
                </div>

                <div className="rx-empty-title">
                  No medicines selected yet
                </div>

                <div className="rx-empty-text">
                  Click a medicine above to add it to the prescription.
                </div>

              </div>
            ) : (
              <div className="rx-selected-list">

                {selected.map(
                  (medicine) => (
                    <div
                      className="rx-selected-med"
                      key={`${medicine.name}-${medicine.type}`}
                    >

                      <div className="rx-selected-header">

                        <div className="rx-selected-title">

                          <span className="rx-selected-name">
                            {
                              medicine.name
                            }
                          </span>

                          <span
                            className={`rx-type-badge${
                              medicine.type ===
                              'Injection'
                                ? ' injection'
                                : ''
                            }`}
                          >
                            {
                              medicine.type
                            }
                          </span>

                        </div>

                        <button
                          type="button"
                          className="rx-remove"
                          onClick={() =>
                            removeMedicine(
                              medicine.name
                            )
                          }
                        >

                          <Icon
                            name="x"
                            size={14}
                            strokeWidth={2.5}
                          />

                          Remove

                        </button>

                      </div>

                      <div className="rx-med-inputs">

                        <input
                          type="text"
                          className="rx-med-input"
                          placeholder="Dosage"
                          value={
                            medicine.dosage
                          }
                          onChange={(
                            event
                          ) =>
                            updateMed(
                              medicine.name,
                              'dosage',
                              event.target
                                .value
                            )
                          }
                        />

                        <select
                          className="rx-med-select"
                          value={
                            medicine.frequency
                          }
                          onChange={(
                            event
                          ) =>
                            updateMed(
                              medicine.name,
                              'frequency',
                              event.target
                                .value
                            )
                          }
                        >

                          <option>
                            Once daily (OD)
                          </option>

                          <option>
                            Twice daily (BD)
                          </option>

                          <option>
                            Thrice daily (TDS)
                          </option>

                          <option>
                            Four times (QID)
                          </option>

                          <option>
                            As needed (SOS)
                          </option>

                        </select>

                        <input
                          type="text"
                          className="rx-med-input"
                          placeholder="Duration"
                          value={
                            medicine.duration
                          }
                          onChange={(
                            event
                          ) =>
                            updateMed(
                              medicine.name,
                              'duration',
                              event.target
                                .value
                            )
                          }
                        />

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

          {/* ==================================================
              ADDITIONAL DETAILS
          ================================================== */}

          <div className="rx-card">

            <div className="rx-section-heading">

              <div className="rx-heading-left">

                <div className="rx-heading-icon">
                  <Icon
                    name="file"
                    size={20}
                  />
                </div>

                <div>
                  <h3>
                    Additional Details
                  </h3>

                  <p>
                    Add instructions and notes for the patient
                  </p>
                </div>

              </div>

            </div>

            <div className="rx-detail-group">

              <div className="rx-form-group">

                <label className="rx-label">
                  Additional Instructions
                </label>

                <textarea
                  className="rx-form-control rx-textarea"
                  placeholder="e.g. Take after meals, avoid alcohol..."
                  value={
                    form.additional_instructions
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        additional_instructions:
                          event.target
                            .value,
                      })
                    )
                  }
                />

              </div>

            </div>

            <div className="rx-detail-group">

              <div className="rx-form-group">

                <label className="rx-label">
                  Notes for Patient
                </label>

                <textarea
                  className="rx-form-control rx-textarea"
                  placeholder="Any notes or advice for the patient..."
                  value={
                    form.notes_for_patient
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        notes_for_patient:
                          event.target
                            .value,
                      })
                    )
                  }
                />

              </div>

            </div>

          </div>

          {/* ==================================================
              SAVE
          ================================================== */}

          <div className="rx-submit-area">

            <button
              type="submit"
              className="rx-save-button"
              disabled={
                loading ||
                patientsLoading ||
                feeLoading ||
                !form.patient_id
              }
            >

              {loading ? (
                <>
                  <Icon
                    name="activity"
                    size={17}
                    className="rx-spin"
                  />

                  Saving Prescription...
                </>
              ) : (
                <>
                  <Icon
                    name="save"
                    size={17}
                  />

                  Save Prescription
                </>
              )}

            </button>

          </div>

        </form>

      </div>
    </Layout>
  );
}