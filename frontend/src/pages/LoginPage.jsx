import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";

// Icons
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Email from "@mui/icons-material/Email";
// import Lock from "@mui/icons-material/Lock";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
// import CheckCircle from "@mui/icons-material/CheckCircle";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [phoneNumber, setPhoneNumber] = useState("");
  const [loginMethod, setLoginMethod] = useState("email"); // 'email' or 'phone'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.role === "admin" ? "/admin/dashboard" : "/", {
        replace: true,
      });
    }
  }, [isAuthenticated, user, navigate]);

  // Real-time validation
  useEffect(() => {
    const newErrors = {};

    // Email validation
    if (loginMethod === "email" && touched.email) {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          newErrors.email = "Please enter a valid email address";
        }
      }
    }

    // Phone validation
    if (loginMethod === "phone" && touched.phone) {
      if (!phoneNumber) {
        newErrors.phone = "Phone number is required";
      } else if (!isValidPhoneNumber(phoneNumber)) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    // Password validation
    if (touched.password) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      }
    }

    setErrors(newErrors);
  }, [formData, phoneNumber, touched, loginMethod]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value) => {
    setPhoneNumber(value);
    if (touched.phone) {
      setTouched((prev) => ({ ...prev, phone: true }));
    }
  };

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === "email" ? "phone" : "email");
    setErrors({});
    setTouched({});
  };

  const isFormValid = () => {
    if (loginMethod === "email") {
      return (
        formData.email && formData.password && Object.keys(errors).length === 0
      );
    } else {
      return (
        phoneNumber &&
        formData.password &&
        Object.keys(errors).length === 0 &&
        isValidPhoneNumber(phoneNumber)
      );
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Mark all fields as touched to show errors
    const allFieldsTouched =
      loginMethod === "email"
        ? { email: true, password: true }
        : { phone: true, password: true };

    setTouched(allFieldsTouched);

    if (!isFormValid()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setIsLoading(true);

    try {
      const loginData =
        loginMethod === "email"
          ? { email: formData.email.trim(), password: formData.password }
          : { phone: phoneNumber, password: formData.password };

      if (rememberMe) {
        loginData.rememberMe = true;
      }

      const loggedInUser = await login(loginData);

      toast.success("🎉 Login successful!");

      setTimeout(() => {
        navigate(loggedInUser?.role === "admin" ? "/admin/dashboard" : "/", {
          replace: true,
        });
      }, 1000);
    } catch (error) {
      console.error("Login failed:", error);

      // Enhanced error handling
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your credentials and try again.";

      toast.error(errorMessage);

      // Set specific field errors if available
      if (error.response?.data?.errors) {
        setErrors((prev) => ({ ...prev, ...error.response.data.errors }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Demo account login for testing
  const handleDemoLogin = (role = "user") => {
    const demoAccounts = {
      user: { email: "demo@example.com", password: "Demo123!" },
      admin: { email: "admin@example.com", password: "Admin123!" },
    };

    const demoAccount = demoAccounts[role];
    setFormData(demoAccount);
    setLoginMethod("email");
    setTouched({ email: true, password: true });

    toast.info(`Demo ${role} credentials filled! Click Login to continue.`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white my-8 rounded-md shadow-md border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="pt-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <div className="p-8">
            {/* Login Method Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  type="button"
                  onClick={() => setLoginMethod("email")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    loginMethod === "email"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Email Login
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("phone")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    loginMethod === "phone"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Phone Login
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email/Phone Field */}
              {loginMethod === "email" ? (
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur("email")}
                      placeholder="john@example.com"
                      className={`w-full p-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                      required
                    />
                    <Email className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>

                  {errors.email && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <ErrorOutline className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div
                    className={`phone-input-custom border rounded-lg transition-all duration-200 ${
                      errors.phone
                        ? "border-red-500 focus-within:ring-2 focus-within:ring-red-200"
                        : "border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
                    }`}
                  >
                    <PhoneInput
                      international
                      defaultCountry="BD"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      onBlur={() => handleBlur("phone")}
                      placeholder="Enter phone number"
                      className="w-full p-3"
                    />
                  </div>

                  {errors.phone && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <ErrorOutline className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              )}

              {/* Password Field */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur("password")}
                    placeholder="Enter your password"
                    className={`w-full p-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 pr-10 ${
                      errors.password
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <VisibilityOff className="w-5 h-5" />
                    ) : (
                      <Visibility className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <ErrorOutline className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2">Remember me</span>
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className={`w-full p-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  isLoading || !isFormValid()
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            {/* <div className="relative flex items-center py-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">
                or continue with
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div> */}

            {/* Social Login */}
            {/* <div>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white text-gray-700 font-medium p-3 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                  className="w-5 h-5"
                />
                <span>Sign in with Google</span>
              </button>
            </div> */}

            {/* Signup Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
