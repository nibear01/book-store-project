import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage";
import Navbar from "./components/Navbar";
import { Button } from "@/components/ui/button";
import Register from "./pages/register";
import LoginPage from "./pages/LoginPage";
import SignpPage from "./pages/SignupPage";
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoginPage/>
        <SignpPage/>
      </div>
    </Router>
  );
}

export default App;
