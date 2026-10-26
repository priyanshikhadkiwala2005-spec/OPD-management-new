<?php
session_start();
include 'db.php';

if(!isset($_SESSION['doctor_id'])) {
    header("location:doctor_login.php");
    exit;
}

$doctor_id   = $_SESSION['doctor_id'];
$doctor_name = $_SESSION['doctor_name'];

// Stats
$total_patients     = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM patients"));
$total_appointments = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM appointments WHERE doctor_id='$doctor_id'"));
$total_completed    = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM consultations WHERE doctor_id='$doctor_id' AND status='Completed'"));
$revenue            = mysqli_fetch_assoc(mysqli_query($conn, "SELECT SUM(amount) AS total FROM billing WHERE doctor_id='$doctor_id' AND payment_status='Paid'"));
$total_revenue      = $revenue['total'] ?? 0;

// Date filter
$filter     = isset($_GET['filter']) ? $_GET['filter'] : 'today';
$today_date = date('Y-m-d');

if($filter == 'tomorrow') {
    $filter_date_from = date('Y-m-d', strtotime('+1 day'));
    $filter_date_to   = $filter_date_from;
    $filter_label     = "Tomorrow's";
} elseif($filter == 'week') {
    $filter_date_from = $today_date;
    $filter_date_to   = date('Y-m-d', strtotime('+6 days'));
    $filter_label     = "This Week's";
} else {
    $filter_date_from = $today_date;
    $filter_date_to   = $today_date;
    $filter_label     = "Today's";
}

$date_condition      = "a.appointment_date BETWEEN '$filter_date_from' AND '$filter_date_to'";
$date_condition_simple = "appointment_date BETWEEN '$filter_date_from' AND '$filter_date_to'";

