<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error('Method not allowed', 405);
}

$body     = get_json_body();
$email    = clean($conn, $body['email']    ?? '');
$password = clean($conn, $body['password'] ?? '');

if (!$email || !$password) {
    send_error('Email and password are required.');
}

$result = mysqli_query($conn,
    "SELECT id, full_name, email, mobile, age, gender, blood_group, password
     FROM patients
     WHERE LOWER(email) = LOWER('$email')
     LIMIT 1"
);

if (!$result || mysqli_num_rows($result) === 0) {
    send_error('Invalid email or password. Please try again.', 401);
}

$row = mysqli_fetch_assoc($result);

// password_verify — entered password ko hash se compare karta hai
if (!password_verify($password, $row['password'])) {
    send_error('Invalid email or password. Please try again.', 401);
}

$_SESSION['patient_id']   = $row['id'];
$_SESSION['patient_name'] = $row['full_name'];

send_success([
    'patient' => [
        'id'          => (int) $row['id'],
        'full_name'   => $row['full_name'],
        'email'       => $row['email'],
        'mobile'      => $row['mobile'],
        'age'         => $row['age'],
        'gender'      => $row['gender'],
        'blood_group' => $row['blood_group'],
    ]
], 'Login successful');
