
// Get the base URL for assets
const getBaseUrl = () => {
  return process.env.FRONTEND_URL || process.env.VITE_BACKEND_URL || 'http://localhost:5173';
};

// Common email styles matching website design
const getEmailStyles = () => `
  body {
    margin: 0;
    padding: 0;
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .email-wrapper {
    max-width: 600px;
    margin: 40px auto;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  .header {
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    padding: 40px 30px;
    text-align: center;
    position: relative;
  }
  .header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ef4444 0%, #dc2626 50%, #10b981 100%);
  }
  .header-title {
    color: #ffffff;
    font-size: 28px;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.5px;
  }
  .header-subtitle {
    color: #9ca3af;
    font-size: 14px;
    margin: 10px 0 0;
  }
  .content {
    padding: 40px 30px;
    line-height: 1.8;
    color: #374151;
  }
  .content h2 {
    color: #111827;
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 20px;
  }
  .content p {
    margin: 0 0 16px;
    font-size: 15px;
  }
  .button {
    display: inline-block;
    padding: 14px 32px;
    margin: 24px 0;
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  .button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  }
  .button-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }
  .button-danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }
  .highlight-box {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-left: 4px solid #10b981;
    padding: 20px;
    margin: 24px 0;
    border-radius: 8px;
  }
  .code-box {
    background: #f9fafb;
    border: 2px solid #e5e7eb;
    padding: 20px;
    margin: 24px 0;
    border-radius: 8px;
    text-align: center;
  }
  .code {
    font-size: 32px;
    font-weight: 700;
    color: #000000;
    letter-spacing: 8px;
    font-family: 'Courier New', monospace;
  }
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%);
    margin: 32px 0;
  }
  .footer {
    background: #f9fafb;
    padding: 30px;
    text-align: center;
    border-top: 1px solid #e5e7eb;
  }
  .footer-links {
    margin: 20px 0;
  }
  .footer-link {
    color: #6b7280;
    text-decoration: none;
    margin: 0 12px;
    font-size: 13px;
  }
  .footer-link:hover {
    color: #000000;
  }
  .social-icons {
    margin: 20px 0;
  }
  .social-icon {
    display: inline-block;
    width: 36px;
    height: 36px;
    margin: 0 8px;
    background: #e5e7eb;
    border-radius: 50%;
    text-align: center;
    line-height: 36px;
    color: #6b7280;
    text-decoration: none;
  }
  .social-icon:hover {
    background: #000000;
    color: #ffffff;
  }
  .footer-text {
    color: #9ca3af;
    font-size: 12px;
    line-height: 1.6;
    margin: 8px 0;
  }
  @media only screen and (max-width: 600px) {
    .email-wrapper {
      margin: 20px 10px;
      border-radius: 12px;
    }
    .content {
      padding: 30px 20px;
    }
    .header {
      padding: 30px 20px;
    }
    .button {
      display: block;
      text-align: center;
    }
    .code {
      font-size: 24px;
      letter-spacing: 4px;
    }
  }
`;

