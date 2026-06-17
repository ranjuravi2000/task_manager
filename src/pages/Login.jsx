import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin = () => {
    const users =
      JSON.parse(
        localStorage.getItem("users")
      ) || [];

    const user = users.find(
      (u) =>
        u.username === username &&
        u.password === password
    );

    if (user) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify(user)
      );

      navigate("/dashboard");
    } else {
      alert("Invalid Credentials");
    }
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
                Smart Collaborative Task Management System
              </p>

              <h3 className="text-center mb-4">
                Login
              </h3>

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
              />

              <input
                type="password"
                className="form-control mb-3"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <button
                className="btn btn-primary w-100"
                onClick={handleLogin}
              >
                Login
              </button>

              <p className="mt-3 text-center">
                Don't have an account?{" "}
                <Link to="/register">
                  Register
                </Link>
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login