<?php
// Returns currently logged-in user info (doctor or patient)
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';

if (isset($_SESSION['doctor_id'])) {
    $id     = (int) $_SESSION['doctor_id'];
    $result = mysqli_query($conn,
        "SELECT id, full_name, email, mobile, specialization FROM doctors WHERE id='$id' LIMIT 1"
    );
    if ($result && $row = mysqli_fetch_assoc($result)) {
        send_success(['role' => 'doctor', 'user' => $row]);
    }
    send_error('Doctor not found', 404);
}

if (isset($_SESSION['patient_id'])) {
    $id     = (int) $_SESSION['patient_id'];
    $result = mysqli_query($conn,
        "SELECT id, full_name, email, mobile, age, gender, blood_group FROM patients WHERE id='$id' LIMIT 1"
    );
    if ($result && $row = mysqli_fetch_assoc($result)) {
        send_success(['role' => 'patient', 'user' => $row]);
    }
    send_error('Patient not found', 404);
}

send_error('Not logged in', 401);
