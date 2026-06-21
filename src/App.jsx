import { BrowserRouter, Routes, Route, } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateTask from "./pages/CreateTask";
import TaskDetails from "./pages/TaskDetails";
import CollaborationRequests from "./pages/CollaborationRequests";
import SentRequests from "./pages/SentRequests";
import Profile from "./pages/Profile";
// import TaskPilotAI from "./pages/TaskPilotAI";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";


function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Login />}
                />

                <Route path="/register" element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
                <Route path="/create-task" element={<CreateTask />}
                />
                <Route path="/task/:id" element={<TaskDetails />}
                />
                <Route path="/collaboration-requests" element={<CollaborationRequests />} />
                <Route path="/sent-requests" element={<SentRequests />} />
                {/* <Route path="/taskpilot" element={<TaskPilotAI />} /> */}
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/checkout/:planId" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App