<?php
session_start();
include 'db.php';

if(!isset($_SESSION['doctor_id'])) {
    header("location:doctor_login.php");
    exit;
}

$doctor_id   = $_SESSION['doctor_id'];
$doctor_name = $_SESSION['doctor_name'];
$success = "";

// Delete prescription
if(isset($_GET['delete'])) {
    $id = $_GET['delete'];
    mysqli_query($conn, "DELETE FROM prescription_medicines WHERE prescription_id='$id'");
    mysqli_query($conn, "DELETE FROM prescription_new WHERE id='$id' AND doctor_id='$doctor_id'");
    $success = "Prescription deleted!";
}

// Fetch all prescriptions with patient name
$prescriptions = mysqli_query($conn, "
    SELECT pr.*, p.full_name AS patient_name, p.age, p.gender, p.blood_group
    FROM prescription_new pr
    JOIN patients p ON pr.patient_id = p.id
    WHERE pr.doctor_id = '$doctor_id'
    ORDER BY pr.created_at DESC
");

$today = date("l, d F Y");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consultations – MedCare OPD</title>
    <link rel="stylesheet" href="doctor_dashboard.css">
    <style>
        .consult-card {
            background: #fff;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            margin-bottom: 18px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            overflow: hidden;
            transition: box-shadow 0.2s;
        }
        .consult-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.09); }

        .consult-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 24px;
            border-bottom: 1px solid #f1f5f9;
            background: #fafbff;
        }
        .patient-left {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .pat-av {
            width: 44px; height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, #2563eb, #0ea5e9);
            display: flex; align-items: center;
            justify-content: center;
            font-size: 18px; font-weight: 700;
            color: #fff; flex-shrink: 0;
        }
        .pat-name { font-size: 16px; font-weight: 700; color: #0f172a; }
        .pat-meta { font-size: 12px; color: #64748b; margin-top: 3px; }

        .consult-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .fee-tag {
            background: #f0fdf4;
            color: #10b981;
            border: 1px solid #bbf7d0;
            padding: 5px 14px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 700;
        }
        .date-tag {
            font-size: 12px;
            color: #64748b;
        }
        .btn-delete-rx {
            background: #fef2f2;
            color: #ef4444;
            border: 1px solid #fecaca;
            padding: 6px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            text-decoration: none;
        }

        .consult-body {
            padding: 20px 24px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
        }
        .info-block label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #94a3b8;
            margin-bottom: 6px;
        }
        .info-block p {
            font-size: 14px;
            color: #1e293b;
            line-height: 1.6;
            text-align: left;
            margin: 0;
        }

        .medicines-section {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px dashed #e2e8f0;
        }
        .medicines-section h4 {
            font-size: 13px;
            font-weight: 700;
            color: #475569;
            margin-bottom: 12px;
        }
        .med-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .med-tag {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 14px;
            font-size: 13px;
        }
        .med-tag .mname { font-weight: 700; color: #0f172a; }
        .med-tag .mdetail { color: #64748b; font-size: 12px; margin-top: 2px; }
        .med-tag.injection { border-color: #fce7f3; background: #fdf4ff; }
        .med-tag.injection .mname { color: #9f1239; }

        .notes-section {
            margin-top: 14px;
            padding: 12px 16px;
            background: #fff7ed;
            border-radius: 8px;
            border-left: 3px solid #f59e0b;
        }
        .notes-section label {
            font-size: 11px; font-weight: 700;
            color: #92400e; text-transform: uppercase;
            letter-spacing: 0.8px; display: block;
            margin-bottom: 4px;
        }
        .notes-section p {
            font-size: 13px; color: #78350f;
            line-height: 1.5; margin: 0;
            text-align: left;
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            background: #fff;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
        }
        .empty-state .icon { font-size: 60px; margin-bottom: 14px; }
        .empty-state p { color: #64748b; font-size: 15px; }
        .empty-state a {
            color: #2563eb; font-weight: 600;
            text-decoration: none;
        }

        .alert-success {
            background: #f0fdf4; color: #10b981;
            border: 1px solid #bbf7d0; border-radius: 10px;
            padding: 12px 18px; margin-bottom: 20px;
            font-weight: 600;
        }

        .page-stats {
            display: grid;
            grid-template-columns: repeat(3,1fr);
            gap: 16px;
            margin-bottom: 24px;
        }
        .pstat {
            background: #fff;
            border-radius: 12px;
            padding: 18px 22px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            display: flex; align-items: center; gap: 14px;
        }
        .pstat .icon { font-size: 28px; }
        .pstat h3 { font-size: 24px; font-weight: 800; color: #2563eb; margin-bottom: 2px; }
        .pstat p { font-size: 12.5px; color: #64748b; margin: 0; text-align: left; }
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
    <a href="consultations.php" class="active"><span class="nav-icon">🩺</span> Consultations</a>
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
            <h1>Consultations</h1>
            <p>All patient prescriptions and consultation records</p>
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

        <?php
        // Stats
        $total_rx   = mysqli_num_rows(mysqli_query($conn, "SELECT id FROM prescription_new WHERE doctor_id='$doctor_id'"));
        $total_meds = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(pm.id) AS t FROM prescription_medicines pm JOIN prescription_new pr ON pm.prescription_id=pr.id WHERE pr.doctor_id='$doctor_id'"))['t'] ?? 0;
        $total_rev  = mysqli_fetch_assoc(mysqli_query($conn, "SELECT SUM(consultation_fee) AS t FROM prescription_new WHERE doctor_id='$doctor_id'"))['t'] ?? 0;
        ?>

        <!-- Stats -->
        <div class="page-stats">
            <div class="pstat">
                <div class="icon">📋</div>
                <div><h3><?php echo $total_rx; ?></h3><p>Total Consultations</p></div>
            </div>
            <div class="pstat">
                <div class="icon">💊</div>
                <div><h3><?php echo $total_meds; ?></h3><p>Medicines Prescribed</p></div>
            </div>
            <div class="pstat">
                <div class="icon">💰</div>
                <div><h3 style="color:#10b981;">₹<?php echo number_format($total_rev); ?></h3><p>Consultation Revenue</p></div>
            </div>
        </div>

        <?php
        $count = mysqli_num_rows($prescriptions);
        if($count == 0):
        ?>
        <div class="empty-state">
            <div class="icon">🩺</div>
            <p>No consultations recorded yet.</p>
            <p style="margin-top:10px;"><a href="prescriptions.php">+ Write First Prescription →</a></p>
        </div>
        <?php else: while($row = mysqli_fetch_assoc($prescriptions)):
            $initial = strtoupper(substr($row['patient_name'], 0, 1));
            $medicines = mysqli_query($conn, "SELECT * FROM prescription_medicines WHERE prescription_id='{$row['id']}'");
            $med_count = mysqli_num_rows($medicines);
        ?>

        <div class="consult-card">
            <div class="consult-header">
                <div class="patient-left">
                    <div class="pat-av"><?php echo $initial; ?></div>
                    <div>
                        <div class="pat-name"><?php echo htmlspecialchars($row['patient_name']); ?></div>
                        <div class="pat-meta">
                            <?php echo $row['age']; ?> yrs • <?php echo $row['gender']; ?> •
                            Blood: <?php echo $row['blood_group']; ?> •
                            <?php echo $med_count; ?> medicine(s)
                        </div>
                    </div>
                </div>
                <div class="consult-right">
                    <span class="fee-tag">₹<?php echo number_format($row['consultation_fee'], 2); ?></span>
                    <span class="date-tag">🕒 <?php echo date('d M Y, h:i A', strtotime($row['created_at'])); ?></span>
                    <a href="consultations.php?delete=<?php echo $row['id']; ?>"
                       onclick="return confirm('Delete this consultation?')"
                       class="btn-delete-rx">🗑</a>
                </div>
            </div>

            <div class="consult-body">
                <?php if($row['symptoms'] || $row['diagnosis']): ?>
                <div class="info-grid">
                    <?php if($row['symptoms']): ?>
                    <div class="info-block">
                        <label>Symptoms</label>
                        <p><?php echo nl2br(htmlspecialchars($row['symptoms'])); ?></p>
                    </div>
                    <?php endif; ?>
                    <?php if($row['diagnosis']): ?>
                    <div class="info-block">
                        <label>Diagnosis</label>
                        <p><?php echo nl2br(htmlspecialchars($row['diagnosis'])); ?></p>
                    </div>
                    <?php endif; ?>
                </div>
                <?php endif; ?>

                <!-- Medicines -->
                <?php if($med_count > 0): ?>
                <div class="medicines-section">
                    <h4>💊 Prescribed Medicines (<?php echo $med_count; ?>)</h4>
                    <div class="med-tags">
                        <?php
                        mysqli_data_seek($medicines, 0);
                        while($m = mysqli_fetch_assoc($medicines)):
                            $is_inj = ($m['medicine_type'] == 'Injection');
                        ?>
                        <div class="med-tag <?php echo $is_inj ? 'injection' : ''; ?>">
                            <div class="mname">
                                <?php echo $is_inj ? '💉 ' : '💊 '; ?>
                                <?php echo htmlspecialchars($m['medicine_name']); ?>
                            </div>
                            <div class="mdetail">
                                <?php echo htmlspecialchars($m['dosage']); ?> •
                                <?php echo htmlspecialchars($m['frequency']); ?> •
                                <?php echo htmlspecialchars($m['duration']); ?>
                            </div>
                        </div>
                        <?php endwhile; ?>
                    </div>
                </div>
                <?php endif; ?>

                <!-- Notes -->
                <?php if($row['notes_for_patient'] || $row['additional_instructions']): ?>
                <div class="notes-section">
                    <label>📝 Notes & Instructions</label>
                    <?php if($row['additional_instructions']): ?>
                    <p><?php echo nl2br(htmlspecialchars($row['additional_instructions'])); ?></p>
                    <?php endif; ?>
                    <?php if($row['notes_for_patient']): ?>
                    <p style="margin-top:4px;"><?php echo nl2br(htmlspecialchars($row['notes_for_patient'])); ?></p>
                    <?php endif; ?>
                </div>
                <?php endif; ?>

            </div>
        </div>

        <?php endwhile; endif; ?>

    </div>
</div>

</body>
</html>