// Base template structure
const getBaseTemplate = ({ subject, headerTitle, headerSubtitle, content, lang = 'en' }) => {
  const baseUrl = getBaseUrl();
  const logoUrl = `${baseUrl}/logo.png`;
  
  const translations = {
    en: {
      copyright: 'All rights reserved',
      receivedBecause: "You're receiving this email because you have an account with BoiBiliash.",
      unsubscribe: 'Unsubscribe',
      contactUs: 'Contact Us',
      privacyPolicy: 'Privacy Policy',
      terms: 'Terms of Service',
      visitWebsite: 'Visit Website',
    },
    bn: {
      copyright: 'সর্বস্বত্ব সংরক্ষিত',
      receivedBecause: 'আপনার BoiBiliash অ্যাকাউন্ট থাকায় এই ইমেইলটি পাচ্ছেন।',
      unsubscribe: 'আনসাবস্ক্রাইব',
      contactUs: 'যোগাযোগ করুন',
      privacyPolicy: 'গোপনীয়তা নীতি',
      terms: 'সেবার শর্তাবলী',
      visitWebsite: 'ওয়েবসাইট ভিজিট করুন',
    }
  };

  const t = translations[lang] || translations.en;
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="${lang}" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    ${getEmailStyles()}
  </style>
</head>
<body>
  <div class="email-wrapper">
    <!-- Header -->
    <div class="header">
      <h1 class="header-title">${headerTitle}</h1>
      ${headerSubtitle ? `<p class="header-subtitle">${headerSubtitle}</p>` : ''}
    </div>

    <!-- Content -->
    <div class="content">
      ${content}
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-links">
        <a href="${baseUrl}" class="footer-link">${t.visitWebsite}</a>
        <a href="${baseUrl}/contact" class="footer-link">${t.contactUs}</a>
        <a href="${baseUrl}/terms" class="footer-link">${t.terms}</a>
      </div>
      
      <div class="divider" style="margin: 20px 0;"></div>
      
      <p class="footer-text">&copy; ${currentYear} BoiBiliash. ${t.copyright}</p>
      <p class="footer-text">${t.receivedBecause}</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Newsletter template
export const getNewsletterTemplate = ({ subject, text, html, unsubscribeLink, lang = 'en' }) => {
  const translations = {
    en: {
      headerTitle: 'BoiBiliash Newsletter',
      headerSubtitle: 'Your Literary Journey Updates',
      unsubscribeText: 'Not interested anymore?',
      unsubscribeLink: 'Unsubscribe from this newsletter',
    },
    bn: {
      headerTitle: 'BoiBiliash নিউজলেটার',
      headerSubtitle: 'আপনার সাহিত্যিক যাত্রার আপডেট',
      unsubscribeText: 'আর আগ্রহী নন?',
      unsubscribeLink: 'এই নিউজলেটার থেকে আনসাবস্ক্রাইব করুন',
    }
  };

  const t = translations[lang] || translations.en;
  const content = html || `<p>${text.replace(/\n/g, '<br>')}</p>`;
  
  const fullContent = `
    ${content}
    ${unsubscribeLink ? `
      <div class="divider"></div>
      <p style="text-align: center; color: #9ca3af; font-size: 13px;">
        ${t.unsubscribeText} 
        <a href="${unsubscribeLink}" style="color: #ef4444; text-decoration: none;">${t.unsubscribeLink}</a>
      </p>
    ` : ''}
  `;

  return getBaseTemplate({
    subject,
    headerTitle: t.headerTitle,
    headerSubtitle: t.headerSubtitle,
    content: fullContent,
    lang
  });
};

// Welcome email template
export const getWelcomeEmailTemplate = ({ name, lang = 'en' }) => {
  const translations = {
    en: {
      subject: 'Welcome to BoiBiliash! 🎉',
      headerTitle: 'Welcome to BoiBiliash!',
      headerSubtitle: 'Your Literary Adventure Begins',
      greeting: `Hi ${name || 'Reader'}!`,
      message: `We're thrilled to have you join our community of book lovers! Your email has been verified successfully, and you're all set to explore our vast collection of books.`,
      features: 'What you can do now:',
      feature1: '📚 Browse thousands of books across all genres',
      feature2: '🎯 Create personalized wishlists',
      feature3: '💰 Get exclusive deals and discounts',
      feature4: '📦 Track your orders in real-time',
      cta: 'Start Exploring Books',
      closing: 'Happy reading!',
      team: '— The BoiBiliash Team',
    },
    bn: {
      subject: 'BoiBiliash এ স্বাগতম! 🎉',
      headerTitle: 'BoiBiliash এ স্বাগতম!',
      headerSubtitle: 'আপনার সাহিত্যিক যাত্রা শুরু',
      greeting: `হ্যালো ${name || 'পাঠক'}!`,
      message: `বই প্রেমীদের আমাদের কমিউনিটিতে যুক্ত হওয়ার জন্য আমরা রোমাঞ্চিত! আপনার ইমেইল সফলভাবে যাচাই করা হয়েছে এবং আপনি আমাদের বিশাল বই সংগ্রহ অন্বেষণ করতে প্রস্তুত।`,
      features: 'আপনি এখন যা করতে পারেন:',
      feature1: '📚 সব ধরনের হাজার হাজার বই ব্রাউজ করুন',
      feature2: '🎯 ব্যক্তিগত উইশলিস্ট তৈরি করুন',
      feature3: '💰 এক্সক্লুসিভ ডিল এবং ছাড় পান',
      feature4: '📦 রিয়েল-টাইমে অর্ডার ট্র্যাক করুন',
      cta: 'বই খুঁজুন শুরু করুন',
      closing: 'শুভ পাঠ!',
      team: '— BoiBiliash টিম',
    }
  };

  const t = translations[lang] || translations.en;
  const baseUrl = getBaseUrl();

  const content = `
    <h2>${t.greeting}</h2>
    <p>${t.message}</p>
    
    <div class="highlight-box">
      <p style="margin: 0 0 12px; font-weight: 600; color: #10b981;">${t.features}</p>
      <p style="margin: 8px 0;">${t.feature1}</p>
      <p style="margin: 8px 0;">${t.feature2}</p>
      <p style="margin: 8px 0;">${t.feature3}</p>
      <p style="margin: 8px 0;">${t.feature4}</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${baseUrl}/shop" class="button button-success">${t.cta}</a>
    </div>
    
    <p>${t.closing}</p>
    <p><strong>${t.team}</strong></p>
  `;

  return getBaseTemplate({
    subject: t.subject,
    headerTitle: t.headerTitle,
    headerSubtitle: t.headerSubtitle,
    content,
    lang
  });
};

// OTP Verification email template
export const getOtpEmailTemplate = ({ code, name, lang = 'en' }) => {
  const translations = {
    en: {
      subject: 'Verify Your Email - BoiBiliash',
      headerTitle: 'Email Verification',
      headerSubtitle: 'One more step to get started',
      greeting: `Hi ${name || 'there'}!`,
      message: 'Thank you for signing up with BoiBiliash. Please use the verification code below to complete your registration:',
      codeLabel: 'Your Verification Code',
      expiryNote: 'This code will expire in 10 minutes.',
      securityNote: 'If you didn\'t request this code, please ignore this email.',
      trouble: 'Having trouble?',
      contact: 'Contact our support team',
    },
    bn: {
      subject: 'আপনার ইমেইল যাচাই করুন - BoiBiliash',
      headerTitle: 'ইমেইল যাচাইকরণ',
      headerSubtitle: 'শুরু করার জন্য আর একটি ধাপ',
      greeting: `হ্যালো ${name || 'সেখানে'}!`,
      message: 'BoiBiliash এ সাইন আপ করার জন্য ধন্যবাদ। আপনার রেজিস্ট্রেশন সম্পূর্ণ করতে নিচের যাচাইকরণ কোডটি ব্যবহার করুন:',
      codeLabel: 'আপনার যাচাইকরণ কোড',
      expiryNote: 'এই কোডটি ১০ মিনিটে মেয়াদ শেষ হবে।',
      securityNote: 'আপনি যদি এই কোডটি অনুরোধ না করেন তবে এই ইমেইলটি উপেক্ষা করুন।',
      trouble: 'সমস্যা হচ্ছে?',
      contact: 'আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন',
    }
  };

  const t = translations[lang] || translations.en;
  const baseUrl = getBaseUrl();

  const content = `
    <h2>${t.greeting}</h2>
    <p>${t.message}</p>
    
    <div class="code-box">
      <p style="margin: 0 0 12px; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">${t.codeLabel}</p>
      <div class="code">${code}</div>
    </div>
    
    <p style="text-align: center; color: #9ca3af; font-size: 13px;">${t.expiryNote}</p>
    
    <div class="divider"></div>
    
    <p style="color: #6b7280; font-size: 14px;">⚠️ ${t.securityNote}</p>
    
    <p style="text-align: center; margin-top: 32px;">
      <span style="color: #6b7280; font-size: 13px;">${t.trouble}</span><br/>
      <a href="${baseUrl}/contact" style="color: #ef4444; text-decoration: none; font-weight: 600;">${t.contact}</a>
    </p>
  `;

  return getBaseTemplate({
    subject: t.subject,
    headerTitle: t.headerTitle,
    headerSubtitle: t.headerSubtitle,
    content,
    lang
  });
};

// Password Reset email template
export const getPasswordResetTemplate = ({ resetUrl, name, lang = 'en' }) => {
  const translations = {
    en: {
      subject: 'Reset Your Password - BoiBiliash',
      headerTitle: 'Password Reset Request',
      headerSubtitle: 'Secure your account',
      greeting: `Hi ${name || 'there'}!`,
      message: 'We received a request to reset your password. Click the button below to create a new password:',
      cta: 'Reset Password',
      expiryNote: 'This link will expire in 1 hour for security reasons.',
      noRequest: 'If you didn\'t request a password reset, please ignore this email. Your password will remain unchanged.',
      securityTip: '💡 Security Tip: Never share your password with anyone.',
    },
    bn: {
      subject: 'আপনার পাসওয়ার্ড রিসেট করুন - BoiBiliash',
      headerTitle: 'পাসওয়ার্ড রিসেট অনুরোধ',
      headerSubtitle: 'আপনার অ্যাকাউন্ট সুরক্ষিত করুন',
      greeting: `হ্যালো ${name || 'সেখানে'}!`,
      message: 'আমরা আপনার পাসওয়ার্ড রিসেট করার জন্য একটি অনুরোধ পেয়েছি। একটি নতুন পাসওয়ার্ড তৈরি করতে নিচের বোতামে ক্লিক করুন:',
      cta: 'পাসওয়ার্ড রিসেট করুন',
      expiryNote: 'নিরাপত্তার কারণে এই লিঙ্কটি ১ ঘন্টায় মেয়াদ শেষ হবে।',
      noRequest: 'আপনি যদি পাসওয়ার্ড রিসেট অনুরোধ না করেন তবে এই ইমেইলটি উপেক্ষা করুন। আপনার পাসওয়ার্ড অপরিবর্তিত থাকবে।',
      securityTip: '💡 নিরাপত্তা টিপ: আপনার পাসওয়ার্ড কারো সাথে শেয়ার করবেন না।',
    }
  };

  const t = translations[lang] || translations.en;

  const content = `
    <h2>${t.greeting}</h2>
    <p>${t.message}</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" class="button button-danger">${t.cta}</a>
    </div>
    
    <p style="text-align: center; color: #9ca3af; font-size: 13px;">${t.expiryNote}</p>
    
    <div class="divider"></div>
    
    <p style="color: #6b7280; font-size: 14px;">${t.noRequest}</p>
    
    <div class="highlight-box" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left-color: #ef4444;">
      <p style="margin: 0; font-size: 14px;">${t.securityTip}</p>
    </div>
  `;

  return getBaseTemplate({
    subject: t.subject,
    headerTitle: t.headerTitle,
    headerSubtitle: t.headerSubtitle,
    content,
    lang
  });
};

// Author Welcome email template
export const getAuthorWelcomeTemplate = ({ name, lang = 'en' }) => {
  const translations = {
    en: {
      subject: 'Welcome to BoiBiliash Authors - Your Request Approved! 🎉',
      headerTitle: 'Welcome to Our Authors Community!',
      headerSubtitle: 'Your journey as an author begins',
      greeting: `Congratulations, ${name || 'Author'}!`,
      message: 'We\'re excited to inform you that your author request has been approved! You\'re now part of our exclusive community of talented writers and publishers.',
      benefits: 'As a BoiBiliash author, you can:',
      benefit1: '✍️ Publish and manage your books',
      benefit2: '📊 Track your sales and royalties',
      benefit3: '🎨 Customize your author profile',
      benefit4: '📢 Reach thousands of readers',
      benefit5: '💬 Engage with your audience',
      cta: 'Access Author Dashboard',
      nextSteps: 'Next Steps:',
      step1: 'Complete your author profile',
      step2: 'Upload your first manuscript',
      step3: 'Set your pricing and availability',
      closing: 'We can\'t wait to see your work reach readers around the world!',
      team: '— The BoiBiliash Team',
    },
    bn: {
      subject: 'BoiBiliash লেখক সম্প্রদায়ে স্বাগতম - আপনার অনুরোধ অনুমোদিত! 🎉',
      headerTitle: 'আমাদের লেখক সম্প্রদায়ে স্বাগতম!',
      headerSubtitle: 'লেখক হিসেবে আপনার যাত্রা শুরু',
      greeting: `অভিনন্দন, ${name || 'লেখক'}!`,
      message: 'আপনার লেখক অনুরোধ অনুমোদিত হয়েছে জানাতে পেরে আমরা উচ্ছ্বসিত! আপনি এখন আমাদের প্রতিভাবান লেখক এবং প্রকাশকদের এক্সক্লুসিভ সম্প্রদায়ের অংশ।',
      benefits: 'BoiBiliash লেখক হিসেবে আপনি পারবেন:',
      benefit1: '✍️ আপনার বই প্রকাশ এবং পরিচালনা করুন',
      benefit2: '📊 আপনার বিক্রয় এবং রয়্যালটি ট্র্যাক করুন',
      benefit3: '🎨 আপনার লেখক প্রোফাইল কাস্টমাইজ করুন',
      benefit4: '📢 হাজার হাজার পাঠকের কাছে পৌঁছান',
      benefit5: '💬 আপনার দর্শকদের সাথে যুক্ত হন',
      cta: 'লেখক ড্যাশবোর্ড অ্যাক্সেস করুন',
      nextSteps: 'পরবর্তী পদক্ষেপ:',
      step1: 'আপনার লেখক প্রোফাইল সম্পূর্ণ করুন',
      step2: 'আপনার প্রথম পাণ্ডুলিপি আপলোড করুন',
      step3: 'আপনার মূল্য এবং প্রাপ্যতা সেট করুন',
      closing: 'বিশ্বজুড়ে পাঠকদের কাছে আপনার কাজ পৌঁছানোর জন্য আমরা অপেক্ষা করতে পারি না!',
      team: '— BoiBiliash টিম',
    }
  };

  const t = translations[lang] || translations.en;
  const baseUrl = getBaseUrl();

  const content = `
    <h2>${t.greeting}</h2>
    <p>${t.message}</p>
    
    <div class="highlight-box">
      <p style="margin: 0 0 12px; font-weight: 600; color: #10b981;">${t.benefits}</p>
      <p style="margin: 8px 0;">${t.benefit1}</p>
      <p style="margin: 8px 0;">${t.benefit2}</p>
      <p style="margin: 8px 0;">${t.benefit3}</p>
      <p style="margin: 8px 0;">${t.benefit4}</p>
      <p style="margin: 8px 0;">${t.benefit5}</p>
    </div>
    
    <div style="text-align: center;">
      <a href="${baseUrl}/admin/author" class="button">${t.cta}</a>
    </div>
    
    <div class="divider"></div>
    
    <p style="font-weight: 600; margin-bottom: 12px;">${t.nextSteps}</p>
    <p style="margin: 8px 0;">1️⃣ ${t.step1}</p>
    <p style="margin: 8px 0;">2️⃣ ${t.step2}</p>
    <p style="margin: 8px 0;">3️⃣ ${t.step3}</p>
    
    <div class="divider"></div>
    
    <p>${t.closing}</p>
    <p><strong>${t.team}</strong></p>
  `;

  return getBaseTemplate({
    subject: t.subject,
    headerTitle: t.headerTitle,
    headerSubtitle: t.headerSubtitle,
    content,
    lang
  });
};

// Contact Form email template
export const getContactFormTemplate = ({ name, email, subject, message }) => {
  const baseUrl = getBaseUrl();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const content = `
    <h2>📩 New Contact Form Submission</h2>
    <p>You have received a new message from your BoiBiliash contact form.</p>
    
    <div class="divider"></div>
    
    <div class="highlight-box" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #3b82f6;">
      <h3 style="margin: 0 0 16px; color: #1e40af; font-size: 18px; font-weight: 600;">Contact Details</h3>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #bfdbfe;">
            <strong style="color: #1e3a8a; display: inline-block; width: 120px;">Name:</strong>
            <span style="color: #374151;">${name}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #bfdbfe;">
            <strong style="color: #1e3a8a; display: inline-block; width: 120px;">Email:</strong>
            <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #bfdbfe;">
            <strong style="color: #1e3a8a; display: inline-block; width: 120px;">Subject:</strong>
            <span style="color: #374151;">${subject}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <strong style="color: #1e3a8a; display: inline-block; width: 120px;">Submitted:</strong>
            <span style="color: #6b7280; font-size: 14px;">${currentDate}</span>
          </td>
        </tr>
      </table>
    </div>

    <div style="margin: 32px 0;">
      <h3 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 16px;">Message:</h3>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; line-height: 1.8;">
        <p style="margin: 0; color: #374151; white-space: pre-wrap;">${message}</p>
      </div>
    </div>

    <div class="divider"></div>

    <div style="text-align: center; padding: 20px; background: #f0f9ff; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 16px; color: #374151; font-size: 14px;">
        <strong>Quick Action:</strong> Reply directly to this customer
      </p>
      <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" 
         class="button button-success" 
         style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); text-decoration: none; display: inline-block;">
        Reply to ${name}
      </a>
    </div>

    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; color: #92400e; font-size: 13px;">
        <span style="font-size: 20px; margin-right: 8px;">💡</span>
        <strong>Tip:</strong> Responding quickly to customer inquiries improves satisfaction and builds trust.
      </p>
    </div>

    <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0; text-align: center;">
      This message was sent via your BoiBiliash contact form at <a href="${baseUrl}/contact" style="color: #3b82f6; text-decoration: none;">${baseUrl}/contact</a>
    </p>
  `;

  return getBaseTemplate({
    subject: `New Contact Message: ${subject}`,
    headerTitle: '�� Contact Form Message',
    headerSubtitle: 'New inquiry from your BoiBiliash website',
    content,
  });
};
