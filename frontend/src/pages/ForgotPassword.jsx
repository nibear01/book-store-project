import { useState } from "react";
import { useTranslation } from "react-i18next";
import { userAPI } from "../api/user-api";

const ForgotPassword = () => {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!email) {
      setError(t("forgotPassword.error"));
      return;
    }
    setIsLoading(true);
    try {
      await userAPI.forgotPassword(email);
      setMessage(t("forgotPassword.success"));
    } catch (e) {
      setError(e.message || t("forgotPassword.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-15">
      <div className="w-[400px] min-w-[350px] bg-white shadow-md pb-10 flex-col justify-center items-center rounded-[2px]">
        <div className="py-6 w-full flex-col justify-center">
          <h1 className="text-[25px] text-center">{t("forgotPassword.title")}</h1>
          <h3 className="text-center">{t("forgotPassword.subtitle")}</h3>
        </div>
        <div className="px-5">
          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex-col justify-center">
            <div className="space-y-3 mb-3">
              <label className="text-sm font-medium text-gray-700">
                {t("forgotPassword.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("forgotPassword.email")}
                className="w-full p-3 border border-gray-300 focus:ring-2 focus:ring-grey-500 outline-none transition-all duration-200 text-sm rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`text-center w-full p-2 my-6 cursor-pointer rounded-md ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              } text-white transition-colors`}
            >
              {isLoading ? `${t("forgotPassword.sendLink")}...` : t("forgotPassword.sendLink")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
