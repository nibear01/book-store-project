import React, { useState } from "react";

// src/pages/TermsPage.jsx
// Refined, high-quality Terms page: balanced typography, measured scale, accessible spacing.
// Tailwind CSS assumed. Headings reduced in scale, body text improved, consistent rhythm.

const Icon = ({ name, className = "w-6 h-6" }) => {
  const icons = {
    book: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M4 7.5A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v9A2.5 2.5 0 0117.5 19H6.5A2.5 2.5 0 014 16.5v-9z" />
      </svg>
    ),
    user: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.5a3 3 0 11-6 0 3 3 0 016 0zM4 19a8 8 0 0116 0" />
      </svg>
    ),
    payment: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5h18M7 15h.01M11 15h6M4 7.5h16A2.5 2.5 0 0122.5 10v4A2.5 2.5 0 0120 16.5H4A2.5 2.5 0 011.5 14V10A2.5 2.5 0 014 7.5z" />
      </svg>
    ),
    clock: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12A9 9 0 113 12a9 9 0 0118 0z" />
      </svg>
    ),
    mail: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25v7.5A2.25 2.25 0 005.25 18h13.5A2.25 2.25 0 0021 15.75v-7.5A2.25 2.25 0 0018.75 6H5.25A2.25 2.25 0 003 8.25zM21 8.25l-9 6-9-6" />
      </svg>
    ),
  };
  return icons[name] || null;
};

function Collapsible({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 transition-transform duration-200 hover:shadow-md">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-start gap-4 text-left">
        <div className="flex-shrink-0 mt-1 p-2 rounded-md bg-amber-50 text-amber-600">
          <Icon name={icon} className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900">{title}</h3>
            <span className="text-sm text-gray-500">{open ? 'Hide' : 'Read'}</span>
          </div>
          {open && <div className="mt-3 text-base text-slate-700 leading-relaxed">{children}</div>}
        </div>
      </button>
    </section>
  );
}

function SummaryCard({ lastUpdated }) {
  return (
    <aside className="sticky top-8 hidden lg:block w-80">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-slate-900">Quick summary</h4>
            <p className="text-sm text-gray-500 mt-1">Fast highlights for busy readers.</p>
          </div>
          <div className="text-slate-300 font-bold text-2xl">•</div>
        </div>

        <ul className="mt-4 space-y-3 text-slate-700">
          <li className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-gray-50 border border-gray-100">
              <Icon name="book" className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">Who we are</div>
              <div className="text-xs text-gray-500">Online book retailer</div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-gray-50 border border-gray-100">
              <Icon name="payment" className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">Payments</div>
              <div className="text-xs text-gray-500">Secure gateways, receipts via email</div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-gray-50 border border-gray-100">
              <Icon name="clock" className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium">Refunds</div>
              <div className="text-xs text-gray-500">7 days for physical defects; e-books non-refundable</div>
            </div>
          </li>
        </ul>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">Last updated</div>
          <div className="text-sm font-medium text-slate-900">{lastUpdated}</div>

          <div className="mt-4 flex gap-2">
            <button onClick={() => window.print()} className="flex-1 py-2 rounded-md text-sm font-medium border border-gray-100 bg-white hover:bg-gray-50">Print</button>
            <a href="mailto:support@bookstore.com" className="py-2 px-3 rounded-md text-sm font-medium border border-gray-100 bg-white hover:bg-gray-50">Contact</a>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function TermsPage() {
  const lastUpdated = "September 11, 2025";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header hero: balanced scale */}
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Terms &amp; Conditions</h1>
          <p className="mt-3 text-base md:text-lg text-gray-600 max-w-2xl mx-auto">Please read these terms before using our Book Store. We keep language clear and approachable.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <main className="lg:col-span-2 space-y-6">

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-medium text-slate-900">Overview</h2>
              <p className="mt-2 text-base text-slate-700">Using our Book Store means you accept these Terms &amp; Conditions. If you need legal certainty, consult a lawyer.</p>
            </div>

            <Collapsible title="1. Introduction" icon="book" defaultOpen>
              <p>By accessing and using our Book Store you agree to these terms. They protect our community and keep service quality high.</p>
            </Collapsible>

            <Collapsible title="2. User responsibilities" icon="user">
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide accurate, up-to-date account information.</li>
                <li>Use the platform for lawful and ethical purposes only.</li>
                <li>Respect copyrights and intellectual property rights.</li>
              </ul>
            </Collapsible>

            <Collapsible title="3. Purchases &amp; Payments" icon="payment">
              <p>All purchases are processed via secure payment gateways. Prices shown at checkout are final and receipts are emailed.</p>
            </Collapsible>

            <Collapsible title="4. Refund &amp; Return Policy" icon="clock">
              <p>Refunds available for defective or incorrect physical items reported within 7 days. Digital products are non-refundable once delivered.</p>
            </Collapsible>

            <Collapsible title="5. Changes to Terms" icon="book">
              <p>We may update these Terms occasionally. We'll publish the updated date. Continued use after changes means you accept them.</p>
            </Collapsible>

            <Collapsible title="6. Contact &amp; Disputes" icon="mail">
              <p>Questions? Email <a href="mailto:support@bookstore.com" className="text-amber-600 underline">support@bookstore.com</a>. We aim to resolve issues quickly.</p>
            </Collapsible>

            <div className="text-sm text-gray-500">Note: This template is for general guidance and doesn't replace legal advice.</div>

          </main>

          <SummaryCard lastUpdated={lastUpdated} />
        </div>

        <footer className="mt-10 text-center">
          <div className="inline-block bg-white border border-gray-100 p-4 rounded-lg shadow-sm">
            <div className="text-sm text-slate-900">Thank you for being part of our <span className="font-semibold">Book Store</span>.</div>
          </div>
        </footer>

      </div>
    </div>
  );
}
