import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import Signup from "./pages/signup"
import Login from "./pages/login"

import Dashboard from "./pages/Dashboard";
import GroupsList from "./pages/GroupsList";
import GroupDetails from "./pages/GroupDetails";
import Analytics from "./pages/Analytics";
import GroupAnalytics from "./pages/GroupAnalytics";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups" element={<GroupsList />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/analytics/:id" element={<GroupAnalytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/group/:id" element={<GroupDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
