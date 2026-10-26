<?php
session_start();
include 'db.php';

if(!isset($_SESSION['doctor_id'])) {
    header("location:doctor_login.php");
    exit;
}

$doctor_id   = $_SESSION['doctor_id'];
$doctor_name = $_SESSION['doctor_name'];

// Get date from URL
$selected_date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
$display_date  = date('l, d F Y', strtotime($selected_date));

// Update status
if(isset($_POST['update_status'])) {
    $appt_id = $_POST['appt_id'];
    $status  = $_POST['status'];
    mysqli_query($conn, "UPDATE appointments SET status='$status' WHERE id='$appt_id'");
}

// Fetch appointments for this date
$appointments = mysqli_query($conn, "
    SELECT a.*, p.full_name, p.email, p.mobile, p.age, p.gender
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE a.doctor_id = '$doctor_id' AND a.appointment_date = '$selected_date'
    ORDER BY a.appointment_time ASC
");

$total = mysqli_num_rows($appointments);
$today = date("l, d F Y");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointments – <?php echo $display_date; ?></title>
    <link rel="stylesheet" href="doctor_dashboard.css">
    <style>
        .back-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: #f1f5f9;
            color: #475569;
            border-radius: 8px;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 20px;
            border: 1px solid #e2e8f0;
            transition: all 0.2s;
        }
        .back-btn:hover { background: #e2e8f0; color: #0f172a; }

        .date-banner {
            background: linear-gradient(135deg, #2563eb, #0ea5e9);
            border-radius: 14px;
            padding: 20px 28px;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .date-banner h2 {
            font-size: 20px;
            font-weight: 700;
            color: #fff;
            text-align: left;
            margin-bottom: 4px;
        }
        .date-banner p {
            font-size: 13px;
            color: rgba(255,255,255,0.8);
            text-align: left;
            margin: 0;
        }
        .date-banner .count-badge {
            background: rgba(255,255,255,0.2);
            color: #fff;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 15px;
            font-weight: 700;
        }

        .appt-card {
            background: #fff;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            padding: 20px 24px;
            margin-bottom: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 18px;
            align-items: center;
        }
        .appt-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.09); }

        .appt-avatar {
            width: 50px; height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2563eb, #0ea5e9);
            display: flex; align-items: center;
            justify-content: center;
            font-size: 20px; font-weight: 700;
            color: #fff; flex-shrink: 0;
        }
        .appt-info .name { font-size: 16px; font-weight: 700; color: #0f172a; }
        .appt-info .meta { font-size: 13px; color: #64748b; margin-top: 4px; }
        .appt-info .meta span {
            display: inline-block;
            margin-right: 12px;
        }

        .type-general   { background: #eff6ff; color: #2563eb; }
        .type-followup  { background: #f0fdf4; color: #10b981; }
        .type-emergency { background: #fef2f2; color: #ef4444; }
        .type-review    { background: #fff7ed; color: #f59e0b; }
        .type-badge {
            padding: 3px 12px; border-radius: 20px;
            font-size: 12px; font-weight: 700;
        }

        .appt-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
        .appt-time { font-size: 15px; font-weight: 700; color: #0f172a; }

        .status-pending    { background:#fff7ed; color:#f59e0b; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #fde68a; }
        .status-inprogress { background:#eff6ff; color:#2563eb; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #bfdbfe; }
        .status-completed  { background:#f0fdf4; color:#10b981; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #bbf7d0; }
        .status-cancelled  { background:#fef2f2; color:#ef4444; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #fecaca; }

        .update-form { display: flex; gap: 8px; align-items: center; }
        .update-form select {
            padding: 6px 10px; border-radius: 6px;
            border: 1.5px solid #e2e8f0; font-size: 13px;
            outline: none;
        }
        .btn-update {
            padding: 6px 14px; background: #2563eb;
            color: #fff; border: none; border-radius: 6px;
            font-size: 12px; font-weight: 600; cursor: pointer;
        }
        .btn-update:hover { background: #1d4ed8; }

        .empty-box {
            text-align: center; padding: 60px 20px;
            background: #fff; border-radius: 14px;
            border: 1px solid #e2e8f0;
        }
        .empty-box .icon { font-size: 50px; margin-bottom: 12px; }
        .empty-box p { color: #64748b; font-size: 15px; }
        .empty-box a { color: #2563eb; font-weight: 600; text-decoration: none; }
    </style>
</head>
<body>

<div class="sidebar">
    <div class="sidebar-brand">
        <div class="brand-icon">🏥</div>
        <h2>Med<span>Care</span></h2>
    </div>
    <div class="nav-label">Main Menu</div>
    <a href="doctor_dashboard.php"><span class="nav-icon">📊</span> Dashboard</a>
    <a href="patients.php"><span class="nav-icon">👥</span> Patients</a>
    <a href="appointments.php" class="active"><span class="nav-icon">📅</span> Appointments</a>
    <a href="consultations.php"><span class="nav-icon">🩺</span> Consultations</a>
    <a href="prescriptions.php"><span class="nav-icon">💊</span> Prescriptions</a>
    <a href="billing.php"><span class="nav-icon">💳</span> Billing</a>
    <div class="nav-label">Other</div>
    <a href="#"><span class="nav-icon">📈</span> Reports</a>
    <div class="sidebar-footer">
        <a href="logout.php"><span class="nav-icon">🚪</span> Logout</a>
    </div>
</div>

<div class="main">
    <div class="header">
        <div class="header-left">
            <h1>Appointments</h1>
            <p>Viewing: <?php echo $display_date; ?></p>
        </div>
        <div class="header-right">
            <span class="date-badge">📅 <?php echo $today; ?></span>
            <div class="doctor-avatar"><?php echo strtoupper(substr($doctor_name,0,1)); ?></div>
        </div>
    </div>

    <div class="content">

        <a href="doctor_dashboard.php" class="back-btn">← Back to Dashboard</a>

        <!-- Date Banner -->
        <div class="date-banner">
            <div>
                <h2>📅 <?php echo $display_date; ?></h2>
                <p><?php echo $total; ?> appointment(s) scheduled</p>
            </div>
            <div class="count-badge"><?php echo $total; ?> Patients</div>
        </div>

        <?php if($total == 0): ?>
        <div class="empty-box">
            <div class="icon">📭</div>
            <p>No appointments on this date.</p>
            <p style="margin-top:10px;">
                <a href="appointments.php">+ Book Appointment</a>
            </p>
        </div>
        <?php else:
        mysqli_data_seek($appointments, 0);
        while($row = mysqli_fetch_assoc($appointments)):
            $s = $row['status'];
            $badge = ($s=='Pending') ? 'status-pending' : (($s=='In Progress') ? 'status-inprogress' : (($s=='Completed') ? 'status-completed' : 'status-cancelled'));
            $type = isset($row['type']) && $row['type'] ? $row['type'] : 'General';
            $type_class = 'type-' . strtolower(str_replace('-','',str_replace(' ','',$type)));
            $initial = strtoupper(substr($row['full_name'], 0, 1));
        ?>
        <div class="appt-card">
            <div class="appt-avatar"><?php echo $initial; ?></div>
            <div class="appt-info">
                <div class="name"><?php echo htmlspecialchars($row['full_name']); ?></div>
                <div class="meta">
                    <span>📞 <?php echo htmlspecialchars($row['mobile']); ?></span>
                    <span>👤 <?php echo $row['age']; ?> yrs, <?php echo $row['gender']; ?></span>
                    <span class="type-badge <?php echo $type_class; ?>"><?php echo $type; ?></span>
                </div>
            </div>
            <div class="appt-right">
                <div class="appt-time">🕐 <?php echo date('h:i A', strtotime($row['appointment_time'])); ?></div>
                <span class="<?php echo $badge; ?>"><?php echo ($s=='Pending'?'Waiting':$s); ?></span>
                <form method="post" class="update-form">
                    <input type="hidden" name="appt_id" value="<?php echo $row['id']; ?>">
                    <select name="status">
                        <option <?php if($s=='Pending')      echo 'selected'; ?>>Pending</option>
                        <option <?php if($s=='In Progress')  echo 'selected'; ?>>In Progress</option>
                        <option <?php if($s=='Completed')    echo 'selected'; ?>>Completed</option>
                        <option <?php if($s=='Cancelled')    echo 'selected'; ?>>Cancelled</option>
                    </select>
                    <button type="submit" name="update_status" class="btn-update">Update</button>
                </form>
            </div>
        </div>
        <?php endwhile; endif; ?>

    </div>
</div>

</body>
</html>
