import React, { useState } from "react";

const Join = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    // Spam honeypot
    if (formData.get("botcheck")) {
      setSubmitting(false);
      return;
    }

    // Normalize + validate email
    const rawEmail = String(formData.get("email") || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      setSubmitting(false);
      setError("Please enter a valid email address.");
      return;
    }
    formData.set("email", rawEmail);

    // Normalize + validate name
    const rawName = String(formData.get("name") || "").trim();
    if (!rawName) {
      setSubmitting(false);
      setError("Please enter your name.");
      return;
    }
    formData.set("name", rawName);

    // Web3Forms required + helpful fields
    formData.append("access_key", "276695ce-1e44-4cb0-bc1f-df51e6a92587");
    formData.append("replyto", rawEmail); // reply-to user
    formData.append("from_name", rawName); // inbox sender name
    if (!formData.get("subject")) {
      formData.append("subject", `Newsletter Signup — ${rawName}`);
    }

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      }).then((r) => r.json());

      if (res.success) {
        setSubmitted(true);
        form.reset();
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(res.message || "Submission failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="px-4 py-10 mx-auto sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="relative z-10 flex flex-col items-center justify-between gap-10 px-6 py-16 md:px-16 md:py-20 lg:flex-row md:gap-12">
          {/* Left Content */}
          <div className="max-w-xl text-center text-white md:text-left">
            <h2 className="mb-3 text-2xl font-semibold sm:text-3xl md:text-4xl">
              Subscribe to our newsletter
            </h2>
            <p className="text-sm text-emerald-100 sm:text-base">
              Book releases, reading lists, and hand-picked deals — straight to
              your inbox.
            </p>
          </div>

          {/* Form */}
          <div className="w-full md:w-auto">
            <form
              onSubmit={onSubmit}
              className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:gap-2"
              noValidate
            >
              {/* Honeypot (hidden) */}
              <input
                type="text"
                name="botcheck"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Name (required) */}
              <div className="w-full sm:w-auto">
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white rounded-xl sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>

              {/* Email (required) */}
              <div className="w-full sm:w-auto">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white md:w-72 rounded-xl sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>

              {/* Hidden subject (will be overridden with name in handler if absent) */}
              <input
                type="hidden"
                name="subject"
                value="Newsletter Signup — Books"
              />

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center w-full gap-2 px-6 py-3 text-white transition-colors bg-green-700 sm:w-auto hover:bg-green-800 rounded-xl sm:rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
                aria-busy={submitting ? "true" : "false"}
              >
                {submitting ? "Subscribing…" : "Subscribe"}
              </button>
            </form>

            {/* Messages */}
            <div
              className="mt-3 min-h-[1.5rem]"
              aria-live="polite"
              role="status"
            >
              {submitted && (
                <p className="text-emerald-100">
                  ✅ Thanks, your subscription was successful.
                </p>
              )}
              {!!error && <p className="text-red-50">⚠️ {error}</p>}
            </div>

            <p className="mt-2 text-xs text-emerald-100/80">
              By subscribing, you agree to receive emails about books and
              related content. You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Join;
