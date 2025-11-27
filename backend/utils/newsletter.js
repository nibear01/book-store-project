/**
 * Observer pattern implementation for newsletter/promotional emails.
 *
 * Roles:
 * - Subject (NewsletterSubject): maintains a list of observers and notifies them.
 * - Observer (EmailObserver): encapsulates delivery logic to an individual recipient.
 *
 * Contract:
 * - notify({ subject, text?, html? })
 *   - html falls back to a minimal template using text if not provided.
 *   - Only active subscribers should be used to build observers (enforced by caller).
 */
import transporter from "../middlewares/email-verify.js";

export class NewsletterSubject {
  constructor() {
    this.observers = new Set();
  }

  attach(observer) {
    if (observer && typeof observer.update === "function") {
      this.observers.add(observer);
    }
  }

  detach(observer) {
    this.observers.delete(observer);
  }

  size() {
    return this.observers.size;
  }

  /**
   * Notify all observers with a payload. Runs with a basic concurrency limit to avoid SMTP throttling.
   * @param {{ subject: string, text?: string, html?: string, from?: string }} payload
   * @param {{ concurrency?: number }} [options]
   */
  async notify(payload, options = {}) {
    const observers = Array.from(this.observers);
    const concurrency = Math.max(1, Math.min(options.concurrency || 10, 50));

    const runChunk = async (chunk) => {
      return Promise.allSettled(chunk.map((obs) => obs.update(payload)));
    };

    const results = [];
    for (let i = 0; i < observers.length; i += concurrency) {
      const chunk = observers.slice(i, i + concurrency);
      // eslint-disable-next-line no-await-in-loop
      const res = await runChunk(chunk);
      results.push(...res);
    }

    const summary = {
      total: observers.length,
      fulfilled: results.filter((r) => r.status === "fulfilled").length,
      rejected: results.filter((r) => r.status === "rejected").length,
      errors: results
        .map((r, idx) => ({ idx, r }))
        .filter((x) => x.r.status === "rejected")
        .map((x) => x.r.reason?.message || String(x.r.reason)),
    };
    return summary;
  }
}

export class EmailObserver {
  constructor({ email, name }) {
    this.email = email;
    this.name = name || "Subscriber";
  }

  /**
   * Send an email to this observer's recipient
   * @param {{ subject: string, text?: string, html?: string, from?: string }} payload
   */
  async update({ subject, text, html, from }) {
    if (!subject || typeof subject !== "string") {
      throw new Error("Email subject is required");
    }
    const fallbackHtml = `<!doctype html><html><body><p>${
      text ? escapeHtml(text) : ""
    }</p></body></html>`;

    const mail = {
      from: from, // defer to transporter default if undefined
      to: this.email,
      subject,
      text: text || undefined,
      html: html || fallbackHtml,
    };

    const info = await transporter.sendMail(mail);
    return info?.messageId || true;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default { NewsletterSubject, EmailObserver };
