<?php

session_start();
include 'db.php';

if(!isset($_SESSION['patient_id']))
{
    header("location:login.php");
    exit;
}

$patient_id   = $_SESSION['patient_id'];
$patient_name = $_SESSION['patient_name'];

// Fetch patient details
$patient_query  = mysqli_query($conn, "SELECT * FROM patients WHERE id = '$patient_id'");
$patient        = mysqli_fetch_assoc($patient_query);

// Total appointments for this patient
$total_appointments = mysqli_num_rows(
    mysqli_query($conn, "SELECT * FROM appointments WHERE patient_id = '$patient_id'")
);

// Completed consultations
$total_completed = mysqli_num_rows(
    mysqli_query($conn, "SELECT * FROM consultations WHERE patient_id = '$patient_id' AND status='Completed'")
);

// Total bills
$billing_query  = mysqli_fetch_assoc(
    mysqli_query($conn, "SELECT SUM(amount) AS total FROM billing WHERE patient_id = '$patient_id' AND payment_status='Paid'")
);
$total_paid = $billing_query['total'] ?? 0;

$today = date("l, d F Y");

// First letter of name for avatar
$avatar_letter = strtoupper(substr($patient_name, 0, 1));
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patient Dashboard – MedCare OPD</title>
    <link rel="stylesheet" href="patient_dashboard.css">
</head>
<body>

<!-- ===== SIDEBAR ===== -->
<div class="sidebar">

    <div class="sidebar-brand">
        <div class="brand-icon">🏥</div>
        <h2>Med<span>Care</span></h2>
    </div>

    <div class="nav-label">Main Menu</div>

    <a href="dashboard.php" class="active">
        <span class="nav-icon">📊</span> Dashboard
    </a>
    <a href="#">
        <span class="nav-icon">📅</span> My Appointments
    </a>
    <a href="#">
        <span class="nav-icon">🩺</span> Consultations
    </a>
    <a href="#">
        <span class="nav-icon">💊</span> Prescriptions
    </a>
    <a href="#">
        <span class="nav-icon">💳</span> Billing
    </a>
    <a href="#">
        <span class="nav-icon">📋</span> Medical Records
    </a>

    <div class="nav-label">Account</div>

    <a href="#">
        <span class="nav-icon">👤</span> My Profile
    </a>
    <a href="#">
        <span class="nav-icon">⚙️</span> Settings
    </a>

    <div class="sidebar-footer">
        <a href="logout.php">
            <span class="nav-icon">🚪</span> Logout
        </a>
    </div>

</div>

<!-- ===== MAIN ===== -->
<div class="main">

    <!-- Top Header -->
    <div class="header">
        <div class="header-left">
            <h1>Patient Dashboard</h1>
            <p>Manage your health records and appointments</p>
        </div>
        <div class="header-right">
            <span class="date-badge">📅 <?php echo $today; ?></span>
            <div class="patient-avatar" title="<?php echo htmlspecialchars($patient_name); ?>">
                <?php echo $avatar_letter; ?>
            </div>
        </div>
    </div>

    <!-- Content -->
    <div class="content">

        <!-- Welcome Banner -->
        <div class="welcome-banner">
            <div class="welcome-text">
                <h2>Welcome back, <?php echo htmlspecialchars($patient_name); ?> 👋</h2>
                <p>Here's a summary of your health activity. Stay healthy!</p>
            </div>
            <div class="welcome-icon">🩺</div>
        </div>

        <!-- Stats Cards -->
        <div class="cards">

            <div class="card blue">
                <div class="card-icon">📅</div>
                <div class="card-info">
                    <h2><?php echo $total_appointments; ?></h2>
                    <p>My Appointments</p>
                </div>
            </div>

            <div class="card green">
                <div class="card-icon">✅</div>
                <div class="card-info">
                    <h2><?php echo $total_completed; ?></h2>
                    <p>Consultations Done</p>
                </div>
            </div>

            <div class="card orange">
                <div class="card-icon">💊</div>
                <div class="card-info">
                    <h2>0</h2>
                    <p>Prescriptions</p>
                </div>
            </div>

            <div class="card purple">
                <div class="card-icon">💳</div>
                <div class="card-info">
                    <h2>₹<?php echo number_format($total_paid); ?></h2>
                    <p>Total Paid</p>
                </div>
            </div>

        </div>

        <!-- Profile + Quick Actions Row -->
        <div class="two-col">

            <!-- Patient Info Card -->
            <div class="info-card">
                <div class="info-card-header">
                    <h3>👤 My Profile</h3>
                    <a href="#">Edit</a>
                </div>
                <div class="info-body">
                    <?php if($patient): ?>
                    <div class="info-row">
                        <span class="info-label">Full Name</span>
                        <span class="info-value"><?php echo htmlspecialchars($patient['full_name']); ?></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Gender</span>
                        <span class="info-value"><?php echo htmlspecialchars($patient['gender']); ?></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Age</span>
                        <span class="info-value"><?php echo htmlspecialchars($patient['age']); ?> years</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Blood Group</span>
                        <span class="info-value blood-badge"><?php echo htmlspecialchars($patient['blood_group']); ?></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Mobile</span>
                        <span class="info-value"><?php echo htmlspecialchars($patient['mobile']); ?></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email</span>
                        <span class="info-value"><?php echo htmlspecialchars($patient['email']); ?></span>
                    </div>
                    <?php else: ?>
                        <p style="color:#64748b; font-size:14px;">Profile details not available.</p>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-card">
                <div class="info-card-header">
                    <h3>⚡ Quick Actions</h3>
                </div>
                <div class="quick-grid">
                    <div class="quick-btn">
                        <span>📅</span>
                        <p>Book Appointment</p>
                    </div>
                    <div class="quick-btn">
                        <span>💊</span>
                        <p>View Prescriptions</p>
                    </div>
                    <div class="quick-btn">
                        <span>📋</span>
                        <p>Medical Records</p>
                    </div>
                    <div class="quick-btn">
                        <span>💳</span>
                        <p>View Bills</p>
                    </div>
                </div>
            </div>

        </div>
        <!-- /two-col -->

    </div>
    <!-- /content -->

</div>
<!-- /main -->

</body>
</html>
