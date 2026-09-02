import React, { useEffect, useMemo, useState } from "react";import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const BANKS = {
  idlc: {
    name: "IDLC Finance PLC.",
    rate: 8.75,
    recommended: true,
  },
  city: {
    name: "City Bank",
    rate: 8.5,
    recommended: false,
  },
};

const DURATIONS = [
  { days: 90, label: "৩ মাস" },
  { days: 180, label: "৬ মাস" },
  { days: 270, label: "৯ মাস" },
  { days: 365, label: "১২ মাস" },
];

const QUICK_AMOUNTS = [250, 500, 1000, 2000, 5000];

const PAYMENT_METHODS = {
  bKash: {
    name: "bKash",
    receiverNumber: "01897889723",
  },
  Nagad: {
    name: "Nagad",
    receiverNumber: "01897889723",
  },
  Rocket: {
    name: "Rocket",
    receiverNumber: "01897889723",
  },
};
function Savings() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [step, setStep] = useState(1);

  // Personal Information
  const [nidNumber, setNidNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");

  // Bank
  const [selectedBank, setSelectedBank] = useState("idlc");

  // Savings Plan
  const [frequency, setFrequency] = useState("weekly");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState(90);
  const [startDate, setStartDate] = useState("");

  // Payment
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bKash");
const [transactionId, setTransactionId] = useState("");
  const [savingsHistory, setSavingsHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Loading / message
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [message, setMessage] = useState("");

  const bank = BANKS[selectedBank];

  useEffect(() => {
    const loadSavingsHistory = async () => {
      if (!user?.uid) return;

      try {
        setHistoryLoading(true);

        const historyRef = collection(
          db,
          "shops",
          user.uid,
          "savingsHistory"
        );

        const historyQuery = query(
          historyRef,
          orderBy("createdAt", "desc")
        );

        const historySnap = await getDocs(historyQuery);

        setSavingsHistory(
          historySnap.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      } catch (error) {
        console.error("Savings history load error:", error);
        setSavingsHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadSavingsHistory();
  }, [user]);

  /*
   * Savings Calculation
   *
   * Example:
   * Weekly ৳250
   * 90 days = 13 weekly installments
   * Total deposit = 250 × 13 = ৳3,250
   *
   * Interest:
   * Total deposit × bank rate
   *
   * IDLC:
   * 3250 × 8.75% = ৳284.38
   *
   * Total:
   * 3250 + 284.38 = ৳3,534.38
   */
  const calculation = useMemo(() => {
    const installmentAmount = Number(amount) || 0;

    if (installmentAmount <= 0) {
      return {
        installmentAmount: 0,
        installments: 0,
        principal: 0,
        interest: 0,
        total: 0,
      };
    }

    // Daily = প্রতিদিন ১ কিস্তি
    // Weekly = প্রতি ৭ দিনে ১ কিস্তি
    const installments =
      frequency === "daily"
        ? duration
        : Math.ceil(duration / 7);

    const principal =
      installmentAmount * installments;

    // User-এর চাওয়া অনুযায়ী:
    // মোট জমার উপর সরাসরি সুদ
    const interest =
      principal * (bank.rate / 100);

    const total =
      principal + interest;

    return {
      installmentAmount,
      installments,
      principal,
      interest,
      total,
    };
  }, [amount, frequency, duration, bank.rate]);

  const money = (value) =>
    new Intl.NumberFormat("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const handleAmount = (e) => {
    const value = e.target.value;

    if (
      value === "" ||
      /^\d*\.?\d*$/.test(value)
    ) {
      setAmount(value);
    }
  };

  const validatePersonal = () => {
    setMessage("");

    if (!user) {
      setMessage("আগে Login করুন।");
      return false;
    }

    if (!nidNumber.trim()) {
      setMessage("NID Number দিন।");
      return false;
    }

    if (!dateOfBirth) {
      setMessage("জন্ম তারিখ দিন।");
      return false;
    }

    if (!phone.trim()) {
      setMessage("মোবাইল নম্বর দিন।");
      return false;
    }

    return true;
  };

  const validatePlan = () => {
    setMessage("");

    if (!amount || Number(amount) <= 0) {
      setMessage("জমার পরিমাণ দিন।");
      return false;
    }

    if (!duration || duration < 90) {
      setMessage("Savings-এর minimum মেয়াদ 90 দিন।");
      return false;
    }

    if (!startDate) {
      setMessage("Savings শুরু করার তারিখ দিন।");
      return false;
    }

    return true;
  };

  /*
   * STEP 1 → STEP 2
   */
  const goToBank = async () => {
    if (!validatePersonal()) return;

    setMessage("");
    setPageLoading(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    );

    setStep(2);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    await new Promise((resolve) =>
      setTimeout(resolve, 250)
    );

    setPageLoading(false);
  };

  /*
   * STEP 2 → STEP 3
   */
  const goToPlan = async () => {
    setMessage("");

    setPageLoading(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    );

    setStep(3);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    await new Promise((resolve) =>
      setTimeout(resolve, 250)
    );

    setPageLoading(false);
  };

  /*
   * Open Payment Popup
   */
  const openPayment = () => {
    if (!validatePlan()) return;

    setMessage("");
    setTransactionId("");
    setShowPaymentPopup(true);
  };

  /*
   * Submit First Payment
   */
  const submitPayment = async () => {
  setMessage("");

  if (!transactionId.trim()) {
    setMessage(`${paymentMethod} Transaction ID দিন।`);
    return;
  }

  if (!user) {
    setMessage("আগে Login করুন।");
    return;
  }

  const selectedPayment =
    PAYMENT_METHODS[paymentMethod];

  if (!selectedPayment) {
    setMessage("Payment method নির্বাচন করুন।");
    return;
  }

  if (!selectedPayment.receiverNumber) {
    setMessage(
      `${paymentMethod} receiver number এখনো সেট করা হয়নি।`
    );
    return;
  }

  try {
    setSaving(true);

    const nextDueDate = new Date(startDate);

    if (frequency === "daily") {
      nextDueDate.setDate(
        nextDueDate.getDate() + 1
      );
    } else {
      nextDueDate.setDate(
        nextDueDate.getDate() + 7
      );
    }

    const savingsRef = collection(
      db,
      "shops",
      user.uid,
      "savings"
    );

    const savingsDocRef = await addDoc(savingsRef, {
      customer: {
        nidNumber: nidNumber.trim(),
        dateOfBirth,
        phone: phone.trim(),
      },

      plan: {
        bank: bank.name,
        interestRate: bank.rate,
        frequency,

        installmentAmount:
          calculation.installmentAmount,

        durationDays: duration,

        startDate,

        nextDueDate:
          nextDueDate
            .toISOString()
            .split("T")[0],

        totalInstallments:
          calculation.installments,

        totalDeposit:
          calculation.principal,

        estimatedInterest:
          calculation.interest,

        estimatedTotal:
          calculation.total,
      },

      payment: {
        method: selectedPayment.name,

        receiverNumber:
          selectedPayment.receiverNumber,

        firstInstallment:
          calculation.installmentAmount,

        transactionId:
          transactionId.trim(),

        status: "pending",

        submittedAt:
          serverTimestamp(),
      },

      status: "pending",

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    });

    const historyRef = collection(
      db,
      "shops",
      user.uid,
      "savingsHistory"
    );

    const historyDoc = {
      savingsId: savingsDocRef.id,
      customer: {
        nidNumber: nidNumber.trim(),
        dateOfBirth,
        phone: phone.trim(),
      },
      plan: {
        bank: bank.name,
        interestRate: bank.rate,
        frequency,
        installmentAmount: calculation.installmentAmount,
        durationDays: duration,
        startDate,
        totalInstallments: calculation.installments,
        totalDeposit: calculation.principal,
        estimatedInterest: calculation.interest,
        estimatedTotal: calculation.total,
      },
      payment: {
        method: selectedPayment.name,
        receiverNumber: selectedPayment.receiverNumber,
        firstInstallment: calculation.installmentAmount,
        transactionId: transactionId.trim(),
        status: "pending",
      },
      status: "pending",
      historyType: "initial_payment",
      createdAt: serverTimestamp(),
    };

    const historyDocRef = await addDoc(historyRef, historyDoc);

    setSavingsHistory((prev) => [
      {
        id: historyDocRef.id,
        ...historyDoc,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    const text = `Smart Halkhata Savings Payment

Personal Information
NID: ${nidNumber.trim()}
Date of Birth: ${dateOfBirth}
Phone: ${phone.trim()}

Savings Plan
Bank: ${bank.name}
Interest Rate: ${bank.rate}%
Savings Type: ${frequency === "daily" ? "Daily" : "Weekly"}
Installment: ৳${money(calculation.installmentAmount)}
Duration: ${duration} days
Total Installments: ${calculation.installments}
Total Deposit: ৳${money(calculation.principal)}
Estimated Interest: ৳${money(calculation.interest)}
Estimated Total: ৳${money(calculation.total)}

Payment Information
Payment Method: ${selectedPayment.name}
Payment Number: ${selectedPayment.receiverNumber}
Transaction ID: ${transactionId.trim()}

Payment Status: Pending

আমি প্রথম Savings কিস্তির payment করেছি।`;

    const whatsappUrl =
      `https://wa.me/8801897889723?text=` +
      encodeURIComponent(text);

    window.open(whatsappUrl, "_blank");

    setShowPaymentPopup(false);

    setMessage(
      "Payment history-তে save হয়েছে এবং WhatsApp message তৈরি হয়েছে। Send চাপুন।"
    );

    setStep(4);

    setNidNumber("");
    setDateOfBirth("");
    setPhone("");
    setAmount("");
    setStartDate("");
    setTransactionId("");
    setPaymentMethod("bKash");
  } catch (error) {
    console.error(
      "Savings payment error:",
      error
    );

    setMessage(
      error?.message ||
        "Payment submit করা যায়নি। আবার চেষ্টা করুন।"
    );
  } finally {
    setSaving(false);
  }
};
  /*
   * WhatsApp
   */
  const openWhatsApp = () => {
    const selectedPayment = PAYMENT_METHODS[paymentMethod];

    const text = `Smart Halkhata Savings Payment

Personal Information
NID: ${nidNumber.trim()}
Date of Birth: ${dateOfBirth}
Phone: ${phone.trim()}

Savings Plan
Bank: ${bank.name}
Interest Rate: ${bank.rate}%
Savings Type: ${frequency === "daily" ? "Daily" : "Weekly"}
Installment: ৳${money(calculation.installmentAmount)}
Duration: ${duration} days
Total Deposit: ৳${money(calculation.principal)}
Estimated Interest: ৳${money(calculation.interest)}
Estimated Total: ৳${money(calculation.total)}

Payment Information
Payment Method: ${selectedPayment?.name || paymentMethod}
Payment Number: ${selectedPayment?.receiverNumber || ""}
Transaction ID: ${transactionId.trim()}

আমি প্রথম Savings কিস্তির payment করেছি।`;

    const url =
      `https://wa.me/8801897889723?text=` +
      encodeURIComponent(text);

    window.open(url, "_blank");
  };

  return (
    <>
      {/* ================= PAGE LOADER ================= */}

      {pageLoading && (
        <div style={pageLoaderOverlay}>
          <div style={pageLoaderBox}>
            <div style={pageLoaderSpinner}></div>

            <div style={pageLoaderText}>
              Smart Halkhata
            </div>

            <div style={pageLoaderSubText}>
              লোড হচ্ছে...
            </div>
          </div>
        </div>
      )}

      <div style={rootStyle}>
        <div style={containerStyle}>

          {/* ================= HEADER ================= */}

          <div style={headerStyle}>
            <button
              type="button"
              onClick={() => {
                if (
                  step > 1 &&
                  step < 4
                ) {
                  setStep(step - 1);
                  setMessage("");
                } else {
                  navigate("/dashboard");
                }
              }}
              style={backButtonStyle}
              disabled={pageLoading}
            >
              ←
            </button>

            <div>
              <h1 style={titleStyle}>
                Savings
              </h1>

              <p style={subtitleStyle}>
                Personal Savings Plan
              </p>
            </div>
          </div>

          {/* ================= STEPS ================= */}

          {step < 4 && (
            <div style={stepsStyle}>

              <Step
                number="01"
                title="তথ্য"
                active={step === 1}
                done={step > 1}
              />

              <div
                style={{
                  ...stepLine,
                  background:
                    step > 1
                      ? "#2563EB"
                      : "#D1D5DB",
                }}
              />

              <Step
                number="02"
                title="প্রতিষ্ঠান"
                active={step === 2}
                done={step > 2}
              />

              <div
                style={{
                  ...stepLine,
                  background:
                    step > 2
                      ? "#2563EB"
                      : "#D1D5DB",
                }}
              />

              <Step
                number="03"
                title="Savings"
                active={step === 3}
                done={false}
              />

            </div>
          )}

          {/* ================= STEP 1 ================= */}

          {step === 1 && (
            <section style={sectionStyle}>

              <SectionTitle
                number="01"
                title="ব্যক্তিগত তথ্য"
              />

              <Input
                label="NID Number"
                value={nidNumber}
                onChange={setNidNumber}
                placeholder="NID Number"
                inputMode="numeric"
              />

              <Input
                label="জন্ম তারিখ"
                type="date"
                value={dateOfBirth}
                onChange={setDateOfBirth}
              />

              <Input
                label="মোবাইল নম্বর"
                value={phone}
                onChange={setPhone}
                placeholder="01XXXXXXXXX"
                inputMode="tel"
              />

              {message && (
                <Message text={message} />
              )}

              <BottomButton
                text="এগিয়ে যান"
                onClick={goToBank}
                disabled={pageLoading}
              />

            </section>
          )}

          {/* ================= STEP 2 ================= */}

          {step === 2 && (
            <section style={sectionStyle}>

              <SectionTitle
                number="02"
                title="Savings প্রতিষ্ঠান বাছাই করুন"
              />

              <p style={infoText}>
                আপনার Savings-এর জন্য প্রতিষ্ঠান নির্বাচন করুন।
              </p>

              {Object.entries(BANKS).map(
                ([key, item]) => {
                  const active =
                    selectedBank === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setSelectedBank(key)
                      }
                      style={{
                        ...bankCard,
                        border: active
                          ? "2px solid #2563EB"
                          : "1px solid #E5E7EB",
                        background: active
                          ? "#EFF6FF"
                          : "var(--card, #fff)",
                      }}
                    >

                      {item.recommended && (
                        <span style={recommended}>
                          RECOMMENDED
                        </span>
                      )}

                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: 900,
                          color:
                            "var(--text, #111827)",
                        }}
                      >
                        {item.name}
                      </div>

                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "14px",
                          fontWeight: 800,
                          color: "#2563EB",
                        }}
                      >
                        সুদের হার {item.rate}%
                      </div>

                    </button>
                  );
                }
              )}

              {message && (
                <Message text={message} />
              )}

              <BottomButton
                text="এগিয়ে যান"
                onClick={goToPlan}
                disabled={pageLoading}
              />

            </section>
          )}

          {/* ================= STEP 3 ================= */}

          {step === 3 && (
            <>
              <section style={sectionStyle}>

                <SectionTitle
                  number="03"
                  title="Savings Plan"
                />

                {/* FREQUENCY */}

                <label style={labelStyle}>
                  Savings-এর ধরন
                </label>

                <div style={twoColumn}>

                  <button
                    type="button"
                    onClick={() =>
                      setFrequency("daily")
                    }
                    style={frequencyButton(
                      frequency === "daily"
                    )}
                  >
                    দৈনিক
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFrequency("weekly")
                    }
                    style={frequencyButton(
                      frequency === "weekly"
                    )}
                  >
                    সাপ্তাহিক
                  </button>

                </div>

                {/* AMOUNT */}

                <label
                  style={{
                    ...labelStyle,
                    marginTop: "18px",
                  }}
                >
                  প্রতি কিস্তিতে কত টাকা জমাবেন?
                </label>

                <div style={quickAmountWrap}>

                  {QUICK_AMOUNTS.map(
                    (quickAmount) => (
                      <button
                        key={quickAmount}
                        type="button"
                        onClick={() =>
                          setAmount(
                            String(quickAmount)
                          )
                        }
                        style={{
                          ...quickAmountButton,
                          border:
                            Number(amount) ===
                            quickAmount
                              ? "2px solid #2563EB"
                              : "1px solid #D1D5DB",
                          color:
                            Number(amount) ===
                            quickAmount
                              ? "#2563EB"
                              : "var(--text, #374151)",
                        }}
                      >
                        ৳
                        {quickAmount.toLocaleString()}
                      </button>
                    )
                  )}

                </div>

                <div style={moneyInputWrap}>
                  <span style={moneyIcon}>
                    ৳
                  </span>

                  <input
                    value={amount}
                    onChange={handleAmount}
                    inputMode="decimal"
                    placeholder="নিজের amount লিখুন"
                    style={{
                      ...inputStyle,
                      paddingLeft: "40px",
                    }}
                  />
                </div>

                {/* DURATION */}

                <label
                  style={{
                    ...labelStyle,
                    marginTop: "18px",
                  }}
                >
                  Savings-এর মেয়াদ
                </label>

                <div style={durationGrid}>

                  {DURATIONS.map((item) => {
                    const active =
                      duration === item.days;

                    return (
                      <button
                        key={item.days}
                        type="button"
                        onClick={() =>
                          setDuration(item.days)
                        }
                        style={{
                          ...durationButton,
                          border: active
                            ? "2px solid #2563EB"
                            : "1px solid #D1D5DB",
                          background: active
                            ? "#EFF6FF"
                            : "var(--card, #fff)",
                          color: active
                            ? "#2563EB"
                            : "var(--text, #374151)",
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}

                </div>

                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "11px",
                    color: "#6B7280",
                  }}
                >
                  Minimum Savings মেয়াদ: 90 দিন
                </div>

                <Input
                  label="Savings শুরু করার তারিখ"
                  type="date"
                  value={startDate}
                  onChange={setStartDate}
                />

              </section>

              {/* ================= CALCULATION ================= */}

              <section style={sectionStyle}>

                <SectionTitle
                  number="04"
                  title="Savings হিসাব"
                />

                <div style={calculationBox}>

                  <CalcRow
                    label="প্রতিষ্ঠান"
                    value={bank.name}
                  />

                  <CalcRow
                    label="সুদের হার"
                    value={`${bank.rate}%`}
                  />

                  <CalcRow
                    label={
                      frequency === "daily"
                        ? "দৈনিক জমা"
                        : "সাপ্তাহিক জমা"
                    }
                    value={`৳ ${money(
                      calculation.installmentAmount
                    )}`}
                  />

                  <CalcRow
                    label="মোট কিস্তি"
                    value={
                      calculation.installments
                    }
                  />

                  <CalcRow
                    label="মেয়াদ"
                    value={`${duration} দিন`}
                  />

                  <CalcRow
                    label="মোট জমা"
                    value={`৳ ${money(
                      calculation.principal
                    )}`}
                  />

                  <div style={divider} />

                  <CalcRow
                    label="আনুমানিক সুদ"
                    value={`৳ ${money(
                      calculation.interest
                    )}`}
                  />

                  <div style={totalBox}>

                    <div
                      style={{
                        fontSize: "12px",
                        opacity: 0.85,
                      }}
                    >
                      মেয়াদ শেষে মোট
                    </div>

                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: 950,
                        marginTop: "4px",
                      }}
                    >
                      ৳ {money(
                        calculation.total
                      )}
                    </div>

                  </div>

                </div>

                {message && (
                  <Message text={message} />
                )}

                <BottomButton
                  text="প্রথম কিস্তির Payment দিন"
                  onClick={openPayment}
                  disabled={pageLoading}
                />

              </section>
            </>
          )}

          {/* ================= SUCCESS ================= */}

          {step === 4 && (
            <section
              style={{
                ...sectionStyle,
                textAlign: "center",
                padding: "35px 20px",
              }}
            >

              <div style={successIcon}>
                ✓
              </div>

              <h2
                style={{
                  margin: "18px 0 8px",
                  color:
                    "var(--text, #111827)",
                }}
              >
                Payment Submitted
              </h2>

              <p
                style={{
                  color: "#6B7280",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                আপনার প্রথম Savings কিস্তির
                payment pending আছে।
                Payment verification হওয়ার পর
                Savings active হবে।
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard")
                }
                style={{
                  ...bottomButtonStyle,
                  marginTop: "20px",
                  justifyContent: "center",
                }}
              >
                Dashboard-এ যান →
              </button>

            </section>
          )}

          {/* ================= SAVINGS HISTORY ================= */}
          {user && (
            <section style={sectionStyle}>
              <SectionTitle
                number="05"
                title="Savings History"
              />

              {historyLoading ? (
                <div
                  style={{
                    padding: "18px 0",
                    textAlign: "center",
                    color: "#6B7280",
                    fontSize: "13px",
                  }}
                >
                  History লোড হচ্ছে...
                </div>
              ) : savingsHistory.length === 0 ? (
                <div
                  style={{
                    padding: "18px 0",
                    textAlign: "center",
                    color: "#9CA3AF",
                    fontSize: "13px",
                  }}
                >
                  এখনো কোনো Savings payment history নেই।
                </div>
              ) : (
                savingsHistory.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "15px",
                      marginBottom: "12px",
                      borderRadius: "15px",
                      background: "var(--bg, #f8fafc)",
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <strong style={{ fontSize: "14px" }}>
                        {item.payment?.method || "Payment"}
                      </strong>

                      <span
                        style={{
                          padding: "5px 9px",
                          borderRadius: "999px",
                          background:
                            item.payment?.status === "confirmed"
                              ? "#DCFCE7"
                              : item.payment?.status === "rejected"
                              ? "#FEE2E2"
                              : "#FEF3C7",
                          color:
                            item.payment?.status === "confirmed"
                              ? "#15803D"
                              : item.payment?.status === "rejected"
                              ? "#B91C1C"
                              : "#92400E",
                          fontSize: "10px",
                          fontWeight: 900,
                        }}
                      >
                        {item.payment?.status || item.status || "pending"}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "12.5px",
                        lineHeight: 1.8,
                        color: "var(--text, #374151)",
                      }}
                    >
                      <div><strong>Transaction ID:</strong> {item.payment?.transactionId || "—"}</div>
                      <div><strong>Bank:</strong> {item.plan?.bank || "—"}</div>
                      <div><strong>Savings Type:</strong> {item.plan?.frequency === "daily" ? "Daily" : "Weekly"}</div>
                      <div><strong>Installment:</strong> ৳ {money(item.plan?.installmentAmount)}</div>
                      <div><strong>Total Deposit:</strong> ৳ {money(item.plan?.totalDeposit)}</div>
                      <div><strong>Estimated Interest:</strong> ৳ {money(item.plan?.estimatedInterest)}</div>
                      <div><strong>Estimated Total:</strong> ৳ {money(item.plan?.estimatedTotal)}</div>
                    </div>
                  </div>
                ))
              )}
            </section>
          )}

        </div>

       {/* ================= PAYMENT POPUP ================= */}

