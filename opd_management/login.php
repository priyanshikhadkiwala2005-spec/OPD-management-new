<?php

session_start();
include 'db.php';

$error = "";

if(isset($_POST['login']))
{
    $email    = trim($_POST['email']);
    $password = trim($_POST['password']);

    $query  = "SELECT * FROM patients WHERE LOWER(email) = LOWER('$email') AND password = '$password'";
    $result = mysqli_query($conn, $query);

    if(mysqli_num_rows($result) > 0)
    {
        $row = mysqli_fetch_assoc($result);
        $_SESSION['patient_id']   = $row['id'];
        $_SESSION['patient_name'] = $row['full_name'];
        header("location:dashboard.php");
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
    <title>Patient Login – OPD Management</title>
    <link rel="stylesheet" href="style.css">
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

        <div class="box-title">
            <h2>Welcome Back</h2>
            <p>Sign in to your patient account</p>
        </div>

        <?php if($error): ?>
            <div class="error">⚠️ <?php echo $error; ?></div>
        <?php endif; ?>

        <form method="post" autocomplete="off">

            <div class="form-group">
                <label for="email">Email Address</label>
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
                    <span class="icon"></span>
                    <input type="password"
                           id="password"
                           name="password"
                           placeholder="Enter your password"
                           required>
                </div>
            </div>

            <button type="submit" name="login" class="btn-primary">
                Sign In
            </button>

        </form>

        <div class="divider">or</div>

        <p style="margin-top:0;">
            New Patient?
            <a href="register.php?type=patient">Create Account</a>
        </p>
        <p style="margin-top:8px;">
            Are you a Doctor?
            <a href="doctor_login.php">Doctor Login</a>
        </p>

    </div>

</div>

</body>
</html>
