<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';
require_once 'auth_check.php';

$patient_id = require_patient();
$method     = $_SERVER['REQUEST_METHOD'];

// ── GET — patient's all appointments ──────────────────────────────────────
if ($method === 'GET') {
    $result = mysqli_query($conn,
        "SELECT a.id, a.appointment_date, a.appointment_time, a.type, a.status,
                d.full_name AS doctor_name, d.specialization
         FROM appointments a
         JOIN doctors d ON a.doctor_id = d.id
         WHERE a.patient_id = '$patient_id'
         ORDER BY a.appointment_date DESC, a.appointment_time DESC"
    );

    $appointments = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $row['id'] = (int) $row['id'];
        $appointments[] = $row;
    }

    send_success(['appointments' => $appointments]);
}

// ── POST — book new appointment ────────────────────────────────────────────
if ($method === 'POST') {
    $body      = get_json_body();
    $doctor_id = (int) ($body['doctor_id'] ?? 0);
    $date      = clean($conn, $body['appointment_date'] ?? '');
    $time      = clean($conn, $body['appointment_time'] ?? '');
    $type      = clean($conn, $body['type'] ?? 'General');

    if (!$doctor_id || !$date || !$time) {
        send_error('Doctor, date and time are required.');
    }

    $q = "INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, type, status)
          VALUES ('$patient_id','$doctor_id','$date','$time','$type','Pending')";

    if (mysqli_query($conn, $q)) {
        send_success(['id' => mysqli_insert_id($conn)], 'Appointment booked successfully!');
    } else {
        send_error('Failed: ' . mysqli_error($conn));
    }
}

send_error('Method not allowed', 405);
