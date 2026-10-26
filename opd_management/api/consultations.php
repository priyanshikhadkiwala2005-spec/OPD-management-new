<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';
require_once 'auth_check.php';

$doctor_id = require_doctor();
$method    = $_SERVER['REQUEST_METHOD'];

// ── GET /api/consultations.php ───────────────────────────────────────────
if ($method === 'GET') {
    $result = mysqli_query($conn,
        "SELECT pr.id, pr.patient_id, pr.symptoms, pr.diagnosis,
                pr.additional_instructions, pr.notes_for_patient,
                pr.consultation_fee, pr.created_at,
                p.full_name AS patient_name, p.age, p.gender, p.blood_group
         FROM prescription_new pr
         JOIN patients p ON pr.patient_id = p.id
         WHERE pr.doctor_id = '$doctor_id'
         ORDER BY pr.created_at DESC"
    );

    $consultations = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $row['id']              = (int) $row['id'];
        $row['patient_id']      = (int) $row['patient_id'];
        $row['consultation_fee']= (float) $row['consultation_fee'];
        $row['age']             = (int) $row['age'];

        // Get medicines for this prescription
        $meds_result = mysqli_query($conn,
            "SELECT id, medicine_name, medicine_type, dosage, frequency, duration, instructions
             FROM prescription_medicines WHERE prescription_id='{$row['id']}'"
        );
        $medicines = [];
        while ($m = mysqli_fetch_assoc($meds_result)) {
            $m['id']  = (int) $m['id'];
            $medicines[] = $m;
        }
        $row['medicines'] = $medicines;
        $consultations[]  = $row;
    }

    // Stats
    $total_rx   = count($consultations);
    $total_meds = array_sum(array_map(fn($c) => count($c['medicines']), $consultations));
    $total_rev  = array_sum(array_map(fn($c) => $c['consultation_fee'], $consultations));

    send_success([
        'consultations' => $consultations,
        'stats' => [
            'total_rx'   => $total_rx,
            'total_meds' => $total_meds,
            'total_rev'  => $total_rev,
        ],
    ]);
}

// ── DELETE /api/consultations.php?id=3 ───────────────────────────────────
if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if (!$id) send_error('Consultation ID required.');

    mysqli_query($conn, "DELETE FROM prescription_medicines WHERE prescription_id='$id'");
    mysqli_query($conn, "DELETE FROM prescription_new WHERE id='$id' AND doctor_id='$doctor_id'");

    send_success([], 'Consultation deleted!');
}

send_error('Method not allowed', 405);
