-- Run this in phpMyAdmin or MySQL to create the doctor_settings table

CREATE TABLE IF NOT EXISTS `doctor_settings` (
  `id`               INT(11)       NOT NULL AUTO_INCREMENT,
  `doctor_id`        INT(11)       NOT NULL UNIQUE,

  -- Clinic Info
  `clinic_name`      VARCHAR(255)  DEFAULT '',
  `clinic_address`   TEXT          DEFAULT '',
  `clinic_phone`     VARCHAR(20)   DEFAULT '',
  `clinic_email`     VARCHAR(255)  DEFAULT '',

  -- Fee Settings
  `fee_general`      DECIMAL(10,2) DEFAULT 500.00,
  `fee_emergency`    DECIMAL(10,2) DEFAULT 800.00,
  `fee_followup`     DECIMAL(10,2) DEFAULT 400.00,
  `fee_review`       DECIMAL(10,2) DEFAULT 400.00,

  `created_at`       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
