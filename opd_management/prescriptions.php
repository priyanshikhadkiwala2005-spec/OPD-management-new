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

// Save prescription
if(isset($_POST['save_prescription'])) {
    $patient_id     = $_POST['patient_id'];
    $symptoms       = $_POST['symptoms'];
    $diagnosis      = $_POST['diagnosis'];
    $instructions   = $_POST['additional_instructions'];
    $notes          = $_POST['notes_for_patient'];
    $fee            = $_POST['consultation_fee'];

    $q = "INSERT INTO prescription_new (patient_id, doctor_id, symptoms, diagnosis, additional_instructions, notes_for_patient, consultation_fee)
          VALUES ('$patient_id','$doctor_id','$symptoms','$diagnosis','$instructions','$notes','$fee')";
    
    if(mysqli_query($conn, $q)) {
        $prescription_id = mysqli_insert_id($conn);
        
        // Save medicines
        if(isset($_POST['medicines']) && is_array($_POST['medicines'])) {
            foreach($_POST['medicines'] as $med) {
                $name = $med['name'];
                $type = $med['type'];
                $dosage = $med['dosage'];
                $freq = $med['frequency'];
                $dur = $med['duration'];
                $inst = isset($med['instructions']) ? $med['instructions'] : '';
                
                mysqli_query($conn, "INSERT INTO prescription_medicines (prescription_id, medicine_name, medicine_type, dosage, frequency, duration, instructions)
                                     VALUES ('$prescription_id','$name','$type','$dosage','$freq','$dur','$inst')");
            }
        }
        
        $success = "Prescription saved successfully!";
    } else {
        $error = mysqli_error($conn);
    }
}

// Fetch patients
$patients = mysqli_query($conn, "SELECT id, full_name, age FROM patients ORDER BY full_name");

$today = date("l, d F Y");

// Common medicines by category
$medicine_data = [
    'Pain/Fever' => ['Paracetamol 500mg', 'Ibuprofen 400mg', 'Aspirin 75mg', 'Diclofenac 50mg'],
    'Antibiotic' => ['Amoxicillin 500mg', 'Azithromycin 500mg', 'Ciprofloxacin 500mg', 'Cefixime 200mg'],
    'Allergy' => ['Cetirizine 10mg', 'Levocetirizine 5mg', 'Montelukast 10mg', 'Fexofenadine 120mg'],
    'Gastric' => ['Pantoprazole 40mg', 'Omeprazole 20mg', 'Ranitidine 150mg', 'Domperidone 10mg'],
    'Diabetes' => ['Metformin 500mg', 'Glimepiride 2mg', 'Insulin (Actrapid)', 'Sitagliptin 100mg'],
    'Blood Pressure' => ['Amlodipine 5mg', 'Telmisartan 40mg', 'Atenolol 50mg', 'Losartan 50mg'],
    'Cholesterol' => ['Atorvastatin 10mg', 'Rosuvastatin 10mg', 'Simvastatin 20mg'],
    'Supplement' => ['Vitamin D3 60K', 'B-Complex', 'Calcium Carbonate', 'Iron Folic Acid']
];

$injection_data = ['Diclofenac Injection', 'Tramadol Injection', 'Insulin Injection', 'Ranitidine Injection', 'Ceftriaxone Injection'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Write Prescription – MedCare OPD</title>
    <link rel="stylesheet" href="doctor_dashboard.css">
    <style>
        .rx-container {
            max-width: 1100px;
            margin: 0 auto;
        }
        .rx-card {
            background: #fff;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            padding: 28px 32px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .rx-card h3 {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
        }
        .form-group label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 6px;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 10px 14px;
            border: 1.5px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            font-family: inherit;
            transition: all 0.2s;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }
        .form-group textarea {
            resize: vertical;
            min-height: 70px;
        }

        /* Medicine Categories */
        .med-categories {
            display: grid;
            gap: 16px;
        }
        .med-category h4 {
            font-size: 13px;
            font-weight: 700;
            color: #64748b;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .med-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .med-pill {
            padding: 8px 14px;
            background: #f1f5f9;
            border: 1.5px solid #e2e8f0;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
            color: #475569;
            cursor: pointer;
            transition: all 0.2s;
        }
        .med-pill:hover {
            background: #e0f2fe;
            border-color: #0ea5e9;
            color: #0284c7;
        }
        .med-pill.selected {
            background: #2563eb;
            border-color: #2563eb;
            color: #fff;
        }

        /* Selected Medicines */
        #selectedMeds {
            margin-top: 20px;
        }
        .sel-med {
            background: #f8fafc;
            border: 1.5px solid #e2e8f0;
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 12px;
            position: relative;
        }
        .sel-med-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }
        .sel-med-name {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
        }
        .sel-med-type {
            background: #fef3c7;
            color: #92400e;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
        }
        .sel-med-type.injection {
            background: #fce7f3;
            color: #9f1239;
        }
        .btn-remove {
            background: #fef2f2;
            color: #ef4444;
            border: none;
            padding: 5px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
        }
        .sel-med-inputs {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
        }
        .sel-med-inputs input,
        .sel-med-inputs select {
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 13px;
        }

        /* Custom Medicine */
        .custom-med-form {
            display: grid;
            grid-template-columns: 2fr 1fr auto;
            gap: 10px;
            align-items: end;
            margin-top: 12px;
        }
        .btn-add-custom {
            padding: 10px 20px;
            background: #10b981;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
        }
        .btn-add-custom:hover {
            background: #059669;
        }

        .btn-save-rx {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: #fff;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(16,185,129,0.4);
            transition: all 0.2s;
        }
        .btn-save-rx:hover {
            background: linear-gradient(135deg, #059669, #047857);
            transform: translateY(-1px);
        }

        .alert {
            padding: 12px 18px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-weight: 600;
        }
        .alert-success {
            background: #f0fdf4;
            color: #10b981;
            border: 1px solid #bbf7d0;
        }
        .alert-error {
            background: #fef2f2;
            color: #ef4444;
            border: 1px solid #fecaca;
        }
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
    <a href="prescriptions.php" class="active"><span class="nav-icon">💊</span> Prescriptions</a>
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
            <h1>Write Prescription</h1>
            <p>Select patient and medications</p>
        </div>
        <div class="header-right">
            <span class="date-badge">📅 <?php echo $today; ?></span>
            <div class="doctor-avatar"><?php echo strtoupper(substr($doctor_name,0,1)); ?></div>
        </div>
    </div>

    <div class="content">
        <div class="rx-container">

            <?php if($success): ?>
            <div class="alert alert-success">✅ <?php echo $success; ?></div>
            <?php endif; ?>
            <?php if($error): ?>
            <div class="alert alert-error">⚠️ <?php echo $error; ?></div>
            <?php endif; ?>

            <form method="post" id="rxForm">

                <!-- Patient & Visit -->
                <div class="rx-card">
                    <h3>👤 Select Patient & Visit</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Patient *</label>
                            <select name="patient_id" id="patientSelect" onchange="updateFee()" required>
                                <option value="">Select patient</option>
                                <?php while($p = mysqli_fetch_assoc($patients)): ?>
                                <option value="<?php echo $p['id']; ?>">
                                    <?php echo htmlspecialchars($p['full_name']); ?> (<?php echo $p['age']; ?> yrs)
                                </option>
                                <?php endwhile; ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Consultation Fee (₹) <span id="visitType" style="font-size:11px;color:#64748b;font-weight:500;"></span></label>
                            <input type="number" name="consultation_fee" id="feeInput" placeholder="e.g. 500" min="0" step="0.01" value="500">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Symptoms</label>
                            <textarea name="symptoms" placeholder="Patient symptoms..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Diagnosis</label>
                            <textarea name="diagnosis" placeholder="Diagnosis..."></textarea>
                        </div>
                    </div>
                </div>

                <!-- Common Medicines -->
                <div class="rx-card">
                    <h3>💊 Common Medicines</h3>
                    <div class="med-categories">
                        <?php foreach($medicine_data as $cat => $meds): ?>
                        <div class="med-category">
                            <h4><?php echo $cat; ?></h4>
                            <div class="med-pills">
                                <?php foreach($meds as $med): ?>
                                <div class="med-pill" onclick="toggleMedicine('<?php echo $med; ?>', 'Medicine')">
                                    <?php echo $med; ?>
                                </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                        <?php endforeach; ?>

                        <div class="med-category">
                            <h4>💉 Injections</h4>
                            <div class="med-pills">
                                <?php foreach($injection_data as $inj): ?>
                                <div class="med-pill" onclick="toggleMedicine('<?php echo $inj; ?>', 'Injection')">
                                    <?php echo $inj; ?>
                                </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>

                    <!-- Custom Medicine -->
                    <div style="margin-top:20px;padding-top:20px;border-top:1px solid #e2e8f0;">
                        <h4 style="font-size:13px;font-weight:700;color:#64748b;margin-bottom:10px;">+ ADD CUSTOM MEDICINE</h4>
                        <div class="custom-med-form">
                            <input type="text" id="customMedName" placeholder="Enter medicine name">
                            <select id="customMedType">
                                <option value="Medicine">Medicine</option>
                                <option value="Injection">Injection</option>
                            </select>
                            <button type="button" class="btn-add-custom" onclick="addCustomMedicine()">+ Add</button>
                        </div>
                    </div>
                </div>

                <!-- Selected Medicines -->
                <div class="rx-card">
                    <h3>📋 Selected Medicines (<span id="medCount">0</span>)</h3>
                    <div id="selectedMeds"></div>
                </div>

                <!-- Additional Instructions -->
                <div class="rx-card">
                    <h3>📝 Additional Details</h3>
                    <div class="form-group">
                        <label>Additional Instructions</label>
                        <textarea name="additional_instructions" placeholder="e.g., Take after meals, avoid alcohol..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Notes for Patient</label>
                        <textarea name="notes_for_patient" placeholder="Any notes or advice..."></textarea>
                    </div>
                </div>

                <!-- Save Button -->
                <button type="submit" name="save_prescription" class="btn-save-rx">
                    💾 Save Prescription
                </button>

            </form>

        </div>
    </div>
</div>

<script>
let selectedMedicines = [];

function toggleMedicine(name, type) {
    const idx = selectedMedicines.findIndex(m => m.name === name);
    if(idx > -1) {
        selectedMedicines.splice(idx, 1);
        event.target.classList.remove('selected');
    } else {
        selectedMedicines.push({name, type, dosage:'1 tablet', frequency:'Twice daily (BD)', duration:'5 Days', instructions:''});
        event.target.classList.add('selected');
    }
    renderSelected();
}

function addCustomMedicine() {
    const name = document.getElementById('customMedName').value.trim();
    const type = document.getElementById('customMedType').value;
    if(name) {
        selectedMedicines.push({name, type, dosage:'1 tablet', frequency:'Twice daily (BD)', duration:'5 Days', instructions:''});
        document.getElementById('customMedName').value = '';
        renderSelected();
    }
}

function removeMedicine(idx) {
    selectedMedicines.splice(idx, 1);
    renderSelected();
}

function renderSelected() {
    const container = document.getElementById('selectedMeds');
    document.getElementById('medCount').textContent = selectedMedicines.length;

    if(selectedMedicines.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:30px;">No medicines selected yet. Click on medicines above.</p>';
        return;
    }

    let html = '';
    selectedMedicines.forEach((med, idx) => {
        const typeClass = med.type === 'Injection' ? 'injection' : '';
        html += `
        <div class="sel-med">
            <div class="sel-med-header">
                <div>
                    <span class="sel-med-name">${med.name}</span>
                    <span class="sel-med-type ${typeClass}">${med.type}</span>
                </div>
                <button type="button" class="btn-remove" onclick="removeMedicine(${idx})">✕ Remove</button>
            </div>
            <div class="sel-med-inputs">
                <input type="text" placeholder="Dosage" value="${med.dosage}" onchange="selectedMedicines[${idx}].dosage=this.value">
                <select onchange="selectedMedicines[${idx}].frequency=this.value">
                    <option ${med.frequency.includes('Once')?'selected':''}>Once daily (OD)</option>
                    <option ${med.frequency.includes('Twice')?'selected':''}>Twice daily (BD)</option>
                    <option ${med.frequency.includes('Thrice')?'selected':''}>Thrice daily (TDS)</option>
                    <option ${med.frequency.includes('Four')?'selected':''}>Four times (QID)</option>
                    <option ${med.frequency.includes('needed')?'selected':''}>As needed (SOS)</option>
                </select>
                <input type="text" placeholder="Duration" value="${med.duration}" onchange="selectedMedicines[${idx}].duration=this.value">
            </div>
            <input type="hidden" name="medicines[${idx}][name]" value="${med.name}">
            <input type="hidden" name="medicines[${idx}][type]" value="${med.type}">
            <input type="hidden" name="medicines[${idx}][dosage]" value="${med.dosage}">
            <input type="hidden" name="medicines[${idx}][frequency]" value="${med.frequency}">
            <input type="hidden" name="medicines[${idx}][duration]" value="${med.duration}">
        </div>`;
    });
    container.innerHTML = html;
}

renderSelected();

function updateFee() {
    const patientId = document.getElementById('patientSelect').value;
    const feeInput  = document.getElementById('feeInput');
    const typeLabel = document.getElementById('visitType');

    if(!patientId) {
        feeInput.value = 500;
        typeLabel.textContent = '';
        return;
    }

    fetch('get_patient_fee.php?patient_id=' + patientId)
        .then(r => r.json())
        .then(data => {
            feeInput.value = data.fee;
            const colors = {
                'General':   '#2563eb',
                'Emergency': '#ef4444',
                'Follow-up': '#10b981',
                'Review':    '#f59e0b'
            };
            const color = colors[data.type] || '#64748b';
            typeLabel.innerHTML = `<span style="background:${color}15;color:${color};padding:2px 10px;border-radius:12px;font-weight:700;">${data.type} • ₹${data.fee}</span>`;
        })
        .catch(() => { feeInput.value = 500; });
}
</script>

</body>
</html>
