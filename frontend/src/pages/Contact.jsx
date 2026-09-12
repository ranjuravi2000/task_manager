import Header from "../components/Header";
import Footer from "../components/Footer";

function Contact() {
  return (
    <>
      <Header />

      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-9">

            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">

                <h2 className="fw-bold mb-3">
                  Contact Us
                </h2>

                <p className="text-muted">
                  If you have any questions, feedback, or issues related to
                  Taskify, you can contact us using the information below.
                </p>

                <div className="mt-4">

                  <div className="mb-3">
                    <h6 className="fw-bold mb-1">
                      Email
                    </h6>
                    <p className="text-muted mb-0">
                      support@taskify.com
                    </p>
                  </div>

                  <div className="mb-3">
                    <h6 className="fw-bold mb-1">
                      Support
                    </h6>
                    <p className="text-muted mb-0">
                      Our support team is available to help with
                      Taskify-related questions and issues.
                    </p>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Contact;