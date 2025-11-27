import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const ProfileTab = ({
  form,
  setForm,
  preview,
  saving,
  onSubmit,
  onChange,
  onPickImage,
  setActiveTab,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
              name="profile-image-preview"
            />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center text-gray-400"
              name="profile-image-placeholder"
            >
              <span className="text-sm">No Image</span>
            </div>
          )}
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            name="profile_image"
            onChange={onPickImage}
            className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">PNG/JPG up to ~5MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            autoComplete="name"
            placeholder="Your full name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <div className="phone-input-custom border rounded-lg border-gray-300 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition">
            <PhoneInput
              international
              defaultCountry="BD"
              name="profile_phone"
              value={form.phone}
              onChange={(v) =>
                setForm((prev) => ({ ...prev, phone: v || "" }))
              }
              className="w-full px-3 py-2 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={onChange}
            rows={3}
            autoComplete="street-address"
            placeholder="Street, City, State, ZIP"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="submit"
          name="btn_save_profile"
          value="save_changes"
          disabled={saving}
          className={`px-4 py-2 rounded-md text-white shadow-sm transition text-sm ${
            saving
              ? "bg-gray-600"
              : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
          }`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          name="btn_cancel_profile"
          value="cancel"
          onClick={() => setActiveTab("overview")}
          className="px-4 py-2 rounded-md bg-white text-gray-800 text-sm border border-gray-300 hover:bg-gray-50 shadow-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProfileTab;
