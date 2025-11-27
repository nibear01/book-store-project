import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAffiliate } from "../context/AffiliateContext";
import { toast } from "react-toastify";

// Icons
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Email from "@mui/icons-material/Email";
import ErrorOutline from "@mui/icons-material/ErrorOutline";

const AffiliateLoginPage = () => {
  const navigate = useNavigate();
  const { login, isAffiliateAuthenticated, affiliate } = useAffiliate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [errorTimeout, setErrorTimeout] = useState(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAffiliateAuthenticated && affiliate) {
      navigate("/affiliate/dashboard", { replace: true });
    }
  }, [isAffiliateAuthenticated, affiliate, navigate]);

  // Clear error after 30 seconds
  useEffect(() => {
    if (loginError) {
      const timeout = setTimeout(() => {
        setLoginError("");
      }, 30000);
      setErrorTimeout(timeout);

      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [loginError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (loginError) {
      setLoginError("");
      if (errorTimeout) clearTimeout(errorTimeout);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast.success("Login successful!");
        navigate("/affiliate/dashboard");
      } else {
        // Show specific error message
        let errorMsg = result.message;
        if (errorMsg.includes("pending")) {
          setLoginError("⏳ Your account is pending admin approval. Please wait.");
        } else if (errorMsg.includes("suspended")) {
          setLoginError("🚫 Your account has been suspended. Contact support.");
        } else if (errorMsg.includes("rejected")) {
          setLoginError("❌ Your application was rejected.");
        } else if (errorMsg.includes("Invalid")) {
          setLoginError("❌ Invalid email or password");
        } else {
          setLoginError("❌ " + errorMsg);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("❌ An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Affiliate Login
          </h2>
          <p className="text-gray-600">
            Sign in to your affiliate account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Email className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pr-10 py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <VisibilityOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Visibility className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Error Message */}
              {loginError && (
                <p className="text-red-600 text-sm flex items-center gap-1 mt-2">
                  <ErrorOutline className="h-4 w-4" />
                  {loginError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white font-semibold ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all`}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/affiliate/register"
                className="font-semibold text-blue-600 hover:text-blue-800"
              >
                Register as Affiliate
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link
                to="/affiliate"
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to Affiliate Home
              </Link>
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Your account needs admin approval before you can start earning commissions. If your account is pending, please wait for approval.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AffiliateLoginPage;
