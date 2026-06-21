import { Link, useNavigate } from "react-router-dom";
import { getPlan } from "../data/plans";
import {
  FaTasks,
  FaUser,
  FaPlus,
  FaUsers,
  FaPaperPlane,
  FaEdit,
  FaSignOutAlt,
} from "react-icons/fa";

function Header({ showNav = false }) {
  const navigate = useNavigate();

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
  );

  const allRequests =
    JSON.parse(
      localStorage.getItem(
        "collaborationRequests"
      )
    ) || [];

  const pendingCount =
    allRequests.filter(
      (r) =>
        r.toUser ===
        currentUser?.username &&
        r.status === "Pending"
    ).length;

  const userPlan =
    currentUser?.plan || "free";

  const planInfo = getPlan(userPlan);

  const planBadgeVariant = {
    free: "secondary",
    pro: "primary",
    ultimate: "success",
  }[userPlan] || "secondary";

  const logout = () => {
    
    const backdrop = document.querySelector(
      ".modal-backdrop"
    );

    if (backdrop) {
      backdrop.remove();
    }
    document.body.classList.remove(
      "modal-open"
    );

    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    localStorage.removeItem("currentUser");

    navigate("/");
  };

  return (
    <> <nav className="navbar navbar-dark bg-dark px-4 py-2 shadow-sm">
      <div
        className="d-flex flex-wrap align-items-center w-100"
        style={{
          rowGap: "10px",
          columnGap: "12px",
        }}
      >
        <div
          className="d-flex align-items-center flex-wrap"
          style={{
            columnGap: "12px",
          }}
        > <Link
          className="navbar-brand fw-bold fs-4 m-0"
          to="/dashboard"
        >
            ✔㆜αടƙι⨍ყ </Link>

          ```
          <span
            className="text-white-50 d-none d-md-inline"
            style={{
              fontSize: "16px",
            }}
          >
            Smart Collaborative Task Manager
          </span>
        </div>

        {showNav &&
          currentUser && (
            <div
              className="d-flex flex-wrap align-items-center ms-md-auto"
              style={{
                rowGap: "10px",
                columnGap: "10px",
              }}
            >
              {/*---- User------ */}
              <span
                className="text-white fw-semibold d-flex align-items-center"
                style={{
                  fontSize: "14px",
                }}
              >
                <FaUser className="me-1" />
                {currentUser.username}
              </span>

              {/*------ Plan----- */}
              <span
                className={`badge bg-${planBadgeVariant}`}
              >
                {planInfo.label} Plan
              </span>

              {/*----- Dashboard -----*/}
              <Link
                className="btn btn-outline-light btn-sm"
                to="/dashboard"
              >
                <FaTasks className="me-1" />
                Dashboard
              </Link>

              {/*------ Create Task------ */}
              <Link
                className="btn btn-outline-light btn-sm"
                to="/create-task"
              >
                <FaPlus className="me-1" />
                Create Task
              </Link>

              {/* -----Requests ------*/}
              <Link
                className="btn btn-outline-light btn-sm position-relative"
                to="/collaboration-requests"
              >
                <FaUsers className="me-1" />
                Requests

                {pendingCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{
                      fontSize: "10px",
                    }}
                  >
                    {pendingCount}
                  </span>
                )}
              </Link>

              {/* -----------Sent Requests------------ */}
              <Link
                className="btn btn-outline-light btn-sm"
                to="/sent-requests"
              >
                <FaPaperPlane className="me-1" />
                Sent
              </Link>

              {/* ----------Profile-------------- */}
              <Link
                className="btn btn-outline-light btn-sm"
                to="/profile"
              >
                <FaEdit className="me-1" />
                Profile
              </Link>

              {/* ----------Logout-------------- */}
              <button
                className="btn btn-danger btn-sm"
                data-bs-toggle="modal"
                data-bs-dismiss="modal"
                data-bs-target="#logoutModal"
              >
                <FaSignOutAlt className="me-1" />
                Logout
              </button>
            </div>
          )}
      </div>
    </nav>

      {/* --------Logout Modal------------- */}
      <div
        className="modal fade"
        id="logoutModal"
        tabIndex="-1"
        aria-labelledby="logoutModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5
                className="modal-title"
                id="logoutModalLabel"
              >
                Confirm Logout
              </h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              Are you sure you want to logout?
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={logout}
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      </div>
    </>

  );
}
export default Header
