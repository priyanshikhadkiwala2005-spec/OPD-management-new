<?php
session_start();
include 'db.php';

if(!isset($_SESSION['doctor_id'])) {
    header("location:doctor_login.php");
    exit;
}

$doctor_id   = $_SESSION['doctor_id'];
$doctor_name = $_SESSION['doctor_name'];
$success = $error = "";

// Book new appointment
if(isset($_POST['book'])) {
    $patient_id = $_POST['patient_id'];
    $date       = $_POST['appointment_date'];
    $time       = $_POST['appointment_time'];
    $type       = $_POST['type'];

    $q = "INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, type, status)
          VALUES ('$patient_id','$doctor_id','$date','$time','$type','Pending')";
    if(mysqli_query($conn, $q))
        $success = "Appointment booked successfully!";
    else
        $error = mysqli_error($conn);
}

// Update status
if(isset($_POST['update_status'])) {
    $appt_id = $_POST['appt_id'];
    $status  = $_POST['status'];
    mysqli_query($conn, "UPDATE appointments SET status='$status' WHERE id='$appt_id'");
    $success = "Appointment status updated!";
}

// Delete
if(isset($_GET['delete'])) {
    $appt_id = $_GET['delete'];
    mysqli_query($conn, "DELETE FROM appointments WHERE id='$appt_id' AND doctor_id='$doctor_id'");
    $success = "Appointment deleted!";
}

// Stats
$total_appts     = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM appointments WHERE doctor_id='$doctor_id'"));
$pending_appts   = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND status='Pending'"));
$completed_appts = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND status='Completed'"));
$cancelled_appts = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND status='Cancelled'"));

// Patients dropdown
$patients = mysqli_query($conn, "SELECT id, full_name FROM patients ORDER BY full_name");

