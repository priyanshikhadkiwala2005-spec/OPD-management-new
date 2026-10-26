<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';
require_once 'auth_check.php';

$doctor_id = require_doctor();
$method    = $_SERVER['REQUEST_METHOD'];

// ── GET /api/appointments.php?filter=today|tomorrow|week ─────────────────
if ($method === 'GET') {
    $filter   = $_GET['filter'] ?? 'all';
    $today    = date('Y-m-d');
    $where_date = "";

    if ($filter === 'today') {
        $where_date = "AND a.appointment_date = '$today'";
    } elseif ($filter === 'tomorrow') {
        $tomorrow   = date('Y-m-d', strtotime('+1 day'));
        $where_date = "AND a.appointment_date = '$tomorrow'";
    } elseif ($filter === 'week') {
        $week_end   = date('Y-m-d', strtotime('+6 days'));
        $where_date = "AND a.appointment_date BETWEEN '$today' AND '$week_end'";
    }

    $result = mysqli_query($conn,
        "SELECT a.id, a.patient_id, a.appointment_date, a.appointment_time,
                a.type, a.status,
                p.full_name AS patient_name, p.mobile AS patient_mobile
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         WHERE a.doctor_id = '$doctor_id' $where_date
         ORDER BY a.appointment_date DESC, a.appointment_time DESC"
    );

    $appointments = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $row['id']         = (int) $row['id'];
        $row['patient_id'] = (int) $row['patient_id'];
        $appointments[]    = $row;
    }

    // Counts for stats
    $total      = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM appointments WHERE doctor_id='$doctor_id'"));
    $pending    = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND status='Pending'"));
    $inprogress = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND status='In Progress'"));
    $completed  = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND status='Completed'"));
    $cancelled  = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND status='Cancelled'"));

    send_success([
        'appointments' => $appointments,
        'stats' => [
            'total'      => (int) $total,
            'pending'    => (int) $pending,
            'inprogress' => (int) $inprogress,
            'completed'  => (int) $completed,
            'cancelled'  => (int) $cancelled,
        ],
    ]);
}

// ── POST /api/appointments.php  (book new) ────────────────────────────────
if ($method === 'POST') {
    $body       = get_json_body();
    $patient_id = (int) ($body['patient_id'] ?? 0);
    $date       = clean($conn, $body['appointment_date'] ?? '');
    $time       = clean($conn, $body['appointment_time'] ?? '');
    $type       = clean($conn, $body['type'] ?? 'General');

    if (!$patient_id || !$date || !$time) {
        send_error('patient_id, appointment_date, and appointment_time are required.');
    }

    $q = "INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, type, status)
          VALUES ('$patient_id','$doctor_id','$date','$time','$type','Pending')";

    if (mysqli_query($conn, $q)) {
        $new_id = mysqli_insert_id($conn);
        send_success(['id' => $new_id], 'Appointment booked successfully!');
    } else {
        send_error('Failed to book appointment: ' . mysqli_error($conn));
    }
}

// ── PUT /api/appointments.php  (update status) ────────────────────────────
if ($method === 'PUT') {
    $body    = get_json_body();
    $id      = (int) ($body['id']     ?? 0);
    $status  = clean($conn, $body['status'] ?? '');

    $allowed = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    if (!$id || !in_array($status, $allowed)) {
        send_error('Valid id and status are required.');
    }

    mysqli_query($conn,
        "UPDATE appointments SET status='$status' WHERE id='$id' AND doctor_id='$doctor_id'"
    );
    send_success([], 'Appointment status updated!');
}

// ── DELETE /api/appointments.php?id=5 ────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) send_error('Appointment ID required.');

    mysqli_query($conn,
        "DELETE FROM appointments WHERE id='$id' AND doctor_id='$doctor_id'"
    );
    send_success([], 'Appointment deleted!');
}

send_error('Method not allowed', 405);
