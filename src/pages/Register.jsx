import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [usernameTouched, setUsernameTouched] =
    useState(false);

  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] =
    useState(false);

  const [password, setPassword] = useState("");
  const [passwordFocused, setPasswordFocused] =
    useState(false);

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [passwordTouched, setPasswordTouched] =
    useState(false);

  const usernameRegex = /^[A-Za-z_ ]+$/;

  const validateEmail = (email) => {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
      email.trim()
    );
  };

  const usernameError =
    username &&
      !usernameRegex.test(username)
      ? "Only letters, spaces and underscore allowed"
      : "";

  const passwordRules = [
    {
      label: "At least 8 characters",
      test: (p) => p.length >= 8,
    },
    {
      label: "At least one uppercase letter",
      test: (p) => /[A-Z]/.test(p),
    },
    {
      label: "At least one lowercase letter",
      test: (p) => /[a-z]/.test(p),
    },
    {
      label: "At least one number",
      test: (p) => /[0-9]/.test(p),
    },
    {
      label:
        "At least one special character (!@#$%^&*)",
      test: (p) =>
        /[!@#$%^&*]/.test(p),
    },
  ];

  const allRulesPassed =
    passwordRules.every((rule) =>
      rule.test(password)
    );

  const registerUser = () => {
    const trimmedUsername =
      username.trim();

    const trimmedEmail =
      email.trim();

    const trimmedPassword =
      password.trim();

    const trimmedConfirmPassword =
      confirmPassword.trim();

    if (
      !trimmedUsername ||
      !trimmedEmail ||
      !trimmedPassword ||
      !trimmedConfirmPassword
    ) {

      return;
    }

    if (!usernameRegex.test(trimmedUsername)) {

      return;
    }

    if (!validateEmail(trimmedEmail)) {

      return;
    }

    if (!allRulesPassed) {
      return;
    }

    if (
      trimmedPassword !==
      trimmedConfirmPassword
    ) {

    }

    const users =
      JSON.parse(
        localStorage.getItem("users")
      ) || [];

    const existingUser = users.find(
      (user) =>
        user.username.toLowerCase() ===
        trimmedUsername.toLowerCase()
    );

    if (existingUser) {

      return;
    }

    const newUser = {
      id: Date.now(),
      username: trimmedUsername,
      email: trimmedEmail,
      password: trimmedPassword,
      plan: "free",
    };

    users.push(newUser);

    localStorage.setItem(
      "users",
      JSON.stringify(users)
    );

    navigate("/");
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={false} />

      <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light py-4">
        <div className="col-md-5 col-lg-4 px-3">

          <div className="card shadow border-0">
            <div className="card-body p-4">

              <h3 className="text-center fw-bold mb-1">
                Create Account{" "}
                <FaCheckCircle className="text-primary" />
              </h3>

              <p
                className="text-center text-muted mb-4"
                style={{
                  fontSize: "13px",
                }}
              >
                Join Taskify and boost your
                productivity
              </p>

              {/*---------------- Username -------------------*/}

              <label className="form-label fw-semibold">
                Username
                <span className="text-danger">
                  {" "}
                  *
                </span>
              </label>

              <input
                type="text"
                className={`form-control ${usernameTouched &&
                  usernameError
                  ? "is-invalid"
                  : usernameTouched &&
                    username &&
                    !usernameError
                    ? "is-valid"
                    : ""
                  }`}
                placeholder=""
                value={username}
                onBlur={() =>
                  setUsernameTouched(true)
                }
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
              />

              {usernameTouched &&
                usernameError && (
                  <div className="invalid-feedback d-block">
                    {usernameError}
                  </div>
                )}

              {/* --------------Email-------------- */}

              <label className="form-label fw-semibold mt-3">
                Email
                <span className="text-danger">
                  {" "}
                  *
                </span>
              </label>

              <input
                type="email"
                className={`form-control ${emailTouched &&
                  email &&
                  !validateEmail(email)
                  ? "is-invalid"
                  : emailTouched &&
                    email &&
                    validateEmail(
                      email
                    )
                    ? "is-valid"
                    : ""
                  }`}
                placeholder=""
                value={email}
                onBlur={() =>
                  setEmailTouched(true)
                }
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
              />

              {emailTouched &&
                email &&
                !validateEmail(email) && (
                  <div className="invalid-feedback d-block">
                    Please enter a valid email
                    address
                  </div>
                )}

              {/*-------------- Password----------------- */}

              <label className="form-label fw-semibold mt-3">
                Password
                <span className="text-danger">
                  {" "}
                  *
                </span>
              </label>

              <div className="position-relative">

                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${password && allRulesPassed
                    ? "is-valid"
                    : ""
                    }`}
                  placeholder=" "
                  value={password}
                  onFocus={() =>
                    setPasswordFocused(true)
                  }
                  onBlur={() =>
                    setTimeout(
                      () => setPasswordFocused(false),
                      150
                    )
                  }
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }

                />

                {passwordFocused && (
                  <div
                    className="card shadow-sm position-absolute w-100 mt-2"
                    style={{
                      zIndex: 1000,
                    }}
                  >
                    <div className="card-body py-2">

                      {passwordRules.map(
                        (
                          rule,
                          index
                        ) => (
                          <div
                            key={index}
                            className={`small mb-1 ${rule.test(
                              password
                            )
                              ? "text-success"
                              : "text-danger"
                              }`}
                          >
                            {rule.test(
                              password
                            ) ? (
                              <FaCheckCircle className="me-1" />
                            ) : (
                              <FaTimesCircle className="me-1" />
                            )}

                            {rule.label}
                          </div>
                        )
                      )}

                    </div>
                  </div>
                )}

              </div>

              {/*-------------- Confirm Password -------------*/}

              <label className="form-label fw-semibold mt-3">
                Confirm Password
                <span className="text-danger">
                  {" "}
                  *
                </span>
              </label>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className={`form-control ${confirmPassword
                  ? confirmPassword ===
                    password
                    ? "is-valid"
                    : "is-invalid"
                  : ""
                  }`}
                placeholder=" "
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
              />

              {confirmPassword && (
                <div
                  className={`small mt-1 ${confirmPassword ===
                    password
                    ? "text-success"
                    : "text-danger"
                    }`}
                >
                  {confirmPassword ===
                    password ? (
                    <>
                      <FaCheckCircle className="me-1" />
                      Passwords match
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="me-1" />
                      Passwords do not match
                    </>
                  )}
                </div>
              )}

              <div className="form-check mt-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={showPassword}
                  onChange={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  id="showPassword"
                />

                <label
                  className="form-check-label"
                  htmlFor="showPassword"
                >
                  Show Password
                </label>
              </div>

              <button
                className="btn btn-primary w-100 mt-4"
                onClick={registerUser}
                disabled={
                  !allRulesPassed ||
                  confirmPassword !==
                  password
                }
              >
                Register
              </button>

              <p
                className="mt-3 text-center"
                style={{
                  fontSize: "13px",
                }}
              >
                Already have an account?{" "}
                <Link to="/">
                  Login
                </Link>
              </p>

            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
export default Register