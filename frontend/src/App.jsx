import { BrowserRouter, Routes, Route } from "react-router-dom";

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

// Footer Pages
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Tasks */}
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/create-task" element={<CreateTask />} />
        <Route path="/task/:id" element={<TaskDetails />} />

        {/* Collaboration */}
        <Route
          path="/collaboration-requests"
          element={<CollaborationRequests />}
        />

        <Route
          path="/sent-requests"
          element={<SentRequests />}
        />

        {/* TaskPilot */}
        <Route path="/taskpilot" element={<TaskPilotAI />} />

        <Route
          path="/taskpilot/history"
          element={<TaskPilotHistory />}
        />

        {/* Subscription */}
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/checkout/:planId" element={<Checkout />} />

        {/* Profile & Notifications */}
        <Route path="/profile" element={<Profile />} />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        {/* Footer Pages */}
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;