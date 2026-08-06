import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import BottomNavigation from "../components/BottomNavigation";
import { IoArrowBack } from "react-icons/io5";

const CONTENT = {
  en: {
    langLabel: "🇧🇩 বাংলা",
    tagline: "Digital Credit Ledger for Shopkeepers",
    aboutTitle: "About Smart Halkhata",
    aboutBody:
      "Smart Halkhata is a digital replacement for the traditional paper credit ledger used by small shops. It was created so shopkeepers can track customer dues, record payments, and manage their shop's finances from a phone — without losing a paper book, without doing math by hand, and without the risk of a customer disputing what was written.",
    howTitle: "How to Use",
    steps: [
      { title: "Create Your Shop Profile", desc: "Go to Shop Profile and add your shop name, owner name, phone, and logo. This appears on every receipt." },
      { title: "Add Customers", desc: "Open Customers and add each person who buys on credit — name and phone number." },
      { title: "Add Due Transactions", desc: "Open a customer's page and use Add Due whenever they take something on credit." },
      { title: "Receive Payments", desc: "When a customer pays you back, use Receive Payment — it updates their balance instantly." },
      { title: "View Reports", desc: "Export any customer's history to PDF or Excel from their detail page." },
      { title: "Business Overview", desc: "Check your shop's total due, total received, and today's collection at a glance." },
      { title: "Notifications", desc: "Due reminders appear automatically for customers who owe you money." },
      { title: "Settings", desc: "Adjust dark mode, language, and your shop name from Settings at any time." },
    ],
    notesTitle: "Important Notes",
    notesBody:
      "Always double-check the amount before saving a transaction — it cannot be undone by anyone but you. Use a stable internet connection when adding transactions, since data is saved to the cloud in real time. Keep your login password private.",
    problemsTitle: "Common Problems",
    problems: [
      { q: "A transaction didn't save", a: "Check your internet connection and try again. If the customer's balance didn't change, the transaction was not recorded." },
      { q: "Wrong balance appears", a: "Open the customer's Transaction History and review recent entries for a mistaken amount, then edit or delete it." },
      { q: "The app is stuck loading", a: "Close and reopen the app. If it continues, check your internet connection." },
      { q: "Data looks out of sync", a: "Pull to refresh the page, or log out and log back in." },
      { q: "Anything else unexpected", a: "Contact Help & Support below or email us — we respond as quickly as we can." },
    ],
    supportTitle: "Help & Support",
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    phone: "Phone",
    email: "Email",
    devTitle: "Developer",
    devBy: "Developed & Designed by",
    devName: "Md Monir Hosen",
    footerRights: "All Rights Reserved.",
    back: "Back",
  },
  bn: {
    langLabel: "🇺🇸 English",
    tagline: "দোকানদারদের জন্য ডিজিটাল বাকি খাতা",
    aboutTitle: "স্মার্ট হালখাতা সম্পর্কে",
    aboutBody:
      "স্মার্ট হালখাতা ছোট দোকানের ঐতিহ্যবাহী কাগজের বাকি খাতার ডিজিটাল বিকল্প। এটি তৈরি করা হয়েছে যাতে দোকানদাররা ফোন থেকেই গ্রাহকের বাকি, পেমেন্ট এবং দোকানের হিসাব রাখতে পারেন — খাতা হারানোর ভয় ছাড়া, হাতে হিসাব করা ছাড়া, এবং গ্রাহকের সাথে হিসাব নিয়ে মতভেদের ঝুঁকি ছাড়া।",
    howTitle: "ব্যবহারের নিয়ম",
    steps: [
      { title: "দোকানের প্রোফাইল তৈরি করুন", desc: "Shop Profile-এ গিয়ে দোকানের নাম, মালিকের নাম, ফোন নম্বর এবং লোগো যোগ করুন। এটি প্রতিটি রসিদে দেখাবে।" },
      { title: "গ্রাহক যোগ করুন", desc: "Customers-এ গিয়ে যারা বাকিতে কেনাকাটা করেন তাদের নাম ও ফোন নম্বর যোগ করুন।" },
      { title: "বাকি যোগ করুন", desc: "গ্রাহকের পেজে গিয়ে Add Due ব্যবহার করুন যখনই তিনি বাকিতে কিছু নেন।" },
      { title: "পেমেন্ট গ্রহণ করুন", desc: "গ্রাহক টাকা পরিশোধ করলে Receive Payment ব্যবহার করুন — বাকি সাথে সাথে আপডেট হবে।" },
      { title: "রিপোর্ট দেখুন", desc: "গ্রাহকের পেজ থেকে তার হিসাব PDF অথবা Excel এ এক্সপোর্ট করুন।" },
      { title: "ব্যবসার সারসংক্ষেপ", desc: "মোট বাকি, মোট আদায় এবং আজকের আদায় এক নজরে দেখুন।" },
      { title: "নোটিফিকেশন", desc: "যেসব গ্রাহকের বাকি আছে তাদের জন্য রিমাইন্ডার স্বয়ংক্রিয়ভাবে দেখাবে।" },
      { title: "সেটিংস", desc: "যেকোনো সময় ডার্ক মোড, ভাষা ও দোকানের নাম পরিবর্তন করতে পারবেন।" },
    ],
    notesTitle: "গুরুত্বপূর্ণ তথ্য",
    notesBody:
      "লেনদেন সংরক্ষণের আগে সবসময় টাকার পরিমাণ দুইবার চেক করুন — এটি পরে আপনি ছাড়া অন্য কেউ পরিবর্তন করতে পারবে না। লেনদেন যোগ করার সময় স্থিতিশীল ইন্টারনেট সংযোগ ব্যবহার করুন, কারণ তথ্য সরাসরি ক্লাউডে সংরক্ষিত হয়। আপনার পাসওয়ার্ড গোপন রাখুন।",
    problemsTitle: "সাধারণ সমস্যা",
    problems: [
      { q: "লেনদেন সংরক্ষণ হচ্ছে না", a: "ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন। গ্রাহকের বাকি পরিবর্তন না হলে বুঝবেন লেনদেনটি সংরক্ষিত হয়নি।" },
      { q: "ভুল বাকি দেখাচ্ছে", a: "গ্রাহকের Transaction History খুলে সাম্প্রতিক এন্ট্রি চেক করুন এবং ভুল থাকলে এডিট বা ডিলিট করুন।" },
      { q: "অ্যাপ লোড হচ্ছে না", a: "অ্যাপ বন্ধ করে আবার খুলুন। সমস্যা থাকলে ইন্টারনেট সংযোগ চেক করুন।" },
      { q: "তথ্য সিঙ্ক হচ্ছে না মনে হচ্ছে", a: "পেজ রিফ্রেশ করুন, অথবা লগআউট করে আবার লগইন করুন।" },
      { q: "অন্য কোনো সমস্যা", a: "নিচের Help & Support অথবা ইমেইলে যোগাযোগ করুন — আমরা যত দ্রুত সম্ভব সাড়া দেব।" },
    ],
    supportTitle: "সাহায্য ও সহায়তা",
    telegram: "টেলিগ্রাম",
    whatsapp: "হোয়াটসঅ্যাপ",
    phone: "ফোন",
    email: "ইমেইল",
    devTitle: "ডেভেলপার",
    devBy: "তৈরি ও ডিজাইন করেছেন",
    devName: "মো. মনির হোসেন",
    footerRights: "সর্বস্বত্ব সংরক্ষিত।",
    back: "ফিরে যান",
  },
};

