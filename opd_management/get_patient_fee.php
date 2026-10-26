<?php
session_start();
include 'db.php';

if(!isset($_SESSION['doctor_id'])) {
    echo json_encode(['error' => 'Not authorized']);
    exit;
}

$patient_id = isset($_GET['patient_id']) ? $_GET['patient_id'] : 0;
$doctor_id  = $_SESSION['doctor_id'];

// Get latest appointment type for this patient with this doctor
$result = mysqli_query($conn, "
    SELECT type FROM appointments 
    WHERE patient_id = '$patient_id' AND doctor_id = '$doctor_id'
    ORDER BY appointment_date DESC, appointment_time DESC 
    LIMIT 1
");

$type = 'General'; // default
$fee  = 500;       // default

if($result && mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_assoc($result);
    $type = $row['type'] ? $row['type'] : 'General';
}

// Set fee based on type
switch($type) {
    case 'Emergency':
        $fee = 800;
        break;
    case 'Follow-up':
    case 'Review':
        $fee = 300;
        break;
    case 'General':
    default:
        $fee = 500;
        break;
}

echo json_encode(['type' => $type, 'fee' => $fee]);
?>
