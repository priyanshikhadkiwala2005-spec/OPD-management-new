<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';
require_once 'auth_check.php';

$doctor_id = require_doctor();
$method    = $_SERVER['REQUEST_METHOD'];

// ── POST — save prescription + medicines ──────────────────────────────────
if ($method === 'POST') {
    $body       = get_json_body();
    $patient_id = (int)   ($body['patient_id']              ?? 0);
    $fee        = (float) ($body['consultation_fee']        ?? 0);
    $symptoms   = clean($conn, $body['symptoms']            ?? '');
    $diagnosis  = clean($conn, $body['diagnosis']           ?? '');
    $instruct   = clean($conn, $body['additional_instructions'] ?? '');
    $notes      = clean($conn, $body['notes_for_patient']   ?? '');
    $medicines  = $body['medicines'] ?? [];

    if (!$patient_id) send_error('Please select a patient.');

    // Insert into prescription_new
    $q = "INSERT INTO prescription_new
            (patient_id, doctor_id, symptoms, diagnosis,
             additional_instructions, notes_for_patient, consultation_fee)
          VALUES
            ('$patient_id','$doctor_id','$symptoms','$diagnosis',
             '$instruct','$notes','$fee')";

    if (!mysqli_query($conn, $q)) {
        send_error('Failed to save prescription: ' . mysqli_error($conn));
    }

    $prescription_id = mysqli_insert_id($conn);

    // Insert medicines
    foreach ($medicines as $med) {
        $name     = clean($conn, $med['name']      ?? '');
        $type     = clean($conn, $med['type']      ?? 'Medicine');
        $dosage   = clean($conn, $med['dosage']    ?? '');
        $freq     = clean($conn, $med['frequency'] ?? '');
        $dur      = clean($conn, $med['duration']  ?? '');

        if (!$name) continue;

        mysqli_query($conn,
            "INSERT INTO prescription_medicines
               (prescription_id, medicine_name, medicine_type, dosage, frequency, duration)
             VALUES
               ('$prescription_id','$name','$type','$dosage','$freq','$dur')"
        );
    }

    send_success(['id' => $prescription_id], 'Prescription saved successfully!');
}

send_error('Method not allowed', 405);
