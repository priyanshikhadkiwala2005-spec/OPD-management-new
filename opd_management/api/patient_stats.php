<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';
require_once 'auth_check.php';

$patient_id = require_patient();

// Total appointments
$total_appointments = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM appointments WHERE patient_id='$patient_id'"));

// Completed consultations
$total_consultations = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM prescription_new WHERE patient_id='$patient_id'"));

// Total prescriptions (same as consultations)
$total_prescriptions = $total_consultations;

// Total bills
$total_bills = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM billing WHERE patient_id='$patient_id'"));

// Total paid amount
$paid_row = mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT SUM(amount) AS total FROM billing 
     WHERE patient_id='$patient_id' AND payment_status='Paid'"));
$total_paid = (float) ($paid_row['total'] ?? 0);

// Pending amount
$pending_row = mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT SUM(amount) AS total FROM billing 
     WHERE patient_id='$patient_id' AND payment_status='Pending'"));
$total_pending = (float) ($pending_row['total'] ?? 0);

send_success([
    'total_appointments'  => $total_appointments,
    'total_consultations' => $total_consultations,
    'total_prescriptions' => $total_prescriptions,
    'total_bills'         => $total_bills,
    'total_paid'          => $total_paid,
    'total_pending'       => $total_pending,
]);
