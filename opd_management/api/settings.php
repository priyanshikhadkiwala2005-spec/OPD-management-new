<?php
session_start();
require_once 'cors.php';
require_once 'db.php';
require_once 'response.php';
require_once 'auth_check.php';

$doctor_id = require_doctor();
$method    = $_SERVER['REQUEST_METHOD'];

// ── Auto-create doctor_settings table if not exists ──────────────────────
mysqli_query($conn, "
  CREATE TABLE IF NOT EXISTS `doctor_settings` (
    `id`             INT(11)       NOT NULL AUTO_INCREMENT,
    `doctor_id`      INT(11)       NOT NULL UNIQUE,
    `clinic_name`    VARCHAR(255)  DEFAULT '',
    `clinic_address` TEXT          DEFAULT '',
    `clinic_phone`   VARCHAR(20)   DEFAULT '',
    `clinic_email`   VARCHAR(255)  DEFAULT '',
    `fee_general`    DECIMAL(10,2) DEFAULT 500.00,
    `fee_emergency`  DECIMAL(10,2) DEFAULT 800.00,
    `fee_followup`   DECIMAL(10,2) DEFAULT 400.00,
    `fee_review`     DECIMAL(10,2) DEFAULT 400.00,
    `created_at`     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8
");

// ── GET — fetch all settings ──────────────────────────────────────────────
if ($method === 'GET') {
    // Doctor profile from doctors table
    $doc_result = mysqli_query($conn,
        "SELECT id, full_name, email, mobile, specialization
         FROM doctors WHERE id='$doctor_id' LIMIT 1"
    );
    
    $doctor = null;
    if ($doc_result && $row = mysqli_fetch_assoc($doc_result)) {
        $doctor = [
            'id'             => (int) $row['id'],
            'full_name'      => $row['full_name'],
            'email'          => $row['email'],
            'mobile'         => $row['mobile'],
            'specialization' => $row['specialization'],
        ];
    }

    // Settings from doctor_settings table (or create default if missing)
    $settings_result = mysqli_query($conn,
        "SELECT * FROM doctor_settings WHERE doctor_id='$doctor_id' LIMIT 1"
    );

    if ($settings_result && mysqli_num_rows($settings_result) > 0) {
        $settings = mysqli_fetch_assoc($settings_result);
    } else {
        // Create default settings for this doctor
        mysqli_query($conn,
            "INSERT INTO doctor_settings (doctor_id) VALUES ('$doctor_id')"
        );
        $settings_result = mysqli_query($conn,
            "SELECT * FROM doctor_settings WHERE doctor_id='$doctor_id' LIMIT 1"
        );
        $settings = mysqli_fetch_assoc($settings_result);
    }

    send_success([
        'profile' => $doctor,
        'clinic' => [
            'clinic_name'    => $settings['clinic_name']    ?? '',
            'clinic_address' => $settings['clinic_address'] ?? '',
            'clinic_phone'   => $settings['clinic_phone']   ?? '',
            'clinic_email'   => $settings['clinic_email']   ?? '',
        ],
        'fees' => [
            'fee_general'   => (float) ($settings['fee_general']   ?? 500),
            'fee_emergency' => (float) ($settings['fee_emergency'] ?? 800),
            'fee_followup'  => (float) ($settings['fee_followup']  ?? 400),
            'fee_review'    => (float) ($settings['fee_review']    ?? 400),
        ],
    ]);
}

// ── POST — update settings ────────────────────────────────────────────────
if ($method === 'POST') {
    $body    = get_json_body();
    $section = $body['section'] ?? ''; // profile | clinic | fees

    if ($section === 'profile') {
        // Update doctors table
        $full_name      = clean($conn, $body['full_name']      ?? '');
        $email          = clean($conn, $body['email']          ?? '');
        $mobile         = clean($conn, $body['mobile']         ?? '');
        $specialization = clean($conn, $body['specialization'] ?? '');

        mysqli_query($conn,
            "UPDATE doctors
             SET full_name='$full_name', email='$email',
                 mobile='$mobile', specialization='$specialization'
             WHERE id='$doctor_id'"
        );

        send_success([], 'Profile updated successfully!');
    }

    if ($section === 'clinic') {
        // Update clinic info in doctor_settings
        $clinic_name    = clean($conn, $body['clinic_name']    ?? '');
        $clinic_address = clean($conn, $body['clinic_address'] ?? '');
        $clinic_phone   = clean($conn, $body['clinic_phone']   ?? '');
        $clinic_email   = clean($conn, $body['clinic_email']   ?? '');

        mysqli_query($conn,
            "UPDATE doctor_settings
             SET clinic_name='$clinic_name',
                 clinic_address='$clinic_address',
                 clinic_phone='$clinic_phone',
                 clinic_email='$clinic_email'
             WHERE doctor_id='$doctor_id'"
        );

        send_success([], 'Clinic info updated successfully!');
    }

    if ($section === 'fees') {
        // Update fee settings
        $fee_general   = (float) ($body['fee_general']   ?? 500);
        $fee_emergency = (float) ($body['fee_emergency'] ?? 800);
        $fee_followup  = (float) ($body['fee_followup']  ?? 400);
        $fee_review    = (float) ($body['fee_review']    ?? 400);

        mysqli_query($conn,
            "UPDATE doctor_settings
             SET fee_general='$fee_general',
                 fee_emergency='$fee_emergency',
                 fee_followup='$fee_followup',
                 fee_review='$fee_review'
             WHERE doctor_id='$doctor_id'"
        );

        send_success([], 'Fee settings updated successfully!');
    }

    send_error('Invalid section parameter. Use: profile, clinic, or fees.');
}

send_error('Method not allowed', 405);
