import { BrowserRouter, Routes, Route, } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyTasks from "./pages/MyTasks";
import CreateTask from "./pages/CreateTask";
import TaskDetails from "./pages/TaskDetails";
import CollaborationRequests from "./pages/CollaborationRequests";
import SentRequests from "./pages/SentRequests";
import Profile from "./pages/Profile";
import TaskPilotAI from "./pages/TaskPilotAI";
import TaskPilotHistory from "./pages/TaskPilotHistory";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import Notifications from "./pages/Notifications";


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
                <Route path="/my-tasks" element={<MyTasks />} />
                <Route path="/create-task" element={<CreateTask />}
                />
                <Route path="/task/:id" element={<TaskDetails />}
                />
                <Route path="/collaboration-requests" element={<CollaborationRequests />} />
                <Route path="/sent-requests" element={<SentRequests />} />
                <Route path="/taskpilot" element={<TaskPilotAI />} />
                <Route
                    path="/taskpilot/history"
                    element={<TaskPilotHistory />}
                />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/checkout/:planId" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route
                    path="/notifications"
                    element={<Notifications />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App