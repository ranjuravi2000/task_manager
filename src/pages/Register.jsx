import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const registerUser = () => {

    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const users =
      JSON.parse(
        localStorage.getItem("users")
      ) || [];

    const existingUser =
      users.find(
        (user) =>
          user.username === username
      );

    if (existingUser) {
      alert("Username already exists");
      return;
    }

    users.push({
      id: Date.now(),
      username,
      email,
      password,
      plan: "free",
    });

    localStorage.setItem(
      "users",
      JSON.stringify(users)
    );

    alert(
      "Registration Successful!"
    );

    navigate("/");
  };

  return (
    <div className="container">
      <div
        className="row justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-4">

              <h1 className="text-center fw-bold">
                Taskify
              </h1>

              <p className="text-center text-muted mb-4">
                Smart Collaborative Task
                Management System
              </p>

              <h3 className="text-center mb-4">
                Register
              </h3>

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Username"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
              />

              <input
                type="email"
                className="form-control mb-3"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className="form-control mb-3"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className="form-control mb-3"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
              />

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                />

                <label
                  className="form-check-label"
                  htmlFor="showPassword"
                >
                  Show Password
                </label>
              </div>
              <button
                className="btn btn-success w-100"
                onClick={registerUser}
              >
                Register
              </button>

              <p className="mt-3 text-center">
                Already have an account?{" "}
                <Link to="/">
                  Login
                </Link>
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register