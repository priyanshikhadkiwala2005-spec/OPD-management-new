// ===== MOCK DATA =====

export const DOCTOR = {
  id: 1,
  name: 'Rajesh Kumar',
  email: 'rajesh@medcare.com',
  specialization: 'General Physician',
};

export const PATIENT_USER = {
  id: 1,
  full_name: 'Amit Sharma',
  gender: 'Male',
  age: 32,
  blood_group: 'B+',
  mobile: '9876543210',
  email: 'amit@example.com',
  address: '12, MG Road, Mumbai',
};

export const PATIENTS = [
  { id: 1, full_name: 'Amit Sharma',   gender: 'Male',   age: 32, blood_group: 'B+', mobile: '9876543210', email: 'amit@example.com',   created_at: '2025-01-10' },
  { id: 2, full_name: 'Priya Singh',   gender: 'Female', age: 27, blood_group: 'O+', mobile: '9765432100', email: 'priya@example.com',  created_at: '2025-01-15' },
  { id: 3, full_name: 'Ravi Verma',    gender: 'Male',   age: 45, blood_group: 'A+', mobile: '9654321000', email: 'ravi@example.com',   created_at: '2025-02-01' },
  { id: 4, full_name: 'Sneha Patel',   gender: 'Female', age: 38, blood_group: 'AB+',mobile: '9543210000', email: 'sneha@example.com',  created_at: '2025-02-10' },
  { id: 5, full_name: 'Karan Mehta',   gender: 'Male',   age: 55, blood_group: 'O-', mobile: '9432100000', email: 'karan@example.com',  created_at: '2025-03-05' },
  { id: 6, full_name: 'Nisha Gupta',   gender: 'Female', age: 22, blood_group: 'A-', mobile: '9321000000', email: 'nisha@example.com',  created_at: '2025-03-15' },
  { id: 7, full_name: 'Suresh Yadav',  gender: 'Male',   age: 60, blood_group: 'B-', mobile: '9210000000', email: 'suresh@example.com', created_at: '2025-04-01' },
  { id: 8, full_name: 'Pooja Reddy',   gender: 'Female', age: 34, blood_group: 'AB-',mobile: '9100000000', email: 'pooja@example.com',  created_at: '2025-04-20' },
];

export const APPOINTMENTS = [
  { id: 1, patient_id: 1, patient_name: 'Amit Sharma',  patient_mobile: '9876543210', appointment_date: '2026-07-21', appointment_time: '09:00', type: 'General',   status: 'Pending'   },
  { id: 2, patient_id: 2, patient_name: 'Priya Singh',  patient_mobile: '9765432100', appointment_date: '2026-07-21', appointment_time: '10:30', type: 'Follow-up', status: 'Completed' },
  { id: 3, patient_id: 3, patient_name: 'Ravi Verma',   patient_mobile: '9654321000', appointment_date: '2026-07-21', appointment_time: '11:00', type: 'Emergency', status: 'In Progress'},
  { id: 4, patient_id: 4, patient_name: 'Sneha Patel',  patient_mobile: '9543210000', appointment_date: '2026-07-22', appointment_time: '09:30', type: 'Review',    status: 'Pending'   },
  { id: 5, patient_id: 5, patient_name: 'Karan Mehta',  patient_mobile: '9432100000', appointment_date: '2026-07-22', appointment_time: '11:00', type: 'General',   status: 'Pending'   },
  { id: 6, patient_id: 6, patient_name: 'Nisha Gupta',  patient_mobile: '9321000000', appointment_date: '2026-07-23', appointment_time: '14:00', type: 'Follow-up', status: 'Cancelled' },
  { id: 7, patient_id: 7, patient_name: 'Suresh Yadav', patient_mobile: '9210000000', appointment_date: '2026-07-24', appointment_time: '10:00', type: 'General',   status: 'Pending'   },
  { id: 8, patient_id: 8, patient_name: 'Pooja Reddy',  patient_mobile: '9100000000', appointment_date: '2026-07-25', appointment_time: '15:30', type: 'Review',    status: 'Completed' },
];

