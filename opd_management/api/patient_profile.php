<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';
require_once 'auth_check.php';

$patient_id = require_patient();
$method     = $_SERVER['REQUEST_METHOD'];

// ── GET — fetch patient profile ───────────────────────────────────────────
if ($method === 'GET') {
    $result = mysqli_query($conn,
        "SELECT id, full_name, email, mobile, gender, age, blood_group, address
         FROM patients WHERE id='$patient_id' LIMIT 1"
    );

    if ($result && $row = mysqli_fetch_assoc($result)) {
        $row['id']  = (int) $row['id'];
        $row['age'] = (int) $row['age'];
        send_success(['profile' => $row]);
    }
    send_error('Patient not found.', 404);
}

// ── POST — update profile ──────────────────────────────────────────────────
if ($method === 'POST') {
    $body        = get_json_body();
    $full_name   = clean($conn, $body['full_name']   ?? '');
    $email       = clean($conn, $body['email']       ?? '');
    $mobile      = clean($conn, $body['mobile']      ?? '');
    $gender      = clean($conn, $body['gender']      ?? '');
    $age         = (int) ($body['age']               ?? 0);
    $blood_group = clean($conn, $body['blood_group'] ?? '');
    $address     = clean($conn, $body['address']     ?? '');

    mysqli_query($conn,
        "UPDATE patients
         SET full_name='$full_name', email='$email', mobile='$mobile',
             gender='$gender', age='$age', blood_group='$blood_group', address='$address'
         WHERE id='$patient_id'"
    );

    send_success([], 'Profile updated successfully!');
}

send_error('Method not allowed', 405);
