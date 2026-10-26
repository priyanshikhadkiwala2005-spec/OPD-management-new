<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';
require_once 'auth_check.php';

$doctor_id = require_doctor();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error('Method not allowed', 405);
}

$body              = get_json_body();
$current_password  = clean($conn, $body['current_password']  ?? '');
$new_password      = clean($conn, $body['new_password']      ?? '');
$confirm_password  = clean($conn, $body['confirm_password']  ?? '');

if (!$current_password || !$new_password || !$confirm_password) {
    send_error('All fields are required.');
}

if ($new_password !== $confirm_password) {
    send_error('New password and confirm password do not match.');
}

if (strlen($new_password) < 6) {
    send_error('New password must be at least 6 characters.');
}

// Verify current password
$result = mysqli_query($conn,
    "SELECT password FROM doctors WHERE id='$doctor_id' LIMIT 1"
);

if (!$result || mysqli_num_rows($result) === 0) {
    send_error('Doctor not found.');
}

$row = mysqli_fetch_assoc($result);

// Verify current password using password_verify
if (!password_verify($current_password, $row['password'])) {
    send_error('Current password is incorrect.');
}

// Hash new password before saving
$hashed_new = password_hash($new_password, PASSWORD_BCRYPT);

// Update password
mysqli_query($conn,
    "UPDATE doctors SET password='$hashed_new' WHERE id='$doctor_id'"
);

send_success([], 'Password updated successfully!');
