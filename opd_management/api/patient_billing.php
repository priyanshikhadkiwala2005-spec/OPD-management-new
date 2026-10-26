<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';
require_once 'auth_check.php';

$patient_id = require_patient();

// ── GET — patient's all bills ─────────────────────────────────────────────
$result = mysqli_query($conn,
    "SELECT b.id, b.amount, b.payment_status, b.created_at,
            d.full_name AS doctor_name
     FROM billing b
     JOIN doctors d ON b.doctor_id = d.id
     WHERE b.patient_id = '$patient_id'
     ORDER BY b.created_at DESC"
);

$bills = [];
while ($row = mysqli_fetch_assoc($result)) {
    $row['id']     = (int) $row['id'];
    $row['amount'] = (float) $row['amount'];
    $bills[] = $row;
}

// Summary
$total_paid    = 0;
$total_pending = 0;
foreach ($bills as $b) {
    if ($b['payment_status'] === 'Paid') $total_paid += $b['amount'];
    else $total_pending += $b['amount'];
}

send_success([
    'bills'         => $bills,
    'total_paid'    => $total_paid,
    'total_pending' => $total_pending,
]);
