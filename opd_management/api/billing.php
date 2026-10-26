<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';
require_once 'auth_check.php';

$doctor_id = require_doctor();
$method    = $_SERVER['REQUEST_METHOD'];

// ── GET — sirf is doctor ke bills ─────────────────────────────────────────
if ($method === 'GET') {
    $result = mysqli_query($conn,
        "SELECT b.id, b.patient_id, b.amount, b.payment_status, b.created_at,
                p.full_name AS patient_name
         FROM billing b
         JOIN patients p ON b.patient_id = p.id
         WHERE b.doctor_id = '$doctor_id'
         ORDER BY b.created_at DESC"
    );

    $bills = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $row['id']         = (int)   $row['id'];
        $row['patient_id'] = (int)   $row['patient_id'];
        $row['amount']     = (float) $row['amount'];
        $bills[] = $row;
    }

    // Summary stats — sirf is doctor ke
    $paid_row    = mysqli_fetch_assoc(mysqli_query($conn,
        "SELECT SUM(amount) AS t FROM billing WHERE doctor_id='$doctor_id' AND payment_status='Paid'"));
    $pending_row = mysqli_fetch_assoc(mysqli_query($conn,
        "SELECT SUM(amount) AS t FROM billing WHERE doctor_id='$doctor_id' AND payment_status='Pending'"));
    $total_bills = mysqli_num_rows(mysqli_query($conn,
        "SELECT id FROM billing WHERE doctor_id='$doctor_id'"));

    send_success([
        'bills'         => $bills,
        'total_paid'    => (float) ($paid_row['t']    ?? 0),
        'total_pending' => (float) ($pending_row['t'] ?? 0),
        'total_bills'   => (int)   $total_bills,
    ]);
}

// ── POST — naya bill generate ─────────────────────────────────────────────
if ($method === 'POST') {
    $body           = get_json_body();
    $patient_id     = (int)   ($body['patient_id']     ?? 0);
    $amount         = (float) ($body['amount']         ?? 0);
    $payment_status = clean($conn, $body['payment_status'] ?? 'Pending');

    if (!$patient_id || $amount <= 0) {
        send_error('Patient and a valid amount are required.');
    }

    $allowed = ['Pending', 'Paid'];
    if (!in_array($payment_status, $allowed)) $payment_status = 'Pending';

    $q = "INSERT INTO billing (patient_id, doctor_id, amount, payment_status)
          VALUES ('$patient_id','$doctor_id','$amount','$payment_status')";

    if (mysqli_query($conn, $q)) {
        $new_id = mysqli_insert_id($conn);
        send_success(['id' => $new_id], 'Bill generated successfully!');
    } else {
        send_error('Failed: ' . mysqli_error($conn));
    }
}

// ── PUT — payment status update ───────────────────────────────────────────
if ($method === 'PUT') {
    $body   = get_json_body();
    $id     = (int)   ($body['id']             ?? 0);
    $status = clean($conn, $body['payment_status'] ?? '');

    if (!$id || !in_array($status, ['Pending', 'Paid'])) {
        send_error('Valid id and payment_status required.');
    }

    mysqli_query($conn,
        "UPDATE billing SET payment_status='$status'
         WHERE id='$id' AND doctor_id='$doctor_id'"
    );
    send_success([], 'Payment status updated!');
}

// ── DELETE ────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) send_error('Bill ID required.');

    mysqli_query($conn,
        "DELETE FROM billing WHERE id='$id' AND doctor_id='$doctor_id'"
    );
    send_success([], 'Bill deleted!');
}

send_error('Method not allowed', 405);
