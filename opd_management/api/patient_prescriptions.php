<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';
require_once 'auth_check.php';

$patient_id = require_patient();

// ── GET — patient's all prescriptions ─────────────────────────────────────
$result = mysqli_query($conn,
    "SELECT pr.id, pr.symptoms, pr.diagnosis, pr.additional_instructions,
            pr.notes_for_patient, pr.consultation_fee, pr.created_at,
            d.full_name AS doctor_name, d.specialization
     FROM prescription_new pr
     JOIN doctors d ON pr.doctor_id = d.id
     WHERE pr.patient_id = '$patient_id'
     ORDER BY pr.created_at DESC"
);

$prescriptions = [];
while ($row = mysqli_fetch_assoc($result)) {
    $row['id']               = (int) $row['id'];
    $row['consultation_fee'] = (float) $row['consultation_fee'];

    // Get medicines
    $meds_result = mysqli_query($conn,
        "SELECT id, medicine_name, medicine_type, dosage, frequency, duration
         FROM prescription_medicines WHERE prescription_id='{$row['id']}'"
    );
    $medicines = [];
    while ($m = mysqli_fetch_assoc($meds_result)) {
        $m['id'] = (int) $m['id'];
        $medicines[] = $m;
    }
    $row['medicines'] = $medicines;
    $prescriptions[] = $row;
}

send_success(['prescriptions' => $prescriptions]);