{showPaymentPopup && (
  <div style={overlayStyle}>
    <div style={paymentPopup}>

      <button
        type="button"
        onClick={() =>
          setShowPaymentPopup(false)
        }
        style={closeButton}
      >
        ×
      </button>

      <div
        style={{
          fontSize: "20px",
          fontWeight: 900,
          marginBottom: "6px",
        }}
      >
        প্রথম কিস্তির Payment
      </div>

      <div
        style={{
          fontSize: "13px",
          color: "#6B7280",
          marginBottom: "18px",
        }}
      >
        Savings চালু করার জন্য প্রথম
        কিস্তি আগে payment করতে হবে।
      </div>

      {/* PAYMENT METHOD */}

      <div
        style={{
          fontSize: "13px",
          fontWeight: 800,
          marginBottom: "9px",
        }}
      >
        Payment Method নির্বাচন করুন
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, 1fr)",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        {Object.values(PAYMENT_METHODS).map(
          (method) => {
            const active =
              paymentMethod === method.name;

            return (
              <button
                key={method.name}
                type="button"
                onClick={() =>
                  setPaymentMethod(
                    method.name
                  )
                }
                style={{
                  padding: "13px 8px",
                  borderRadius: "12px",
                  border: active
                    ? "2px solid #2563EB"
                    : "1px solid #D1D5DB",
                  background: active
                    ? "#EFF6FF"
                    : "var(--card, #fff)",
                  color: active
                    ? "#2563EB"
                    : "var(--text, #374151)",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {method.name}
              </button>
            );
          }
        )}
      </div>

      {/* SELECTED PAYMENT DETAILS */}

      <div
        style={{
          background:
            paymentMethod === "bKash"
              ? "#FFF0F6"
              : "#F8FAFC",
          border:
            paymentMethod === "bKash"
              ? "1px solid #F9A8D4"
              : "1px solid #E5E7EB",
          borderRadius: "17px",
          padding: "17px",
          textAlign: "center",
        }}
      >

        <div
          style={{
            fontSize: "12px",
            color: "#6B7280",
          }}
        >
          {paymentMethod} Payment Number
        </div>

        <div
          style={{
            fontSize: "25px",
            fontWeight: 950,
            color:
              paymentMethod === "bKash"
                ? "#E2136E"
                : "#111827",
            marginTop: "4px",
          }}
        >
          {PAYMENT_METHODS[paymentMethod]
            ?.receiverNumber ||
            "Receiver number সেট করা হয়নি"}
        </div>

        <div
          style={{
            marginTop: "10px",
            fontSize: "14px",
            fontWeight: 800,
          }}
        >
          প্রথম কিস্তি: ৳{" "}
          {money(
            calculation.installmentAmount
          )}
        </div>

        <div
          style={{
            marginTop: "5px",
            fontSize: "13px",
            color: "#374151",
          }}
        >
          মোট Savings: ৳{" "}
          {money(
            calculation.principal
          )}
        </div>

      </div>

      <button
        type="button"
        onClick={openWhatsApp}
        style={whatsappButton}
      >
        WhatsApp-এ Payment তথ্য পাঠান
      </button>

      <div
        style={{
          marginTop: "15px",
          fontSize: "12px",
          color: "#6B7280",
          lineHeight: 1.6,
        }}
      >
        উপরের {paymentMethod} নম্বরে টাকা Send
        করার পর Transaction ID এখানে দিন।
      </div>

      <input
        value={transactionId}
        onChange={(e) =>
          setTransactionId(
            e.target.value
          )
        }
        placeholder={`${paymentMethod} Transaction ID`}
        style={{
          ...inputStyle,
          marginTop: "12px",
        }}
      />

      {message && (
        <Message text={message} />
      )}

      <button
        type="button"
        onClick={submitPayment}
        disabled={saving}
        style={{
          ...bottomButtonStyle,
          marginTop: "15px",
          justifyContent: "center",
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving
          ? "Submit হচ্ছে..."
          : "Payment Submit করুন →"}
      </button>

    </div>
  </div>
)}
      </div>
    </>
  );
}

