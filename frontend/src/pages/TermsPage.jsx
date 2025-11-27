import React, { useState } from "react";
import { useTranslation } from "react-i18next";

// src/pages/TermsPage.jsx
// Modified to use rounded-[2px] globally.

const Icon = ({ name, className = "w-6 h-6" }) => {
  const icons = {
    book: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M4 7.5A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v9A2.5 2.5 0 0117.5 19H6.5A2.5 2.5 0 014 16.5v-9z" />
      </svg>
    ),
    user: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.5a3 3 0 11-6 0 3 3 0 016 0zM4 19a8 8 0 0116 0" />
      </svg>
    ),
    payment: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5h18M7 15h.01M11 15h6M4 7.5h16A2.5 2.5 0 0122.5 10v4A2.5 2.5 0 0120 16.5H4A2.5 2.5 0 011.5 14V10A2.5 2.5 0 014 7.5z" />
      </svg>
    ),
    clock: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12A9 9 0 113 12a9 9 0 0118 0z" />
      </svg>
    ),
    mail: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25v7.5A2.25 2.25 0 005.25 18h13.5A2.25 2.25 0 0021 15.75v-7.5A2.25 2.25 0 0018.75 6H5.25A2.25 2.25 0 003 8.25zM21 8.25l-9 6-9-6" />
      </svg>
    ),
  };
  return icons[name] || null;
};

function Collapsible({ title, icon, children, defaultOpen = false, t }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="bg-white border border-gray-100 rounded-[2px] shadow-sm p-6 transition-transform duration-200 hover:shadow-md">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-start gap-4 text-left">
        <div className="flex-shrink-0 mt-1 p-2 rounded-[2px] bg-amber-50 text-amber-600">
          <Icon name={icon} className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900">{title}</h3>
            <span className="text-sm text-gray-500">{open ? t('home.terms.hide') : t('home.terms.read')}</span>
          </div>
          {open && <div className="mt-3 text-base text-slate-700 leading-relaxed">{children}</div>}
        </div>
      </button>
    </section>
  );
}

function SummaryCard({ lastUpdated, t }) {
  return (
    <aside className="sticky top-8 hidden lg:block w-80">
      <div className="bg-white border border-gray-100 rounded-[2px] shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-slate-900">{t('home.terms.quickSummary')}</h4>
            <p className="text-sm text-gray-500 mt-1">{t('home.terms.quickSummaryDesc')}</p>
          </div>
          <div className="text-slate-300 font-bold text-2xl">•</div>
        </div>

        <ul className="mt-4 space-y-3 text-slate-700">
          <li className="flex items-start gap-3">
            <div className="p-2 rounded-[2px] bg-gray-50 border border-gray-100">
              <Icon name="book" className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{t('home.terms.whoWeAre')}</div>
              <div className="text-xs text-gray-500">{t('home.terms.whoWeAreDesc')}</div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="p-2 rounded-[2px] bg-gray-50 border border-gray-100">
              <Icon name="payment" className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{t('home.terms.payments')}</div>
              <div className="text-xs text-gray-500">{t('home.terms.paymentsDesc')}</div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="p-2 rounded-[2px] bg-gray-50 border border-gray-100">
              <Icon name="clock" className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{t('home.terms.refunds')}</div>
              <div className="text-xs text-gray-500">{t('home.terms.refundsDesc')}</div>
            </div>
          </li>
        </ul>

        {/* <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">{t('home.terms.lastUpdated')}</div>
          <div className="text-sm font-medium text-slate-900">{lastUpdated}</div>

          <div className="mt-4 flex gap-2">
            <button onClick={() => window.print()} className="flex-1 py-2 rounded-[2px] text-sm font-medium border border-gray-100 bg-white hover:bg-gray-50">{t('home.terms.print')}</button>
            <a href="mailto:support@bookstore.com" className="py-2 px-3 rounded-[2px] text-sm font-medium border border-gray-100 bg-white hover:bg-gray-50">{t('navbar.contact')}</a>
          </div>
        </div> */}
      </div>
    </aside>
  );
}

export default function TermsPage() {
  const { t } = useTranslation('common');
  const lastUpdated = "September 11, 2025";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">{t('home.terms.title')}</h1>
          <p className="mt-3 text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            {t('home.terms.subtitle')}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <main className="lg:col-span-2 space-y-6">

            <div className="bg-white border border-gray-100 rounded-[2px] p-6 shadow-sm">
              <h2 className="text-lg font-medium text-slate-900">{t('home.terms.overview')}</h2>
              <p className="mt-2 text-base text-slate-700">
                {t('home.terms.overviewText')}
              </p>
            </div>

            <Collapsible title={t('home.terms.introduction')} icon="book" defaultOpen t={t}>
              <p>
                {t('home.terms.introductionText')}
              </p>
            </Collapsible>

            <Collapsible title={t('home.terms.userResponsibilities')} icon="user" t={t}>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t('home.terms.userResp1')}</li>
                <li>{t('home.terms.userResp2')}</li>
                <li>{t('home.terms.userResp3')}</li>
              </ul>
            </Collapsible>

            <Collapsible title={t('home.terms.purchasesPayments')} icon="payment" t={t}>
              <p>
                {t('home.terms.purchasesText')}
              </p>
            </Collapsible>

            <Collapsible title={t('home.terms.refundPolicy')} icon="clock" t={t}>
              <p>
                {t('home.terms.refundText')}
              </p>
            </Collapsible>

            <Collapsible title={t('home.terms.changesToTerms')} icon="book" t={t}>
              <p>
                {t('home.terms.changesText')}
              </p>
            </Collapsible>

            <Collapsible title={t('home.terms.contactDisputes')} icon="mail" t={t}>
              <p>
                {t('home.terms.contactText')}
              </p>
            </Collapsible>

            <div className="text-sm text-gray-500">
              {t('home.terms.legalNote')}
            </div>
          </main>

          <SummaryCard lastUpdated={lastUpdated} t={t} />
        </div>

        <footer className="mt-10 text-center">
          <div className="inline-block bg-white border border-gray-100 p-4 rounded-[2px] shadow-sm">
            <div className="text-sm text-slate-900">
              {t('home.terms.thankYou')} <span className="font-semibold">{t('home.terms.bookStore')}</span>.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
