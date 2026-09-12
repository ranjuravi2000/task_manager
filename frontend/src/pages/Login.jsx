import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import API from "../api/axiosInstance";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    username: Yup.string()
      .required("Email is required"),

    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  const handleLogin = async (values) => {
    setLoginError("");
    setLoading(true);

    try {
      const email = values.username.trim();
      const password = values.password.trim();

      // Send login request to backend
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      console.log("Login response:", response.data);

      // Store JWT token
      localStorage.setItem("token", response.data.token);

      // Store logged-in user
      if (response.data.user) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify(response.data.user)
        );
      }

      // Go to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        setLoginError(
          error.response.data.message ||
          "Invalid email or password."
        );
      } else {
        setLoginError(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={false} />

      <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-light py-4">

        <div className="col-md-5 col-lg-4 px-3">

          <div className="card shadow border-0">
            <div className="card-body p-4">

              <h3 className="text-center fw-bold mb-1">
                Welcome Back{" "}
                <FaCheckCircle
                  style={{
                    color: "#3AAFA9",
                  }}
                />
              </h3>

              <p
                className="text-center text-muted mb-4"
                style={{
                  fontSize: "13px",
                }}
              >
                Login to manage your tasks
              </p>

              <Formik
                initialValues={{
                  username: "",
                  password: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleLogin}
              >
                {({
                  touched,
                  errors,
                }) => (
                  <Form>

                    <label className="form-label fw-semibold mb-1">
                      Email{" "}
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <Field
                      type="email"
                      name="username"
                      className={`form-control mb-1 ${
                        touched.username &&
                        errors.username
                          ? "is-invalid"
                          : touched.username
                          ? "is-valid"
                          : ""
                      }`}
                      placeholder="Enter your email"
                    />

                    <ErrorMessage
                      name="username"
                      component="div"
                      className="text-danger small mb-3"
                    />

                    <label className="form-label fw-semibold mb-1">
                      Password{" "}
                      <span className="text-danger">
                        *
                      </span>
                    </label>

                    <Field
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      className={`form-control ${
                        touched.password &&
                        errors.password
                          ? "is-invalid"
                          : touched.password
                          ? "is-valid"
                          : ""
                      }`}
                      placeholder="Enter password"
                    />

                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-danger small mt-1"
                    />

                    <div className="form-check mt-2 mb-3">

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

                    {loginError && (
                      <p className="text-danger small">
                        <FaTimesCircle className="me-1" />
                        {loginError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Login"}
                    </button>

                  </Form>
                )}
              </Formik>

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