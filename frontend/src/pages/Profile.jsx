import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getPlan, formatLimit } from "../data/plans";
import API from "../api/axiosInstance";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaCamera,
  FaLock,
  FaCreditCard,
  FaSignOutAlt,
} from "react-icons/fa";

function Profile() {
  const navigate = useNavigate();


  // CURRENT USER

  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || {};

  
  // PLAN

  const currentPlan =
    currentUser?.subscription?.plan ||
    currentUser?.plan ||
    "free";

  const planInfo = getPlan(currentPlan);

  
  // PROFILE STATES

  const [profileImage, setProfileImage] = useState(
    currentUser?.profileImage || ""
  );

  const [username, setUsername] = useState(
    currentUser?.name ||
      currentUser?.username ||
      ""
  );

  

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  
  // MESSAGES

  const [profileMessage, setProfileMessage] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  
  // TASK USAGE

  const allTasks =
    JSON.parse(localStorage.getItem("tasks")) || [];

  const currentUsername =
    currentUser?.name ||
    currentUser?.username ||
    "";

  const myTasks = allTasks.filter((task) => {
    return (
      task.createdBy === currentUsername ||
      task.assignedTo === currentUsername
    );
  });

  const taskLimit = planInfo?.taskLimit;

  const usagePercentage =
    taskLimit === Infinity
      ? 0
      : Math.min(
          (myTasks.length / taskLimit) * 100,
          100
        );

 
  // MEMBER SINCE

  const memberSince = currentUser?.createdAt
    ? new Date(
        currentUser.createdAt
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  
  // PROFILE IMAGE

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileMessage(
        "Profile image must be less than 2MB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const imageData = reader.result;

      setProfileImage(imageData);

      const updatedUser = {
        ...currentUser,
        profileImage: imageData,
      };

      localStorage.setItem(
        "currentUser",
        JSON.stringify(updatedUser)
      );

      setProfileMessage(
        "Profile picture updated successfully."
      );
    };

    reader.readAsDataURL(file);
  };

  
  // UPDATE USERNAME

  const handleUsernameUpdate = () => {
    setProfileMessage("");

    if (!username.trim()) {
      setProfileMessage(
        "Username cannot be empty."
      );
      return;
    }

    const updatedUser = {
      ...currentUser,
      name: username.trim(),
    };

    localStorage.setItem(
      "currentUser",
      JSON.stringify(updatedUser)
    );

    setProfileMessage(
      "Profile updated successfully."
    );
  };

 
  // CHANGE PASSWORD

  const handlePasswordChange = async () => {
    setPasswordMessage("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordMessage(
        "Please fill in all password fields."
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage(
        "New passwords do not match."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await API.put(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

      setPasswordMessage(
        response.data.message ||
          "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Hide passwords again after successful change
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setPasswordMessage(
        error.response?.data?.message ||
          "Unable to change password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  
  // LOGOUT

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");

    navigate("/");
  };

 

  const PasswordField = ({
    label,
    value,
    setValue,
    showPassword,
    setShowPassword,
    placeholder,
  }) => {
    return (
      <div className="mb-3">

        <label className="form-label fw-semibold">
          {label}
        </label>

        
        <div
          style={{
            position: "relative",
            width: "100%",
          }}
        >

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            className="form-control"
            value={value}
            onChange={(e) =>
              setValue(e.target.value)
            }
            placeholder={placeholder}
            style={{
              paddingRight: "50px",
              height: "44px",
            }}
          />

          {/* EYE BUTTON */}
          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (previous) => !previous
              )
            }
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            style={{
              position: "absolute",
              top: "50%",
              right: "12px",
              transform: "translateY(-50%)",

              border: "none",
              background: "transparent",

              padding: "5px",
              margin: "0",

              width: "30px",
              height: "30px",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              color: "#6c757d",

              cursor: "pointer",

              zIndex: 5,
            }}
          >
            {showPassword ? (
              <FaEyeSlash size={16} />
            ) : (
              <FaEye size={16} />
            )}
          </button>

        </div>
      </div>
    );
  };

  

  return (
    <>
      <Header showNav={true} />

      <main
        style={{
          background: "#f6f7fb",
          minHeight: "calc(100vh - 80px)",
          padding: "45px 0",
        }}
      >

        <div className="container">

          

          <div className="mb-4">

            <h2
              className="fw-bold mb-1"
              style={{
                color: "#212529",
              }}
            >
              My Profile
            </h2>

            <p className="text-muted mb-0">
              Manage your account and preferences
            </p>

          </div>

          {/* --------------- PROFILE HEADER------*/}

          <div
            className="card border-0 shadow-sm mb-4"
            style={{
              borderRadius: "16px",
            }}
          >

            <div className="card-body p-4">

              <div className="row align-items-center">

                {/* PROFILE IMAGE */}

                <div className="col-auto">

                  <div
                    style={{
                      width: "105px",
                      height: "105px",
                      position: "relative",
                    }}
                  >

                    {profileImage ? (

                      <img
                        src={profileImage}
                        alt="Profile"
                        style={{
                          width: "105px",
                          height: "105px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          border: "3px solid #eee",
                        }}
                      />

                    ) : (

                      <div
                        style={{
                          width: "105px",
                          height: "105px",
                          borderRadius: "50%",
                          background: "#212529",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "40px",
                          fontWeight: "600",
                        }}
                      >
                        {(
                          currentUser?.name ||
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                    )}

                  </div>

                </div>

                {/* USER INFORMATION */}

                <div className="col mt-3 mt-md-0">

                  <div className="d-flex align-items-center flex-wrap gap-2">

                    <h3 className="fw-bold mb-0">
                      {currentUser?.name ||
                        currentUser?.username ||
                        "User"}
                    </h3>

                    <span
                      className={`badge bg-${planInfo?.color ||
                        "secondary"} px-3 py-2`}
                    >
                      {planInfo?.label ||
                        "Free"}
                    </span>

                  </div>

                  <p className="text-muted mb-1 mt-1">
                    {currentUser?.email ||
                      "No email"}
                  </p>

                  <small className="text-muted">
                    Member since {memberSince}
                  </small>

                </div>

                {/* CHANGE PHOTO */}

                <div className="col-12 col-md-auto mt-3 mt-md-0">

                  <label
                    htmlFor="profileImage"
                    className="btn btn-outline-dark"
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <FaCamera className="me-2" />
                    Change Photo
                  </label>

                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageChange
                    }
                    style={{
                      display: "none",
                    }}
                  />

                </div>

              </div>

              {profileMessage && (

                <div
                  className="alert alert-info mt-4 mb-0"
                >
                  {profileMessage}
                </div>

              )}

            </div>

          </div>

          {/* --------- MAIN CONTENT----- */}

          <div className="row g-4">

           

            <div className="col-lg-7">

              {/* PERSONAL INFORMATION */}

              <div
                className="card border-0 shadow-sm mb-4"
                style={{
                  borderRadius: "16px",
                }}
              >

                <div className="card-body p-4">

                  <div className="d-flex align-items-center mb-4">

                    <div
                      className="me-3"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaUser />
                    </div>

                    <div>

                      <h5 className="fw-bold mb-1">
                        Personal Information
                      </h5>

                      <p className="text-muted small mb-0">
                        Update your basic account
                        information.
                      </p>

                    </div>

                  </div>

                  {/* USERNAME */}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Username
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value
                        )
                      }
                      style={{
                        height: "44px",
                      }}
                    />

                  </div>

                  {/* EMAIL */}

                  <div className="mb-4">

                    <label className="form-label fw-semibold">
                      Email
                    </label>

                    <input
                      type="email"
                      className="form-control"
                      value={
                        currentUser?.email ||
                        ""
                      }
                      disabled
                      style={{
                        height: "44px",
                      }}
                    />

                    <small className="text-muted">
                     
                    </small>

                  </div>

                  <button
                    type="button"
                    className="btn btn-dark px-4"
                    onClick={
                      handleUsernameUpdate
                    }
                  >
                    Save Changes
                  </button>

                </div>

              </div>

              

              <div
                className="card border-0 shadow-sm"
                style={{
                  borderRadius: "16px",
                }}
              >

                <div className="card-body p-4">

                  <div className="d-flex align-items-center mb-4">

                    <div
                      className="me-3"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaLock />
                    </div>

                    <div>

                      <h5 className="fw-bold mb-1">
                        Security
                      </h5>

                      <p className="text-muted small mb-0">
                        Change your password to
                        keep your account secure.
                      </p>

                    </div>

                  </div>

                  {/* CURRENT PASSWORD */}

                  <PasswordField
                    label="Current Password"
                    value={currentPassword}
                    setValue={
                      setCurrentPassword
                    }
                    showPassword={
                      showCurrentPassword
                    }
                    setShowPassword={
                      setShowCurrentPassword
                    }
                    placeholder="Enter current password"
                  />

                  {/* NEW PASSWORD */}

                  <PasswordField
                    label="New Password"
                    value={newPassword}
                    setValue={setNewPassword}
                    showPassword={
                      showNewPassword
                    }
                    setShowPassword={
                      setShowNewPassword
                    }
                    placeholder="Enter new password"
                  />

                  {/* CONFIRM PASSWORD */}

                  <PasswordField
                    label="Confirm New Password"
                    value={confirmPassword}
                    setValue={
                      setConfirmPassword
                    }
                    showPassword={
                      showConfirmPassword
                    }
                    setShowPassword={
                      setShowConfirmPassword
                    }
                    placeholder="Confirm new password"
                  />

                  {passwordMessage && (

                    <div className="alert alert-info small">
                      {passwordMessage}
                    </div>

                  )}

                  <button
                    type="button"
                    className="btn btn-dark px-4"
                    onClick={
                      handlePasswordChange
                    }
                    disabled={passwordLoading}
                  >
                    {passwordLoading
                      ? "Changing..."
                      : "Change Password"}
                  </button>

                </div>

              </div>

            </div>

            

            <div className="col-lg-5">

              {/* =================================================
                  SUBSCRIPTION
              ================================================= */}

              <div
                className="card border-0 shadow-sm mb-4"
                style={{
                  borderRadius: "16px",
                }}
              >

                <div className="card-body p-4">

                  <div className="d-flex align-items-center mb-4">

                    <div
                      className="me-3"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaCreditCard />
                    </div>

                    <div>

                      <h5 className="fw-bold mb-1">
                        Subscription
                      </h5>

                      <p className="text-muted small mb-0">
                        Your current Taskify
                        plan
                      </p>

                    </div>

                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">

                    <h4 className="fw-bold mb-0">
                      {planInfo?.label ||
                        "Free"}{" "}
                      Plan
                    </h4>

                    <span
                      className={`badge bg-${planInfo?.color ||
                        "secondary"} px-3 py-2`}
                    >
                      {planInfo?.label ||
                        "Free"}
                    </span>

                  </div>

                  {currentUser?.subscription
                    ?.status && (

                    <div className="mb-4">

                      <span className="text-success small fw-semibold">
                        ●{" "}
                        {currentUser.subscription.status
                          .charAt(0)
                          .toUpperCase() +
                          currentUser.subscription.status.slice(
                            1
                          )}
                      </span>

                    </div>

                  )}

                  {/* TASK USAGE */}

                  <div className="mb-4">

                    <div className="d-flex justify-content-between mb-2">

                      <span className="small fw-semibold">
                        Task usage
                      </span>

                      <span className="small text-muted">
                        {myTasks.length} /{" "}
                        {formatLimit(
                          currentPlan
                        )}
                      </span>

                    </div>

                    {taskLimit !==
                      Infinity && (

                      <div
                        className="progress"
                        style={{
                          height: "8px",
                        }}
                      >

                        <div
                          className="progress-bar"
                          style={{
                            width: `${usagePercentage}%`,
                          }}
                        />

                      </div>

                    )}

                  </div>

                  {/* FEATURES */}

                  <div className="mb-4">

                    {planInfo?.features?.map(
                      (
                        feature,
                        index
                      ) => (

                        <div
                          key={index}
                          className="d-flex align-items-center mb-2"
                        >

                          <span className="text-success me-2">
                            ✓
                          </span>

                          <span className="small">
                            {feature}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                  {currentPlan !==
                    "ultimate" && (

                    <button
                      type="button"
                      className="btn btn-outline-dark w-100"
                      onClick={() =>
                        navigate("/pricing")
                      }
                    >
                      Manage Plan
                    </button>

                  )}

                </div>

              </div>

              {/* ACCOUNT*/}

              <div
                className="card border-0 shadow-sm"
                style={{
                  borderRadius: "16px",
                }}
              >

                <div className="card-body p-4">

                  <div className="d-flex align-items-center mb-3">

                    <div
                      className="me-3"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaSignOutAlt />
                    </div>

                    <div>

                      <h5 className="fw-bold mb-1">
                        Account
                      </h5>

                      <p className="text-muted small mb-0">
                        Manage your Taskify
                        session.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-danger w-100"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}

export default Profile;