import { Link, useNavigate } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white mt-auto py-4">
      <div className="container">
        <div className="row align-items-center">

          {/*---logo----- */}
          <div className="col-md-4 mb-3 mb-md-0">
            <h5 className="fw-bold mb-1">✔㆜αടƙι⨍ყ</h5>
            <small className="text-white-50">
              Smart Collaborative Task Management System
            </small>
          </div>

          <div className="col-md-4 text-center mb-3 mb-md-0">
            <div className="d-flex justify-content-center gap-3">
              <a href="#" className="text-white-50 text-decoration-none" style={{ fontSize: "13px" }}>
                About
              </a>
              <a href="#" className="text-white-50 text-decoration-none" style={{ fontSize: "13px" }}>
                Privacy
              </a>
              <a href="#" className="text-white-50 text-decoration-none" style={{ fontSize: "13px" }}>
                Contact
              </a>
            </div>
          </div>

          {/* ------------Copyright----- */}
          <div className="col-md-4 text-md-end">
            <small className="text-white-50">
              © {year} Taskify. All rights reserved.
            </small>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer