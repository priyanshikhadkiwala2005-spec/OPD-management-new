<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';
require_once 'auth_check.php';

$doctor_id = require_doctor();

// ── Summary Stats ─────────────────────────────────────────────────────────
$total_patients = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM patients"));

$total_appointments = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM appointments WHERE doctor_id='$doctor_id'"));

$total_consultations = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM prescription_new WHERE doctor_id='$doctor_id'"));

$revenue_row = mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT SUM(amount) AS total FROM billing WHERE doctor_id='$doctor_id' AND payment_status='Paid'"));
$total_revenue = (float) ($revenue_row['total'] ?? 0);

$pending_row = mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT SUM(amount) AS total FROM billing WHERE doctor_id='$doctor_id' AND payment_status='Pending'"));
$pending_revenue = (float) ($pending_row['total'] ?? 0);

$total_bills = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM billing WHERE doctor_id='$doctor_id'"));

// ── Appointment Status Breakdown ──────────────────────────────────────────
$appt_pending   = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND status='Pending'"));
$appt_completed = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND status='Completed'"));
$appt_cancelled = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND status='Cancelled'"));
$appt_inprogress = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND status='In Progress'"));

// ── Patient Gender Breakdown ──────────────────────────────────────────────
$male_count   = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM patients WHERE gender='Male'"));
$female_count = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM patients WHERE gender='Female'"));
$other_count  = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM patients WHERE gender='Other'"));

// ── Top 10 Prescribed Medicines ───────────────────────────────────────────
$top_meds_result = mysqli_query($conn,
    "SELECT pm.medicine_name, pm.medicine_type, COUNT(*) AS count
     FROM prescription_medicines pm
     JOIN prescription_new pr ON pm.prescription_id = pr.id
     WHERE pr.doctor_id = '$doctor_id'
     GROUP BY pm.medicine_name, pm.medicine_type
     ORDER BY count DESC
     LIMIT 10"
);

$top_medicines = [];
while ($row = mysqli_fetch_assoc($top_meds_result)) {
    $row['count'] = (int) $row['count'];
    $top_medicines[] = $row;
}

// ── Recent Appointments (last 10) ─────────────────────────────────────────
$recent_appts_result = mysqli_query($conn,
    "SELECT a.id, a.appointment_date, a.appointment_time, a.type, a.status,
            p.full_name AS patient_name
     FROM appointments a
     JOIN patients p ON a.patient_id = p.id
     WHERE a.doctor_id = '$doctor_id'
     ORDER BY a.appointment_date DESC, a.appointment_time DESC
     LIMIT 10"
);

$recent_appointments = [];
while ($row = mysqli_fetch_assoc($recent_appts_result)) {
    $row['id'] = (int) $row['id'];
    $recent_appointments[] = $row;
}

// ── Response ──────────────────────────────────────────────────────────────
send_success([
    'summary' => [
        'total_patients'      => $total_patients,
        'total_appointments'  => $total_appointments,
        'total_consultations' => $total_consultations,
        'total_revenue'       => $total_revenue,
        'pending_revenue'     => $pending_revenue,
        'total_bills'         => $total_bills,
    ],
    'appointment_status' => [
        'pending'    => $appt_pending,
        'completed'  => $appt_completed,
        'cancelled'  => $appt_cancelled,
        'inprogress' => $appt_inprogress,
    ],
    'patient_gender' => [
        'male'   => $male_count,
        'female' => $female_count,
        'other'  => $other_count,
    ],
    'top_medicines'       => $top_medicines,
    'recent_appointments' => $recent_appointments,
]);
