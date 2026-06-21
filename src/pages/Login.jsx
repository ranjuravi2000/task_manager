import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loginError, setLoginError] =
    useState("");

  const handleLogin = () => {
    const trimmedInput =
      username.trim();


    const trimmedPassword =
      password.trim();

    if (
      !trimmedInput ||
      !trimmedPassword
    ) {
      setLoginError(
        "Please fill all required fields."
      );
      return;
    }

    if (
      trimmedPassword.length < 8
    ) {
      setLoginError(
        "Password must be at least 8 characters."
      );
      return;
    }

    const users =
      JSON.parse(
        localStorage.getItem("users")
      ) || [];

    const user = users.find(
      (u) =>
        (u.username ===
          trimmedInput ||
          u.email ===
          trimmedInput) &&
        u.password ===
        trimmedPassword
    );

    if (user) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
      );

      navigate("/dashboard");
    } else {
      setLoginError(
        "Invalid username/email or password."
      );
    }


  };

  return (<div className="d-flex flex-column min-vh-100"> <Header showNav={false} />


    <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light py-4">
      <div className="col-md-5 col-lg-4 px-3">

        <div className="card shadow">
          <div className="card-body p-4">

            <h3 className="text-center fw-bold mb-1">
              Welcome Back{" "}
              <FaCheckCircle className="text-primary" />
            </h3>

            <p
              className="text-center text-muted mb-4"
              style={{
                fontSize: "13px",
              }}
            >
              Login to manage your tasks
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >

              <label className="form-label fw-semibold mb-1">
                Username or Email{" "}
                <span className="text-danger">
                  *
                </span>
              </label>

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Enter username or email"
                value={username}
                onChange={(e) => {
                  setUsername(
                    e.target.value
                  );
                  setLoginError("");
                }}
              />

              <label className="form-label fw-semibold mb-1">
                Password{" "}
                <span className="text-danger">
                  *
                </span>
              </label>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(
                    e.target.value
                  );
                  setLoginError("");
                }}
              />

              <div className="form-check mt-2 mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showPassword"
                  checked={
                    showPassword
                  }
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

              {loginError && (
                <p className="text-danger small">
                  <FaTimesCircle className="me-1" />
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={
                  !username.trim() ||
                  password.length < 8
                }
              >
                Login
              </button>

            </form>

            <p
              className="mt-3 text-center"
              style={{
                fontSize: "13px",
              }}
            >
              Don't have an account?{" "}
              <Link to="/register">
                Register
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

export default Login;
