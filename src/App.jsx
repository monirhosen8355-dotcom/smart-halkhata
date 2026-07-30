import React, { useState } from "react";

const SEED_CUSTOMERS = [
  { id: 1, name: "রহিম উদ্দিন", phone: "01711-223344", due: 850, history: [
    { note: "চাল, ডাল", amount: 350, date: "২৮ জুলাই" },
    { note: "সাবান, তেল", amount: 500, date: "২৯ জুলাই" },
  ]},
  { id: 2, name: "সালমা বেগম", phone: "01911-556677", due: 0, history: [] },
  { id: 3, name: "করিম মিয়া", phone: "01611-889900", due: 2100, history: [
    { note: "চিনি, আটা, তেল", amount: 1200, date: "২৫ জুলাই" },
    { note: "সিগারেট", amount: 900, date: "২৯ জুলাই" },
  ]},
  { id: 4, name: "আয়েশা খাতুন", phone: "01511-334455", due: 300, history: [
    { note: "বিস্কুট, চা পাতা", amount: 300, date: "৩০ জুলাই" },
  ]},
];

const SHOP_NAME = "মায়ের দোয়া স্টোর";

function initials(name) {
  return name.trim().split(" ").slice(0, 2).map(w => w[0]).join("");
}

export default function KhataApp() {
  const [customers, setCustomers] = useState(SEED_CUSTOMERS);
  const [selectedId, setSelectedId] = useState(null);
  const [screen, setScreen] = useState("list"); // list | detail | add | notif
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [lastTxn, setLastTxn] = useState(null);
  const [search, setSearch] = useState("");
  const [notifChannels, setNotifChannels] = useState({ app: true, sms: true });

  const selected = customers.find(c => c.id === selectedId);
  const totalDue = customers.reduce((s, c) => s + c.due, 0);

  const filtered = customers.filter(c =>
    c.name.includes(search) || c.phone.includes(search)
  );

  function openCustomer(id) {
    setSelectedId(id);
    setScreen("detail");
  }

  function submitTxn() {
    const amt = parseInt(amount, 10);
    if (!amt || amt <= 0) return;
    const newDue = selected.due + amt;
    const updated = customers.map(c =>
      c.id === selected.id
        ? {
            ...c,
            due: newDue,
            history: [{ note: note || "নতুন কেনাকাটা", amount: amt, date: "আজ" }, ...c.history],
          }
        : c
    );
    setCustomers(updated);
    setLastTxn({ name: selected.name, phone: selected.phone, amt, newDue });
    setScreen("notif");
    setAmount("");
    setNote("");
  }

  return (
    <div style={{
      fontFamily: "'Hind Siliguri','Noto Sans Bengali',system-ui,sans-serif",
      background: "#EDE6D6",
      minHeight: "700px",
      display: "flex",
      justifyContent: "center",
      padding: "24px 12px",
    }}>
      {/* phone frame */}
      <div style={{
        width: 360,
        background: "#F7F2E9",
        borderRadius: 28,
        boxShadow: "0 20px 50px rgba(43,38,32,0.25)",
        overflow: "hidden",
        border: "8px solid #2B2620",
        position: "relative",
      }}>
        {/* status bar */}
        <div style={{
          background: "#1F4D3D",
          color: "#F7F2E9",
          fontSize: 11,
          padding: "6px 16px",
          display: "flex",
          justifyContent: "space-between",
        }}>
          <span>৯:৪১</span>
          <span>খাতা</span>
        </div>

        {/* header */}
        <div style={{
          background: "#1F4D3D",
          color: "#F7F2E9",
          padding: "16px 18px 20px",
          position: "relative",
        }}>
          {/* stitched thread motif */}
          <svg width="100%" height="10" style={{ position: "absolute", bottom: 0, left: 0, opacity: 0.5 }}>
            <line x1="0" y1="5" x2="1000" y2="5" stroke="#B33A3A" strokeWidth="2" strokeDasharray="6,6" />
          </svg>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.5 }}>{SHOP_NAME}</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>বাকি হিসাবের খাতা</div>
            </div>
            <div style={{
              background: "#D9A441",
              color: "#2B2620",
              borderRadius: 10,
              padding: "6px 10px",
              fontSize: 11,
              fontWeight: 700,
              textAlign: "center",
              lineHeight: 1.2,
            }}>
              মোট বাকি<br /><span style={{ fontSize: 15 }}>৳{totalDue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* body */}
        <div style={{ padding: "16px 16px 24px", minHeight: 480 }}>

          {screen === "list" && (
            <>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="নাম বা নম্বর খুঁজুন..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid #d8cdb8",
                  background: "#fff",
                  fontSize: 13,
                  marginBottom: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ fontSize: 12, color: "#7a6f5c", marginBottom: 8, fontWeight: 600 }}>
                গ্রাহক তালিকা ({filtered.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map(c => (
                  <button
                    key={c.id}
                    onClick={() => openCustomer(c.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: "#fff",
                      border: "1px solid #e7ddc8",
                      borderRadius: 14,
                      padding: "10px 12px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "#A8C3B4", color: "#1F4D3D",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 14, flexShrink: 0,
                    }}>
                      {initials(c.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#2B2620" }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "#8a7d68" }}>{c.phone}</div>
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: c.due > 0 ? "#B33A3A" : "#4a8a6a",
                    }}>
                      {c.due > 0 ? `৳${c.due}` : "পরিশোধ"}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {screen === "detail" && selected && (
            <>
              <button onClick={() => setScreen("list")} style={backBtn}>← ফিরে যান</button>
              <div style={{ textAlign: "center", margin: "10px 0 16px" }}>
                <div style={{
                  width: 60, height: 60, borderRadius: "50%", margin: "0 auto 8px",
                  background: "#A8C3B4", color: "#1F4D3D",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 20,
                }}>
                  {initials(selected.name)}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#2B2620" }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: "#8a7d68" }}>{selected.phone}</div>
                <div style={{
                  marginTop: 10, display: "inline-block", background: "#B33A3A",
                  color: "#fff", padding: "6px 16px", borderRadius: 20, fontWeight: 700, fontSize: 14,
                }}>
                  মোট বাকি: ৳{selected.due}
                </div>
              </div>

              <button onClick={() => setScreen("add")} style={primaryBtn}>+ নতুন বাকি যোগ করুন</button>

              <div style={{ fontSize: 12, color: "#7a6f5c", margin: "16px 0 8px", fontWeight: 600 }}>
                লেনদেনের ইতিহাস
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selected.history.length === 0 && (
                  <div style={{ fontSize: 12, color: "#a89c85", textAlign: "center", padding: 12 }}>
                    কোনো লেনদেন নেই
                  </div>
                )}
                {selected.history.map((h, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between",
                    background: "#fff", border: "1px solid #e7ddc8", borderRadius: 10, padding: "8px 12px",
                  }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#2B2620" }}>{h.note}</div>
                      <div style={{ fontSize: 10, color: "#a89c85" }}>{h.date}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#B33A3A" }}>+৳{h.amount}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {screen === "add" && selected && (
            <>
              <button onClick={() => setScreen("detail")} style={backBtn}>← ফিরে যান</button>
              <div style={{ fontWeight: 700, fontSize: 15, margin: "12px 0 4px", color: "#2B2620" }}>
                {selected.name} — নতুন বাকি
              </div>
              <div style={{ fontSize: 11, color: "#8a7d68", marginBottom: 14 }}>
                বর্তমান বাকি: ৳{selected.due}
              </div>

              <label style={label}>টাকার পরিমাণ</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="৳ 0"
                style={input}
              />

              <label style={label}>কী কিনলো (নোট)</label>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="যেমনঃ চাল, তেল, সাবান"
                style={input}
              />

              <div style={{ fontSize: 12, color: "#7a6f5c", margin: "14px 0 6px", fontWeight: 600 }}>
                নোটিফিকেশন পাঠান
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <label style={checkChip}>
                  <input type="checkbox" checked={notifChannels.app}
                    onChange={() => setNotifChannels(s => ({ ...s, app: !s.app }))} />
                  &nbsp;অ্যাপে
                </label>
                <label style={checkChip}>
                  <input type="checkbox" checked={notifChannels.sms}
                    onChange={() => setNotifChannels(s => ({ ...s, sms: !s.sms }))} />
                  &nbsp;SMS
                </label>
              </div>

              <button onClick={submitTxn} disabled={!amount} style={{
                ...primaryBtn,
                opacity: amount ? 1 : 0.5,
                cursor: amount ? "pointer" : "not-allowed",
              }}>
                লেনদেন সংরক্ষণ করুন
              </button>
            </>
          )}

          {screen === "notif" && lastTxn && (
            <>
              <div style={{ textAlign: "center", margin: "8px 0 18px" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", margin: "0 auto 8px",
                  background: "#4a8a6a", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>✓</div>
                <div style={{ fontWeight: 700, color: "#2B2620" }}>লেনদেন সংরক্ষণ হয়েছে</div>
              </div>

              {notifChannels.app && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: "#7a6f5c", fontWeight: 600, marginBottom: 6 }}>
                    📱 অ্যাপ নোটিফিকেশন (দোকানদার দেখবে)
                  </div>
                  <div style={{
                    background: "#fff", border: "1px solid #e7ddc8", borderRadius: 12,
                    padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <div style={{ fontSize: 18 }}>🔔</div>
                    <div style={{ fontSize: 12.5, color: "#2B2620", lineHeight: 1.5 }}>
                      <b>{lastTxn.name}</b> বাকিতে ৳{lastTxn.amt} নিয়েছে।<br />
                      মোট বাকি এখন: <b style={{ color: "#B33A3A" }}>৳{lastTxn.newDue}</b>
                    </div>
                  </div>
                </div>
              )}

              {notifChannels.sms && (
                <div>
                  <div style={{ fontSize: 11, color: "#7a6f5c", fontWeight: 600, marginBottom: 6 }}>
                    💬 SMS ({lastTxn.phone} নম্বরে যাবে)
                  </div>
                  <div style={{
                    background: "#DCF2E3", borderRadius: "14px 14px 14px 2px",
                    padding: "10px 12px", fontSize: 12.5, color: "#1c3b2c", lineHeight: 1.6,
                  }}>
                    প্রিয় {lastTxn.name}, আপনি {SHOP_NAME} থেকে ৳{lastTxn.amt} টাকার পণ্য বাকিতে
                    নিয়েছেন। আপনার মোট বাকি এখন ৳{lastTxn.newDue}। ধন্যবাদ।
                  </div>
                </div>
              )}

              <button onClick={() => setScreen("list")} style={{ ...primaryBtn, marginTop: 20 }}>
                তালিকায় ফিরে যান
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const backBtn = {
  background: "none", border: "none", color: "#1F4D3D",
  fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0,
};

const primaryBtn = {
  width: "100%", background: "#1F4D3D", color: "#fff", border: "none",
  borderRadius: 12, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer",
};

const label = {
  display: "block", fontSize: 12, color: "#7a6f5c", fontWeight: 600, margin: "10px 0 4px",
};

const input = {
  width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d8cdb8",
  fontSize: 14, boxSizing: "border-box", outline: "none",
};

const checkChip = {
  flex: 1, fontSize: 12, background: "#fff", border: "1px solid #e7ddc8",
  borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", cursor: "pointer",
};