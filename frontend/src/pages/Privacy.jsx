import Header from "../components/Header";
import Footer from "../components/Footer";

function Privacy() {
  return (
    <>
      <Header />

      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-9">

            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">

                <h2 className="fw-bold mb-3">
                  Privacy Policy
                </h2>

                <p className="text-muted">
                  At Taskify, we respect your privacy and are committed to
                  protecting the information used within the application.
                </p>

                <h5 className="fw-bold mt-4">
                  Information We Collect
                </h5>

                <p className="text-muted">
                  Taskify may collect information such as your name, email
                  address, account information, and task-related data required
                  to provide the application's features.
                </p>

                <h5 className="fw-bold mt-4">
                  How We Use Information
                </h5>

                <p className="text-muted">
                  Information is used to provide account functionality,
                  manage tasks, support collaboration, and improve the
                  Taskify experience.
                </p>

                <h5 className="fw-bold mt-4">
                  Data Security
                </h5>

                <p className="text-muted">
                  We take reasonable measures to protect user information
                  and prevent unauthorized access.
                </p>

              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Privacy;