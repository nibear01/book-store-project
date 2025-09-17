import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userAPI } from "../api/user-api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const emailParam = params.get("email") || "";
  const tokenParam = params.get("token") || "";

  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail(emailParam);
    setToken(tokenParam);
  }, [emailParam, tokenParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!email || !token) {
      setError("Invalid or missing token.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await userAPI.resetPassword({ email, token, password });
      setMessage("Password has been reset. Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (e) {
      setError(e.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-15">
      <div className="h-auto w-[400px] min-w-[350px] bg-white shadow-md pb-10 flex-col justify-center items-center rounded-[2px]">
        <div className="py-6 w-full flex-col justify-center">
          <h1 className="text-[25px] text-center">Reset Password</h1>
          <h3 className="text-center">Enter your new password</h3>
        </div>
        <div className="px-5">
          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex-col justify-center">
            <div className="space-y-3 mb-3">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 outline-none transition-all duration-200 text-sm rounded-[2px]"
                required
              />
            </div>
            <div className="space-y-3 mb-3">
              <label className="text-sm font-medium text-gray-700">Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste reset token"
                className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 outline-none transition-all duration-200 text-sm rounded-[2px]"
                required
              />
            </div>
            <div className="space-y-3 mb-3">
              <label className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 outline-none transition-all duration-200 text-sm rounded-[2px]"
                required
              />
            </div>
            <div className="space-y-3 mb-3">
              <label className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 outline-none transition-all duration-200 text-sm rounded-[2px]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`text-center w-full p-2 my-6 cursor-pointer rounded-[2px] ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              } text-white transition-colors`}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
