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

// Delete patient
if(isset($_GET['delete'])) {
    $pid = $_GET['delete'];
    mysqli_query($conn, "DELETE FROM patients WHERE id='$pid'");
    $success = "Patient deleted successfully!";
}

// Search
$search = "";
$where  = "";
if(isset($_GET['search']) && trim($_GET['search']) != "") {
    $search = trim($_GET['search']);
    $where  = "WHERE full_name LIKE '%$search%' OR email LIKE '%$search%' OR mobile LIKE '%$search%'";
}

$patients = mysqli_query($conn, "SELECT * FROM patients $where ORDER BY id DESC");
$total    = mysqli_num_rows($patients);

// Stats
$total_male   = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM patients WHERE gender='Male'"));
$total_female = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM patients WHERE gender='Female'"));
$total_all    = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM patients"));

$today = date("l, d F Y");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patients – MedCare OPD</title>
    <link rel="stylesheet" href="doctor_dashboard.css">
    <style>
        .stats-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }
        .stat-card {
            background: #fff;
            border-radius: 12px;
            padding: 20px 24px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .stat-card .icon {
            width: 48px; height: 48px;
            border-radius: 12px;
            display: flex; align-items: center;
            justify-content: center; font-size: 22px;
        }
        .stat-card.blue .icon   { background: #eff6ff; }
        .stat-card.green .icon  { background: #f0fdf4; }
        .stat-card.purple .icon { background: #faf5ff; }
        .stat-card h3 { font-size: 26px; font-weight: 800; margin-bottom: 2px; line-height: 1; }
        .stat-card.blue   h3 { color: #2563eb; }
        .stat-card.green  h3 { color: #10b981; }
        .stat-card.purple h3 { color: #8b5cf6; }
        .stat-card p { font-size: 12.5px; color: #64748b; margin: 0; text-align: left; }

        .top-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            gap: 14px;
        }
        .search-box {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            max-width: 380px;
        }
        .search-box input {
            flex: 1;
            padding: 10px 16px;
            border: 1.5px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            margin-bottom: 0;
        }
        .search-box input:focus { border-color: #2563eb; }
        .btn-search {
            padding: 10px 18px;
            background: #2563eb;
            color: #fff; border: none;
            border-radius: 8px; font-size: 14px;
            font-weight: 600; cursor: pointer;
        }
        .btn-search:hover { background: #1d4ed8; }
        .btn-add {
            padding: 10px 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: #fff; border: none;
            border-radius: 8px; font-size: 14px;
            font-weight: 600; cursor: pointer;
            text-decoration: none; white-space: nowrap;
            box-shadow: 0 4px 10px rgba(16,185,129,0.3);
        }
        .btn-add:hover { background: linear-gradient(135deg, #059669, #047857); }

        .avatar-cell {
            width: 36px; height: 36px;
            border-radius: 50%;
            display: flex; align-items: center;
            justify-content: center;
            font-size: 15px; font-weight: 700;
            color: #fff; flex-shrink: 0;
        }
        .avatar-male   { background: linear-gradient(135deg, #2563eb, #0ea5e9); }
        .avatar-female { background: linear-gradient(135deg, #ec4899, #a855f7); }
        .avatar-other  { background: linear-gradient(135deg, #10b981, #06b6d4); }

        .patient-name-cell {
            display: flex; align-items: center; gap: 12px;
        }
        .patient-name-cell .name  { font-weight: 700; color: #0f172a; font-size: 14px; }
        .patient-name-cell .email { font-size: 12px; color: #64748b; margin-top: 2px; }

        .badge-male   { background:#eff6ff; color:#2563eb; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #bfdbfe; }
        .badge-female { background:#fdf4ff; color:#a855f7; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #e9d5ff; }
        .badge-other  { background:#f0fdf4; color:#10b981; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #bbf7d0; }
        .badge-blood  { background:#fef2f2; color:#ef4444; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #fecaca; }

        .btn-view { padding:5px 12px; background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; border-radius:6px; font-size:12px; font-weight:600; text-decoration:none; margin-right:4px; }
        .btn-del  { padding:5px 12px; background:#fef2f2; color:#ef4444; border:1px solid #fecaca; border-radius:6px; font-size:12px; font-weight:600; text-decoration:none; }
        .btn-view:hover { background:#dbeafe; }
        .btn-del:hover  { background:#fee2e2; }

        .alert-success { background:#f0fdf4; color:#10b981; border:1px solid #bbf7d0; border-radius:10px; padding:12px 18px; margin-bottom:20px; font-weight:600; }

        .empty-row td { text-align:center; padding:50px 20px; color:#94a3b8; font-size:14px; }
        .empty-icon { font-size:40px; display:block; margin-bottom:10px; }
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
    <a href="patients.php" class="active"><span class="nav-icon">👥</span> Patients</a>
    <a href="appointments.php"><span class="nav-icon">📅</span> Appointments</a>
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
            <h1>Patients</h1>
            <p>View and manage all registered patients</p>
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

        <!-- Stats -->
        <div class="stats-row">
            <div class="stat-card blue">
                <div class="icon">👥</div>
                <div><h3><?php echo $total_all; ?></h3><p>Total Patients</p></div>
            </div>
            <div class="stat-card green">
                <div class="icon">👨</div>
                <div><h3><?php echo $total_male; ?></h3><p>Male Patients</p></div>
            </div>
            <div class="stat-card purple">
                <div class="icon">👩</div>
                <div><h3><?php echo $total_female; ?></h3><p>Female Patients</p></div>
            </div>
        </div>

        <!-- Top Bar -->
        <div class="top-bar">
            <form method="get" class="search-box">
                <input type="text" name="search"
                       placeholder="Search by name, email or mobile..."
                       value="<?php echo htmlspecialchars($search); ?>">
                <button type="submit" class="btn-search">🔍 Search</button>
                <?php if($search): ?>
                <a href="patients.php" style="font-size:13px;color:#ef4444;font-weight:600;text-decoration:none;white-space:nowrap;">✕ Clear</a>
                <?php endif; ?>
            </form>
            <a href="register.php?type=patient" class="btn-add">+ Add Patient</a>
        </div>

        <!-- Table -->
        <div class="table-box">
            <div class="table-header">
                <h2>All Patients
                    <span style="font-size:13px;font-weight:500;color:#64748b;margin-left:8px;">
                        (<?php echo $total; ?> <?php echo $search ? "found" : "total"; ?>)
                    </span>
                </h2>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Patient</th>
                        <th>Gender</th>
                        <th>Age</th>
                        <th>Blood Group</th>
                        <th>Mobile</th>
                        <th>Registered</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                <?php
                $i = 1;
                if($total == 0):
                ?>
                <tr class="empty-row">
                    <td colspan="8">
                        <span class="empty-icon">👥</span>
                        <?php echo $search ? "No patients found for \"$search\"" : "No patients registered yet."; ?>
                    </td>
                </tr>
                <?php else: while($row = mysqli_fetch_assoc($patients)):
                    $g = $row['gender'];
                    $avatar_class = ($g=='Male') ? 'avatar-male' : (($g=='Female') ? 'avatar-female' : 'avatar-other');
                    $badge_class  = ($g=='Male') ? 'badge-male'  : (($g=='Female') ? 'badge-female'  : 'badge-other');
                    $initial = strtoupper(substr($row['full_name'], 0, 1));
                ?>
                <tr>
                    <td style="color:#94a3b8;font-weight:600;"><?php echo $i++; ?></td>
                    <td>
                        <div class="patient-name-cell">
                            <div class="avatar-cell <?php echo $avatar_class; ?>"><?php echo $initial; ?></div>
                            <div>
                                <div class="name"><?php echo htmlspecialchars($row['full_name']); ?></div>
                                <div class="email"><?php echo htmlspecialchars($row['email']); ?></div>
                            </div>
                        </div>
                    </td>
                    <td><span class="<?php echo $badge_class; ?>"><?php echo $g; ?></span></td>
                    <td style="font-weight:600;"><?php echo $row['age']; ?> yrs</td>
                    <td><span class="badge-blood"><?php echo htmlspecialchars($row['blood_group']); ?></span></td>
                    <td style="color:#475569;">📞 <?php echo htmlspecialchars($row['mobile']); ?></td>
                    <td style="color:#64748b;font-size:13px;">
                        <?php echo isset($row['created_at']) ? date('d M Y', strtotime($row['created_at'])) : '—'; ?>
                    </td>
                    <td>
                        <a href="prescriptions.php" class="btn-view">💊 Prescribe</a>
                        <a href="patients.php?delete=<?php echo $row['id']; ?>"
                           onclick="return confirm('Delete patient <?php echo htmlspecialchars($row['full_name']); ?>?')"
                           class="btn-del">🗑</a>
                    </td>
                </tr>
                <?php endwhile; endif; ?>
                </tbody>
            </table>
        </div>

    </div>
</div>

</body>
</html>
