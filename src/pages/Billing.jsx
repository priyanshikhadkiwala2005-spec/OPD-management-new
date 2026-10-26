import { useState, useEffect } from 'react';
import {
  BadgeIndianRupee,
  Clock3,
  ReceiptText,
  FilePlus2,
  Trash2,
  CircleCheck,
  TriangleAlert,
  Plus,
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../data/mockData';
import ConfirmModal from '../components/ConfirmModal';
import ReceiptModal from '../components/ReceiptModal';

import { API, getToken } from '../api';

export default function Billing() {
  const { user } = useAuth();

  const doctorName =
    user?.full_name ||
    user?.fullName ||
    'Doctor';

  // ============================================================
  // COLORS
  // ============================================================

  const NAVY = '#0f2a52';
  const BLUE = '#2563eb';

  // ============================================================
  // STATE
  // ============================================================

  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);

  const [summary, setSummary] = useState({
    total_paid: 0,
    total_pending: 0,
    total_bills: 0,
  });

  const [loading, setLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] =
    useState(true);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [clinicInfo, setClinicInfo] = useState(null);

  const [form, setForm] = useState({
    patient_id: '',
    amount: '',
    payment_status: 'Pending',
  });

  // ============================================================
  // MODALS
  // ============================================================

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptBill, setReceiptBill] = useState(null);

  // ============================================================
  // AUTH HEADERS
  // ============================================================

  function getAuthHeaders(includeJson = false) {
    const token = getToken();

    const headers = {
      Authorization: token
        ? `Bearer ${token}`
        : '',
    };

    if (includeJson) {
      headers['Content-Type'] =
        'application/json';
    }

    return headers;
  }

  // ============================================================
  // FLASH MESSAGE
  // ============================================================

  function flash(message, isError = false) {
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
  }

  // ============================================================
  // SAFE JSON RESPONSE
  // ============================================================

  async function getJson(response) {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch (err) {
      console.error(
        'Invalid JSON response:',
        text
      );

      return {
        success: false,
        message:
          'Server returned an invalid response.',
      };
    }
  }

  // ============================================================
  // LOAD BILLS
  // GET /api/billing
  // ============================================================

  async function loadBills() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API}/billing`,
        {
          method: 'GET',
          headers: getAuthHeaders(false),
        }
      );

      const data = await getJson(response);

      console.log(
        'Billing API response:',
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Unable to load bills.'
        );
      }

      if (data.success) {
        const rawBills =
          data.data?.bills ||
          data.bills ||
          [];

        setBills(
          Array.isArray(rawBills)
            ? rawBills
            : []
        );

        setSummary({
          total_paid:
            Number(
              data.data?.total_paid ??
                data.total_paid ??
                0
            ),

          total_pending:
            Number(
              data.data?.total_pending ??
                data.total_pending ??
                0
            ),

          total_bills:
            Number(
              data.data?.total_bills ??
                data.total_bills ??
                rawBills.length ??
                0
            ),
        });
      } else {
        throw new Error(
          data.message ||
            'Unable to load bills.'
        );
      }
    } catch (err) {
      console.error(
        'Load bills error:',
        err
      );

      setError(
        err.message ||
          'Unable to load bills.'
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // NORMALIZE PATIENT
  // ============================================================

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
      'Unknown Patient';

    const mobile =
      patient.mobile ||
      patient.phone ||
      patient.patient_mobile ||
      patient.patientMobile ||
      '';

    const age =
      patient.age ??
      patient.patient_age ??
      patient.patientAge ??
      '';

    return {
      id: String(id),
      full_name: String(fullName),
      mobile: String(mobile || ''),
      age,
    };
  }

  // ============================================================
  // EXTRACT PATIENT FROM APPOINTMENT
  // ============================================================

  function normalizeAppointmentPatient(
    appointment
  ) {
    if (!appointment) {
      return null;
    }

    const patientObject =
      appointment.patient &&
      typeof appointment.patient ===
        'object'
        ? appointment.patient
        : {};

    const patientIdObject =
      appointment.patientId &&
      typeof appointment.patientId ===
        'object'
        ? appointment.patientId
        : {};

    const patientId =
      appointment.patient_id ||
      patientObject._id ||
      patientObject.id ||
      patientIdObject._id ||
      patientIdObject.id ||
      (typeof appointment.patientId ===
      'string'
        ? appointment.patientId
        : '');

    if (!patientId) {
      return null;
    }

    const patientName =
      appointment.patient_name ||
      appointment.patientName ||
      patientObject.fullName ||
      patientObject.full_name ||
      patientObject.name ||
      patientIdObject.fullName ||
      patientIdObject.full_name ||
      patientIdObject.name ||
      'Unknown Patient';

    const patientMobile =
      appointment.patient_mobile ||
      appointment.patientMobile ||
      patientObject.mobile ||
      patientObject.phone ||
      patientIdObject.mobile ||
      patientIdObject.phone ||
      '';

    const patientAge =
      appointment.patient_age ??
      appointment.patientAge ??
      patientObject.age ??
      patientIdObject.age ??
      '';

    return {
      id: String(patientId),
      full_name: String(patientName),
      mobile: String(
        patientMobile || ''
      ),
      age: patientAge,
    };
  }

  // ============================================================
  // LOAD PATIENTS
  // ============================================================

  async function loadPatients() {
    setPatientsLoading(true);

    try {
      const headers =
        getAuthHeaders(false);

      let registeredPatients = [];
      let appointmentPatients = [];

      // ========================================================
      // 1. REGISTERED PATIENTS
      // ========================================================

      try {
        const response = await fetch(
          `${API}/patients`,
          {
            method: 'GET',
            headers,
          }
        );

        const data =
          await getJson(response);

        console.log(
          'Patients API response:',
          data
        );

        if (
          response.ok &&
          data.success
        ) {
          const rawPatients =
            data.data?.patients ||
            data.data ||
            data.patients ||
            [];

          if (
            Array.isArray(rawPatients)
          ) {
            registeredPatients =
              rawPatients
                .map(
                  normalizePatient
                )
                .filter(Boolean);
          }
        }
      } catch (err) {
        console.error(
          'Patients API error:',
          err
        );
      }

      // ========================================================
      // 2. APPOINTMENT PATIENTS
      // ========================================================

      try {
        const response = await fetch(
          `${API}/appointments`,
          {
            method: 'GET',
            headers,
          }
        );

        const data =
          await getJson(response);

        console.log(
          'Appointments API response:',
          data
        );

        if (
          response.ok &&
          data.success
        ) {
          const rawAppointments =
            data.data?.appointments ||
            data.appointments ||
            data.data ||
            [];

          if (
            Array.isArray(
              rawAppointments
            )
          ) {
            appointmentPatients =
              rawAppointments
                .map(
                  normalizeAppointmentPatient
                )
                .filter(Boolean);
          }
        }
      } catch (err) {
        console.error(
          'Appointments API error:',
          err
        );
      }

      // ========================================================
      // 3. MERGE
      // ========================================================

      const patientMap = new Map();

      registeredPatients.forEach(
        (patient) => {
          patientMap.set(
            String(patient.id),
            patient
          );
        }
      );

      appointmentPatients.forEach(
        (patient) => {
          const key =
            String(patient.id);

          const existing =
            patientMap.get(key);

          if (existing) {
            patientMap.set(key, {
              ...existing,

              full_name:
                existing.full_name &&
                existing.full_name !==
                  'Unknown Patient'
                  ? existing.full_name
                  : patient.full_name,

              mobile:
                existing.mobile ||
                patient.mobile,

              age:
                existing.age !== '' &&
                existing.age !== null &&
                existing.age !==
                  undefined
                  ? existing.age
                  : patient.age,
            });
          } else {
            patientMap.set(
              key,
              patient
            );
          }
        }
      );

      // ========================================================
      // 4. SORT
      // ========================================================

      const finalPatients =
        Array.from(
          patientMap.values()
        ).sort((a, b) =>
          String(
            a.full_name
          ).localeCompare(
            String(b.full_name)
          )
        );

      console.log(
        'Final billing patients:',
        finalPatients
      );

      setPatients(
        finalPatients
      );
    } catch (err) {
      console.error(
        'Load patients error:',
        err
      );

      setError(
        err.message ||
          'Unable to load patients.'
      );
    } finally {
      setPatientsLoading(false);
    }
  }

  // ============================================================
  // LOAD CLINIC SETTINGS
  // ============================================================

  async function loadClinicInfo() {
    try {
      const response = await fetch(
        `${API}/settings`,
        {
          method: 'GET',
          headers:
            getAuthHeaders(false),
        }
      );

      const data =
        await getJson(response);

      console.log(
        'Settings API response:',
        data
      );

      if (
        response.ok &&
        data.success
      ) {
        setClinicInfo(
          data.data?.clinic ||
            data.clinic ||
            null
        );
      }
    } catch (err) {
      console.error(
        'Settings API error:',
        err
      );
    }
  }

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadBills();
    loadPatients();
    loadClinicInfo();
  }, []);

  // ============================================================
  // GENERATE BILL
  // ============================================================

  async function handleGenerate(e) {
    e.preventDefault();

    const patientId =
      String(
        form.patient_id || ''
      ).trim();

    const amount =
      Number(form.amount);

    if (!patientId) {
      flash(
        'Please select a patient.',
        true
      );
      return;
    }

    if (
      !form.amount ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      flash(
        'Please enter a valid amount.',
        true
      );
      return;
    }

    try {
      const response =
        await fetch(
          `${API}/billing`,
          {
            method: 'POST',

            headers:
              getAuthHeaders(true),

            body: JSON.stringify({
              patient_id:
                patientId,

              amount,

              payment_status:
                form.payment_status ||
                'Pending',
            }),
          }
        );

      const data =
        await getJson(response);

      console.log(
        'Generate bill response:',
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            'Failed to generate bill.'
        );
      }

      flash(
        'Bill generated successfully!'
      );

      setForm({
        patient_id: '',
        amount: '',
        payment_status:
          'Pending',
      });

      await loadBills();
    } catch (err) {
      console.error(
        'Generate bill error:',
        err
      );

      flash(
        err.message ||
          'Server error while generating bill.',
        true
      );
    }
  }

  // ============================================================
  // UPDATE PAYMENT STATUS
  // ============================================================

  async function handleUpdateStatus(
    id,
    newStatus
  ) {
    if (!id) {
      flash(
        'Invalid bill ID.',
        true
      );
      return;
    }

    try {
      const response = await fetch(
        `${API}/billing/${encodeURIComponent(id)}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            payment_status: newStatus,
          }),
        }
      );

      const data =
        await getJson(response);

      console.log(
        'Update payment response:',
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            'Failed to update payment status.'
        );
      }

      flash(
        'Payment status updated!'
      );

      await loadBills();
    } catch (err) {
      console.error(
        'Update status error:',
        err
      );

      flash(
        err.message ||
          'Server error while updating payment status.',
        true
      );
    }
  }

  // ============================================================
  // DELETE BILL
  // ============================================================

  async function doDelete() {
    const id = deleteTarget;

    setConfirmOpen(false);

    if (!id) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API}/billing?id=${encodeURIComponent(
            id
          )}`,
          {
            method: 'DELETE',

            headers:
              getAuthHeaders(false),
          }
        );

      const data =
        await getJson(response);

      console.log(
        'Delete bill response:',
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            'Failed to delete bill.'
        );
      }

      flash(
        'Bill deleted!'
      );

      setDeleteTarget(null);

      await loadBills();
    } catch (err) {
      console.error(
        'Delete bill error:',
        err
      );

      flash(
        err.message ||
          'Server error while deleting bill.',
        true
      );
    }
  }

  // ============================================================
  // BILL ID HELPER
  // ============================================================

  function getBillId(bill) {
    if (!bill) {
      return '';
    }

    return (
      bill.id ||
      bill._id ||
      bill.bill_id ||
      ''
    );
  }

  // ============================================================
  // BILL PATIENT NAME HELPER
  // ============================================================

  function getBillPatientName(bill) {
    if (!bill) {
      return 'Unknown Patient';
    }

    return (
      bill.patient_name ||
      bill.patientName ||
      bill.patient?.fullName ||
      bill.patient?.full_name ||
      bill.patient?.name ||
      'Unknown Patient'
    );
  }

  // ============================================================
  // BILL STATUS HELPER
  // ============================================================

  function getBillStatus(bill) {
    return (
      bill?.payment_status ||
      bill?.paymentStatus ||
      'Pending'
    );
  }

  // ============================================================
  // BILL AMOUNT HELPER
  // ============================================================

  function getBillAmount(bill) {
    return Number(
      bill?.amount || 0
    );
  }

  // ============================================================
  // BILL DATE HELPER
  // ============================================================

  function getBillDate(bill) {
    return (
      bill?.created_at ||
      bill?.createdAt ||
      bill?.date ||
      ''
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Layout
      role="doctor"
      name={doctorName}
      title="Billing"
      subtitle="Generate and manage patient bills"
    >

      {/* ======================================================
          BILLING PAGE FONT + COLOR OVERRIDES
      ====================================================== */}

      <style>{`
        .billing-page,
        .billing-page *,
        .billing-page input,
        .billing-page select,
        .billing-page button {
          font-family: 'Poppins', sans-serif !important;
        }

        .billing-page h1,
        .billing-page h2,
        .billing-page h3,
        .billing-page h4,
        .billing-page strong,
        .billing-page label,
        .billing-page th,
        .billing-page .table-header h2 {
          color: ${NAVY} !important;
        }

        /* Summary numbers */
        .billing-page .sum-card h2 {
          color: ${NAVY} !important;
        }

        /* Summary labels */
        .billing-page .sum-card p {
          color: ${NAVY} !important;
        }

        /* Generate New Bill */
        .billing-page .form-card h3 {
          color: ${NAVY} !important;
        }

        /* My Bills */
        .billing-page .table-header h2 {
          color: ${NAVY} !important;
        }

        /* Table headings */
        .billing-page table thead th {
          color: ${NAVY} !important;
        }

        /* Patient names */
        .billing-page table tbody td strong {
          color: ${NAVY} !important;
        }

        /* Amount */
        .billing-page table tbody td {
          color: ${NAVY};
        }

        .billing-page table tbody td[style*="font-size"] {
          color: ${NAVY} !important;
        }

        /* Generate button */
        .billing-page .btn-generate {
          background: ${NAVY} !important;
          border-color: ${NAVY} !important;
          color: #ffffff !important;
        }

        .billing-page .btn-generate:hover {
          background: #0b2142 !important;
          border-color: #0b2142 !important;
        }

        /* Receipt button */
        .billing-page .btn-view {
          background: #ffffff !important;
          border-color: ${NAVY} !important;
          color: ${NAVY} !important;
        }

        .billing-page .btn-view:hover {
          background: ${NAVY} !important;
          color: #ffffff !important;
        }

        /* Update button */
        .billing-page .btn-update {
          background: ${NAVY} !important;
          border-color: ${NAVY} !important;
          color: #ffffff !important;
        }

        .billing-page .btn-update:hover {
          background: #0b2142 !important;
          border-color: #0b2142 !important;
        }

        /* Status badges */
        .billing-page .badge-paid,
        .billing-page .badge-pending {
          color: ${NAVY} !important;
        }

        /* Blue icons */
        .billing-page .billing-icon {
          color: ${BLUE} !important;
        }

        /* Form controls */
        .billing-page select:focus,
        .billing-page input:focus {
          border-color: ${NAVY} !important;
          box-shadow: 0 0 0 3px rgba(15, 42, 82, 0.10) !important;
          outline: none !important;
        }

        /* Delete must remain RED */
        .billing-page .btn-del {
          color: #ef4444 !important;
          border-color: #fecaca !important;
          background: #ffffff !important;
        }

        .billing-page .btn-del:hover {
          color: #ffffff !important;
          background: #ef4444 !important;
          border-color: #ef4444 !important;
        }

        /* Error text remains red */
        .billing-page .no-patients-message {
          color: #ef4444 !important;
        }
      `}</style>

      <div
        className="billing-page"
        style={{
          fontFamily:
            "'Poppins', sans-serif",
        }}
      >

        {/* ======================================================
            ALERTS
        ====================================================== */}

        {success && (
          <div className="alert alert-success">
            <span
              className="billing-icon"
              style={{
                color: BLUE,
                display: 'inline-flex',
                alignItems: 'center',
                verticalAlign: 'middle',
              }}
            >
              <CircleCheck
                size={18}
                strokeWidth={2.2}
              />
            </span>{' '}
            {success}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span
              style={{
                color: '#ef4444',
                display: 'inline-flex',
                alignItems: 'center',
                verticalAlign: 'middle',
              }}
            >
              <TriangleAlert
                size={18}
                strokeWidth={2.2}
              />
            </span>{' '}
            {error}
          </div>
        )}

        {/* ======================================================
            SUMMARY
        ====================================================== */}

        <div className="summary-cards">

          <div className="sum-card green">
            <h2
              style={{
                color: NAVY,
              }}
            >
              ₹
              {Number(
                summary.total_paid
              ).toLocaleString(
                'en-IN',
                {
                  minimumFractionDigits: 2,
                }
              )}
            </h2>

            <p
              style={{
                color: NAVY,
              }}
            >
              <span
                className="billing-icon"
                style={{
                  color: BLUE,
                  display: 'inline-flex',
                  alignItems: 'center',
                  verticalAlign: 'middle',
                }}
              >
                <BadgeIndianRupee
  size={18}
  strokeWidth={2.2}
/>
              </span>{' '}
              Total Collected
            </p>
          </div>

          <div className="sum-card orange">
            <h2
              style={{
                color: NAVY,
              }}
            >
              ₹
              {Number(
                summary.total_pending
              ).toLocaleString(
                'en-IN',
                {
                  minimumFractionDigits: 2,
                }
              )}
            </h2>

            <p
              style={{
                color: NAVY,
              }}
            >
              <span
                className="billing-icon"
                style={{
                  color: BLUE,
                  display: 'inline-flex',
                  alignItems: 'center',
                  verticalAlign: 'middle',
                }}
              >
                <Clock3
                  size={18}
                  strokeWidth={2.2}
                />
              </span>{' '}
              Pending Amount
            </p>
          </div>

          <div className="sum-card blue">
            <h2
              style={{
                color: NAVY,
              }}
            >
              {summary.total_bills}
            </h2>

            <p
              style={{
                color: NAVY,
              }}
            >
              <span
                className="billing-icon"
                style={{
                  color: BLUE,
                  display: 'inline-flex',
                  alignItems: 'center',
                  verticalAlign: 'middle',
                }}
              >
                <ReceiptText
                  size={18}
                  strokeWidth={2.2}
                />
              </span>{' '}
              Total Bills
            </p>
          </div>

        </div>

        {/* ======================================================
            GENERATE NEW BILL
        ====================================================== */}

        <div className="form-card">

          <h3
            style={{
              color: NAVY,
            }}
          >
            <span
              className="billing-icon"
              style={{
                color: BLUE,
                display: 'inline-flex',
                alignItems: 'center',
                verticalAlign: 'middle',
              }}
            >
              <FilePlus2
                size={19}
                strokeWidth={2.2}
              />
            </span>{' '}
            Generate New Bill
          </h3>

          <form
            onSubmit={handleGenerate}
          >
            <div className="form-grid-bill">

              {/* PATIENT */}

              <div>
                <label
                  style={{
                    color: NAVY,
                  }}
                >
                  Select Patient
                </label>

                <select
                  value={
                    form.patient_id
                  }
                  onChange={(e) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        patient_id:
                          e.target.value,
                      })
                    )
                  }
                  required
                  disabled={
                    patientsLoading
                  }
                >
                  <option value="">
                    {patientsLoading
                      ? 'Loading patients...'
                      : patients.length ===
                        0
                      ? 'No patients found'
                      : '-- Select Patient --'}
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

                {!patientsLoading &&
                  patients.length ===
                    0 && (
                    <div
                      className="no-patients-message"
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color:
                          '#ef4444',
                      }}
                    >
                      No patients found.
                      Make sure the
                      patient is
                      registered or has
                      booked an
                      appointment.
                    </div>
                  )}
              </div>

              {/* AMOUNT */}

              <div>
                <label
                  style={{
                    color: NAVY,
                  }}
                >
                  Amount (₹)
                </label>

                <input
                  type="number"
                  placeholder="e.g. 1500"
                  min="0"
                  step="0.01"
                  value={
                    form.amount
                  }
                  onChange={(e) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        amount:
                          e.target.value,
                      })
                    )
                  }
                  required
                />
              </div>

              {/* PAYMENT STATUS */}

              <div>
                <label
                  style={{
                    color: NAVY,
                  }}
                >
                  Payment Status
                </label>

                <select
                  value={
                    form.payment_status
                  }
                  onChange={(e) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        payment_status:
                          e.target.value,
                      })
                    )
                  }
                >
                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Paid">
                    Paid
                  </option>
                </select>
              </div>

              {/* GENERATE */}

              <div>
                <label>
                  &nbsp;
                </label>

                <button
                  type="submit"
                  className="btn-generate"
                  disabled={
                    patientsLoading ||
                    !form.patient_id ||
                    !form.amount
                  }
                  style={{
                    backgroundColor:
                      NAVY,
                    borderColor:
                      NAVY,
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                  }}
                >
                  <Plus
                    size={17}
                    strokeWidth={2.5}
                  />
                  Generate
                </button>
              </div>

            </div>
          </form>
        </div>

        {/* ======================================================
            BILLS TABLE
        ====================================================== */}

        <div className="table-box">

          <div className="table-header">
            <h2
              style={{
                color: NAVY,
              }}
            >
              My Bills

              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: NAVY,
                  marginLeft: 8,
                }}
              >
                (
                {
                  summary.total_bills
                }{' '}
                total)
              </span>
            </h2>
          </div>

          <table>

            <thead>
              <tr>
                <th
                  style={{
                    color: NAVY,
                  }}
                >
                  #
                </th>

                <th
                  style={{
                    color: NAVY,
                  }}
                >
                  Patient
                </th>

                <th
                  style={{
                    color: NAVY,
                  }}
                >
                  Amount
                </th>

                <th
                  style={{
                    color: NAVY,
                  }}
                >
                  Status
                </th>

                <th
                  style={{
                    color: NAVY,
                  }}
                >
                  Date
                </th>

                <th
                  style={{
                    color: NAVY,
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign:
                        'center',
                      padding: 40,
                      color:
                        '#64748b',
                    }}
                  >
                    Loading...
                  </td>
                </tr>

              ) : bills.length ===
                0 ? (

                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">

                      <span
                        className="empty-icon billing-icon"
                        style={{
                          color: BLUE,
                          display: 'inline-flex',
                          alignItems: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        <ReceiptText
                          size={32}
                          strokeWidth={2}
                        />
                      </span>

                      No bills yet.

                    </div>
                  </td>
                </tr>

              ) : (

                bills.map(
                  (bill, index) => {

                    const billId =
                      getBillId(
                        bill
                      );

                    const status =
                      getBillStatus(
                        bill
                      );

                    const amount =
                      getBillAmount(
                        bill
                      );

                    const patientName =
                      getBillPatientName(
                        bill
                      );

                    const billDate =
                      getBillDate(
                        bill
                      );

                    return (
                      <tr
                        key={
                          billId ||
                          index
                        }
                      >

                        {/* NUMBER */}

                        <td
                          style={{
                            color:
                              NAVY,
                            fontWeight:
                              600,
                          }}
                        >
                          {index + 1}
                        </td>

                        {/* PATIENT */}

                        <td>
                          <strong
                            style={{
                              color:
                                NAVY,
                            }}
                          >
                            {
                              patientName
                            }
                          </strong>
                        </td>

                        {/* AMOUNT */}

                        <td
                          style={{
                            fontSize: 15,
                            fontWeight:
                              700,
                            color:
                              NAVY,
                          }}
                        >
                          ₹
                          {amount.toLocaleString(
                            'en-IN',
                            {
                              minimumFractionDigits:
                                2,
                            }
                          )}
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={
                              `badge ${
                                status ===
                                'Paid'
                                  ? 'badge-paid'
                                  : 'badge-pending'
                              }`
                            }
                            style={{
                              color:
                                NAVY,
                            }}
                          >
                            {status}
                          </span>
                        </td>

                        {/* DATE */}

                        <td
                          style={{
                            color:
                              NAVY,
                          }}
                        >
                          {billDate
                            ? formatDate(
                                billDate
                              )
                            : '-'}
                        </td>

                        {/* ACTIONS */}

                        <td>

                          {/* RECEIPT */}

                          <button
                            type="button"
                            className="btn-sm btn-view"
                            style={{
                              marginRight: 5,
                              borderColor:
                                NAVY,
                              color:
                                NAVY,
                              backgroundColor:
                                '#ffffff',
                            }}
                            onClick={() => {
                              setReceiptBill(
                                bill
                              );

                              setReceiptOpen(
                                true
                              );
                            }}
                          >
                            <span
                              className="billing-icon"
                              style={{
                                color:
                                  BLUE,
                                display: 'inline-flex',
                                alignItems: 'center',
                                verticalAlign: 'middle',
                              }}
                            >
                              <ReceiptText
                                size={16}
                                strokeWidth={2.2}
                              />
                            </span>{' '}
                            Receipt
                          </button>

                          {/* STATUS */}

                          <div
                            className="action-inline"
                            style={{
                              display:
                                'inline-flex',
                              gap: 5,
                            }}
                          >

                            <select
                              value={
                                status
                              }
                              onChange={(
                                e
                              ) =>
                                handleUpdateStatus(
                                  billId,
                                  e
                                    .target
                                    .value
                                )
                              }
                            >
                              <option value="Pending">
                                Pending
                              </option>

                              <option value="Paid">
                                Paid
                              </option>
                            </select>

                            {/* UPDATE */}

                            <button
                              type="button"
                              className="btn-sm btn-update"
                              style={{
                                backgroundColor:
                                  NAVY,
                                borderColor:
                                  NAVY,
                                color:
                                  '#ffffff',
                              }}
                              onClick={() => {
                                const currentStatus =
                                  status;

                                handleUpdateStatus(
                                  billId,
                                  currentStatus
                                );
                              }}
                            >
                              Update
                            </button>

                          </div>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="btn-sm btn-del"
                            style={{
                              marginLeft: 5,
                              color:
                                '#ef4444',
                              borderColor:
                                '#fecaca',
                              backgroundColor:
                                '#ffffff',
                            }}
                            onClick={() => {

                              if (
                                !billId
                              ) {
                                flash(
                                  'Invalid bill ID.',
                                  true
                                );
                                return;
                              }

                              setDeleteTarget(
                                billId
                              );

                              setConfirmOpen(
                                true
                              );

                            }}
                          >
                            <span
                              style={{
                                color:
                                  '#ef4444',
                                display: 'inline-flex',
                                alignItems: 'center',
                                verticalAlign: 'middle',
                              }}
                            >
                              <Trash2
                                size={16}
                                strokeWidth={2.2}
                              />
                            </span>
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

        {/* ======================================================
            CONFIRM DELETE MODAL
        ====================================================== */}

        <ConfirmModal
          isOpen={
            confirmOpen
          }
          title="Delete Bill?"
          message="This bill record will be permanently deleted."
          confirmText="Yes, Delete"
          confirmColor="#ef4444"
          onConfirm={
            doDelete
          }
          onCancel={() => {
            setConfirmOpen(
              false
            );

            setDeleteTarget(
              null
            );
          }}
        />

        {/* ======================================================
            RECEIPT MODAL
        ====================================================== */}

        <ReceiptModal
          isOpen={
            receiptOpen
          }
          bill={
            receiptBill
          }
          clinicInfo={
            clinicInfo
          }
          onClose={() => {
            setReceiptOpen(
              false
            );

            setReceiptBill(
              null
            );
          }}
        />

      </div>
    </Layout>
  );
}