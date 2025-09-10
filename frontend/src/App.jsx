import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage";
import AboutPage from "./pages/AboutPage";
import CategoriesPage from "./pages/CategoriesPage";
import ShopPage from "./pages/ShopPage";
import TermsPage from "./pages/TermsPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Navbar from "./components/Navbar";
<<<<<<< HEAD
import { Button } from "@/components/ui/button";
import Login from "./pages/login";
=======

>>>>>>> 4c6fe985a698cd01587bafd4dc48fecb3a8df791
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
<<<<<<< HEAD
        <Login/>

       
       
       
=======
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
>>>>>>> 4c6fe985a698cd01587bafd4dc48fecb3a8df791
      </div>
    </Router>
  );
}

export default App;
