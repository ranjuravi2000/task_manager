import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const trimmedInput = username.trim();
    const trimmedPassword = password.trim();

    const user = users.find(
      (u) =>
        (u.username === trimmedInput || u.email === trimmedInput) &&
        u.password === trimmedPassword
    );

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      navigate("/dashboard");
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* Header — no nav links on login page */}
      <Header showNav={false} />

      {/* Main Content */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light">
        <div className="col-md-5 col-lg-4 px-3">
          <div className="card shadow">
            <div className="card-body p-4">

              <h3 className="text-center fw-bold mb-1">Welcome Back 👋</h3>
              <p className="text-center text-muted mb-4" style={{ fontSize: "13px" }}>
                Login to manage your tasks
              </p>

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Username or Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <input
                type="password"
                className="form-control mb-3"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                className="btn btn-primary w-100"
                onClick={handleLogin}
              >
                Login
              </button>

              <p className="mt-3 text-center" style={{ fontSize: "13px" }}>
                Don't have an account?{" "}
                <Link to="/register">Register</Link>
              </p>

            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default Login