/* ================= COMPONENTS ================= */

function Step({
  number,
  title,
  active,
  done,
}) {
  return (
    <div style={stepItem}>

      <div
        style={{
          ...stepCircle,
          background:
            active || done
              ? "#2563EB"
              : "var(--card, #fff)",
          color:
            active || done
              ? "#fff"
              : "#6B7280",
        }}
      >
        {done ? "✓" : number}
      </div>

      <div
        style={{
          fontSize: "11px",
          fontWeight: 800,
          color:
            active
              ? "#2563EB"
              : "var(--text, #374151)",
        }}
      >
        {title}
      </div>

    </div>
  );
}

function SectionTitle({
  number,
  title,
}) {
  return (
    <div style={sectionTitle}>

      <div style={sectionNumber}>
        {number}
      </div>

      <h2 style={sectionHeading}>
        {title}
      </h2>

    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}) {
  return (
    <div
      style={{
        marginBottom: "14px",
      }}
    >

      <label style={labelStyle}>
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        inputMode={inputMode}
        style={inputStyle}
      />

    </div>
  );
}

function CalcRow({
  label,
  value,
}) {
  return (
    <div style={resultRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Message({ text }) {
  const success =
    text.includes("সফল") ||
    text.includes("Submitted");

  return (
    <div
      style={{
        marginTop: "14px",
        padding: "12px 14px",
        borderRadius: "12px",
        background: success
          ? "#F0FDF4"
          : "#FEF2F2",
        color: success
          ? "#15803D"
          : "#B91C1C",
        border: success
          ? "1px solid #BBF7D0"
          : "1px solid #FECACA",
        fontSize: "13px",
        fontWeight: 700,
        lineHeight: 1.5,
      }}
    >
      {text}
    </div>
  );
}

function BottomButton({
  text,
  onClick,
  disabled = false,
}) {
  const [buttonLoading, setButtonLoading] =
    useState(false);

  const handleClick = async () => {
    if (
      buttonLoading ||
      disabled
    ) {
      return;
    }

    setButtonLoading(true);

    try {
      await onClick?.();
    } catch (error) {
      console.error(error);
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={
        buttonLoading || disabled
      }
      style={{
        ...bottomButtonStyle,
        opacity:
          buttonLoading || disabled
            ? 0.75
            : 1,
        cursor:
          buttonLoading || disabled
            ? "wait"
            : "pointer",
      }}
    >
      {text}

      <span
        style={{
          fontSize: "22px",
          lineHeight: 1,
        }}
      >
        →
      </span>
    </button>
  );
}

/* ================= STYLES ================= */

const rootStyle = {
  minHeight: "100vh",
  background: "var(--bg, #f8fafc)",
  padding: "20px 15px 100px",
  boxSizing: "border-box",
  fontFamily: "system-ui, sans-serif",
};

const containerStyle = {
  width: "100%",
  maxWidth: "620px",
  margin: "0 auto",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "18px",
};

const backButtonStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "13px",
  border:
    "1px solid var(--border, #e5e7eb)",
  background:
    "var(--card, #fff)",
  color:
    "var(--text, #111827)",
  fontSize: "22px",
  cursor: "pointer",
};

const titleStyle = {
  margin: 0,
  fontSize: "24px",
  fontWeight: 900,
  color:
    "var(--text, #111827)",
};

const subtitleStyle = {
  margin: "3px 0 0",
  fontSize: "13px",
  color: "#6B7280",
};

const stepsStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "20px",
};

const stepItem = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "5px",
  minWidth: "62px",
};

const stepCircle = {
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "11px",
  fontWeight: 900,
  border:
    "2px solid #2563EB",
};

const stepLine = {
  height: "3px",
  flex: 1,
  marginBottom: "18px",
};

const sectionStyle = {
  background:
    "var(--card, #fff)",
  border:
    "1px solid var(--border, #e5e7eb)",
  borderRadius: "21px",
  padding: "19px",
  marginBottom: "15px",
  boxShadow:
    "0 8px 25px rgba(0,0,0,0.05)",
};

const sectionTitle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "18px",
};

