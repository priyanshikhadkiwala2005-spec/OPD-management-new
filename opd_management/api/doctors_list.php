<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';

// Public endpoint - no auth needed, patients need to see doctors list
$result = mysqli_query($conn,
    "SELECT id, full_name, specialization, mobile, email
     FROM doctors
     ORDER BY full_name ASC"
);

$doctors = [];
while ($row = mysqli_fetch_assoc($result)) {
    $row['id'] = (int) $row['id'];
    $doctors[] = $row;
}

send_success(['doctors' => $doctors]);
