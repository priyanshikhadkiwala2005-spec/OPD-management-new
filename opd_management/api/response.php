<?php
function send_success($data = [], $message = 'Success') {
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data'    => $data,
    ]);
    exit();
}

function send_error($message = 'Something went wrong', $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message,
        'data'    => null,
    ]);
    exit();
}

// Read raw JSON body (for POST/PUT with JSON payload)
function get_json_body() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

// Sanitize input
function clean($conn, $val) {
    return mysqli_real_escape_string($conn, trim($val));
}