const sectionNumber = {
  width: "30px",
  height: "30px",
  borderRadius: "10px",
  background: "#EFF6FF",
  color: "#2563EB",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "11px",
  fontWeight: 900,
};

const sectionHeading = {
  margin: 0,
  fontSize: "17px",
  fontWeight: 900,
  color:
    "var(--text, #111827)",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "13px",
  fontWeight: 800,
  color:
    "var(--text, #374151)",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 15px",
  borderRadius: "13px",
  border:
    "1px solid #D1D5DB",
  background:
    "var(--bg, #f9fafb)",
  color:
    "var(--text, #111827)",
  fontSize: "15px",
  fontWeight: 600,
  outline: "none",
};

const infoText = {
  marginTop: "-8px",
  marginBottom: "15px",
  fontSize: "13px",
  color: "#6B7280",
};

const bankCard = {
  width: "100%",
  position: "relative",
  textAlign: "left",
  padding: "18px",
  borderRadius: "17px",
  marginBottom: "12px",
  cursor: "pointer",
};

const recommended = {
  position: "absolute",
  top: "-8px",
  right: "10px",
  background: "#16A34A",
  color: "#fff",
  padding: "4px 8px",
  borderRadius: "20px",
  fontSize: "9px",
  fontWeight: 900,
};

