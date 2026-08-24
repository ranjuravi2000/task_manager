import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getPlan } from "../data/plans";
import { FaCreditCard, FaArrowLeft } from "react-icons/fa";

function Checkout() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const plan = getPlan(planId);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  if (!plan || planId === "free") {
    return (
      <div className="container mt-4">
        <h5>Invalid plan selected.</h5>
        <Link to="/pricing">Back to Pricing</Link>
      </div>
    );
  }

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const validate = () => {
    const newErrors = {};

    if (!cardName.trim()) {
      newErrors.cardName = "Name on card is required";
    }

    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      newErrors.expiry = "Use MM/YY format";
    } else {
      const [mm, yy] = expiry.split("/").map(Number);
      if (mm < 1 || mm > 12) {
        newErrors.expiry = "Invalid month";
      }
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = "CVV must be 3-4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setProcessing(true);


    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const updatedUsers = users.map((u) =>
        u.username === currentUser.username ? { ...u, plan: planId } : u
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ ...currentUser, plan: planId })
      );

      setProcessing(false);
      navigate("/dashboard");
    }, 900);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={true} />

      <div className="flex-grow-1 bg-light py-4">
        <div className="container">

          <div className="d-flex justify-content-between align-items-center mb-4">
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

            {/*------------- Order Summary ---------------- */}
            <div className="col-md-4">
              <div className="card shadow-sm">
                <div className="card-header bg-white fw-semibold">
                  Order Summary
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span>{plan.label} Plan</span>
                    <span className="fw-semibold">${plan.price}/mo</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total</span>
                    <span>${plan.price}.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* -----Card ----- */}
            <div className="col-md-8">
              <div className="card shadow-sm">
                <div className="card-header bg-white fw-semibold">
                  Payment Details
                </div>
                <div className="card-body">
                  <form onSubmit={handlePay}>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.cardName ? "is-invalid" : ""
                          }`}
                        placeholder=""
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                      {errors.cardName && (
                        <div className="invalid-feedback">{errors.cardName}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Card Number
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.cardNumber ? "is-invalid" : ""
                          }`}
                        placeholder=""
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(formatCardNumber(e.target.value))
                        }
                      />
                      {errors.cardNumber && (
                        <div className="invalid-feedback">
                          {errors.cardNumber}
                        </div>
                      )}
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-semibold">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.expiry ? "is-invalid" : ""
                            }`}
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) =>
                            setExpiry(formatExpiry(e.target.value))
                          }
                        />
                        {errors.expiry && (
                          <div className="invalid-feedback">{errors.expiry}</div>
                        )}
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold">CVV</label>
                        <input
                          type="text"
                          className={`form-control ${errors.cvv ? "is-invalid" : ""
                            }`}
                          placeholder=""
                          value={cvv}
                          onChange={(e) =>
                            setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                          }
                        />
                        {errors.cvv && (
                          <div className="invalid-feedback">{errors.cvv}</div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
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

export default Checkout