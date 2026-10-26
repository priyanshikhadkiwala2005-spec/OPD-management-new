<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';
require_once 'auth_check.php';

$doctor_id = require_doctor();
$method    = $_SERVER['REQUEST_METHOD'];

// ── GET /api/patients.php?search=xyz ──────────────────────────────────────
if ($method === 'GET') {
    $where = "";
    if (!empty($_GET['search'])) {
        $s     = clean($conn, $_GET['search']);
        $where = "WHERE full_name LIKE '%$s%' OR email LIKE '%$s%' OR mobile LIKE '%$s%'";
    }

    $result = mysqli_query($conn,
        "SELECT id, full_name, gender, age, blood_group, mobile, email, created_at
         FROM patients $where ORDER BY id DESC"
    );

    $patients = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $row['id']  = (int) $row['id'];
        $row['age'] = (int) $row['age'];
        $patients[] = $row;
    }

    // Stats
    $total_male   = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM patients WHERE gender='Male'"));
    $total_female = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM patients WHERE gender='Female'"));

    send_success([
        'patients'     => $patients,
        'total'        => count($patients),
        'total_male'   => (int) $total_male,
        'total_female' => (int) $total_female,
        'total_all'    => (int) mysqli_num_rows(mysqli_query($conn, "SELECT id FROM patients")),
    ]);
}

// ── DELETE /api/patients.php?id=5 ────────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) send_error('Patient ID required.');

    mysqli_query($conn, "DELETE FROM patients WHERE id='$id'");
    send_success([], 'Patient deleted successfully.');
}

send_error('Method not allowed', 405);
