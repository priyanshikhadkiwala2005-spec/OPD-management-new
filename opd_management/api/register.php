<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error('Method not allowed', 405);
}

$body = get_json_body();

$type             = clean($conn, $body['type']             ?? 'patient');
$full_name        = clean($conn, $body['full_name']        ?? '');
$gender           = clean($conn, $body['gender']           ?? '');
$dob              = clean($conn, $body['dob']              ?? '');
$age              = (int) ($body['age']                    ?? 0);
$mobile           = clean($conn, $body['mobile']           ?? '');
$email            = clean($conn, $body['email']            ?? '');
$address          = clean($conn, $body['address']          ?? '');
$password         = clean($conn, $body['password']         ?? '');
$confirm_password = clean($conn, $body['confirm_password'] ?? '');

// Validation
if (!$full_name || !$gender || !$email || !$password) {
    send_error('Please fill all required fields.');
}

if ($password !== $confirm_password) {
    send_error('Passwords do not match. Please try again.');
}

// Check if email already exists
if ($type === 'doctor') {
    $check = mysqli_query($conn, "SELECT id FROM doctors WHERE LOWER(email) = LOWER('$email') LIMIT 1");
} else {
    $check = mysqli_query($conn, "SELECT id FROM patients WHERE LOWER(email) = LOWER('$email') LIMIT 1");
}

if ($check && mysqli_num_rows($check) > 0) {
    send_error('An account with this email already exists.');
}

// Hash the password before saving — plain text kabhi save mat karo
$hashed_password = password_hash($password, PASSWORD_BCRYPT);

// Insert
if ($type === 'doctor') {
    $specialization = clean($conn, $body['specialization'] ?? '');
    $query = "INSERT INTO doctors
              (full_name, gender, dob, age, specialization, mobile, email, address, password)
              VALUES
              ('$full_name','$gender','$dob','$age','$specialization','$mobile','$email','$address','$hashed_password')";
} else {
    $blood_group = clean($conn, $body['blood_group'] ?? '');
    $query = "INSERT INTO patients
              (full_name, gender, dob, age, blood_group, mobile, email, address, password)
              VALUES
              ('$full_name','$gender','$dob','$age','$blood_group','$mobile','$email','$address','$hashed_password')";
}

if (mysqli_query($conn, $query)) {
    $new_id = mysqli_insert_id($conn);
    send_success(['id' => $new_id], 'Registration successful! Please login.');
} else {
    send_error('Registration failed: ' . mysqli_error($conn));
}