// Appointments list
$appointments = mysqli_query($conn, "
    SELECT a.*, p.full_name AS patient_name, p.mobile AS patient_mobile
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE a.doctor_id = '$doctor_id'
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
");

$today = date("l, d F Y");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointments – MedCare OPD</title>
    <link rel="stylesheet" href="doctor_dashboard.css">
    <style>
        /* ---- Stats Row ---- */
        .appt-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }
        .appt-stat {
            background: #fff;
            border-radius: 12px;
            padding: 18px 20px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .appt-stat .stat-icon {
            width: 46px; height: 46px;
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            font-size: 20px; flex-shrink: 0;
        }
        .appt-stat.all   .stat-icon { background: #eff6ff; }
        .appt-stat.pend  .stat-icon { background: #fff7ed; }
        .appt-stat.done  .stat-icon { background: #f0fdf4; }
        .appt-stat.canc  .stat-icon { background: #fef2f2; }
        .appt-stat h3 { font-size: 24px; font-weight: 800; margin-bottom: 2px; line-height: 1; }
        .appt-stat.all  h3 { color: #2563eb; }
        .appt-stat.pend h3 { color: #f59e0b; }
        .appt-stat.done h3 { color: #10b981; }
        .appt-stat.canc h3 { color: #ef4444; }
        .appt-stat p { font-size: 12.5px; color: #64748b; margin: 0; text-align: left; }

        /* ---- Book Form ---- */
        .book-card {
            background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
            border-radius: 14px;
            padding: 24px 28px;
            border: 1px solid #c7d7ff;
            box-shadow: 0 2px 12px rgba(37,99,235,0.07);
            margin-bottom: 24px;
        }
        .book-card h3 {
            font-size: 15px; font-weight: 700; color: #1e293b;
            margin-bottom: 18px;
            display: flex; align-items: center; gap: 8px;
        }
        .book-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr auto;
            gap: 14px;
            align-items: end;
        }
        .book-grid .fg label {
            display: block; font-size: 12.5px; font-weight: 600;
            color: #475569; margin-bottom: 6px;
        }
        .book-grid select,
        .book-grid input[type="date"],
        .book-grid input[type="time"] {
            width: 100%; padding: 10px 14px;
            border: 1.5px solid #d1d9ff;
            border-radius: 8px; font-size: 14px;
            color: #1e293b; background: #fff;
            outline: none; margin-bottom: 0;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .book-grid select:focus,
        .book-grid input:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
        }
        .btn-book {
            padding: 11px 28px;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: #fff; border: none; border-radius: 8px;
            font-size: 14px; font-weight: 600; cursor: pointer;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(37,99,235,0.3);
            transition: all 0.2s;
        }
        .btn-book:hover {
            background: linear-gradient(135deg, #1d4ed8, #1e40af);
            transform: translateY(-1px);
        }

        /* ---- Alert ---- */
        .alert-success {
            background: #f0fdf4; color: #10b981;
            border: 1px solid #bbf7d0; border-radius: 10px;
            padding: 12px 18px; margin-bottom: 20px;
            font-weight: 600; display: flex; align-items: center; gap: 8px;
        }
        .alert-error {
            background: #fef2f2; color: #ef4444;
            border: 1px solid #fecaca; border-radius: 10px;
            padding: 12px 18px; margin-bottom: 20px;
            font-weight: 600; display: flex; align-items: center; gap: 8px;
        }

        /* ---- Table ---- */
        .table-box { border-radius: 14px; }
        .filter-bar {
            display: flex; align-items: center; gap: 10px;
        }
        .filter-bar select {
            padding: 7px 14px; border-radius: 8px;
            border: 1.5px solid #e2e8f0; font-size: 13px;
            color: #475569; outline: none; background: #f8fafc;
            cursor: pointer;
        }
        .filter-bar select:focus { border-color: #2563eb; }

        table th { font-size: 11.5px; }
        table td { font-size: 13.5px; vertical-align: middle; }

        .patient-cell .name { font-weight: 700; color: #0f172a; font-size: 14px; }
        .patient-cell .mobile { font-size: 12px; color: #64748b; margin-top: 2px; }

        .date-cell .date { font-weight: 600; color: #1e293b; }
        .date-cell .time { font-size: 12px; color: #64748b; margin-top: 2px; }

        .badge-pending   { background:#fff7ed; color:#f59e0b; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #fde68a; white-space:nowrap; }
        .badge-completed { background:#f0fdf4; color:#10b981; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #bbf7d0; white-space:nowrap; }
        .badge-cancelled { background:#fef2f2; color:#ef4444; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #fecaca; white-space:nowrap; }

        .action-wrap { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .action-wrap select {
            padding: 6px 10px; border-radius: 6px;
            border: 1.5px solid #e2e8f0; font-size: 12.5px;
            color: #334155; outline: none; background: #f8fafc;
        }
        .btn-update {
            padding: 6px 14px; background: #2563eb; color: #fff;
            border: none; border-radius: 6px; font-size: 12px;
            font-weight: 600; cursor: pointer; white-space: nowrap;
        }
        .btn-update:hover { background: #1d4ed8; }
        .btn-del {
            padding: 6px 12px; background: #fef2f2; color: #ef4444;
            border: 1px solid #fecaca; border-radius: 6px;
            font-size: 12px; font-weight: 600; cursor: pointer;
            text-decoration: none; white-space: nowrap;
        }
        .btn-del:hover { background: #fee2e2; }

        .empty-row td {
            text-align: center; padding: 50px 20px;
            color: #94a3b8; font-size: 14px;
        }
        .empty-row .empty-icon { font-size: 40px; display: block; margin-bottom: 10px; }
    </style>
</head>
<body>

<!-- SIDEBAR -->
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

<!-- MAIN -->
<div class="main">

    <div class="header">
        <div class="header-left">
            <h1>Appointments</h1>
            <p>Schedule and manage patient appointments</p>
        </div>
        <div class="header-right">
            <span class="date-badge">📅 <?php echo $today; ?></span>
            <div class="doctor-avatar"><?php echo strtoupper(substr($doctor_name,0,1)); ?></div>
        </div>
    </div>

    <div class="content">

        <?php if($success): ?>
        <div class="alert-success">✅ <?php echo $success; ?></div>
        <?php endif; ?>
        <?php if($error): ?>
        <div class="alert-error">⚠️ <?php echo $error; ?></div>
        <?php endif; ?>

        <!-- Stats -->
        <div class="appt-stats">
            <div class="appt-stat all">
                <div class="stat-icon">📋</div>
                <div><h3><?php echo $total_appts; ?></h3><p>Total</p></div>
            </div>
            <div class="appt-stat pend">
                <div class="stat-icon">⏳</div>
                <div><h3><?php echo $pending_appts; ?></h3><p>Pending</p></div>
            </div>
            <div class="appt-stat done">
                <div class="stat-icon">✅</div>
                <div><h3><?php echo $completed_appts; ?></h3><p>Completed</p></div>
            </div>
            <div class="appt-stat canc">
                <div class="stat-icon">❌</div>
                <div><h3><?php echo $cancelled_appts; ?></h3><p>Cancelled</p></div>
            </div>
        </div>

        <!-- Book Appointment -->
        <div class="book-card">
            <h3>📅 Book New Appointment</h3>
            <form method="post">
                <div class="book-grid">
                    <div class="fg">
                        <label>Select Patient</label>
                        <select name="patient_id" required>
                            <option value="">-- Select Patient --</option>
                            <?php while($p = mysqli_fetch_assoc($patients)): ?>
                            <option value="<?php echo $p['id']; ?>">
                                <?php echo htmlspecialchars($p['full_name']); ?>
                            </option>
                            <?php endwhile; ?>
                        </select>
                    </div>
                    <div class="fg">
                        <label>Type</label>
                        <select name="type">
                            <option value="General">General</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Emergency">Emergency</option>
                            <option value="Review">Review</option>
                        </select>
                    </div>
                    <div class="fg">
                        <label>Appointment Date</label>
                        <input type="date" name="appointment_date"
                               min="<?php echo date('Y-m-d'); ?>" required>
                    </div>
                    <div class="fg">
                        <label>Appointment Time</label>
                        <input type="time" name="appointment_time" required>
                    </div>
                    <div class="fg">
                        <label>&nbsp;</label>
                        <button type="submit" name="book" class="btn-book">+ Book</button>
                    </div>
                </div>
            </form>
        </div>

        <!-- Appointments Table -->
        <div class="table-box">
            <div class="table-header">
                <h2>All Appointments
                    <span style="font-size:13px;font-weight:500;color:#64748b;margin-left:8px;">
                        (<?php echo $total_appts; ?> total)
                    </span>
                </h2>
                <div class="filter-bar">
                    <span style="font-size:13px;color:#64748b;">Filter:</span>
                    <select onchange="filterTable(this.value)">
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <table id="apptTable">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Patient</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Update Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                <?php
                $i = 1;
                $rows = [];
                while($row = mysqli_fetch_assoc($appointments)) $rows[] = $row;

                if(count($rows) == 0):
                ?>
                <tr class="empty-row">
                    <td colspan="6">
                        <span class="empty-icon">📅</span>
                        No appointments booked yet. Book your first appointment above.
                    </td>
                </tr>
                <?php else: foreach($rows as $row):
                    $s = $row['status'];
                    $badge = 'badge-' . strtolower($s);
                ?>
                <tr data-status="<?php echo $s; ?>">
                    <td style="color:#94a3b8;font-weight:600;"><?php echo $i++; ?></td>
                    <td>
                        <div class="patient-cell">
                            <div class="name"><?php echo htmlspecialchars($row['patient_name']); ?></div>
                            <div class="mobile">📞 <?php echo htmlspecialchars($row['patient_mobile']); ?></div>
                        </div>
                    </td>
                    <td>
                        <div class="date-cell">
                            <div class="date">📆 <?php echo date('d M Y', strtotime($row['appointment_date'])); ?></div>
                            <div class="time">🕐 <?php echo date('h:i A', strtotime($row['appointment_time'])); ?></div>
                        </div>
                    </td>
                    <td><span class="<?php echo $badge; ?>"><?php echo $s; ?></span></td>
                    <td>
                        <form method="post" style="display:inline;">
                            <input type="hidden" name="appt_id" value="<?php echo $row['id']; ?>">
                            <div class="action-wrap">
                                <select name="status">
                                    <option <?php if($s=='Pending')   echo 'selected'; ?>>Pending</option>
                                    <option <?php if($s=='Completed') echo 'selected'; ?>>Completed</option>
                                    <option <?php if($s=='Cancelled') echo 'selected'; ?>>Cancelled</option>
                                </select>
                                <button type="submit" name="update_status" class="btn-update">Update</button>
                            </div>
                        </form>
                    </td>
                    <td>
                        <a href="appointments.php?delete=<?php echo $row['id']; ?>"
                           onclick="return confirm('Delete this appointment?')"
                           class="btn-del">🗑 Delete</a>
                    </td>
                </tr>
                <?php endforeach; endif; ?>
                </tbody>
            </table>
        </div>

    </div>
</div>

<script>
function filterTable(status) {
    const rows = document.querySelectorAll('#apptTable tbody tr[data-status]');
    rows.forEach(row => {
        if(status === 'all' || row.dataset.status === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
</script>

</body>
</html>
