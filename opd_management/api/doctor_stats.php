<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';
require_once 'auth_check.php';

$doctor_id = require_doctor();

// Total patients (all registered — same as original PHP)
$total_patients = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM patients"));

// Doctor's own appointments
$total_appointments = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM appointments WHERE doctor_id='$doctor_id'"));

// Doctor's completed appointments count (for dashboard stat card)
$total_completed = (int) mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND status='Completed'"));

// Doctor's own collected revenue (billing table)
$revenue_row   = mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT SUM(amount) AS total FROM billing
     WHERE doctor_id='$doctor_id' AND payment_status='Paid'"));
$total_revenue = (float) ($revenue_row['total'] ?? 0);

send_success([
    'total_patients'     => $total_patients,
    'total_appointments' => $total_appointments,
    'total_completed'    => $total_completed,
    'total_revenue'      => $total_revenue,
]);