// Filtered patients
$today_patients = mysqli_query($conn, "
    SELECT a.*, p.full_name, p.email, p.mobile
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE a.doctor_id = '$doctor_id' AND $date_condition
    ORDER BY a.appointment_date ASC, a.appointment_time ASC
");

// Counts
$today_all       = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND $date_condition_simple"));
$today_waiting   = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND $date_condition_simple AND status='Pending'"));
$today_progress  = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND $date_condition_simple AND status='In Progress'"));
$today_completed = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM appointments WHERE doctor_id='$doctor_id' AND $date_condition_simple AND status='Completed'"));

// Schedule
$schedule = mysqli_query($conn, "
    SELECT a.*, p.full_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE a.doctor_id = '$doctor_id' AND $date_condition
    ORDER BY a.appointment_date ASC, a.appointment_time ASC
    LIMIT 6
");

$today = date("l, d F Y");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Doctor Dashboard – MedCare OPD</title>
    <link rel="stylesheet" href="doctor_dashboard.css">
    <style>
        /* Two column layout for bottom section */
        .dashboard-bottom {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 22px;
            margin-top: 0;
        }

        /* Today's Patients */
        .today-box {
            background: #fff;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
            overflow: hidden;
        }
        .today-header {
            padding: 18px 24px 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .today-header h2 {
            font-size: 16px; font-weight: 700;
            color: #0f172a; text-align: left; margin-bottom: 0;
        }
        .today-header a {
            font-size: 13px; color: #2563eb;
            font-weight: 600; text-decoration: none;
        }
        .today-header a:hover { text-decoration: underline; }

        /* Filter Tabs */
        .filter-tabs {
            display: flex;
            gap: 4px;
            padding: 14px 24px 0;
        }
        .filter-tabs button {
            padding: 6px 16px;
            border-radius: 20px;
            border: none;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            background: #f1f5f9;
            color: #64748b;
            transition: all 0.18s;
        }
        .filter-tabs button.active,
        .filter-tabs button:hover {
            background: #2563eb;
            color: #fff;
        }

        /* Patient rows */
        .patient-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 80px;
            align-items: center;
            padding: 14px 24px;
            border-bottom: 1px solid #f1f5f9;
            transition: background 0.15s;
        }
        .patient-row:last-child { border-bottom: none; }
        .patient-row:hover { background: #fafbff; }
        .patient-row.header-row {
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            padding: 10px 24px;
        }
        .patient-row.header-row span {
            font-size: 11px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.7px;
            color: #94a3b8;
        }
        .pat-info { display: flex; align-items: center; gap: 12px; }
        .pat-avatar {
            width: 36px; height: 36px;
            border-radius: 50%;
            display: flex; align-items: center;
            justify-content: center;
            font-size: 14px; font-weight: 700;
            color: #fff; flex-shrink: 0;
            background: linear-gradient(135deg, #2563eb, #0ea5e9);
        }
        .pat-name { font-size: 14px; font-weight: 700; color: #0f172a; }
        .pat-email { font-size: 12px; color: #94a3b8; margin-top: 1px; }
        .pat-type { font-size: 13px; color: #475569; font-weight: 500; }
        .pat-time { font-size: 13px; color: #475569; font-weight: 500; }

        .status-waiting    { background:#fff7ed; color:#f59e0b; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #fde68a; white-space:nowrap; }
        .status-inprogress { background:#eff6ff; color:#2563eb; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #bfdbfe; white-space:nowrap; }
        .status-completed  { background:#f0fdf4; color:#10b981; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #bbf7d0; white-space:nowrap; }
        .status-cancelled  { background:#fef2f2; color:#ef4444; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #fecaca; white-space:nowrap; }

        .empty-today {
            text-align: center; padding: 40px 20px;
            color: #94a3b8; font-size: 14px;
        }
        .empty-today .eicon { font-size: 36px; margin-bottom: 8px; }

        /* Schedule Panel */
        .schedule-box {
            background: #fff;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
            overflow: hidden;
        }
        .schedule-header {
            padding: 18px 20px 14px;
            border-bottom: 1px solid #f1f5f9;
            display: flex; align-items: center;
            justify-content: space-between;
        }
        .schedule-header h2 {
            font-size: 16px; font-weight: 700;
            color: #0f172a; text-align: left; margin-bottom: 0;
        }
        .schedule-header a {
            font-size: 13px; color: #2563eb;
            font-weight: 600; text-decoration: none;
        }
        .today-date-badge {
            background: #2563eb;
            color: #fff;
            border-radius: 10px;
            padding: 10px 16px;
            margin: 14px 20px;
            text-align: center;
        }
        .today-date-badge .day { font-size: 28px; font-weight: 800; line-height: 1; }
        .today-date-badge .month { font-size: 13px; opacity: 0.85; margin-top: 3px; }

        .schedule-list { padding: 6px 0 10px; }
        .schedule-item {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            padding: 12px 20px;
            border-left: 3px solid transparent;
            margin: 0 0 2px;
            transition: background 0.15s;
        }
        .schedule-item:hover { background: #f8fafc; }
        .schedule-item.color-blue   { border-left-color: #2563eb; }
        .schedule-item.color-green  { border-left-color: #10b981; }
        .schedule-item.color-orange { border-left-color: #f59e0b; }
        .schedule-item.color-purple { border-left-color: #8b5cf6; }
        .schedule-item.color-red    { border-left-color: #ef4444; }

        .sch-time {
            font-size: 12px; color: #94a3b8;
            font-weight: 600; white-space: nowrap;
            min-width: 58px; padding-top: 2px;
        }
        .sch-info .title { font-size: 14px; font-weight: 700; color: #0f172a; }
        .sch-info .sub   { font-size: 12px; color: #64748b; margin-top: 2px; }

        /* ===== MINI CALENDAR ===== */
        .mini-cal {
            padding: 14px 20px 10px;
            border-bottom: 1px solid #f1f5f9;
        }
        .cal-nav {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
        }
        .cal-month {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
        }
        .cal-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
            text-align: center;
        }
        .cal-dow {
            font-size: 11px;
            font-weight: 700;
            color: #94a3b8;
            padding: 4px 0;
        }
        .cal-day {
            font-size: 12.5px;
            font-weight: 500;
            color: #475569;
            padding: 6px 2px;
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            transition: background 0.15s;
        }
        .cal-day.empty { background: transparent; }
        .cal-day.today {
            background: #2563eb;
            color: #fff;
            font-weight: 700;
            border-radius: 8px;
        }
        .cal-day.has-appt .dot {
            display: block;
            width: 4px; height: 4px;
            background: #10b981;
            border-radius: 50%;
            margin: 1px auto 0;
        }
        .cal-day.today .dot { background: #fff; }
        .cal-day:not(.empty):hover {
            background: #f1f5f9;
            color: #0f172a;
        }
        .no-schedule {
            text-align: center; padding: 30px 20px;
            color: #94a3b8; font-size: 13px;
        }

        @media (max-width: 1000px) {
            .dashboard-bottom { grid-template-columns: 1fr; }
        }
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
    <a href="doctor_dashboard.php" class="active"><span class="nav-icon">📊</span> Dashboard</a>
    <a href="patients.php"><span class="nav-icon">👥</span> Patients</a>
    <a href="appointments.php"><span class="nav-icon">📅</span> Appointments</a>
    <a href="consultations.php"><span class="nav-icon">🩺</span> Consultations</a>
    <a href="prescriptions.php"><span class="nav-icon">💊</span> Prescriptions</a>
    <a href="billing.php"><span class="nav-icon">💳</span> Billing</a>
    <div class="nav-label">Other</div>
    <a href="#"><span class="nav-icon">📈</span> Reports</a>
    <a href="#"><span class="nav-icon">⚙️</span> Settings</a>
    <div class="sidebar-footer">
        <a href="logout.php"><span class="nav-icon">🚪</span> Logout</a>
    </div>
</div>

<!-- MAIN -->
<div class="main">

    <div class="header">
        <div class="header-left">
            <h1>Doctor Dashboard</h1>
            <p>Welcome, Dr. <?php echo htmlspecialchars($doctor_name); ?></p>
        </div>
        <div class="header-right">
            <span class="date-badge">📅 <?php echo $today; ?></span>
            <div class="doctor-avatar"><?php echo strtoupper(substr($doctor_name,0,1)); ?></div>
        </div>
    </div>

    <div class="content">

        <!-- Stats Cards -->
        <div class="cards">
            <div class="card blue">
                <div class="card-icon">👥</div>
                <div class="card-info">
                    <h2><?php echo $total_patients; ?></h2>
                    <p>Total Patients</p>
                </div>
            </div>
            <div class="card green">
                <div class="card-icon">📅</div>
                <div class="card-info">
                    <h2><?php echo $total_appointments; ?></h2>
                    <p>Appointments</p>
                </div>
            </div>
            <div class="card orange">
                <div class="card-icon">✅</div>
                <div class="card-info">
                    <h2><?php echo $total_completed; ?></h2>
                    <p>Completed</p>
                </div>
            </div>
            <div class="card purple">
                <div class="card-icon">💰</div>
                <div class="card-info">
                    <h2>₹<?php echo number_format($total_revenue); ?></h2>
                    <p>Total Revenue</p>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick">
            <a href="register.php?type=patient" style="text-decoration:none;">
                <div class="box"><h3>➕ Add Patient</h3><p>Register a new patient</p></div>
            </a>
            <a href="appointments.php" style="text-decoration:none;">
                <div class="box"><h3>📅 Appointment</h3><p>Manage appointments</p></div>
            </a>
            <a href="prescriptions.php" style="text-decoration:none;">
                <div class="box"><h3>💊 Prescription</h3><p>Write a prescription</p></div>
            </a>
            <a href="billing.php" style="text-decoration:none;">
                <div class="box"><h3>💳 Billing</h3><p>Generate patient bills</p></div>
            </a>
        </div>

        <!-- Bottom: Today's Patients + Schedule -->
        <div class="dashboard-bottom">

            <!-- Today's Patients -->
            <div class="today-box">
                <div class="today-header">
                    <h2><?php echo $filter_label; ?> Patients</h2>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <form method="get" style="margin:0;">
                            <select name="filter" onchange="this.form.submit()"
                                style="padding:6px 12px;border-radius:8px;border:1.5px solid #e2e8f0;font-size:13px;font-weight:600;color:#1e293b;outline:none;cursor:pointer;background:#f8fafc;">
                                <option value="today"    <?php if($filter=='today')    echo 'selected'; ?>>📅 Today</option>
                                <option value="tomorrow" <?php if($filter=='tomorrow') echo 'selected'; ?>>📆 Tomorrow</option>
                                <option value="week"     <?php if($filter=='week')     echo 'selected'; ?>>🗓️ This Week</option>
                            </select>
                        </form>
                        <a href="appointments.php">View All →</a>
                    </div>
                </div>

                <!-- Filter Tabs -->
                <div class="filter-tabs">
                    <button class="active" onclick="filterToday('all', this)">
                        All <span style="opacity:0.7;">(<?php echo $today_all; ?>)</span>
                    </button>
                    <button onclick="filterToday('Pending', this)">
                        Waiting <span style="opacity:0.7;">(<?php echo $today_waiting; ?>)</span>
                    </button>
                    <button onclick="filterToday('In Progress', this)">
                        In Progress <span style="opacity:0.7;">(<?php echo $today_progress; ?>)</span>
                    </button>
                    <button onclick="filterToday('Completed', this)">
                        Completed <span style="opacity:0.7;">(<?php echo $today_completed; ?>)</span>
                    </button>
                </div>

                <!-- Header Row -->
                <div class="patient-row header-row" style="margin-top:12px;">
                    <span>Name</span>
                    <span>Type</span>
                    <span>Time</span>
                    <span>Status</span>
                    <span>Action</span>
                </div>

                <!-- Patient Rows -->
                <div id="todayList">
                <?php
                $colors = ['blue','green','orange','purple','red'];
                $ci = 0;
                $rows_today = [];
                while($r = mysqli_fetch_assoc($today_patients)) $rows_today[] = $r;

                if(count($rows_today) == 0):
                ?>
                <div class="empty-today">
                    <div class="eicon">📅</div>
                    No appointments scheduled for today.
                    <br><a href="appointments.php" style="color:#2563eb;font-weight:600;">+ Book Appointment</a>
                </div>
                <?php else: foreach($rows_today as $r):
                    $s = $r['status'];
                    $badge = '';
                    if($s == 'Pending')     $badge = 'status-waiting';
                    elseif($s == 'In Progress') $badge = 'status-inprogress';
                    elseif($s == 'Completed')   $badge = 'status-completed';
                    else $badge = 'status-cancelled';

                    $type = isset($r['type']) && $r['type'] ? $r['type'] : 'General';
                    $initial = strtoupper(substr($r['full_name'], 0, 1));
                ?>
                <div class="patient-row" data-status="<?php echo $s; ?>">
                    <div class="pat-info">
                        <div class="pat-avatar"><?php echo $initial; ?></div>
                        <div>
                            <div class="pat-name"><?php echo htmlspecialchars($r['full_name']); ?></div>
                            <div class="pat-email"><?php echo htmlspecialchars($r['email']); ?></div>
                        </div>
                    </div>
                    <div class="pat-type"><?php echo $type; ?></div>
                    <div class="pat-time"><?php echo date('h:i A', strtotime($r['appointment_time'])); ?></div>
                    <div><span class="<?php echo $badge; ?>"><?php echo ($s=='Pending'?'Waiting':$s); ?></span></div>
                    <div>
                        <a href="prescriptions.php" title="Write Prescription"
                           style="background:#f0fdf4;color:#10b981;border:1px solid #bbf7d0;padding:5px 10px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;">
                            💊
                        </a>
                    </div>
                </div>
                <?php $ci++; endforeach; endif; ?>
                </div>
            </div>

            <!-- Schedule Panel -->
            <div class="schedule-box">
                <div class="schedule-header">
                    <h2>📆 Schedules</h2>
                    <a href="appointments.php">View All</a>
                </div>

                <!-- Mini Calendar -->
                <?php
                $cal_year  = date('Y');
                $cal_month = date('n');
                $cal_month_name = date('F Y');
                $first_day = mktime(0,0,0,$cal_month,1,$cal_year);
                $start_dow = date('w', $first_day); // 0=Sun
                $days_in_month = date('t', $first_day);
                $today_num = (int)date('j');

                // Get days that have appointments
                $appt_days_q = mysqli_query($conn, "SELECT DAY(appointment_date) as d FROM appointments WHERE doctor_id='$doctor_id' AND MONTH(appointment_date)='$cal_month' AND YEAR(appointment_date)='$cal_year'");
                $appt_days = [];
                while($ad = mysqli_fetch_assoc($appt_days_q)) $appt_days[] = (int)$ad['d'];
                ?>
                <div class="mini-cal">
                    <div class="cal-nav">
                        <span class="cal-month"><?php echo $cal_month_name; ?></span>
                    </div>
                    <div class="cal-grid">
                        <div class="cal-dow">S</div><div class="cal-dow">M</div>
                        <div class="cal-dow">T</div><div class="cal-dow">W</div>
                        <div class="cal-dow">T</div><div class="cal-dow">F</div>
                        <div class="cal-dow">S</div>
                        <?php
                        // Empty cells before first day
                        for($e = 0; $e < $start_dow; $e++) echo '<div class="cal-day empty"></div>';
                        // Days
                        for($d = 1; $d <= $days_in_month; $d++) {
                            $cls = 'cal-day';
                            if($d == $today_num) $cls .= ' today';
                            if(in_array($d, $appt_days)) $cls .= ' has-appt';
                            $date_str = sprintf('%04d-%02d-%02d', $cal_year, $cal_month, $d);
                            echo "<div class='$cls' onclick=\"window.location.href='appointments_by_date.php?date=$date_str'\">$d" . (in_array($d,$appt_days) ? '<span class="dot"></span>' : '') . "</div>";
                        }
                        ?>
                    </div>
                </div>

                <!-- Timeline -->
                <div class="schedule-list">
                <?php
                $sch_colors = ['color-blue','color-green','color-orange','color-purple','color-red'];
                $sci = 0;
                $sch_rows = [];
                while($sr = mysqli_fetch_assoc($schedule)) $sch_rows[] = $sr;

                if(count($sch_rows) == 0):
                ?>
                <div class="no-schedule">
                    📭 No schedule.<br>
                    <a href="appointments.php" style="color:#2563eb;font-weight:600;">Book now →</a>
                </div>
                <?php else: foreach($sch_rows as $sr):
                    $stype = isset($sr['type']) && $sr['type'] ? $sr['type'] : 'General';
                    $color = $sch_colors[$sci % count($sch_colors)];
                    $ss = $sr['status'];
                    $appt_date = date('d M', strtotime($sr['appointment_date']));
                ?>
                <div class="schedule-item <?php echo $color; ?>">
                    <div class="sch-time">
                        <?php echo date('h:i A', strtotime($sr['appointment_time'])); ?>
                        <div style="font-size:10px;color:#94a3b8;margin-top:1px;"><?php echo $appt_date; ?></div>
                    </div>
                    <div class="sch-info">
                        <div class="title"><?php echo $stype; ?></div>
                        <div class="sub"><?php echo htmlspecialchars($sr['full_name']); ?> • <?php echo ($ss=='Pending'?'Waiting':$ss); ?></div>
                    </div>
                </div>
                <?php $sci++; endforeach; endif; ?>
                </div>

            </div>

        </div>
        <!-- /dashboard-bottom -->

    </div>
</div>

<script>
function filterToday(status, btn) {
    // Update active tab
    document.querySelectorAll('.filter-tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Filter rows
    const rows = document.querySelectorAll('#todayList .patient-row');
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
