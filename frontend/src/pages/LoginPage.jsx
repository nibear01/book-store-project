import { useState } from "react";
import { Link } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const LoginPage = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    const data = { email, password };
    console.log(data);
  };

  return (
    <div className="flex justify-center pt-15 pb-1">
      <div
        className="min-h-[450px] h-[470px] w-[400px] min-w-[350px] bg-white
       shadow-xl flex-col justify-center rounded-[2px]"
      >
        <div className="py-6 w-full flex-col justify-center">
          <h1 className="text-[25px] text-center">Login</h1>
          <h3 className="text-center">Sign in to continue</h3>
        </div>
        <div className="px-5">
          <form onSubmit={handleLogin} className="flex-col justify-center">
            {/* Email */}
            <div className="space-y-3 mb-3">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 
                focus:border-grey-500 outline-none transition-all duration-200 text-sm rounded-[2px]"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1 relative">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  placeholder="••••••••"
                  className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 focus:border-grey-500 outline-none transition-all duration-200 pr-10 rounded-[2px]"
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
              <div className="flex justify-end">
                <Link
                  to="#"
                  className="text-xs text-black hover:text-gray-600 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="text-center w-full bg-black text-white p-2 my-6 cursor-pointer rounded-[2px]"
            >
              Login
            </button>
          </form>

          {/* Google Login */}
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
              <span>Login with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
