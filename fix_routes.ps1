$files = Get-ChildItem "C:\xampp\htdocs\opd_management_react\src\pages\*.jsx"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false

    # Replace all PHP API endpoints with Node.js equivalents
    $replacements = @{
        '/appointments.php'        = '/appointments'
        '/patients.php'            = '/patients'
        '/billing.php'             = '/billing'
        '/consultations.php'       = '/prescriptions'
        '/prescriptions.php'       = '/prescriptions'
        '/doctor_stats.php'        = '/settings/stats'
        '/patient_stats.php'       = '/settings/patient-stats'
        '/patient_appointments.php'= '/appointments/my'
        '/patient_billing.php'     = '/billing/my'
        '/patient_prescriptions.php'='/prescriptions/my'
        '/patient_profile.php'     = '/patients/profile'
        '/doctors_list.php'        = '/patients/doctors-list'
        '/get_patient_fee.php'     = '/prescriptions/fee'
        '/settings.php'            = '/settings'
        '/update_password.php'     = '/settings/change-password'
        '/reports.php'             = '/settings/reports'
        '/logout.php'              = '/auth/logout'
    }

    foreach ($old in $replacements.Keys) {
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $replacements[$old]
            $changed = $true
        }
    }

    if ($changed) {
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Routes fixed: $($file.Name)"
    }
}
Write-Host "Route replacement done!"