function About() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");

  const c = CONTENT[lang];

  return (
    <div className="ab-root">
      <style>{`
        * { box-sizing: border-box; }
        .ab-root {
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          background: var(--bg);
          color: var(--text);
          font-family: system-ui, -apple-system, sans-serif;
          padding: 16px 12px 110px;
        }
        @media (min-width: 640px) { .ab-root { padding: 24px 20px 40px; } }

        .ab-wrap { max-width: 680px; margin: 0 auto; }

        .ab-top-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 18px; gap: 10px;
        }
        .ab-back {
          background: none; border: none; color: #2563EB;
          font-size: 13px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; gap: 4px; padding: 0;
        }
        .ab-lang-btn {
          padding: 8px 14px; border-radius: 999px;
          border: 1px solid var(--border, #E5E7EB);
          background: var(--card, #fff); color: var(--text);
          font-size: 12.5px; font-weight: 700; cursor: pointer;
        }

        .ab-hero {
          text-align: center;
          background: linear-gradient(135deg, #111827 0%, #1E3A8A 100%);
          border-radius: 20px;
          padding: 32px 20px;
          color: #fff;
          margin-bottom: 20px;
        }
        .ab-logo {
          width: 64px; height: 64px; border-radius: 18px; margin: 0 auto 12px;
          background: rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: 800;
        }
        .ab-app-name { font-size: 22px; font-weight: 800; }
        .ab-tagline { font-size: 12.5px; color: #93C5FD; margin-top: 4px; }
        .ab-version { font-size: 11px; color: #93C5FD; margin-top: 10px; opacity: 0.8; }

        .ab-card {
          background: var(--card, #fff);
          border: 1px solid var(--border, #E5E7EB);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          animation: abFadeIn 0.35s ease both;
        }
        @keyframes abFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ab-section-title {
          font-size: 15px; font-weight: 800; color: var(--text);
          margin: 0 0 12px;
        }
        .ab-body-text { font-size: 13.5px; line-height: 1.7; color: var(--text); opacity: 0.85; }

        .ab-step {
          display: flex; gap: 12px; padding: 10px 0;
          border-bottom: 1px solid var(--border, #F3F4F6);
        }
        .ab-step:last-child { border-bottom: none; }
        .ab-step-num {
          width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
          background: #EFF6FF; color: #2563EB; font-weight: 800; font-size: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .ab-step-title { font-size: 13.5px; font-weight: 700; color: var(--text); }
        .ab-step-desc { font-size: 12.5px; opacity: 0.75; margin-top: 2px; line-height: 1.55; }

        .ab-qa { padding: 10px 0; border-bottom: 1px solid var(--border, #F3F4F6); }
        .ab-qa:last-child { border-bottom: none; }
        .ab-qa-q { font-size: 13px; font-weight: 700; color: #DC2626; }
        .ab-qa-a { font-size: 12.5px; opacity: 0.8; margin-top: 3px; line-height: 1.55; }

        .ab-support-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
        }
        .ab-support-link {
          display: flex; align-items: center; gap: 8px;
          padding: 12px; border-radius: 12px;
          border: 1px solid var(--border, #E5E7EB);
          text-decoration: none; color: var(--text);
          font-size: 12.5px; font-weight: 700;
        }

        .ab-dev-row { display: flex; align-items: center; gap: 12px; }
        .ab-dev-avatar {
          width: 46px; height: 46px; border-radius: 50%;
          background: #EFF6FF; color: #2563EB;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 16px; flex-shrink: 0;
        }

        .ab-payments{
  background: var(--card,#fff);
  border:1px solid var(--border,#E5E7EB);
  border-radius:16px;
  padding:18px;
  margin-bottom:16px;
  text-align:center;
}

.ab-payments-title{
  font-size:15px;
  font-weight:800;
  margin-bottom:14px;
}

.ab-payment-list{
  display:flex;
  justify-content:center;
  align-items:center;
  gap:16px;
  flex-wrap:wrap;
}

.ab-payment-item{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:8px;
}

.ab-payment-item img{
  width:52px;
  height:52px;
  object-fit:contain;
}

.ab-payment-item span{
  font-size:11px;
  font-weight:700;
  opacity:.8;
}

.ab-footer {
          text-align: center; padding: 20px 0 6px;
          font-size: 11.5px; opacity: 0.55; line-height: 1.7;
        }
      `}</style>

      <div className="ab-wrap">
        <div className="ab-top-row">
          <button className="ab-back" onClick={() => navigate(-1)}>
            <IoArrowBack /> {c.back}
          </button>
          <button className="ab-lang-btn" onClick={() => setLang(lang === "en" ? "bn" : "en")}>
            {c.langLabel}
          </button>
        </div>

        <div className="ab-hero">
          <div
  className="ab-logo"
  style={{
    background: "#fff",
    color: "#2563EB",
    fontSize: "34px",
    border: "2px solid rgba(255,255,255,.15)",
    boxShadow: "0 10px 25px rgba(0,0,0,.18)",
  }}
>
  🏪
</div>
          <div className="ab-app-name">Smart Halkhata</div>
          <div className="ab-tagline">{c.tagline}</div>
          <div className="ab-version">Version 1.0.0</div>
        </div>

        <div className="ab-card">
          <div className="ab-section-title">{c.aboutTitle}</div>
          <div className="ab-body-text">{c.aboutBody}</div>
        </div>

        <div className="ab-card">
          <div className="ab-section-title">{c.howTitle}</div>
          {c.steps.map((step, i) => (
            <div className="ab-step" key={i}>
              <div className="ab-step-num">{i + 1}</div>
              <div>
                <div className="ab-step-title">{step.title}</div>
                <div className="ab-step-desc">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="ab-card">
          <div className="ab-section-title">{c.notesTitle}</div>
          <div className="ab-body-text">{c.notesBody}</div>
        </div>

        <div className="ab-card">
          <div className="ab-section-title">{c.problemsTitle}</div>
          {c.problems.map((p, i) => (
            <div className="ab-qa" key={i}>
              <div className="ab-qa-q">{p.q}</div>
              <div className="ab-qa-a">{p.a}</div>
            </div>
          ))}
        </div>

        <div className="ab-card">
          <div className="ab-section-title">{c.supportTitle}</div>
          <div className="ab-support-grid">
            <a className="ab-support-link" href="https://t.me/YOUR_TELEGRAM_HERE" target="_blank" rel="noreferrer">
              📨 {c.telegram}
            </a>
            <a className="ab-support-link" href="https://wa.me/YOUR_PHONE_HERE" target="_blank" rel="noreferrer">
              💬 {c.whatsapp}
            </a>
            <a className="ab-support-link" href="tel:YOUR_PHONE_HERE">
              📞 {c.phone}
            </a>
            <a className="ab-support-link" href="mailto:monirhossen978889@gmail.com">
              ✉️ {c.email}
            </a>
          </div>
        </div>

        <div className="ab-card">
          <div className="ab-section-title">{c.devTitle}</div>
          <div className="ab-dev-row">
            <div className="ab-dev-avatar">MH</div>
            <div>
              <div style={{ fontSize: "12px", opacity: 0.7 }}>{c.devBy}</div>
              <div style={{ fontSize: "14.5px", fontWeight: 700 }}>{c.devName}</div>
              <a href="mailto:monirhossen978889@gmail.com" style={{ fontSize: "12px", color: "#2563EB" }}>
                monirhossen978889@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="ab-payments">

<div className="ab-payments-title">
Supported Payment Methods
</div>

<div
  className="ab-payment-list"
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
  }}
>

<div style={{
padding:"10px 16px",
borderRadius:"12px",
background:"#1A73E8",
color:"#fff",
fontWeight:"700"
}}>
VISA
</div>

<div style={{
padding:"10px 16px",
borderRadius:"12px",
background:"#EB001B",
color:"#fff",
fontWeight:"700"
}}>
MasterCard
</div>

<div style={{
padding:"10px 16px",
borderRadius:"12px",
background:"#E2136E",
color:"#fff",
fontWeight:"700"
}}>
bKash
</div>

<div style={{
padding:"10px 16px",
borderRadius:"12px",
background:"#F97316",
color:"#fff",
fontWeight:"700"
}}>
Nagad
</div>

<div style={{
padding:"10px 16px",
borderRadius:"12px",
background:"#F3BA2F",
color:"#111",
fontWeight:"700"
}}>
Binance
</div>

</div>

</div>

<div className="ab-footer">
          Smart Halkhata — Version 1.0.0<br />
          © 2026 Smart Halkhata. {c.footerRights}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

export default About;