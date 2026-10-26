<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';
require_once 'auth_check.php';

$doctor_id  = require_doctor();
$patient_id = (int) ($_GET['patient_id'] ?? 0);

if (!$patient_id) send_error('patient_id required.');

// Get latest appointment type for this patient with this doctor
$result = mysqli_query($conn,
    "SELECT type FROM appointments
     WHERE patient_id='$patient_id' AND doctor_id='$doctor_id'
     ORDER BY appointment_date DESC, appointment_time DESC
     LIMIT 1"
);

$type = 'General';
if ($result && mysqli_num_rows($result) > 0) {
    $row  = mysqli_fetch_assoc($result);
    $type = $row['type'] ?: 'General';
}

// Get doctor's custom fees from doctor_settings (fallback to defaults)
$fee_row = mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT fee_general, fee_emergency, fee_followup, fee_review
     FROM doctor_settings WHERE doctor_id='$doctor_id' LIMIT 1"
));

// Use doctor's custom fees if available, else hardcoded defaults
$fees = [
    'General'   => $fee_row ? (float) $fee_row['fee_general']   : 500,
    'Emergency' => $fee_row ? (float) $fee_row['fee_emergency'] : 800,
    'Follow-up' => $fee_row ? (float) $fee_row['fee_followup']  : 400,
    'Review'    => $fee_row ? (float) $fee_row['fee_review']    : 400,
];

$fee = $fees[$type] ?? $fees['General'];

send_success(['type' => $type, 'fee' => $fee]);