const twoColumn = {
  display: "grid",
  gridTemplateColumns:
    "1fr 1fr",
  gap: "10px",
};

const frequencyButton = (
  active
) => ({
  padding: "14px",
  borderRadius: "13px",
  border: active
    ? "2px solid #2563EB"
    : "1px solid #D1D5DB",
  background: active
    ? "#EFF6FF"
    : "var(--card, #fff)",
  color: active
    ? "#2563EB"
    : "var(--text, #374151)",
  fontWeight: 900,
  cursor: "pointer",
});

const quickAmountWrap = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginBottom: "12px",
};

const quickAmountButton = {
  padding: "9px 13px",
  borderRadius: "10px",
  background:
    "var(--card, #fff)",
  fontWeight: 800,
  cursor: "pointer",
};

const moneyInputWrap = {
  position: "relative",
};

const moneyIcon = {
  position: "absolute",
  left: "15px",
  top: "50%",
  transform:
    "translateY(-50%)",
  fontSize: "20px",
  fontWeight: 900,
  color: "#2563EB",
};

const durationGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, 1fr)",
  gap: "8px",
  marginBottom: "13px",
};

const durationButton = {
  padding: "12px 5px",
  borderRadius: "11px",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: "12px",
};

const calculationBox = {
  background:
    "linear-gradient(135deg, #2563EB, #7C3AED)",
  borderRadius: "20px",
  padding: "20px",
  color: "#fff",
};

