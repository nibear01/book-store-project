import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  // Minimal set of common country codes. Extend as needed.
  const countryCodes = [
    { code: "+1", label: "United States (+1)" },
    { code: "+44", label: "United Kingdom (+44)" },
    { code: "+61", label: "Australia (+61)" },
    { code: "+81", label: "Japan (+81)" },
    { code: "+82", label: "South Korea (+82)" },
    { code: "+86", label: "China (+86)" },
    { code: "+91", label: "India (+91)" },
    { code: "+880", label: "Bangladesh (+880)" },
    { code: "+92", label: "Pakistan (+92)" },
    { code: "+234", label: "Nigeria (+234)" },
    { code: "+254", label: "Kenya (+254)" },
    { code: "+971", label: "UAE (+971)" },
    { code: "+974", label: "Qatar (+974)" },
    { code: "+966", label: "Saudi Arabia (+966)" },
    { code: "+49", label: "Germany (+49)" },
    { code: "+33", label: "France (+33)" },
    { code: "+34", label: "Spain (+34)" },
    { code: "+39", label: "Italy (+39)" },
  ];

  const [countryCode, setCountryCode] = useState("+1");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handle form submit
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }

    // Build full phone with country code. Strip non-digits from local part.
    const localDigits = (formData.phone || "").replace(/[^0-9]/g, "");
    const fullPhone = `${countryCode}${localDigits}`;

    // Basic E.164-like validation: + followed by 8-15 digits overall
    if (!/^\+[1-9][0-9]{7,14}$/.test(fullPhone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        phone: fullPhone,
        password: formData.password,
        address: formData.address,
      });

      console.log("Registration successful:", response);
      // Navigate appropriately after successful registration
      if (response?.isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-15">
      <div className="h-auto w-[400px] min-w-[350px] bg-white shadow-md pb-10 flex-col justify-center items-center rounded-[2px]">
        <div className="py-6 w-full flex-col justify-center">
          <h1 className="text-[25px] text-center">Register</h1>
          <h3 className="text-center">Create a new account</h3>
        </div>
        <div className="px-5">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex-col justify-center">
            {/* Name */}
            <div className="space-y-3 mb-3">
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 outline-none transition-all duration-200 text-sm rounded-[2px]"
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
                className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 outline-none transition-all duration-200 text-sm rounded-[2px]"
                required
              />
            </div>

            {/* Phone with Country Code */}
            <div className="space-y-3 mb-3">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <div className="flex gap-2">
                <div className="relative min-w-[140px]">
                  {/* Visible selected code */}
                  <div className="p-3 border border-gray-300 rounded-[2px] bg-white text-sm select-none">
                    {countryCode}
                  </div>
                  {/* Native select (transparent) for accessibility and native dropdown */}
                  <select
                    aria-label="Country code"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 outline-none transition-all duration-200 text-sm rounded-[2px]"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Number will be saved as {countryCode}
                {(formData.phone || "").replace(/[^0-9]/g, "") && " "}
                {(formData.phone || "").replace(/[^0-9]/g, "")}
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1 relative mb-3">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 outline-none transition-all duration-200 pr-10 rounded-[2px]"
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
            <div className="space-y-1 relative mb-3">
              <label className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 outline-none transition-all duration-200 pr-10 rounded-[2px]"
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

            {/* Address */}
            <div className="space-y-3 mb-3">
              <label className="text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 outline-none transition-all duration-200 text-sm rounded-[2px]"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`text-center w-full p-2 my-6 cursor-pointer rounded-[2px] ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              } text-white transition-colors`}
            >
              {isLoading ? "Creating Account..." : "Register"}
            </button>
          </form>

          {/* Google Sign Up */}
          <div className="mt-4">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 font-medium py-2 cursor-pointer hover:bg-gray-100 transition rounded-[2px]"
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
            <Link to="/login" className="text-gray-600 hover:text-black">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
