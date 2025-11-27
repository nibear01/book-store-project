import { useState } from "react";
import { useAffiliate } from "../../context/AffiliateContext";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";

const AffiliateProfile = () => {
  const { affiliate, updateProfile } = useAffiliate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: affiliate?.name || "",
    phone: affiliate?.phone || "",
    address: affiliate?.address || "",
    bio: affiliate?.bio || "",
    payment_method: affiliate?.payment_method || "bank_transfer",
    payment_details: {
      account_holder_name: affiliate?.payment_details?.account_holder_name || "",
      account_number: affiliate?.payment_details?.account_number || "",
      bank_name: affiliate?.payment_details?.bank_name || "",
      branch_name: affiliate?.payment_details?.branch_name || "",
      mobile_number: affiliate?.payment_details?.mobile_number || "",
      paypal_email: affiliate?.payment_details?.paypal_email || "",
      other_details: affiliate?.payment_details?.other_details || "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("payment_")) {
      const field = name.replace("payment_", "");
      setFormData({
        ...formData,
        payment_details: {
          ...formData.payment_details,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone || !isValidPhoneNumber(formData.phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);

    const result = await updateProfile(formData);

    if (result.success) {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } else {
      toast.error(result.message);
    }

    setIsSubmitting(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <p className="text-gray-600">Manage your account information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold text-gray-900">{affiliate?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Promo Code</p>
            <p className="font-mono font-bold text-blue-600">
              {affiliate?.promo_code}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={`inline-block px-2 py-1 rounded-full text-sm font-semibold ${
              affiliate?.status === "active"
                ? "bg-green-100 text-green-800"
                : affiliate?.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}>
              {affiliate?.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Commission Rate</p>
            <p className="font-semibold text-green-600">
              {affiliate?.commission_rate || 10}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Member Since</p>
            <p className="font-semibold text-gray-900">
              {formatDate(affiliate?.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  international
                  defaultCountry="US"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_banking">Mobile Banking</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Bank Transfer Fields */}
              {formData.payment_method === "bank_transfer" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      name="payment_account_holder_name"
                      value={formData.payment_details.account_holder_name}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      name="payment_account_number"
                      value={formData.payment_details.account_number}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="payment_bank_name"
                      value={formData.payment_details.bank_name}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      name="payment_branch_name"
                      value={formData.payment_details.branch_name}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* Mobile Banking Fields */}
              {formData.payment_method === "mobile_banking" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="payment_mobile_number"
                    value={formData.payment_details.mobile_number}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* PayPal Fields */}
              {formData.payment_method === "paypal" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PayPal Email
                  </label>
                  <input
                    type="email"
                    name="payment_paypal_email"
                    value={formData.payment_details.paypal_email}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Other Method Fields */}
              {formData.payment_method === "other" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Details
                  </label>
                  <textarea
                    name="payment_other_details"
                    rows="3"
                    value={formData.payment_details.other_details}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provide your payment details..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              } text-white transition-colors`}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: affiliate?.name || "",
                  phone: affiliate?.phone || "",
                  address: affiliate?.address || "",
                  bio: affiliate?.bio || "",
                  payment_method: affiliate?.payment_method || "bank_transfer",
                  payment_details: {
                    account_holder_name: affiliate?.payment_details?.account_holder_name || "",
                    account_number: affiliate?.payment_details?.account_number || "",
                    bank_name: affiliate?.payment_details?.bank_name || "",
                    branch_name: affiliate?.payment_details?.branch_name || "",
                    mobile_number: affiliate?.payment_details?.mobile_number || "",
                    paypal_email: affiliate?.payment_details?.paypal_email || "",
                    other_details: affiliate?.payment_details?.other_details || "",
                  },
                });
              }}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* View Mode - Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">
                  {affiliate?.name || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">
                  {affiliate?.phone || "-"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold text-gray-900">
                  {affiliate?.address || "-"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Bio</p>
                <p className="text-gray-900">{affiliate?.bio || "-"}</p>
              </div>
            </div>
          </div>

          {/* View Mode - Payment Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {affiliate?.payment_method?.replace("_", " ") || "-"}
                </p>
              </div>
              {affiliate?.payment_details && (
                <div className="pt-3 border-t border-gray-200">
                  {Object.entries(affiliate.payment_details).map(
                    ([key, value]) =>
                      value && (
                        <div key={key} className="mb-2">
                          <p className="text-sm text-gray-600 capitalize">
                            {key.replace(/_/g, " ")}
                          </p>
                          <p className="text-gray-900">{value}</p>
                        </div>
                      )
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AffiliateProfile;