const resultRow = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  gap: "15px",
  padding: "7px 0",
  fontSize: "13px",
};

const divider = {
  height: "1px",
  background:
    "rgba(255,255,255,0.2)",
  margin: "12px 0",
};

const totalBox = {
  marginTop: "12px",
  padding: "15px",
  borderRadius: "15px",
  background:
    "rgba(255,255,255,0.14)",
  textAlign: "center",
};

const bottomButtonStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent:
    "space-between",
  marginTop: "16px",
  padding: "16px 18px",
  border: "none",
  borderRadius: "16px",
  background:
    "linear-gradient(135deg, #2563EB, #7C3AED)",
  color: "#fff",
  fontSize: "16px",
  fontWeight: 900,
  cursor: "pointer",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(0,0,0,0.58)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "18px",
  zIndex: 9999,
};

const paymentPopup = {
  position: "relative",
  width: "100%",
  maxWidth: "470px",
  maxHeight: "90vh",
  overflowY: "auto",
  background:
    "var(--card, #fff)",
  borderRadius: "22px",
  padding: "22px",
  boxSizing: "border-box",
};

const closeButton = {
  position: "absolute",
  top: "10px",
  right: "12px",
  width: "34px",
  height: "34px",
  border: "none",
  borderRadius: "50%",
  background: "#F3F4F6",
  fontSize: "24px",
  cursor: "pointer",
};

