import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { getPlan } from "../data/plans";
import { getNotifications } from "../api/notificationApi";

import {
  FaTasks,
  FaUser,
  FaPlus,
  FaUsers,
  FaPaperPlane,
  FaEdit,
  FaSignOutAlt,
  FaBell,
  FaClipboardList
} from "react-icons/fa";

function Header({ showNav = false }) {
  const navigate = useNavigate();

  
  // CURRENT USER------------
 

  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || null;


  const [notificationCount, setNotificationCount] = useState(0);

 
  // COLLABORATION REQUEST COUNT----------
  

  const allRequests =
    JSON.parse(
      localStorage.getItem("collaborationRequests")
    ) || [];

  const pendingCount = allRequests.filter(
    (request) =>
      request.toUser === currentUser?.username &&
      request.status === "Pending"
  ).length;

  
  // USER PLAN---------
  const userPlan = currentUser?.plan || "free";

  const planInfo = getPlan(userPlan);

  const planBadgeVariant =
    {
      free: "secondary",
      pro: "primary",
      ultimate: "success",
    }[userPlan] || "secondary";

 
  // GET NOTIFICATION COUNT
  

  const fetchNotificationCount = async () => {
    try {
      const response = await getNotifications();

      console.log(
        "Header notification response:",
        response
      );

      const notifications =
        response?.notifications || [];

      const unreadCount = notifications.filter(
        (notification) =>
          notification.isRead === false
      ).length;

      setNotificationCount(unreadCount);
    } catch (error) {
      console.error(
        "Failed to fetch notification count:",
        error
      );

      // If token expired
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");

        navigate("/login");
      }
    }
  };

  
  // LOAD NOTIFICATIONS--------
 

  useEffect(() => {
    if (!showNav || !currentUser?._id) {
      return;
    }

    fetchNotificationCount();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchNotificationCount();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [showNav, currentUser?._id]);

  

  const logout = () => {
    // Remove Bootstrap backdrop
    const backdrop =
      document.querySelector(".modal-backdrop");

    if (backdrop) {
      backdrop.remove();
    }

    // Reset Bootstrap modal styles
    document.body.classList.remove("modal-open");

    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    // Remove authentication data
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");

    // Redirect
    navigate("/");
  };

  
  // ACTIVE NAVIGATION BUTTON---------
  

  const navClass = ({ isActive }) =>
    `btn taskify-nav-button ${isActive
      ? "btn-light text-dark"
      : "btn-outline-light"
    }`;

  

  return (
    <>
      

      <nav className="taskify-navbar">
        <div className="taskify-navbar-inner">


          <div className="taskify-brand-section">

            <Link
              to="/dashboard"
              className="taskify-logo"
            >
              <span className="taskify-check">
                ✓
              </span>

              <span>
                Taskify
              </span>
            </Link>

            <span className="taskify-tagline">
              Smart Collaborative Task Manager
            </span>

          </div>


          {showNav && currentUser && (
            <div className="taskify-navigation">

             

              <span className="taskify-user">
                <FaUser size={14} />

                <span>
                  {currentUser.username ||
                    currentUser.name ||
                    currentUser.email}
                </span>
              </span>


              <span
                className={`badge bg-${planBadgeVariant} taskify-plan`}
              >
                {planInfo?.label || "Free"} Plan
              </span>


              <NavLink
                to="/dashboard"
                className={navClass}
              >
                <FaTasks />

                <span>
                  Dashboard
                </span>
              </NavLink>


              <NavLink
                to="/my-tasks"
                className={navClass}
              >
                <FaClipboardList />

                <span>
                  My Tasks
                </span>
              </NavLink>


              <NavLink
                to="/create-task"
                className={navClass}
              >
                <FaPlus />

                <span>
                  Create Task
                </span>
              </NavLink>

           

              <NavLink
                to="/notifications"
                className={`${navClass(
                  {}
                )} position-relative`}
              >
                <FaBell />

                <span>
                  Notifications
                </span>

                {notificationCount > 0 && (
                  <span className="taskify-notification-badge">
                    {notificationCount > 99
                      ? "99+"
                      : notificationCount}
                  </span>
                )}
              </NavLink>

             

              <NavLink
                to="/collaboration-requests"
                className={`${navClass(
                  {}
                )} position-relative`}
              >
                <FaUsers />

                <span>
                  Requests
                </span>

                {pendingCount > 0 && (
                  <span className="taskify-request-badge">
                    {pendingCount > 99
                      ? "99+"
                      : pendingCount}
                  </span>
                )}
              </NavLink>

              

              <NavLink
                to="/sent-requests"
                className={navClass}
              >
                <FaPaperPlane />

                <span>
                  Sent
                </span>
              </NavLink>

            

              <NavLink
                to="/profile"
                className={navClass}
              >
                <FaEdit />

                <span>
                  Profile
                </span>
              </NavLink>


              <button
                type="button"
                className="btn btn-danger taskify-logout-button"
                data-bs-toggle="modal"
                data-bs-target="#logoutModal"
              >
                <FaSignOutAlt />

                <span>
                  Logout
                </span>
              </button>

            </div>
          )}
        </div>
      </nav>


      <div
        className="modal fade"
        id="logoutModal"
        tabIndex="-1"
        aria-labelledby="logoutModalLabel"
        aria-hidden="true"
      >

        <div className="modal-dialog modal-dialog-centered">

          <div className="modal-content">

            {/* HEADER */}

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

            {/* BODY */}

            <div className="modal-body">
              Are you sure you want to logout?
            </div>

            {/* FOOTER */}

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
                data-bs-dismiss="modal"
                onClick={logout}
              >
                <FaSignOutAlt className="me-1" />
                Logout
              </button>

            </div>

          </div>
        </div>
      </div>

     

      <style>
        {`

        /* =====================================================
           MAIN NAVBAR
        ===================================================== */

        .taskify-navbar {
          width: 100%;
          background: #212529;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

          position: relative;
          z-index: 1000;
        }

        .taskify-navbar-inner {
          width: 100%;
          min-height: 80px;

          padding: 10px 32px;

          display: flex;
          align-items: center;

          gap: 15px;

          box-sizing: border-box;
        }


        /* =====================================================
           BRAND
        ===================================================== */

        .taskify-brand-section {
          display: flex;
          align-items: center;

          gap: 15px;

          flex-shrink: 1;
          min-width: 0;
        }

        .taskify-logo {
          display: flex;
          align-items: center;

          text-decoration: none;

          color: white;

          font-size: 30px;
          font-weight: 700;

          white-space: nowrap;

          flex-shrink: 0;
        }

        .taskify-logo:hover {
          color: white;
        }

        .taskify-check {
          color: #7561d8;

          font-size: 43px;
          font-weight: 700;

          line-height: 1;

          margin-right: 8px;
        }

        .taskify-tagline {
          color: rgba(255, 255, 255, 0.55);

          font-size: 16px;

          white-space: nowrap;

          overflow: hidden;
          text-overflow: ellipsis;

          min-width: 0;
        }


        /* =====================================================
           NAVIGATION
        ===================================================== */

        .taskify-navigation {
          margin-left: auto;

          display: flex;
          align-items: center;

          gap: 6px;

          flex-shrink: 0;

          min-width: 0;

          white-space: nowrap;
        }


        /* =====================================================
           USER
        ===================================================== */

        .taskify-user {
          display: inline-flex;
          align-items: center;

          gap: 5px;

          color: white;

          font-size: 14px;
          font-weight: 600;

          white-space: nowrap;

          flex-shrink: 0;
        }


        /* =====================================================
           PLAN
        ===================================================== */

        .taskify-plan {
          font-size: 12px;

          padding: 6px 8px;

          white-space: nowrap;

          flex-shrink: 0;
        }


        /* =====================================================
           NAV BUTTONS
        ===================================================== */

        .taskify-nav-button,
        .taskify-logout-button {
          height: 38px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 5px;

          padding: 0 9px;

          font-size: 14px;

          white-space: nowrap;

          flex-shrink: 0;

          text-decoration: none;
        }


        /* =====================================================
           ACTIVE BUTTON
        ===================================================== */

        .taskify-nav-button.btn-light {
          font-weight: 600;

          border-color: white;
        }


        /* =====================================================
           BADGES
        ===================================================== */

        .taskify-notification-badge,
        .taskify-request-badge {
          position: absolute;

          top: -7px;
          right: -7px;

          min-width: 18px;
          height: 18px;

          padding: 0 4px;

          border-radius: 50px;

          background: #dc3545;

          color: white;

          font-size: 10px;
          font-weight: 700;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 2px solid #212529;
        }


        /* =====================================================
           MEDIUM DESKTOP
        ===================================================== */

        @media (max-width: 1500px) {

          .taskify-navbar-inner {
            padding-left: 20px;
            padding-right: 20px;

            gap: 10px;
          }

          .taskify-brand-section {
            gap: 10px;
          }

          .taskify-logo {
            font-size: 27px;
          }

          .taskify-check {
            font-size: 38px;
          }

          .taskify-tagline {
            font-size: 14px;
          }

          .taskify-navigation {
            gap: 5px;
          }

          .taskify-nav-button,
          .taskify-logout-button {
            padding-left: 7px;
            padding-right: 7px;

            font-size: 13px;
          }

          .taskify-plan {
            font-size: 11px;

            padding-left: 7px;
            padding-right: 7px;
          }

          .taskify-user {
            font-size: 13px;
          }
        }


        /* =====================================================
           SMALLER LAPTOP
        ===================================================== */

        @media (max-width: 1250px) {

          .taskify-navbar-inner {
            padding-left: 14px;
            padding-right: 14px;

            gap: 8px;
          }

          .taskify-brand-section {
            gap: 6px;
          }

          .taskify-logo {
            font-size: 24px;
          }

          .taskify-check {
            font-size: 33px;

            margin-right: 3px;
          }

          .taskify-tagline {
            display: none;
          }

          .taskify-navigation {
            gap: 4px;
          }

          .taskify-nav-button,
          .taskify-logout-button {
            padding-left: 6px;
            padding-right: 6px;

            font-size: 12px;
          }

          .taskify-user {
            font-size: 12px;
          }

          .taskify-plan {
            font-size: 10px;

            padding: 5px 6px;
          }
        }


        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1000px) {

          .taskify-navbar-inner {
            min-height: auto;

            flex-wrap: wrap;

            padding: 12px 16px;
          }

          .taskify-brand-section {
            width: 100%;
          }

          .taskify-navigation {
            width: 100%;

            margin-left: 0;

            justify-content: flex-start;

            flex-wrap: nowrap;

            overflow-x: auto;

            padding-top: 4px;

            scrollbar-width: none;
          }

          .taskify-navigation::-webkit-scrollbar {
            display: none;
          }
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {

          .taskify-navbar-inner {
            padding: 12px;
          }

          .taskify-logo {
            font-size: 23px;
          }

          .taskify-check {
            font-size: 31px;
          }

          .taskify-navigation {
            gap: 6px;
          }

          .taskify-nav-button,
          .taskify-logout-button {
            height: 36px;

            padding: 0 9px;

            font-size: 12px;
          }

          .taskify-nav-button span,
          .taskify-logout-button span {
            display: none;
          }

          .taskify-user span {
            max-width: 100px;

            overflow: hidden;
            text-overflow: ellipsis;
          }

        }

        `}
      </style>
    </>
  );
}

export default Header;