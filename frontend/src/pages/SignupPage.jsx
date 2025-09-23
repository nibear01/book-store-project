import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";

// Icons (You can use Material-UI or Lucide React)
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Person from "@mui/icons-material/Person";
import Email from "@mui/icons-material/Email";
import Lock from "@mui/icons-material/Lock";
import LocationOn from "@mui/icons-material/LocationOn";
import CheckCircle from "@mui/icons-material/CheckCircle";
import ErrorOutline from "@mui/icons-material/ErrorOutline";

const SignupPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.isAdmin ? "/admin/dashboard" : "/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  // Real-time validation
  useEffect(() => {
    const newErrors = {};

    // Name validation
    if (touched.name) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      } else if (formData.name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      } else if (formData.name.trim().length > 50) {
        newErrors.name = "Name must be less than 50 characters";
      }
    }

    // Email validation
    if (touched.email) {
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
    if (touched.phone) {
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
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)
      ) {
        newErrors.password =
          "Include uppercase, lowercase, numbers, and special characters";
      }
    }

    // Confirm password validation
    if (touched.confirmPassword) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    // Address validation
    if (touched.address) {
      if (!formData.address.trim()) {
        newErrors.address = "Address is required";
      } else if (formData.address.trim().length < 5) {
        newErrors.address = "Please enter a valid address";
      }
    }

    setErrors(newErrors);
  }, [formData, phoneNumber, touched]);

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

  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.address &&
      phoneNumber &&
      Object.keys(errors).length === 0 &&
      formData.password === formData.confirmPassword &&
      isValidPhoneNumber(phoneNumber)
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Mark all fields as touched to show errors
    const allFieldsTouched = {
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      address: true,
      phone: true,
    };
    setTouched(allFieldsTouched);

    if (!isFormValid()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: phoneNumber,
        password: formData.password,
        address: formData.address.trim(),
      });

      toast.success("🎉 Account created successfully!");

      setTimeout(() => {
        navigate(response?.isAdmin ? "/admin/dashboard" : "/", {
          replace: true,
        });
      }, 1000);
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Password Strength Indicator Component
  const PasswordStrengthIndicator = () => {
    if (!formData.password) return null;

    const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const strengthColors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ];

    return (
      <div className="mt-2 space-y-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                index <= passwordStrength
                  ? strengthColors[passwordStrength - 1]
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <p
          className={`text-xs font-medium ${
            passwordStrength <= 1
              ? "text-red-600"
              : passwordStrength <= 2
              ? "text-orange-600"
              : passwordStrength <= 3
              ? "text-yellow-600"
              : passwordStrength <= 4
              ? "text-blue-600"
              : "text-green-600"
          }`}
        >
          Password strength:{" "}
          {strengthLabels[passwordStrength - 1] || "Very Strong"}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div
          variants={containerVariants}
          className="bg-white my-8 rounded-md shadow-md border border-white/20 overflow-hidden"
        >
          {/* Header */}
          <div className="pt-8 text-center">
            <h1
              variants={itemVariants}
              className="text-3xl font-bold text-black mb-2"
            >
              Register
            </h1>
            <p variants={itemVariants} className="text-black">
              Create your account in seconds
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Name Field */}
              <div variants={itemVariants} className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    placeholder="John Doe"
                    className={`w-full p-2 border-1 rounded-md transition-all duration-200 focus:outline-none focus:ring-black ${
                      errors.name
                        ? "border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                    required
                  />
                </div>

                {errors.name && (
                  <p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-xs flex items-center gap-1"
                  >
                    <ErrorOutline className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div variants={itemVariants} className="space-y-2">
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
                    className={`w-full p-2 border-1 rounded-md transition-all duration-200 focus:outline-none focus:ring-black ${
                      errors.name
                        ? "border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                    required
                  />
                </div>

                {errors.email && (
                  <p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-xs flex items-center gap-1"
                  >
                    <ErrorOutline className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div variants={itemVariants} className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div
                  className={`phone-input-custom border-1 rounded-md transition-all duration-200 ${
                    errors.phone
                      ? "border-red-500"
                      : "border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500"
                  }`}
                >
                  <PhoneInput
                    international
                    defaultCountry="BD"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    onBlur={() => handleBlur("phone")}
                    placeholder="Enter phone number"
                    className="w-full"
                  />
                </div>

                {errors.phone && (
                  <p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-xs flex items-center gap-1"
                  >
                    <ErrorOutline className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div variants={itemVariants} className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  Password
                  <span className="text-xs text-gray-500 ml-auto">
                    {formData.password
                      ? `${formData.password.length}/8`
                      : "0/8"}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur("password")}
                    placeholder="Enter your password"
                    className={`w-full p-2 border-1 rounded-md transition-all duration-200 focus:outline-none focus:ring-black ${
                      errors.name
                        ? "border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <VisibilityOff className="w-4 h-4" />
                    ) : (
                      <Visibility className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <PasswordStrengthIndicator />

                {errors.password && (
                  <p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-xs flex items-center gap-1"
                  >
                    <ErrorOutline className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}

                {/* Password Requirements */}
                {formData.password && (
                  <div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-gray-600 space-y-1"
                  >
                    <p className="font-medium">Requirements:</p>
                    <ul className="space-y-1">
                      <li
                        className={
                          formData.password.length >= 8
                            ? "text-green-600 flex items-center gap-1"
                            : "text-gray-400 flex items-center gap-1"
                        }
                      >
                        {formData.password.length >= 8 ? "✓" : "○"} At least 8
                        characters
                      </li>
                      <li
                        className={
                          /(?=.*[a-z])/.test(formData.password)
                            ? "text-green-600 flex items-center gap-1"
                            : "text-gray-400 flex items-center gap-1"
                        }
                      >
                        {/(?=.*[a-z])/.test(formData.password) ? "✓" : "○"} One
                        lowercase letter
                      </li>
                      <li
                        className={
                          /(?=.*[A-Z])/.test(formData.password)
                            ? "text-green-600 flex items-center gap-1"
                            : "text-gray-400 flex items-center gap-1"
                        }
                      >
                        {/(?=.*[A-Z])/.test(formData.password) ? "✓" : "○"} One
                        uppercase letter
                      </li>
                      <li
                        className={
                          /(?=.*\d)/.test(formData.password)
                            ? "text-green-600 flex items-center gap-1"
                            : "text-gray-400 flex items-center gap-1"
                        }
                      >
                        {/(?=.*\d)/.test(formData.password) ? "✓" : "○"} One
                        number
                      </li>
                      <li
                        className={
                          /(?=.*[@$!%*?&])/.test(formData.password)
                            ? "text-green-600 flex items-center gap-1"
                            : "text-gray-400 flex items-center gap-1"
                        }
                      >
                        {/(?=.*[@$!%*?&])/.test(formData.password) ? "✓" : "○"}{" "}
                        One special character (@$!%*?&)
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div variants={itemVariants} className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  Confirm Password
                  {formData.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <CheckCircle className="w-4 h-4 ml-auto text-green-500" />
                    )}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="Confirm your password"
                    className={`w-full p-2 border-1 rounded-md transition-all duration-200 focus:outline-none focus:ring-black${
                      errors.confirmPassword
                        ? "border-red-500"
                        : formData.confirmPassword &&
                          formData.password === formData.confirmPassword
                        ? "border-green-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <VisibilityOff className="w-4 h-4" />
                    ) : (
                      <Visibility className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-xs flex items-center gap-1"
                  >
                    <ErrorOutline className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-green-600 text-xs flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Passwords match
                    </p>
                  )}
              </div>

              {/* Address Field */}
              <div variants={itemVariants} className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={() => handleBlur("address")}
                    placeholder="123 Main St, City, State"
                    className={`w-full p-2 border-1 rounded-md transition-all duration-200 focus:outline-none focus:ring-black ${
                      errors.name
                        ? "border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                    required
                  />
                </div>

                {errors.address && (
                  <p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-xs flex items-center gap-1"
                  >
                    <ErrorOutline className="w-3 h-3" />
                    {errors.address}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                variants={itemVariants}
                type="submit"
                disabled={isLoading || !isFormValid()}
                className={`w-full p-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  isLoading || !isFormValid()
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div
              variants={itemVariants}
              className="relative flex items-center py-6"
            >
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">
                or continue with
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Social Login */}
            <div variants={itemVariants}>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 border-1 border-gray-200 bg-white text-gray-700 font-medium p-2 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                  className="w-5 h-5"
                />
                <span>Sign up with Google</span>
              </button>
            </div>

            {/* Login Link */}
            <div variants={itemVariants} className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
