import { useState } from "react";
import { Link } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handle form submit
  const handleRegister = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log("Register data:", formData);
    // TODO: connect with Firebase or backend API
  };

  return (
    <div className="flex justify-center pt-15">
      <div className="min-h-[500px] h-auto w-[400px] min-w-[350px] bg-white shadow-xl flex-col justify-center">
        <div className="py-6 w-full flex-col justify-center">
          <h1 className="text-[25px] text-center">Register</h1>
          <h3 className="text-center">Create a new account</h3>
        </div>
        <div className="px-5">
          <form onSubmit={handleRegister} className="flex-col justify-center">
            {/* Name */}
            <div className="space-y-3 mb-3">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 outline-none transition-all duration-200 text-sm"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-3 mb-3">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 outline-none transition-all duration-200 text-sm"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1 relative mb-3">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 outline-none transition-all duration-200 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1 relative">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 outline-none transition-all duration-200 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="text-center w-full bg-black text-white p-2 my-6 cursor-pointer"
            >
              Register
            </button>
          </form>

          {/* Google Sign Up */}
          <div className="mt-4">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 font-medium py-2 cursor-pointer hover:bg-gray-100 transition"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
                className="w-5 h-5"
              />
              <span>Sign up with Google</span>
            </button>
          </div>

          {/* Redirect to Login */}
          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
