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

// Generate bill
if(isset($_POST['generate'])) {
    $patient_id     = $_POST['patient_id'];
    $amount         = $_POST['amount'];
    $payment_status = $_POST['payment_status'];

    $q = "INSERT INTO billing (patient_id, doctor_id, amount, payment_status)
          VALUES ('$patient_id','$doctor_id','$amount','$payment_status')";
    if(mysqli_query($conn, $q))
        $success = "Bill generated successfully!";
    else
        $error = mysqli_error($conn);
}

// Update payment status
if(isset($_POST['update_payment'])) {
    $bill_id = $_POST['bill_id'];
    $status  = $_POST['payment_status'];
    mysqli_query($conn, "UPDATE billing SET payment_status='$status' WHERE id='$bill_id' AND doctor_id='$doctor_id'");
    $success = "Payment status updated!";
}

// Delete bill
if(isset($_GET['delete'])) {
    $id = $_GET['delete'];
    mysqli_query($conn, "DELETE FROM billing WHERE id='$id' AND doctor_id='$doctor_id'");
    $success = "Bill deleted!";
}

// Fetch patients
$patients = mysqli_query($conn, "SELECT id, full_name FROM patients ORDER BY full_name");

// Fetch bills
$bills = mysqli_query($conn, "
    SELECT b.*, p.full_name AS patient_name
    FROM billing b
    JOIN patients p ON b.patient_id = p.id
    WHERE b.doctor_id = '$doctor_id'
    ORDER BY b.created_at DESC
");

// Summary stats
$total_paid = mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT SUM(amount) AS t FROM billing WHERE doctor_id='$doctor_id' AND payment_status='Paid'"))['t'] ?? 0;
$total_pending = mysqli_fetch_assoc(mysqli_query($conn,
    "SELECT SUM(amount) AS t FROM billing WHERE doctor_id='$doctor_id' AND payment_status='Pending'"))['t'] ?? 0;
$total_bills = mysqli_num_rows(mysqli_query($conn,
    "SELECT id FROM billing WHERE doctor_id='$doctor_id'"));

$today = date("l, d F Y");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Billing – MedCare OPD</title>
    <link rel="stylesheet" href="doctor_dashboard.css">
    <style>
        .form-card { background:#fff; border-radius:14px; padding:26px 28px; border:1px solid #e2e8f0; box-shadow:0 2px 12px rgba(0,0,0,0.06); margin-bottom:24px; }
        .form-card h3 { font-size:16px; font-weight:700; color:#0f172a; margin-bottom:18px; }
        .form-grid-3 { display:grid; grid-template-columns:2fr 1fr 1fr auto; gap:14px; align-items:end; }
        .form-grid-3 select, .form-grid-3 input { margin-bottom:0; }
        label { display:block; font-size:13px; font-weight:600; color:#0f172a; margin-bottom:6px; }
        select, input { width:100%; padding:10px 14px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; outline:none; }
        select:focus, input:focus { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,0.1); }
        .btn-generate { padding:11px 24px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; white-space:nowrap; }
        .btn-generate:hover { background:linear-gradient(135deg,#059669,#047857); }
        .status-paid    { background:#f0fdf4; color:#10b981; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #bbf7d0; }
        .status-pending { background:#fff7ed; color:#f59e0b; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:700; border:1px solid #fde68a; }
        .summary-cards  { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-bottom:24px; }
        .sum-card { background:#fff; border-radius:14px; padding:22px 24px; border:1px solid #e2e8f0; box-shadow:0 2px 8px rgba(0,0,0,0.05); text-align:center; }
        .sum-card h2 { font-size:28px; font-weight:800; margin-bottom:4px; }
        .sum-card p  { font-size:13px; color:#64748b; }
        .sum-card.green h2 { color:#10b981; }
        .sum-card.orange h2 { color:#f59e0b; }
        .sum-card.blue h2 { color:#2563eb; }
        .alert-success { background:#f0fdf4; color:#10b981; border:1px solid #bbf7d0; border-radius:8px; padding:12px 16px; margin-bottom:18px; font-weight:600; }
        .alert-error   { background:#fef2f2; color:#ef4444; border:1px solid #fecaca; border-radius:8px; padding:12px 16px; margin-bottom:18px; font-weight:600; }
        .action-form { display:inline-flex; align-items:center; gap:6px; }
        .action-form select { padding:5px 10px; border-radius:6px; border:1px solid #e2e8f0; font-size:13px; margin-bottom:0; width:auto; }
        .btn-sm { padding:5px 14px; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; }
        .btn-update { background:#2563eb; color:#fff; }
        .btn-delete { background:#fef2f2; color:#ef4444; border:1px solid #fecaca; margin-left:6px; text-decoration:none; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:600; }
        .amount-cell { font-size:15px; font-weight:700; color:#0f172a; }
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
    <a href="appointments.php"><span class="nav-icon">📅</span> Appointments</a>
    <a href="consultations.php"><span class="nav-icon">🩺</span> Consultations</a>
    <a href="prescriptions.php"><span class="nav-icon">💊</span> Prescriptions</a>
    <a href="billing.php" class="active"><span class="nav-icon">💳</span> Billing</a>
    <div class="nav-label">Other</div>
    <a href="#"><span class="nav-icon">📈</span> Reports</a>
    <div class="sidebar-footer">
        <a href="logout.php"><span class="nav-icon">🚪</span> Logout</a>
    </div>
</div>

<div class="main">
    <div class="header">
        <div class="header-left">
            <h1>Billing</h1>
            <p>Generate and manage patient bills</p>
        </div>
        <div class="header-right">
            <span class="date-badge">📅 <?php echo $today; ?></span>
            <div class="doctor-avatar"><?php echo strtoupper(substr($doctor_name,0,1)); ?></div>
        </div>
    </div>

    <div class="content">

        <?php if($success): ?><div class="alert-success">✅ <?php echo $success; ?></div><?php endif; ?>
        <?php if($error):   ?><div class="alert-error">⚠️ <?php echo $error; ?></div><?php endif; ?>

        <!-- Summary Cards -->
        <div class="summary-cards">
            <div class="sum-card green">
                <h2>₹<?php echo number_format($total_paid, 2); ?></h2>
                <p>💰 Total Collected</p>
            </div>
            <div class="sum-card orange">
                <h2>₹<?php echo number_format($total_pending, 2); ?></h2>
                <p>⏳ Pending Amount</p>
            </div>
            <div class="sum-card blue">
                <h2><?php echo $total_bills; ?></h2>
                <p>🧾 Total Bills</p>
            </div>
        </div>

        <!-- Generate Bill Form -->
        <div class="form-card">
            <h3>🧾 Generate New Bill</h3>
            <form method="post">
                <div class="form-grid-3">
                    <div>
                        <label>Select Patient</label>
                        <select name="patient_id" required>
                            <option value="">-- Select Patient --</option>
                            <?php while($p = mysqli_fetch_assoc($patients)): ?>
                            <option value="<?php echo $p['id']; ?>"><?php echo htmlspecialchars($p['full_name']); ?></option>
                            <?php endwhile; ?>
                        </select>
                    </div>
                    <div>
                        <label>Amount (₹)</label>
                        <input type="number" name="amount" placeholder="e.g. 1500" min="0" step="0.01" required>
                    </div>
                    <div>
                        <label>Payment Status</label>
                        <select name="payment_status">
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>
                    <div>
                        <label>&nbsp;</label>
                        <button type="submit" name="generate" class="btn-generate">+ Generate</button>
                    </div>
                </div>
            </form>
        </div>

        <!-- Bills Table -->
        <div class="table-box">
            <div class="table-header">
                <h2>All Bills</h2>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Patient Name</th>
                        <th>Amount</th>
                        <th>Payment Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                <?php
                $i = 1;
                mysqli_data_seek($bills, 0);
                while($row = mysqli_fetch_assoc($bills)):
                    $ps = $row['payment_status'];
                    $badge = ($ps == 'Paid') ? 'status-paid' : 'status-pending';
                ?>
                <tr>
                    <td><?php echo $i++; ?></td>
                    <td><strong><?php echo htmlspecialchars($row['patient_name']); ?></strong></td>
                    <td class="amount-cell">₹<?php echo number_format($row['amount'], 2); ?></td>
                    <td><span class="<?php echo $badge; ?>"><?php echo $ps; ?></span></td>
                    <td><?php echo date('d M Y', strtotime($row['created_at'])); ?></td>
                    <td>
                        <form method="post" class="action-form">
                            <input type="hidden" name="bill_id" value="<?php echo $row['id']; ?>">
                            <select name="payment_status">
                                <option <?php if($ps=='Pending') echo 'selected'; ?>>Pending</option>
                                <option <?php if($ps=='Paid')    echo 'selected'; ?>>Paid</option>
                            </select>
                            <button type="submit" name="update_payment" class="btn-sm btn-update">Update</button>
                        </form>
                        <a href="billing.php?delete=<?php echo $row['id']; ?>"
                           onclick="return confirm('Delete this bill?')"
                           class="btn-delete">🗑 Delete</a>
                    </td>
                </tr>
                <?php endwhile; ?>
                </tbody>
            </table>
        </div>

    </div>
</div>
</body>
</html>
