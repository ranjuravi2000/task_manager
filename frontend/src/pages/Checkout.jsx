import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getPlan } from "../data/plans";
import { FaCreditCard, FaArrowLeft } from "react-icons/fa";
import API from "../api/axiosInstance";

function Checkout() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || {};

  const plan = getPlan(planId);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [errors, setErrors] = useState({});

  const [touched, setTouched] = useState({
    cardName: false,
    cardNumber: false,
    expiry: false,
    cvv: false,
  });

  const [processing, setProcessing] = useState(false);

  // Check whether selected plan is valid
  if (!plan || planId === "free") {
    return (
      <div className="container mt-4">
        <h5>Invalid plan selected.</h5>

        <Link to="/pricing">
          Back to Pricing
        </Link>
      </div>
    );
  }

  // --------------------------------------------------
  // Format Card Number
  // --------------------------------------------------
  const formatCardNumber = (value) => {
    const digits = value
      .replace(/\D/g, "")
      .slice(0, 16);

    return digits
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  // --------------------------------------------------
  // Format Expiry Date
  // --------------------------------------------------
  const formatExpiry = (value) => {
    const digits = value
      .replace(/\D/g, "")
      .slice(0, 4);

    if (digits.length <= 2) {
      return digits;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  // --------------------------------------------------
  // Validate Single Field
  // --------------------------------------------------
  const validateField = (field, value) => {
    let error = "";

    // Name
    if (field === "cardName") {
      if (!value.trim()) {
        error = "Name on card is required";
      } else if (value.trim().length < 3) {
        error = "Name must be at least 3 characters";
      }
    }

    // Card Number
    if (field === "cardNumber") {
      const digits = value.replace(/\s/g, "");

      if (!digits) {
        error = "Card number is required";
      } else if (digits.length < 16) {
        error = "Card number must be 16 digits";
      }
    }

    // Expiry
    if (field === "expiry") {
      if (!value) {
        error = "Expiry date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(value)) {
        error = "Use MM/YY format";
      } else {
        const [mm, yy] = value
          .split("/")
          .map(Number);

        if (mm < 1 || mm > 12) {
          error = "Invalid month";
        } else {
          // Check expiry date
          const currentDate = new Date();

          const currentYear =
            currentDate.getFullYear() % 100;

          const currentMonth =
            currentDate.getMonth() + 1;

          if (
            yy < currentYear ||
            (yy === currentYear && mm < currentMonth)
          ) {
            error = "Card has expired";
          }
        }
      }
    }

    // CVV
    if (field === "cvv") {
      if (!value) {
        error = "CVV is required";
      } else if (!/^\d{3,4}$/.test(value)) {
        error = "CVV must be 3-4 digits";
      }
    }

    return error;
  };

  // --------------------------------------------------
  // Validate Entire Form
  // --------------------------------------------------
  const validate = () => {
    const newErrors = {};

    const fields = {
      cardName,
      cardNumber,
      expiry,
      cvv,
    };

    Object.keys(fields).forEach((field) => {
      const error = validateField(
        field,
        fields[field]
      );

      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);

    // Mark all fields as touched
    setTouched({
      cardName: true,
      cardNumber: true,
      expiry: true,
      cvv: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------
  // Name Change
  // --------------------------------------------------
  const handleCardNameChange = (e) => {
    const value = e.target.value;

    setCardName(value);

    setTouched((prev) => ({
      ...prev,
      cardName: true,
    }));

    const error = validateField(
      "cardName",
      value
    );

    setErrors((prev) => ({
      ...prev,
      cardName: error,
    }));
  };

  // --------------------------------------------------
  // Card Number Change
  // --------------------------------------------------
  const handleCardNumberChange = (e) => {
    const value = formatCardNumber(
      e.target.value
    );

    setCardNumber(value);

    setTouched((prev) => ({
      ...prev,
      cardNumber: true,
    }));

    const error = validateField(
      "cardNumber",
      value
    );

    setErrors((prev) => ({
      ...prev,
      cardNumber: error,
    }));
  };

  // --------------------------------------------------
  // Expiry Change
  // --------------------------------------------------
  const handleExpiryChange = (e) => {
    const value = formatExpiry(
      e.target.value
    );

    setExpiry(value);

    setTouched((prev) => ({
      ...prev,
      expiry: true,
    }));

    const error = validateField(
      "expiry",
      value
    );

    setErrors((prev) => ({
      ...prev,
      expiry: error,
    }));
  };

  // --------------------------------------------------
  // CVV Change
  // --------------------------------------------------
  const handleCvvChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 4);

    setCvv(value);

    setTouched((prev) => ({
      ...prev,
      cvv: true,
    }));

    const error = validateField(
      "cvv",
      value
    );

    setErrors((prev) => ({
      ...prev,
      cvv: error,
    }));
  };

  // --------------------------------------------------
  // Handle Blur
  // --------------------------------------------------
  const handleBlur = (field, value) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    const error = validateField(
      field,
      value
    );

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  // --------------------------------------------------
  // Handle Payment
  // --------------------------------------------------
  const handlePay = async (e) => {
    e.preventDefault();

    // Final validation before payment
    if (!validate()) {
      return;
    }

    try {
      setProcessing(true);

      // Simulated payment processing
      await new Promise((resolve) =>
        setTimeout(resolve, 900)
      );

      // Update subscription in backend
      const response = await API.put(
        "/subscription/update",
        {
          plan: planId,
        }
      );

      // Get updated subscription
      const updatedSubscription =
        response.data.subscription;

      // Update current user in localStorage
      const updatedUser = {
        ...currentUser,
        subscription: updatedSubscription,

        // Keep old plan property for compatibility
        plan: planId,
      };

      localStorage.setItem(
        "currentUser",
        JSON.stringify(updatedUser)
      );

      alert(
        `${plan.label} plan activated successfully!`
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Subscription update error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Payment or subscription update failed"
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={true} />

      <div className="flex-grow-1 bg-light py-4">
        <div className="container">

          {/* Page Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">

            <div>
              <h3 className="fw-bold mb-0">
                <FaCreditCard className="me-2 text-primary" />
                Checkout
              </h3>

              <p className="text-muted small mb-0">
                Upgrading to the {plan.label} plan
              </p>
            </div>

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/pricing")}
            >
              <FaArrowLeft className="me-1" />
              Back to Plans
            </button>

          </div>

          <div className="row g-4">

            {/* Order Summary */}
            <div className="col-12 col-md-4">

              <div className="card shadow-sm h-100">

                <div className="card-header bg-white fw-semibold">
                  Order Summary
                </div>

                <div className="card-body">

                  <div className="d-flex justify-content-between gap-3 mb-2">
                    <span>
                      {plan.label} Plan
                    </span>

                    <span className="fw-semibold">
                      ${plan.price}/mo
                    </span>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total</span>

                    <span>
                      ${plan.price}.00
                    </span>
                  </div>

                </div>

              </div>

            </div>

            {/* Payment */}
            <div className="col-12 col-md-8">

              <div className="card shadow-sm">

                <div className="card-header bg-white fw-semibold">
                  Payment Details
                </div>

                <div className="card-body">

                  <form onSubmit={handlePay}>

                    {/* Name */}
                    <div className="mb-3">

                      <label className="form-label fw-semibold">
                        Name on Card
                      </label>

                      <input
                        type="text"
                        className={`form-control ${
                          touched.cardName &&
                          errors.cardName
                            ? "is-invalid"
                            : touched.cardName &&
                              !errors.cardName
                            ? "is-valid"
                            : ""
                        }`}
                        value={cardName}
                        onChange={handleCardNameChange}
                        onBlur={() =>
                          handleBlur(
                            "cardName",
                            cardName
                          )
                        }
                      />

                      {touched.cardName &&
                        errors.cardName && (
                          <div className="invalid-feedback">
                            {errors.cardName}
                          </div>
                        )}

                    </div>

                    {/* Card Number */}
                    <div className="mb-3">

                      <label className="form-label fw-semibold">
                        Card Number
                      </label>

                      <input
                        type="text"
                        inputMode="numeric"
                        className={`form-control ${
                          touched.cardNumber &&
                          errors.cardNumber
                            ? "is-invalid"
                            : touched.cardNumber &&
                              !errors.cardNumber
                            ? "is-valid"
                            : ""
                        }`}
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={
                          handleCardNumberChange
                        }
                        onBlur={() =>
                          handleBlur(
                            "cardNumber",
                            cardNumber
                          )
                        }
                      />

                      {touched.cardNumber &&
                        errors.cardNumber && (
                          <div className="invalid-feedback">
                            {errors.cardNumber}
                          </div>
                        )}

                    </div>

                    {/* Expiry + CVV */}
                    <div className="row g-3 mb-3">

                      {/* Expiry */}
                      <div className="col-12 col-sm-6">

                        <label className="form-label fw-semibold">
                          Expiry (MM/YY)
                        </label>

                        <input
                          type="text"
                          inputMode="numeric"
                          className={`form-control ${
                            touched.expiry &&
                            errors.expiry
                              ? "is-invalid"
                              : touched.expiry &&
                                !errors.expiry
                              ? "is-valid"
                              : ""
                          }`}
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={
                            handleExpiryChange
                          }
                          onBlur={() =>
                            handleBlur(
                              "expiry",
                              expiry
                            )
                          }
                        />

                        {touched.expiry &&
                          errors.expiry && (
                            <div className="invalid-feedback">
                              {errors.expiry}
                            </div>
                          )}

                      </div>

                      {/* CVV */}
                      <div className="col-12 col-sm-6">

                        <label className="form-label fw-semibold">
                          CVV
                        </label>

                        <input
                          type="password"
                          inputMode="numeric"
                          className={`form-control ${
                            touched.cvv &&
                            errors.cvv
                              ? "is-invalid"
                              : touched.cvv &&
                                !errors.cvv
                              ? "is-valid"
                              : ""
                          }`}
                          placeholder="123"
                          value={cvv}
                          onChange={
                            handleCvvChange
                          }
                          onBlur={() =>
                            handleBlur(
                              "cvv",
                              cvv
                            )
                          }
                        />

                        {touched.cvv &&
                          errors.cvv && (
                            <div className="invalid-feedback">
                              {errors.cvv}
                            </div>
                          )}

                      </div>

                    </div>

                    {/* Payment Note */}
                    <div className="alert alert-light border small">
                      <FaCreditCard className="me-2 text-primary" />
                      Enter your payment details. Validation will
                      appear immediately as you enter the information.
                    </div>

                    {/* Pay Button */}
                    <button
                      type="submit"
                      className="btn btn-primary w-100 fw-semibold"
                      disabled={processing}
                    >
                      {processing
                        ? "Processing..."
                        : `Pay $${plan.price}.00`}
                    </button>

                  </form>

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

export default Checkout;