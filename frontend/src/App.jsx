import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage";
import Navbar from "./components/Navbar";
import { Button } from "@/components/ui/button";
import Login from "./pages/login";
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Login/>

       
       
       
      </div>
    </Router>
  );
}

export default App;
