import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { PLANS, PLAN_ORDER, formatLimit } from "../data/plans";
import { FaGem, FaCheck, FaArrowLeft } from "react-icons/fa";

function Pricing() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const currentPlan = currentUser?.plan || "free";

  const handleChoose = (planId) => {
    if (planId === currentPlan) return;

    if (planId === "free") {
      // --------------------FRee Plan-----------------
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const updatedUsers = users.map((u) =>
        u.username === currentUser.username ? { ...u, plan: "free" } : u
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ ...currentUser, plan: "free" })
      );
      navigate("/dashboard");
      return;
    }

    navigate(`/checkout/${planId}`);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={true} />

      <div className="flex-grow-1 bg-light py-4">
        <div className="container">

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

          <div className="row g-4">
            {PLAN_ORDER.map((planId) => {
              const plan = PLANS[planId];
              const isCurrent = planId === currentPlan;

              return (
                <div className="col-md-4" key={planId}>
                  <div
                    className={`card shadow-sm h-100 ${
                      isCurrent ? `border-${plan.color}` : ""
                    }`}
                    style={isCurrent ? { borderWidth: "2px" } : {}}
                  >
                    <div className="card-body d-flex flex-column">

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className={`fw-bold text-${plan.color} mb-0`}>
                          {plan.label}
                        </h5>
                        {isCurrent && (
                          <span className={`badge bg-${plan.color}`}>
                            Current Plan
                          </span>
                        )}
                      </div>

                      <h2 className="fw-bold mb-1">
                        ${plan.price}
                        <span className="fs-6 text-muted fw-normal">
                          {plan.price > 0 ? " / month" : ""}
                        </span>
                      </h2>

                      <p className="text-muted small mb-3">
                        {formatLimit(planId)} task
                        {formatLimit(planId) === 1 ? "" : "s"}
                      </p>

                      <ul className="list-unstyled mb-4 flex-grow-1">
                        {plan.features.map((f, i) => (
                          <li key={i} className="mb-2 small">
                            <FaCheck className="text-success me-2" />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <button
                        className={`btn ${
                          isCurrent
                            ? "btn-outline-secondary"
                            : `btn-${plan.color}`
                        } w-100`}
                        disabled={isCurrent}
                        onClick={() => handleChoose(planId)}
                      >
                        {isCurrent ? "Current Plan" : `Choose ${plan.label}`}
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
export default Pricing