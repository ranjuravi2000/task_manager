import Header from "../components/Header";
import Footer from "../components/Footer";

function About() {
  return (
    <>
      <Header />

      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-9">

            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">

                <h2 className="fw-bold mb-3">
                  About Taskify
                </h2>

                <p className="text-muted">
                  Taskify is a smart collaborative task management system
                  designed to help users create, organize, track, and
                  collaborate on tasks efficiently.
                </p>

                <p className="text-muted">
                  Users can create tasks, assign tasks to team members,
                  collaborate with participants, add comments, monitor
                  progress, and manage their daily work from one place.
                </p>

                <h5 className="fw-bold mt-4 mb-3">
                  Key Features
                </h5>

                <ul className="text-muted">
                  <li>Create and manage tasks</li>
                  <li>Assign tasks to users</li>
                  <li>Collaborate with team members</li>
                  <li>Track task progress and status</li>
                  <li>Add comments to tasks</li>
                  <li>TaskPilot AI productivity assistance</li>
                </ul>

              </div>
            </div>

          </div>
        </div>
      </main>

      
    </>
  );
}

export default About;