const bkashBox = {
  background: "#FFF0F6",
  border:
    "1px solid #F9A8D4",
  borderRadius: "17px",
  padding: "17px",
  textAlign: "center",
};

const whatsappButton = {
  width: "100%",
  marginTop: "12px",
  padding: "13px",
  border: "none",
  borderRadius: "13px",
  background: "#16A34A",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 900,
  cursor: "pointer",
};

const successIcon = {
  width: "65px",
  height: "65px",
  margin: "0 auto",
  borderRadius: "50%",
  background: "#DCFCE7",
  color: "#16A34A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "35px",
  fontWeight: 900,
};

/* ================= SMART HALKHATA PAGE LOADER ================= */

const pageLoaderOverlay = {
  position: "fixed",
  inset: 0,
  zIndex: 99999,
  background:
    "rgba(255,255,255,0.65)",
  backdropFilter:
    "blur(8px)",
  WebkitBackdropFilter:
    "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const pageLoaderBox = {
  background:
    "var(--card, #fff)",
  padding: "28px 36px",
  borderRadius: "22px",
  boxShadow:
    "0 15px 45px rgba(0,0,0,0.15)",
  textAlign: "center",
  minWidth: "190px",
};

const pageLoaderSpinner = {
  width: "42px",
  height: "42px",
  margin: "0 auto 14px",
  border:
    "4px solid #E5E7EB",
  borderTop:
    "4px solid #2563EB",
  borderRight:
    "4px solid #7C3AED",
  borderRadius: "50%",
  animation:
    "smartHalkhataSpin 0.8s linear infinite",
};

const pageLoaderText = {
  fontSize: "20px",
  fontWeight: 950,
  color: "#2563EB",
  letterSpacing: "-0.3px",
};

const pageLoaderSubText = {
  marginTop: "5px",
  fontSize: "12px",
  color: "#6B7280",
};

if (
  typeof document !==
  "undefined"
) {
  if (
    !document.head.querySelector(
      "#smart-halkhata-loader-style"
    )
  ) {
    const style =
      document.createElement(
        "style"
      );

    style.id =
      "smart-halkhata-loader-style";

    style.innerHTML = `
      @keyframes smartHalkhataSpin {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }
}

export default Savings;