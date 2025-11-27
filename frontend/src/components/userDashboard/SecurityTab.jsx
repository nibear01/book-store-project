import { memo } from "react";

const SecurityTab = ({
  passwordForm,
  onPasswordChange,
  onSubmitPassword,
  changingPassword,
}) => {
  const fields = [
    {
      name: "currentPassword",
      label: "Current Password",
      placeholder: "Enter your current password",
      required: true,
    },
    {
      name: "newPassword",
      label: "New Password",
      placeholder: "Enter your new password",
      required: true,
      hint: "Must be at least 8 characters long",
    },
    {
      name: "confirmPassword",
      label: "Confirm New Password",
      placeholder: "Confirm your new password",
      required: true,
    },
  ];

  return (
    <form
      onSubmit={onSubmitPassword}
      name="form_security_tab"
      className="space-y-4"
    >
      {fields.map(({ name, label, placeholder, required, hint }) => (
        <div key={name} name={`field_${name}`}>
          <label htmlFor={name} className="block text-sm text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            id={name}
            name={name}
            value={passwordForm[name]}
            onChange={onPasswordChange}
            placeholder={placeholder}
            required={required}
            className="w-full p-2 border border-gray-300 rounded-md focus:border-gray-400 outline-none transition"
          />
          {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
        </div>
      ))}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          name="btn_update_password"
          value="update_password"
          disabled={changingPassword}
          className={`p-2 rounded-md text-sm text-white shadow-sm transition ${
            changingPassword
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
          }`}
        >
          {changingPassword ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );
};

export default memo(SecurityTab);
