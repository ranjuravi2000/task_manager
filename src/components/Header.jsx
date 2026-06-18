import { Link, useNavigate } from "react-router-dom";
function Header({ showNav = false }) {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm">
      {/* ----logo----- */}
      <Link className="navbar-brand fw-bold fs-4">
    ✔㆜αടƙι⨍ყ
      </Link>

      <span className="text-white-50 d-none d-md-inline" style={{ fontSize: "18px" }}>
        Smart Collaborative Task Manager
      </span>

      <div className="ms-auto d-flex align-items-center gap-3">
        {showNav && currentUser && (
          <>
            <span className="text-white fw-semibold" style={{ fontSize: "14px" }}>
              👤 {currentUser.username}
            </span>

            <span className="badge bg-warning text-dark">
              {currentUser.plan === "premium" ? "⭐ Premium" : "Free Plan"}
            </span>

            <Link className="btn btn-outline-light btn-sm" to="/dashboard">
              Dashboard
            </Link>

            <Link className="btn btn-outline-light btn-sm" to="/create-task">
              + Create Task
            </Link>

            <button className="btn btn-danger btn-sm" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Header