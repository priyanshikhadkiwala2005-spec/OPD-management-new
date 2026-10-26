<?php

include 'db.php';

$type  = "patient";
$error = "";

if(isset($_GET['type']))
{
    $type = $_GET['type'];
}

if(isset($_POST['register']))
{
    $type             = $_POST['type'];
    $name             = $_POST['full_name'];
    $gender           = $_POST['gender'];
    $dob              = $_POST['dob'];
    $age              = $_POST['age'];
    $mobile           = $_POST['mobile'];
    $email            = $_POST['email'];
    $address          = $_POST['address'];
    $password         = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];

    if($password != $confirm_password)
    {
        $error = "Passwords do not match. Please try again.";
    }
    else
    {
        if($type == "doctor")
        {
            $specialization = $_POST['specialization'];
            $query = "INSERT INTO doctors
                      (full_name, gender, dob, age, specialization, mobile, email, address, password)
                      VALUES
                      ('$name','$gender','$dob','$age','$specialization','$mobile','$email','$address','$password')";
        }
        else
        {
            $blood_group = $_POST['blood_group'];
            $query = "INSERT INTO patients
                      (full_name, gender, dob, age, blood_group, mobile, email, address, password)
                      VALUES
                      ('$name','$gender','$dob','$age','$blood_group','$mobile','$email','$address','$password')";
        }

        $result = mysqli_query($conn, $query);

        if($result)
        {
            echo "<script>
                    alert('Registration Successful! Please login.');
                    window.location='login.php';
                  </script>";
        }
        else
        {
            $error = mysqli_error($conn);
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo ($type == "doctor") ? "Doctor" : "Patient"; ?> Registration – OPD Management</title>
    <link rel="stylesheet" href="style.css">
    <style>
        body { align-items: flex-start; padding: 30px 20px; }
    </style>
</head>
<body>

<div class="auth-wrapper">

    <!-- Branding -->
    <div class="brand-logo">
        <div class="logo-icon">🏥</div>
        <h1>Med<span>Care</span> OPD</h1>
        <p>Create your account to get started</p>
    </div>

    <!-- Card -->
    <div class="box">

        <!-- Toggle Patient / Doctor -->
        <div class="type-buttons">
            <a href="register.php?type=patient">
                <button type="button" <?php if($type=="patient") echo 'class="active"'; ?>>
                    👤 Patient
                </button>
            </a>
            <a href="register.php?type=doctor">
                <button type="button" <?php if($type=="doctor") echo 'class="active"'; ?>>
                    🩺 Doctor
                </button>
            </a>
        </div>

        <div class="box-title">
            <h2><?php echo ($type == "doctor") ? "Doctor Registration" : "Patient Registration"; ?></h2>
            <p>Fill in the details below to create your account</p>
        </div>

        <?php if($error): ?>
            <div class="error">⚠️ <?php echo $error; ?></div>
        <?php endif; ?>

        <form method="post" autocomplete="off">

            <input type="hidden" name="type" value="<?php echo $type; ?>">

            <!-- Personal Info -->
            <div class="section-label">Personal Information</div>

            <div class="form-group">
                <label>Full Name</label>
                <input type="text" name="full_name" placeholder="e.g. Rahul Sharma" required>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Gender</label>
                    <select name="gender" required>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Age</label>
                    <input type="number" name="age" placeholder="Age" min="1" max="120" required>
                </div>
            </div>

            <div class="form-group">
                <label>Date of Birth</label>
                <input type="date" name="dob" required>
            </div>

            <?php if($type == "doctor"): ?>
            <div class="form-group">
                <label>Specialization</label>
                <input type="text" name="specialization" placeholder="e.g. Cardiologist, Orthopedic" required>
            </div>
            <?php endif; ?>

            <?php if($type == "patient"): ?>
            <div class="form-group">
                <label>Blood Group</label>
                <select name="blood_group" required>
                    <option value="">Select Blood Group</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                    <option>O+</option>
                    <option>O-</option>
                </select>
            </div>
            <?php endif; ?>

            <!-- Contact Info -->
            <div class="section-label">Contact Information</div>

            <div class="form-row">
                <div class="form-group">
                    <label>Mobile Number</label>
                    <input type="text" name="mobile" placeholder="10-digit mobile" required>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" placeholder="you@email.com" required>
                </div>
            </div>

            <div class="form-group">
                <label>Address</label>
                <textarea name="address" placeholder="Enter your full address"></textarea>
            </div>

            <!-- Security -->
            <div class="section-label">Security</div>

            <div class="form-row">
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" placeholder="Create password" required>
                </div>
                <div class="form-group">
                    <label>Confirm Password</label>
                    <input type="password" name="confirm_password" placeholder="Re-enter password" required>
                </div>
            </div>

            <button type="submit" name="register" class="btn-primary">
                Create Account
            </button>

        </form>

        <p>Already have an account? <a href="login.php">Sign In</a></p>

    </div>

</div>

</body>
</html>
