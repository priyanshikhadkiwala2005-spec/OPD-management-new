<?php
// Call this in any protected API endpoint
// Usage: require_doctor() or require_patient()

function require_doctor() {
    if (!isset($_SESSION['doctor_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Please login as doctor.']);
        exit();
    }
    return (int) $_SESSION['doctor_id'];
}

function require_patient() {
    if (!isset($_SESSION['patient_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Please login as patient.']);
        exit();
    }
    return (int) $_SESSION['patient_id'];
}
