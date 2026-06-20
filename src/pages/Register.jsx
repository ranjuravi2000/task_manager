import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordRules = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "At least one uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "At least one lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "At least one number", test: (p) => /[0-9]/.test(p) },
    { label: "At least one special character (!@#$%^&*)", test: (p) => /[!@#$%^&*]/.test(p) },
  ];

  const allRulesPassed = passwordRules.every((rule) => rule.test(password));

  const registerUser = () => {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedUsername || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (!allRulesPassed) {
      alert("Password does not meet the required conditions");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const existingUser = users.find((user) => user.username === trimmedUsername);
    if (existingUser) {
      alert("Username already exists");
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
    localStorage.setItem("users", JSON.stringify(users));
    navigate("/");
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={false} />
      <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light py-4">
        <div className="col-md-5 col-lg-4 px-3">
          <div className="card shadow">
            <div className="card-body p-4">

              <h3 className="text-center fw-bold mb-1">
                Create Account <FaCheckCircle className="text-success" />
              </h3>
              <p className="text-center text-muted mb-4" style={{ fontSize: "13px" }}>
                Join Taskify and boost your productivity
              </p>
              
              <label className="form-label fw-semibold mb-1">
                Username <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <label className="form-label fw-semibold mb-1">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control mb-3"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label className="form-label fw-semibold mb-1">
                Password <span className="text-danger">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control mb-1 ${
                  password ? (allRulesPassed ? "is-valid" : "is-invalid") : ""
                }`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {password && (
                <ul className="list-unstyled mb-3 ps-1">
                  {passwordRules.map((rule, index) => (
                    <li
                      key={index}
                      className={`small ${rule.test(password) ? "text-success" : "text-danger"}`}
                    >
                      {rule.test(password) ? (
                        <FaCheckCircle className="me-1" />
                      ) : (
                        <FaTimesCircle className="me-1" />
                      )}{" "}
                      {rule.label}
                    </li>
                  ))}
                </ul>
              )}

              <label className="form-label fw-semibold mb-1">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className={`form-control mb-2 ${
                  confirmPassword
                    ? confirmPassword === password
                      ? "is-valid"
                      : "is-invalid"
                    : ""
                }`}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {confirmPassword && confirmPassword !== password && (
                <p className="small text-danger mb-2">
                  <FaTimesCircle className="me-1" />
                  Passwords do not match
                </p>
              )}
              {confirmPassword && confirmPassword === password && (
                <p className="small text-success mb-2">
                  <FaCheckCircle className="me-1" />
                  Passwords match
                </p>
              )}

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                <label className="form-check-label" htmlFor="showPassword">
                  Show Password
                </label>
              </div>

              <button
                className="btn btn-success w-100"
                onClick={registerUser}
                disabled={!allRulesPassed || confirmPassword !== password}
              >
                Register
              </button>

              <p className="mt-3 text-center" style={{ fontSize: "13px" }}>
                Already have an account? <Link to="/">Login</Link>
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