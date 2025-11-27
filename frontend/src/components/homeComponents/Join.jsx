import ButtonFill from "@/Button/ButtonFill";
import { useState, memo } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Join = () => {
  const { t } = useTranslation(['home', 'common']);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (formData.get("botcheck")) {
      setSubmitting(false);
      return;
    }

    const rawEmail = String(formData.get("email") || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      setSubmitting(false);
      setError("Please enter a valid email address.");
      return;
    }
    formData.set("email", rawEmail);

    const rawName = String(formData.get("name") || "").trim();
    if (!rawName) {
      setSubmitting(false);
      setError("Please enter your name.");
      return;
    }
    formData.set("name", rawName);

    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: rawName, email: rawEmail }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Subscription failed. Please try again.");
      }

      const alreadyExisted =
        Boolean(data?.meta?.alreadyExisted) ||
        /already/i.test(data?.message || "");

      if (alreadyExisted) {
        setError(t('home:newsletter.alreadySubscribed'));
        toast.info(t('home:newsletter.alreadySubscribed'));
      } else {
        toast.success(t('home:newsletter.thanksSubscribed'));
        setSubmitted(true);
        form.reset();
        setTimeout(() => setSubmitted(false), 5000);
      }

    } catch (e) {
      const msg =
        e?.message || "Network error. Please check your connection and try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="px-4 py-12 mx-auto sm:px-6 lg:px-8">
      <div className="
        relative overflow-hidden rounded-2xl 
        bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700
        shadow-xl shadow-emerald-600/25 
        px-5 py-12 sm:px-8 sm:py-16
      ">
        {/* Floating glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Left Text */}
          <div className="max-w-xl text-center text-white lg:text-left">
            <h2 className="mb-3 text-3xl font-semibold sm:text-4xl md:text-5xl leading-tight drop-shadow">
              {t('common:footer.newsletter')}
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/90">
              {t('common:footer.newsletterDesc')}
            </p>
          </div>

          {/* Form */}
          <div className="w-full lg:w-auto">
            <form
              onSubmit={onSubmit}
              noValidate
              className="
                flex flex-col gap-3 
                sm:flex-row sm:gap-2
                max-sm:bg-white/10 max-sm:backdrop-blur max-sm:p-4 max-sm:rounded-xl
              "
            >
              <input type="text" name="botcheck" className="hidden" autoComplete="off" />

              {/* Name */}
              <div className="w-full sm:w-64">
                <input
                  id="name"
                  type="text"
                  name="name"
                  required
                  placeholder={t('home:newsletter.yourName')}
                  className="
                    w-full px-4 py-3 rounded-xl 
                    text-gray-900 placeholder-gray-500 
                    bg-white/90 shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-green-300
                  "
                />
              </div>

              {/* Email */}
              <div className="w-full sm:w-64">
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  placeholder={t('home:newsletter.enterEmail')}
                  className="
                    w-full px-4 py-3 rounded-xl 
                    text-gray-900 placeholder-gray-500 
                    bg-white/90 shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-green-300
                  "
                />
              </div>

              <ButtonFill
                type="submit"
                disabled={submitting}
                aria-busy={submitting ? "true" : "false"}
              >
                {submitting ? t('common:buttons.sending') : t('common:footer.subscribe')}
              </ButtonFill>
            </form>

            {/* Status Message */}
            <div className="mt-3 min-h-[1.5rem]" aria-live="polite">
              {submitted && (
                <p className="text-emerald-50">
                  {t('home:newsletter.thanksSubscribed')}
                </p>
              )}
              {!!error && (
                <p className="text-red-50">⚠️ {error}</p>
              )}
            </div>

            <p className="mt-2 text-xs text-emerald-100/80 text-center sm:text-left">
              {t('common:footer.unsubscribeAnytime')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(Join);
