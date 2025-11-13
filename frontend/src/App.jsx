import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import Signup from "./pages/signup"
import Login from "./pages/login"

// import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;
