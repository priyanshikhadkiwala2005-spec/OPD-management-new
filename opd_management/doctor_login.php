<?php

session_start();
include 'db.php';

// Already logged in to redirect
if(isset($_SESSION['doctor_id']))
{
    header("location:doctor_dashboard.php");
    exit;
}

$error = "";

if(isset($_POST['login']))
{
    $email    = trim($_POST['email']);
    $password = trim($_POST['password']);

    $query  = "SELECT * FROM doctors WHERE LOWER(email) = LOWER('$email') AND password = '$password'";
    $result = mysqli_query($conn, $query);

    if(mysqli_num_rows($result) > 0)
    {
        $row = mysqli_fetch_assoc($result);
        $_SESSION['doctor_id']   = $row['id'];
        $_SESSION['doctor_name'] = $row['full_name'];
        header("location:doctor_dashboard.php");
        exit;
    }
    else
    {
        $error = "Invalid email or password. Please try again.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Doctor Login – MedCare OPD</title>
    <link rel="stylesheet" href="style.css">
    <style>
        .box-title h2 { color: #0f172a; }
        .btn-doctor {
            width: 100%;
            padding: 13px;
            background: linear-gradient(135deg, #0ea5e9, #2563eb);
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(14,165,233,0.35);
            margin-top: 4px;
        }
        .btn-doctor:hover {
            background: linear-gradient(135deg, #0284c7, #1d4ed8);
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(14,165,233,0.45);
        }
        .doctor-tag {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #f0f9ff;
            color: #0284c7;
            border: 1px solid #bae6fd;
            border-radius: 20px;
            padding: 4px 14px;
            font-size: 12.5px;
            font-weight: 600;
            margin-bottom: 18px;
        }
    </style>
</head>
<body>

<div class="auth-wrapper">

    <!-- Branding -->
    <div class="brand-logo">
        <div class="logo-icon">🏥</div>
        <h1>Med<span>Care</span> OPD</h1>
        <p>Outpatient Department Management System</p>
    </div>

    <!-- Card -->
    <div class="box">

        <div style="text-align:center;">
            <div class="doctor-tag">🩺 Doctor Portal</div>
        </div>

        <div class="box-title">
            <h2>Doctor Sign In</h2>
            <p>Access your dashboard and manage patients</p>
        </div>

        <?php if($error): ?>
            <div class="error">⚠️ <?php echo $error; ?></div>
        <?php endif; ?>

        <form method="post" autocomplete="off">

            <div class="form-group">
                <label for="email">Registered Email</label>
                <div class="input-icon">
                    <span class="icon">📧</span>
                    <input type="email"
                           id="email"
                           name="email"
                           placeholder="Enter your email"
                           required>
                </div>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <div class="input-icon">
                    <span class="icon">🔒</span>
                    <input type="password"
                           id="password"
                           name="password"
                           placeholder="Enter your password"
                           required>
                </div>
            </div>

            <button type="submit" name="login" class="btn-doctor">
                Sign In as Doctor
            </button>

        </form>

        <div class="divider">or</div>

        <p style="margin-top:0;">
            New Doctor?
            <a href="register.php?type=doctor">Register Here</a>
        </p>
        <p style="margin-top:8px;">
            Are you a Patient?
            <a href="login.php">Patient Login</a>
        </p>

    </div>

</div>

</body>
</html>
