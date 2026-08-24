
import { useEffect, useState } from "react";
import {
  FaRobot,
  FaUsers,
  FaTrophy,
  FaChartLine,
  FaExclamationTriangle,
} from "react-icons/fa";

import Header from "../components/Header";
import Footer from "../components/Footer";

function TeamPerformanceAI() {
  const [teamData, setTeamData] = useState([]);

  useEffect(() => {
    const tasks =
      JSON.parse(localStorage.getItem("tasks")) || [];

    const usersMap = {};

    tasks.forEach((task) => {
      const participants =
        task.participants || [];

      participants.forEach((user) => {
        if (!usersMap[user]) {
          usersMap[user] = {
            username: user,
            totalTasks: 0,
            completedTasks: 0,
            totalProgress: 0,
          };
        }

        usersMap[user].totalTasks += 1;

        if (task.status === "Completed") {
          usersMap[user].completedTasks += 1;
        }

        usersMap[user].totalProgress +=
          task.progress || 0;
      });
    });

    const result = Object.values(usersMap).map(
      (user) => ({
        ...user,
        completionRate:
          user.totalTasks === 0
            ? 0
            : Math.round(
                (user.completedTasks /
                  user.totalTasks) *
                  100
              ),

        avgProgress:
          user.totalTasks === 0
            ? 0
            : Math.round(
                user.totalProgress /
                  user.totalTasks
              ),
      })
    );

    setTeamData(result);
  }, []);

  const bestPerformer =
    teamData.length > 0
      ? [...teamData].sort(
          (a, b) =>
            b.completionRate -
            a.completionRate
        )[0]
      : null;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={true} />

      <div className="flex-grow-1 bg-light py-4">
        <div className="container">

       
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white">
              <h3 className="mb-0">
                <FaRobot className="me-2" />
                AI Team Performance Analyzer
              </h3>
            </div>

            <div className="card-body">

              <p className="text-muted">
                Analyze collaboration,
                productivity and team
                performance using AI.
              </p>

              {bestPerformer && (
                <div className="alert alert-success">
                  <FaTrophy className="me-2" />

                  Best Performer:
                  <strong>
                    {" "}
                    {bestPerformer.username}
                  </strong>

                  {" "}with{" "}
                  {bestPerformer.completionRate}%
                  completion rate.
                </div>
              )}

            </div>
          </div>

          
          <div className="row g-3">

            {teamData.map((member) => {

              let insight =
                "Good progress.";

              if (
                member.completionRate >= 80
              ) {
                insight =
                  "Excellent contributor.";
              } else if (
                member.completionRate >= 50
              ) {
                insight =
                  "Performing well.";
              } else {
                insight =
                  "May need support.";
              }

              return (
                <div
                  className="col-md-4"
                  key={member.username}
                >
                  <div className="card shadow-sm h-100">

                    <div className="card-body">

                      <h5>
                        <FaUsers className="me-2 text-primary" />
                        {member.username}
                      </h5>

                      <hr />

                      <p>
                        Total Tasks:
                        <strong>
                          {" "}
                          {member.totalTasks}
                        </strong>
                      </p>

                      <p>
                        Completed:
                        <strong>
                          {" "}
                          {
                            member.completedTasks
                          }
                        </strong>
                      </p>

                      <p>
                        Completion Rate:
                        <strong>
                          {" "}
                          {
                            member.completionRate
                          }
                          %
                        </strong>
                      </p>

                      <p>
                        Avg Progress:
                        <strong>
                          {" "}
                          {member.avgProgress}%
                        </strong>
                      </p>

                      <div
                        className="progress mb-3"
                        style={{
                          height: "10px",
                        }}
                      >
                        <div
                          className="progress-bar bg-success"
                          style={{
                            width: `${member.avgProgress}%`,
                          }}
                        />
                      </div>

                      <div
                        className={`alert ${
                          member.completionRate >=
                          80
                            ? "alert-success"
                            : member.completionRate >=
                              50
                            ? "alert-warning"
                            : "alert-danger"
                        }`}
                      >
                        <FaChartLine className="me-2" />
                        AI Insight:
                        <br />
                        {insight}
                      </div>

                      {member.completionRate <
                        50 && (
                        <div className="alert alert-danger">
                          <FaExclamationTriangle className="me-2" />
                          AI Suggestion:
                          Consider
                          redistributing
                          workload or
                          providing
                          assistance.
                        </div>
                      )}

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
export default TeamPerformanceAI