export const CONSULTATIONS = [
  {
    id: 1,
    patient_id: 1,
    patient_name: 'Amit Sharma',
    age: 32, gender: 'Male', blood_group: 'B+',
    symptoms: 'Fever, headache, body ache for 3 days',
    diagnosis: 'Viral fever',
    consultation_fee: 500,
    additional_instructions: 'Rest for 2 days. Avoid cold water.',
    notes_for_patient: 'Follow up if fever persists beyond 5 days.',
    created_at: '2026-07-18 10:30:00',
    medicines: [
      { id: 1, medicine_name: 'Paracetamol 500mg', medicine_type: 'Medicine', dosage: '1 tablet', frequency: 'Thrice daily (TDS)', duration: '5 Days' },
      { id: 2, medicine_name: 'Cetirizine 10mg',   medicine_type: 'Medicine', dosage: '1 tablet', frequency: 'Once daily (OD)',    duration: '3 Days' },
    ],
  },
  {
    id: 2,
    patient_id: 2,
    patient_name: 'Priya Singh',
    age: 27, gender: 'Female', blood_group: 'O+',
    symptoms: 'Cough, cold, sore throat',
    diagnosis: 'Upper respiratory infection',
    consultation_fee: 600,
    additional_instructions: 'Take warm fluids. Steam inhalation twice daily.',
    notes_for_patient: 'Avoid cold drinks and exposure to dust.',
    created_at: '2026-07-19 14:00:00',
    medicines: [
      { id: 3, medicine_name: 'Amoxicillin 500mg', medicine_type: 'Medicine',   dosage: '1 capsule', frequency: 'Twice daily (BD)', duration: '7 Days' },
      { id: 4, medicine_name: 'Diclofenac Injection', medicine_type: 'Injection', dosage: '75mg',    frequency: 'Once daily (OD)', duration: '2 Days' },
    ],
  },
  {
    id: 3,
    patient_id: 3,
    patient_name: 'Ravi Verma',
    age: 45, gender: 'Male', blood_group: 'A+',
    symptoms: 'High BP, dizziness',
    diagnosis: 'Hypertension Stage 1',
    consultation_fee: 800,
    additional_instructions: 'Low salt diet. Morning walk 30 mins daily.',
    notes_for_patient: 'Monitor BP at home twice daily.',
    created_at: '2026-07-20 09:00:00',
    medicines: [
      { id: 5, medicine_name: 'Amlodipine 5mg',   medicine_type: 'Medicine', dosage: '1 tablet', frequency: 'Once daily (OD)', duration: '30 Days' },
      { id: 6, medicine_name: 'Telmisartan 40mg', medicine_type: 'Medicine', dosage: '1 tablet', frequency: 'Once daily (OD)', duration: '30 Days' },
    ],
  },
];

export const BILLS = [
  { id: 1, patient_id: 1, patient_name: 'Amit Sharma',  amount: 1500,  payment_status: 'Paid',    created_at: '2026-07-18' },
  { id: 2, patient_id: 2, patient_name: 'Priya Singh',  amount: 2200,  payment_status: 'Paid',    created_at: '2026-07-19' },
  { id: 3, patient_id: 3, patient_name: 'Ravi Verma',   amount: 3500,  payment_status: 'Pending', created_at: '2026-07-20' },
  { id: 4, patient_id: 4, patient_name: 'Sneha Patel',  amount: 1200,  payment_status: 'Pending', created_at: '2026-07-20' },
  { id: 5, patient_id: 5, patient_name: 'Karan Mehta',  amount: 4000,  payment_status: 'Paid',    created_at: '2026-07-21' },
  { id: 6, patient_id: 7, patient_name: 'Suresh Yadav', amount: 900,   payment_status: 'Pending', created_at: '2026-07-21' },
];

export const MEDICINE_CATEGORIES = {
  'Pain/Fever':     ['Paracetamol 500mg', 'Ibuprofen 400mg', 'Aspirin 75mg', 'Diclofenac 50mg'],
  'Antibiotic':     ['Amoxicillin 500mg', 'Azithromycin 500mg', 'Ciprofloxacin 500mg', 'Cefixime 200mg'],
  'Allergy':        ['Cetirizine 10mg', 'Levocetirizine 5mg', 'Montelukast 10mg', 'Fexofenadine 120mg'],
  'Gastric':        ['Pantoprazole 40mg', 'Omeprazole 20mg', 'Ranitidine 150mg', 'Domperidone 10mg'],
  'Diabetes':       ['Metformin 500mg', 'Glimepiride 2mg', 'Insulin (Actrapid)', 'Sitagliptin 100mg'],
  'Blood Pressure': ['Amlodipine 5mg', 'Telmisartan 40mg', 'Atenolol 50mg', 'Losartan 50mg'],
  'Cholesterol':    ['Atorvastatin 10mg', 'Rosuvastatin 10mg', 'Simvastatin 20mg'],
  'Supplement':     ['Vitamin D3 60K', 'B-Complex', 'Calcium Carbonate', 'Iron Folic Acid'],
};

export const INJECTIONS = [
  'Diclofenac Injection', 'Tramadol Injection', 'Insulin Injection',
  'Ranitidine Injection', 'Ceftriaxone Injection',
];

// Helper: today's date formatted
export function todayFormatted() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
}

// Helper: format date string
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// Helper: format time string HH:MM → hh:mm AM/PM
export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}
