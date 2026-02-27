import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Upload, Building2 } from "lucide-react";
import { toast } from "react-toastify";
import * as publisherApi from "../../../api/publisher-api";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const emptyForm = {
  name: "",
  description: "",
  country: "",
  website: "",
  founded_year: "",
  is_active: true,
  logo: null,
};

const PublisherModal = ({ open, initialPublisher, onClose, onSuccess }) => {
  const [form, setForm] = useState(emptyForm);
  const [logoPreview, setLogoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const editingId = initialPublisher?._id;

  useEffect(() => {
    if (!initialPublisher) {
      setForm(emptyForm);
      setLogoPreview(null);
      return;
    }

    setForm({
      name: initialPublisher.name || "",
      description: initialPublisher.description || "",
      country: initialPublisher.country || "",
      website: initialPublisher.website || "",
      founded_year: initialPublisher.founded_year
        ? String(initialPublisher.founded_year)
        : "",
      is_active: initialPublisher.is_active ?? true,
      logo: null,
    });

    if (initialPublisher.logo) {
      const logoUrl = initialPublisher.logo.startsWith("http")
        ? initialPublisher.logo
        : `${API_BASE}/${initialPublisher.logo}`;
      setLogoPreview(logoUrl);
    } else {
      setLogoPreview(null);
    }
  }, [initialPublisher]);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm({ ...form, logo: file });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Publisher name is required");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description);
      formData.append("country", form.country);
      formData.append("website", form.website);
      if (form.founded_year) {
        formData.append("founded_year", form.founded_year);
      }
      formData.append("is_active", form.is_active);

      if (form.logo instanceof File) {
        formData.append("logo", form.logo);
      }

      if (editingId) {
        await publisherApi.updatePublisher(editingId, formData);
        toast.success("Publisher updated successfully");
      } else {
        await publisherApi.createPublisher(formData);
        toast.success("Publisher created successfully");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to save publisher:", error);
      toast.error(
        error.response?.data?.message || "Failed to save publisher"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {editingId ? "Edit Publisher" : "Add Publisher"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                  <Upload className="w-4 h-4" />
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Recommended: Square image, at least 200x200px
              </p>
            </div>

            {/* Publisher Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publisher Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g., Penguin Random House"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black resize-none"
                placeholder="Brief description of the publisher..."
              />
            </div>

            {/* Country & Founded Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g., USA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Founded Year
                </label>
                <input
                  type="number"
                  value={form.founded_year}
                  onChange={(e) =>
                    setForm({ ...form, founded_year: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="e.g., 2000"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="https://example.com"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Saving..."
              : editingId
              ? "Update Publisher"
              : "Create Publisher"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PublisherModal;
