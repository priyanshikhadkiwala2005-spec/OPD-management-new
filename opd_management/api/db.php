<?php
$host     = "localhost";
$username = "root";
$password = "";
$database = "opd_management";

$conn = mysqli_connect($host, $username, $password, $database);

if (!$conn) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . mysqli_connect_error()]);
    exit();
}

mysqli_set_charset($conn, "utf8");
