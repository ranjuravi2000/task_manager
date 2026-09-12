import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white mt-auto py-4">
      <div className="container">
        <div className="row align-items-center">

         
          <div className="col-12 col-md-4 text-center text-md-start mb-3 mb-md-0">
            <h5 className="fw-bold mb-1">✔㆜αടƙι⨍ყ</h5>

            <small className="text-white-50">
              Smart Collaborative Task Management System
            </small>
          </div>

         
          <div className="col-12 col-md-4 text-center mb-3 mb-md-0">
            <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">

              <Link
                to="/about"
                className="text-white-50 text-decoration-none"
                style={{ fontSize: "13px" }}
              >
                About
              </Link>

              <Link
                to="/privacy"
                className="text-white-50 text-decoration-none"
                style={{ fontSize: "13px" }}
              >
                Privacy
              </Link>

              <Link
                to="/contact"
                className="text-white-50 text-decoration-none"
                style={{ fontSize: "13px" }}
              >
                Contact
              </Link>

            </div>
          </div>

        
          <div className="col-12 col-md-4 text-center text-md-end">
            <small className="text-white-50">
              © {year} Taskify. All rights reserved.
            </small>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;