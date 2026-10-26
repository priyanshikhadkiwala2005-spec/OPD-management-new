import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

import { API, getToken } from '../api';

import {
  UserRound,
  LockKeyhole,
  Hospital,
  WalletCards,
  Save,
  KeyRound,
  LoaderCircle,
  Camera,
} from 'lucide-react';

export default function Settings() {
  const { user, login } = useAuth();
  const doctorName = user?.full_name || 'Doctor';

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    mobile: '',
    specialization: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Profile Photo
  const [profileImage, setProfileImage] = useState('');
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const profileImageInputRef = useRef(null);

  // Password
  const [password, setPassword] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Clinic
  const [clinic, setClinic] = useState({
    clinic_name: '',
    clinic_address: '',
    clinic_phone: '',
    clinic_email: '',
  });
  const [clinicLoading, setClinicLoading] = useState(false);

  // Fees
  const [fees, setFees] = useState({
    fee_general: 500,
    fee_emergency: 800,
    fee_followup: 400,
    fee_review: 400,
  });
  const [feesLoading, setFeesLoading] = useState(false);

  function flash(msg, isError = false) {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 4000);
    }
  }

  // ============================================================
  // LOAD SETTINGS
  // ============================================================

  useEffect(() => {
    async function loadSettings() {
      try {
        const token = getToken();

        const res = await fetch(`${API}/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const d = await res.json();

        if (d.success) {
          // Profile
          if (d.data?.profile) {
            setProfile({
              full_name: d.data.profile.full_name || '',
              email: d.data.profile.email || '',
              mobile: d.data.profile.mobile || '',
              specialization: d.data.profile.specialization || '',
            });

            setProfileImage(
              d.data.profile.profile_image ||
              d.data.profile.profileImage ||
              ''
            );
          }

          // Clinic
          if (d.data?.clinic) {
            setClinic({
              clinic_name: d.data.clinic.clinic_name || '',
              clinic_address: d.data.clinic.clinic_address || '',
              clinic_phone: d.data.clinic.clinic_phone || '',
              clinic_email: d.data.clinic.clinic_email || '',
            });
          }

          // Fees
          if (d.data?.fees) {
            setFees({
              fee_general:
                d.data.fees.fee_general !== null &&
                d.data.fees.fee_general !== undefined
                  ? d.data.fees.fee_general
                  : 500,

              fee_emergency:
                d.data.fees.fee_emergency !== null &&
                d.data.fees.fee_emergency !== undefined
                  ? d.data.fees.fee_emergency
                  : 800,

              fee_followup:
                d.data.fees.fee_followup !== null &&
                d.data.fees.fee_followup !== undefined
                  ? d.data.fees.fee_followup
                  : 400,

              fee_review:
                d.data.fees.fee_review !== null &&
                d.data.fees.fee_review !== undefined
                  ? d.data.fees.fee_review
                  : 400,
            });
          }
        } else {
          setError(d.message || 'Failed to load settings.');
        }
      } catch (err) {
        console.error('Settings load error:', err);
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  // ============================================================
  // UPLOAD PROFILE PHOTO
  // ============================================================

  async function handleProfileImageUpload(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      flash('Please select an image file.', true);
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      flash('Image size must be less than 5 MB.', true);
      e.target.value = '';
      return;
    }

    // Show selected image immediately
    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);

    setProfileImageLoading(true);

    try {
      const token = getToken();

      const formData = new FormData();
      formData.append('profileImage', file);

      const res = await fetch(`${API}/settings/profile-photo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      console.log('Profile photo upload response:', data);

      if (data.success) {
        const uploadedImage =
          data.data?.profile_image ||
          data.data?.profileImage ||
          '';

        setProfileImage(uploadedImage);

        if (user) {
          login({
            ...user,
            profile_image: uploadedImage,
          });
        }

        flash('Profile photo uploaded successfully!');
      } else {
        setProfileImage(user?.profile_image || '');
        flash(
          data.message ||
            data.error ||
            'Failed to upload profile photo.',
          true
        );
      }
    } catch (err) {
      console.error('Profile photo upload error:', err);

      setProfileImage(user?.profile_image || '');

      flash('Server error. Please try again.', true);
    } finally {
      setProfileImageLoading(false);
      e.target.value = '';
    }
  }

  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  async function handleProfileUpdate(e) {
    e.preventDefault();

    if (!profile.full_name.trim()) {
      flash('Full name is required.', true);
      return;
    }

    if (!profile.email.trim()) {
      flash('Email is required.', true);
      return;
    }

    setProfileLoading(true);

    try {
      const token = getToken();

      const res = await fetch(`${API}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          section: 'profile',
          full_name: profile.full_name.trim(),
          email: profile.email.trim(),
          mobile: profile.mobile.trim(),
          specialization: profile.specialization.trim(),
        }),
      });

      const data = await res.json();

      console.log('Profile update response:', data);

      if (data.success) {
        flash('Profile updated successfully!');

        if (user) {
          login({
            ...user,
            full_name: profile.full_name.trim(),
            email: profile.email.trim(),
            mobile: profile.mobile.trim(),
            specialization: profile.specialization.trim(),
            profile_image: profileImage,
          });
        }
      } else {
        flash(
          data.message || data.error || 'Failed to update profile.',
          true
        );
      }
    } catch (err) {
      console.error('Profile update error:', err);
      flash('Server error. Please try again.', true);
    } finally {
      setProfileLoading(false);
    }
  }

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  async function handlePasswordChange(e) {
    e.preventDefault();

    if (!password.current_password) {
      flash('Please enter your current password.', true);
      return;
    }

    if (!password.new_password) {
      flash('Please enter a new password.', true);
      return;
    }

    if (password.new_password.length < 6) {
      flash('New password must be at least 6 characters.', true);
      return;
    }

    if (password.new_password !== password.confirm_password) {
      flash('New password and confirm password do not match.', true);
      return;
    }

    setPasswordLoading(true);

    try {
      const token = getToken();

      const res = await fetch(`${API}/settings/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: password.current_password,
          new_password: password.new_password,
          confirm_password: password.confirm_password,
        }),
      });

      const data = await res.json();

      console.log('Password change response:', data);

      if (data.success) {
        flash('Password changed successfully!');

        setPassword({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        flash(
          data.message || data.error || 'Failed to change password.',
          true
        );
      }
    } catch (err) {
      console.error('Password change error:', err);
      flash('Server error. Please try again.', true);
    } finally {
      setPasswordLoading(false);
    }
  }

  // ============================================================
  // UPDATE CLINIC
  // ============================================================

  async function handleClinicUpdate(e) {
    e.preventDefault();

    setClinicLoading(true);

    try {
      const token = getToken();

      const res = await fetch(`${API}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          section: 'clinic',
          clinic_name: clinic.clinic_name.trim(),
          clinic_address: clinic.clinic_address.trim(),
          clinic_phone: clinic.clinic_phone.trim(),
          clinic_email: clinic.clinic_email.trim(),
        }),
      });

      const data = await res.json();

      console.log('Clinic update response:', data);

      if (data.success) {
        flash('Clinic info updated successfully!');
      } else {
        flash(
          data.message || data.error || 'Failed to update clinic info.',
          true
        );
      }
    } catch (err) {
      console.error('Clinic update error:', err);
      flash('Server error. Please try again.', true);
    } finally {
      setClinicLoading(false);
    }
  }

  // ============================================================
  // UPDATE FEES
  // ============================================================

  async function handleFeesUpdate(e) {
    e.preventDefault();

    setFeesLoading(true);

    try {
      const token = getToken();

      const res = await fetch(`${API}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          section: 'fees',
          fee_general: Number(fees.fee_general) || 0,
          fee_emergency: Number(fees.fee_emergency) || 0,
          fee_followup: Number(fees.fee_followup) || 0,
          fee_review: Number(fees.fee_review) || 0,
        }),
      });

      const data = await res.json();

      console.log('Fees update response:', data);

      if (data.success) {
        flash('Fee settings updated successfully!');
      } else {
        flash(
          data.message || data.error || 'Failed to update fees.',
          true
        );
      }
    } catch (err) {
      console.error('Fees update error:', err);
      flash('Server error. Please try again.', true);
    } finally {
      setFeesLoading(false);
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Layout
        role="doctor"
        name={doctorName}
        title="Settings"
        subtitle="Manage your account and preferences"
      >
        <div
          style={{
            textAlign: 'center',
            padding: 80,
            color: '#64748b',
          }}
        >
          <LoaderCircle
            size={28}
            strokeWidth={2}
            style={{
              animation: 'settings-spin 1s linear infinite',
              color: '#0f172a',
              verticalAlign: 'middle',
              marginRight: 8,
            }}
          />
          Loading settings...
        </div>
      </Layout>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <Layout
      role="doctor"
      name={doctorName}
      title="Settings"
      subtitle="Manage your account and preferences"
    >
      {/* Loading spinner animation */}
      <style>
        {`
          @keyframes settings-spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .settings-navy-button {
            background: #0f172a !important;
            color: #ffffff !important;
            border: 1px solid #0f172a !important;
          }

          .settings-navy-button:hover {
            background: #172554 !important;
            border-color: #172554 !important;
          }

          .settings-navy-icon {
            color: #0f172a !important;
            stroke: #0f172a !important;
          }
        `}
      </style>

      {success && (
        <div className="alert alert-success">
          ✅ {success}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}

      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ======================================================
            1. PROFILE SETTINGS
        ====================================================== */}

        <div
          className="form-card"
          style={{ marginBottom: 24 }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <UserRound
              size={19}
              strokeWidth={2.2}
              className="settings-navy-icon"
            />

            <span>Profile Settings</span>
          </h3>

          {/* ====================================================
              PROFILE PHOTO
          ==================================================== */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              marginBottom: 24,
              paddingBottom: 20,
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                width: 82,
                height: 82,
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '2px solid #e2e8f0',
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={profile.full_name || 'Doctor'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <UserRound
                  size={38}
                  strokeWidth={1.8}
                  color="#64748b"
                />
              )}
            </div>

            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: 5,
                }}
              >
                Profile Photo
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  marginBottom: 10,
                }}
              >
                JPG, JPEG, PNG or WEBP. Maximum 5 MB.
              </div>

              <input
                ref={profileImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                className="btn-primary settings-navy-button"
                onClick={() =>
                  profileImageInputRef.current?.click()
                }
                disabled={profileImageLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {profileImageLoading ? (
                  <>
                    <LoaderCircle
                      size={16}
                      strokeWidth={2}
                      style={{
                        marginRight: 7,
                        animation:
                          'settings-spin 1s linear infinite',
                      }}
                    />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera
                      size={16}
                      strokeWidth={2.2}
                      style={{
                        marginRight: 7,
                      }}
                    />
                    Change Photo
                  </>
                )}
              </button>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>

                <input
                  type="text"
                  className="form-control"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      full_name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>

                <input
                  type="email"
                  className="form-control"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Mobile</label>

                <input
                  type="text"
                  className="form-control"
                  value={profile.mobile}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      mobile: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Specialization</label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. General Physician, Cardiologist"
                  value={profile.specialization}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      specialization: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary settings-navy-button"
              disabled={profileLoading}
            >
              {profileLoading ? (
                <>
                  <LoaderCircle
                    size={17}
                    strokeWidth={2}
                    style={{
                      verticalAlign: 'middle',
                      marginRight: 7,
                      animation:
                        'settings-spin 1s linear infinite',
                    }}
                  />
                  Updating...
                </>
              ) : (
                <>
                  <Save
                    size={17}
                    strokeWidth={2.2}
                    style={{
                      verticalAlign: 'middle',
                      marginRight: 7,
                    }}
                  />
                  Update Profile
                </>
              )}
            </button>
          </form>
        </div>

        {/* ======================================================
            2. CHANGE PASSWORD
        ====================================================== */}

        <div
          className="form-card"
          style={{ marginBottom: 24 }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <LockKeyhole
              size={19}
              strokeWidth={2.2}
              className="settings-navy-icon"
            />

            <span>Change Password</span>
          </h3>

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Current Password *</label>

              <input
                type="password"
                className="form-control"
                placeholder="Enter current password"
                value={password.current_password}
                onChange={(e) =>
                  setPassword({
                    ...password,
                    current_password: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  New Password * (min 6 characters)
                </label>

                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter new password"
                  minLength={6}
                  value={password.new_password}
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      new_password: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password *</label>

                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  minLength={6}
                  value={password.confirm_password}
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      confirm_password: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary settings-navy-button"
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <>
                  <LoaderCircle
                    size={17}
                    strokeWidth={2}
                    style={{
                      verticalAlign: 'middle',
                      marginRight: 7,
                      animation:
                        'settings-spin 1s linear infinite',
                    }}
                  />
                  Changing...
                </>
              ) : (
                <>
                  <KeyRound
                    size={17}
                    strokeWidth={2.2}
                    style={{
                      verticalAlign: 'middle',
                      marginRight: 7,
                    }}
                  />
                  Change Password
                </>
              )}
            </button>
          </form>
        </div>

        {/* ======================================================
            3. CLINIC INFORMATION
        ====================================================== */}

        <div
          className="form-card"
          style={{ marginBottom: 24 }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Hospital
              size={19}
              strokeWidth={2.2}
              className="settings-navy-icon"
            />

            <span>Clinic Information</span>
          </h3>

          <form onSubmit={handleClinicUpdate}>
            <div className="form-row">
              <div className="form-group">
                <label>Clinic / Hospital Name</label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. MedCare Clinic"
                  value={clinic.clinic_name}
                  onChange={(e) =>
                    setClinic({
                      ...clinic,
                      clinic_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Clinic Phone</label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. +91 9876543210"
                  value={clinic.clinic_phone}
                  onChange={(e) =>
                    setClinic({
                      ...clinic,
                      clinic_phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>Clinic Address</label>

              <textarea
                className="form-control"
                placeholder="Full address of your clinic"
                value={clinic.clinic_address}
                onChange={(e) =>
                  setClinic({
                    ...clinic,
                    clinic_address: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Clinic Email</label>

              <input
                type="email"
                className="form-control"
                placeholder="e.g. info@clinic.com"
                value={clinic.clinic_email}
                onChange={(e) =>
                  setClinic({
                    ...clinic,
                    clinic_email: e.target.value,
                  })
                }
              />
            </div>

            <button
              type="submit"
              className="btn-primary settings-navy-button"
              disabled={clinicLoading}
            >
              {clinicLoading ? (
                <>
                  <LoaderCircle
                    size={17}
                    strokeWidth={2}
                    style={{
                      verticalAlign: 'middle',
                      marginRight: 7,
                      animation:
                        'settings-spin 1s linear infinite',
                    }}
                  />
                  Updating...
                </>
              ) : (
                <>
                  <Save
                    size={17}
                    strokeWidth={2.2}
                    style={{
                      verticalAlign: 'middle',
                      marginRight: 7,
                    }}
                  />
                  Update Clinic Info
                </>
              )}
            </button>
          </form>
        </div>

        {/* ======================================================
            4. FEE SETTINGS
        ====================================================== */}

        <div className="form-card">
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#0f172a',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <WalletCards
              size={19}
              strokeWidth={2.2}
              className="settings-navy-icon"
            />

            <span>Consultation Fee Settings</span>
          </h3>

          <p
            style={{
              fontSize: 13,
              color: '#64748b',
              marginBottom: 20,
            }}
          >
            Set default consultation fees for different appointment
            types. These fees will be auto-filled when you select a
            patient.
          </p>

          <form onSubmit={handleFeesUpdate}>
            <div className="form-row">
              <div className="form-group">
                <label>General Consultation (₹)</label>

                <input
                  type="number"
                  className="form-control"
                  placeholder="500"
                  min="0"
                  step="0.01"
                  value={fees.fee_general}
                  onChange={(e) =>
                    setFees({
                      ...fees,
                      fee_general: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Emergency (₹)</label>

                <input
                  type="number"
                  className="form-control"
                  placeholder="800"
                  min="0"
                  step="0.01"
                  value={fees.fee_emergency}
                  onChange={(e) =>
                    setFees({
                      ...fees,
                      fee_emergency: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Follow-up (₹)</label>

                <input
                  type="number"
                  className="form-control"
                  placeholder="400"
                  min="0"
                  step="0.01"
                  value={fees.fee_followup}
                  onChange={(e) =>
                    setFees({
                      ...fees,
                      fee_followup: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Review (₹)</label>

                <input
                  type="number"
                  className="form-control"
                  placeholder="400"
                  min="0"
                  step="0.01"
                  value={fees.fee_review}
                  onChange={(e) =>
                    setFees({
                      ...fees,
                      fee_review: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary settings-navy-button"
              disabled={feesLoading}
            >
              {feesLoading ? (
                <>
                  <LoaderCircle
                    size={17}
                    strokeWidth={2}
                    style={{
                      verticalAlign: 'middle',
                      marginRight: 7,
                      animation:
                        'settings-spin 1s linear infinite',
                    }}
                  />
                  Updating...
                </>
              ) : (
                <>
                  <Save
                    size={17}
                    strokeWidth={2.2}
                    style={{
                      verticalAlign: 'middle',
                      marginRight: 7,
                    }}
                  />
                  Update Fee Settings
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}