import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getPlan, formatLimit } from "../data/plans";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaSave,
  FaSignOutAlt,
  FaCrown,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaArrowRight,
  FaTimesCircle,
  FaArrowLeft,
} from "react-icons/fa";

function Profile() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const planInfo = getPlan(currentUser?.plan || "free");

  // ── Profile Info State ──
  const [username, setUsername] = useState(currentUser?.username || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // ── Password State ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ── Task Stats ──
  const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const myTasks = allTasks.filter(
    (t) =>
      t.createdBy === currentUser?.username ||
      t.assignedTo === currentUser?.username ||
      (t.participants || []).includes(currentUser?.username)
  );
  const completedTasks = myTasks.filter((t) => t.status === "Completed").length;
  const pendingTasks = myTasks.filter((t) => t.status === "Pending").length;
  const overdueTasks = myTasks.filter(
    (t) =>
      t.status === "Pending" &&
      t.dueDate &&
      new Date(t.dueDate) < new Date()
  ).length;

  // ── Password Rules ──
  const passwordRules = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "At least one uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "At least one lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "At least one number", test: (p) => /[0-9]/.test(p) },
    { label: "At least one special character (!@#$%^&*)", test: (p) => /[!@#$%^&*]/.test(p) },
  ];
  const allPasswordRulesPassed = passwordRules.every((r) => r.test(newPassword));

  // ── Update Profile ──
  const updateProfile = () => {
    setProfileSuccess("");
    setProfileError("");

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedEmail) {
      setProfileError("Username and email cannot be empty.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if username is taken by another user
    const usernameTaken = users.find(
      (u) =>
        u.username === trimmedUsername &&
        u.id !== currentUser.id
    );
    if (usernameTaken) {
      setProfileError("Username is already taken.");
      return;
    }

    // Update in users array
    const updatedUsers = users.map((u) =>
      u.id === currentUser.id
        ? { ...u, username: trimmedUsername, email: trimmedEmail }
        : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    // Update currentUser
    const updatedUser = {
      ...currentUser,
      username: trimmedUsername,
      email: trimmedEmail,
    };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    setProfileSuccess("Profile updated successfully!");
  };

  // ── Change Password ──
  const changePassword = () => {
    setPasswordSuccess("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("Please fill all password fields.");
      return;
    }

    // Verify current password
    if (currentPassword !== currentUser.password) {
      setPasswordError("Current password is incorrect.");
      return;
    }

    if (!allPasswordRulesPassed) {
      setPasswordError("New password does not meet the required conditions.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const updatedUsers = users.map((u) =>
      u.id === currentUser.id ? { ...u, password: newPassword } : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    const updatedUser = { ...currentUser, password: newPassword };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    setPasswordSuccess("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  // ── Logout ──
  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={true} />

      <div className="flex-grow-1 bg-light py-4">
        <div className="container">

          {/* ── Page Title ── */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-0">
                <FaUser className="me-2 text-primary" />
                My Profile
              </h3>
              <p className="text-muted small mb-0">
                Manage your account details and preferences
              </p>
            </div>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="row g-4">

            {/* ── Left Column ── */}
            <div className="col-md-4">

              {/* Avatar Card */}
              <div className="card shadow-sm text-center mb-4">
                <div className="card-body py-4">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: "80px", height: "80px", fontSize: "32px" }}
                  >
                    {currentUser?.username?.[0]?.toUpperCase()}
                  </div>
                  <h5 className="fw-bold mb-0">{currentUser?.username}</h5>
                  <p className="text-muted small mb-2">{currentUser?.email}</p>
                  <span className={`badge bg-${planInfo.color}`}>
                    <FaCrown className="me-1" />
                    {planInfo.label} Plan
                  </span>
                </div>
              </div>

              {/* Plan Card */}
              <div className={`card shadow-sm border-${planInfo.color} mb-4`}>
                <div className="card-header bg-white fw-semibold">
                  <FaCrown className="me-2 text-warning" />
                  Current Plan
                </div>
                <div className="card-body">
                  <h5 className={`fw-bold text-${planInfo.color} mb-1`}>
                    {planInfo.label}
                  </h5>
                  <p className="text-muted small mb-1">
                    ${planInfo.price}{planInfo.price > 0 ? " / month" : " forever"}
                  </p>
                  <p className="text-muted small mb-3">
                    {myTasks.length} / {formatLimit(currentUser?.plan)} tasks used
                  </p>
                  <ul className="list-unstyled small mb-3">
                    {planInfo.features.map((f, i) => (
                      <li key={i} className="mb-1">
                        <FaCheck className="text-success me-1" /> {f}
                      </li>
                    ))}
                  </ul>
                  {currentUser?.plan !== "ultimate" && (
                    <button
                      className="btn btn-sm btn-primary w-100"
                      onClick={() => navigate("/pricing")}
                    >
                      Upgrade Plan
                      <FaArrowRight className="ms-1" />
                    </button>
                  )}
                </div>
              </div>

              {/* Task Stats Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white fw-semibold">
                  <FaTasks className="me-2 text-primary" />
                  Task Summary
                </div>
                <div className="card-body p-0">
                  {[
                    { icon: <FaTasks className="text-primary" />, label: "Total Tasks", value: myTasks.length },
                    { icon: <FaCheckCircle className="text-success" />, label: "Completed", value: completedTasks },
                    { icon: <FaClock className="text-warning" />, label: "Pending", value: pendingTasks },
                    { icon: <FaExclamationTriangle className="text-danger" />, label: "Overdue", value: overdueTasks },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom"
                      style={{ fontSize: "14px" }}
                    >
                      <span>{stat.icon} <span className="ms-1">{stat.label}</span></span>
                      <span className="fw-bold">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logout Button */}
              <button
                className="btn btn-danger w-100"
                onClick={logout}
              >
                <FaSignOutAlt className="me-2" />
                Logout
              </button>

            </div>

            {/* ── Right Column ── */}
            <div className="col-md-8">

              {/* Edit Profile Card */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white fw-semibold">
                  <FaUser className="me-2 text-primary" />
                  Edit Profile
                </div>
                <div className="card-body">

                  {profileError && (
                    <div className="alert alert-danger py-2">{profileError}</div>
                  )}
                  {profileSuccess && (
                    <div className="alert alert-success py-2">
                      <FaCheckCircle className="me-1" />
                      {profileSuccess}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FaUser className="me-1" /> Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FaEnvelope className="me-1" /> Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-muted">
                      Member Since
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={
                        currentUser?.id
                          ? new Date(currentUser.id).toLocaleDateString()
                          : "N/A"
                      }
                      readOnly
                    />
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={updateProfile}
                  >
                    <FaSave className="me-1" />
                    Save Changes
                  </button>

                </div>
              </div>

              {/* Change Password Card */}
              <div className="card shadow-sm">
                <div className="card-header bg-white fw-semibold">
                  <FaLock className="me-2 text-warning" />
                  Change Password
                </div>
                <div className="card-body">

                  {passwordError && (
                    <div className="alert alert-danger py-2">{passwordError}</div>
                  )}
                  {passwordSuccess && (
                    <div className="alert alert-success py-2">
                      <FaCheckCircle className="me-1" />
                      {passwordSuccess}
                    </div>
                  )}

                  {/* Current Password */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Current Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="mb-1">
                    <label className="form-label fw-semibold">
                      New Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        className={`form-control ${
                          newPassword
                            ? allPasswordRulesPassed
                              ? "is-valid"
                              : "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* Password Rules */}
                  {newPassword && (
                    <ul className="list-unstyled mb-3 ps-1">
                      {passwordRules.map((rule, i) => (
                        <li
                          key={i}
                          className={`small ${
                            rule.test(newPassword) ? "text-success" : "text-danger"
                          }`}
                        >
                          {rule.test(newPassword) ? (
                            <FaCheckCircle className="me-1" />
                          ) : (
                            <FaTimesCircle className="me-1" />
                          )}{" "}
                          {rule.label}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Confirm New Password */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Confirm New Password
                    </label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className={`form-control ${
                        confirmNewPassword
                          ? confirmNewPassword === newPassword
                            ? "is-valid"
                            : "is-invalid"
                          : ""
                      }`}
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                    {confirmNewPassword && confirmNewPassword !== newPassword && (
                      <p className="small text-danger mt-1">❌ Passwords do not match</p>
                    )}
                    {confirmNewPassword && confirmNewPassword === newPassword && (
                      <p className="small text-success mt-1">✅ Passwords match</p>
                    )}
                  </div>

                  <button
                    className="btn btn-warning"
                    onClick={changePassword}
                    disabled={
                      !newPassword ||
                      !allPasswordRulesPassed ||
                      confirmNewPassword !== newPassword
                    }
                  >
                    <FaLock className="me-1" />
                    Change Password
                  </button>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Profile