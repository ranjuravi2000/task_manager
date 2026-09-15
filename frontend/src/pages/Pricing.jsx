import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { PLANS, PLAN_ORDER, formatLimit } from "../data/plans";
import { FaGem, FaCheck, FaArrowLeft } from "react-icons/fa";
import API from "../api/axiosInstance";

function Pricing() {
  const navigate = useNavigate();

  // Get currently logged-in user
  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || {};

  // Get current subscription plan
  const currentPlan =
    currentUser?.subscription?.plan ||
    currentUser?.plan ||
    "free";

  // Handle plan selection
  const handleChoose = async (planId) => {
    // Don't do anything if already on this plan
    if (planId === currentPlan) {
      return;
    }

    // ---------------- FREE PLAN ----------------
    if (planId === "free") {
      try {
        // Update subscription in backend
        const response = await API.put(
          "/subscription/update",
          {
            plan: "free",
          }
        );

        // Get updated subscription from backend
        const updatedSubscription =
          response.data.subscription;

        // Update current user in localStorage
        const updatedUser = {
          ...currentUser,

          subscription: updatedSubscription,

          // Keep old plan property for compatibility
          plan: "free",
        };

        localStorage.setItem(
          "currentUser",
          JSON.stringify(updatedUser)
        );

        alert("Switched to Free plan successfully!");

        navigate("/dashboard");
      } catch (error) {
        console.error(
          "Subscription update error:",
          error
        );

        alert(
          error.response?.data?.message ||
            "Failed to update subscription"
        );
      }

      return;
    }

    // ---------------- PAID PLANS ----------------
    // Pro and Ultimate will go through checkout.
    navigate(`/checkout/${planId}`);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={true} />

      <div className="flex-grow-1 bg-light py-4">
        <div className="container">

          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-0">
                <FaGem className="me-2 text-primary" />
                Plans & Pricing
              </h3>

              <p className="text-muted small mb-0">
                Choose the plan that fits how you work
              </p>
            </div>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate("/dashboard")}
            >
              <FaArrowLeft className="me-1" />
              Back to Dashboard
            </button>
          </div>

          {/* Plans */}
          <div className="row g-4">
            {PLAN_ORDER.map((planId) => {
              const plan = PLANS[planId];

              // Check whether this is the user's current plan
              const isCurrent = planId === currentPlan;

              return (
                <div
                  className="col-md-4"
                  key={planId}
                >
                  <div
                    className={`card shadow-sm h-100 ${
                      isCurrent
                        ? `border-${plan.color}`
                        : ""
                    }`}
                    style={
                      isCurrent
                        ? { borderWidth: "2px" }
                        : {}
                    }
                  >
                    <div className="card-body d-flex flex-column">

                      {/* Plan Name */}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5
                          className={`fw-bold text-${plan.color} mb-0`}
                        >
                          {plan.label}
                        </h5>

                        {isCurrent && (
                          <span
                            className={`badge bg-${plan.color}`}
                          >
                            Current Plan
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <h2 className="fw-bold mb-1">
                        ${plan.price}

                        <span className="fs-6 text-muted fw-normal">
                          {plan.price > 0
                            ? " / month"
                            : ""}
                        </span>
                      </h2>

                      {/* Task Limit */}
                      <p className="text-muted small mb-3">
                        {formatLimit(planId)} task
                        {formatLimit(planId) === 1
                          ? ""
                          : "s"}
                      </p>

                      {/* Features */}
                      <ul className="list-unstyled mb-4 flex-grow-1">
                        {plan.features.map(
                          (feature, index) => (
                            <li
                              key={index}
                              className="mb-2 small"
                            >
                              <FaCheck className="text-success me-2" />
                              {feature}
                            </li>
                          )
                        )}
                      </ul>

                      {/* Choose Button */}
                      <button
                        className={`btn ${
                          isCurrent
                            ? "btn-outline-secondary"
                            : `btn-${plan.color}`
                        } w-100`}
                        disabled={isCurrent}
                        onClick={() =>
                          handleChoose(planId)
                        }
                      >
                        {isCurrent
                          ? "Current Plan"
                          : `Choose ${plan.label}`}
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

     
    </div>
  );
}

export default Pricing;