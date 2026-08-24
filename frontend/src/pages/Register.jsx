import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const usernameRegex =
  /^[A-Za-z][A-Za-z_ ]*$/;

const validationSchema = Yup.object({
  username: Yup.string()
    .matches(
      usernameRegex,
      "Only letters, spaces and underscores are allowed"
    )
    .required("Username is required"),

  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  password: Yup.string()
    .min(
      8,
      "Password must be at least 8 characters"
    )
    .matches(
      /[A-Z]/,
      "Must contain one uppercase letter"
    )
    .matches(
      /[a-z]/,
      "Must contain one lowercase letter"
    )
    .matches(
      /[0-9]/,
      "Must contain one number"
    )
    .matches(
      /[!@#$%^&*]/,
      "Must contain one special character"
    )
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf(
      [Yup.ref("password")],
      "Passwords do not match"
    )
    .required("Confirm Password is required"),
});

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [passwordFocused, setPasswordFocused] =
    useState(false);

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
      label: "At least one special character",
      test: (p) =>
        /[!@#$%^&*]/.test(p),
    },
  ];

  const registerUser = (values) => {
    const users =
      JSON.parse(
        localStorage.getItem("users")
      ) || [];

    const existingUser = users.find(
      (user) => {
        const storedUsername =
          (user.username || "").toLowerCase();

        const storedEmail =
          (user.email || "").toLowerCase();

        return (
          storedUsername ===
          values.username
            .trim()
            .toLowerCase() ||

          storedEmail ===
          values.email
            .trim()
            .toLowerCase()
        );
      }
    );

    const newUser = {
      id: Date.now(),
      username: values.username.trim(),
      email: values.email.trim(),
      password: values.password.trim(),
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

        <div className="col-md-6 col-lg-5 px-3">

          <div className="card shadow border-0">
            <div className="card-body p-4">

              <h3 className="text-center fw-bold mb-1">
                Create Account{" "}
                <FaCheckCircle
                  style={{
                    color: "#3AAFA9",
                  }}
                />
              </h3>

              <p className="text-center text-muted mb-4">
                Join Taskify and boost your productivity
              </p>

              <Formik
                initialValues={{
                  username: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={
                  validationSchema
                }
                onSubmit={registerUser}
              >
                {({
                  values,
                  touched,
                  errors,
                }) => (
                  <Form>

                    {/* Username */}
                    <label className="form-label fw-semibold">
                      Username *
                    </label>

                    <Field
                      name="username"
                      className={`form-control ${touched.username &&
                          errors.username
                          ? "is-invalid"
                          : touched.username
                            ? "is-valid"
                            : ""
                        }`}
                    />

                    <ErrorMessage
                      name="username"
                      component="div"
                      className="text-danger small mb-3"
                    />

                    {/* Email */}
                    <label className="form-label fw-semibold">
                      Email *
                    </label>

                    <Field
                      type="email"
                      name="email"
                      className={`form-control ${touched.email &&
                          errors.email
                          ? "is-invalid"
                          : touched.email
                            ? "is-valid"
                            : ""
                        }`}
                    />

                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-danger small mb-3"
                    />

                    {/* Password */}
                    <div
                      className="position-relative"
                    >
                      <label className="form-label fw-semibold">
                        Password *
                      </label>

                      <Field
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        className="form-control"
                        onFocus={() =>
                          setPasswordFocused(
                            true
                          )
                        }
                        onBlur={() =>
                          setPasswordFocused(
                            false
                          )
                        }
                      />

                      {passwordFocused && (
                        <div className="password-popup">
                          <ul className="list-unstyled mb-0">
                            {passwordRules.map(
                              (
                                rule,
                                index
                              ) => (
                                <li
                                  key={index}
                                  className={
                                    rule.test(
                                      values.password
                                    )
                                      ? "text-success"
                                      : "text-danger"
                                  }
                                >
                                  {rule.test(
                                    values.password
                                  ) ? (
                                    <FaCheckCircle />
                                  ) : (
                                    <FaTimesCircle />
                                  )}
                                  {" "}
                                  {rule.label}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-danger small mb-3"
                    />

                    {/* Confirm Password */}
                    <label className="form-label fw-semibold">
                      Confirm Password *
                    </label>

                    <Field
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      className="form-control"
                    />

                    <ErrorMessage
                      name="confirmPassword"
                      component="div"
                      className="text-danger small mb-3"
                    />

                    <div className="form-check mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={
                          showPassword
                        }
                        onChange={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                      />

                      <label className="form-check-label">
                        Show Password
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                    >
                      Register
                    </button>

                  </Form>
                )}
              </Formik>

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

      <Footer />
    </div>
  );
}

export default Register
