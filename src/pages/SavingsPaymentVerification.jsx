import { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  collectionGroup,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";

const OWNER_EMAIL = "monirhossen978889@gmail.com";

function SavingsPaymentVerification() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");

  const isOwner =
    user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  useEffect(() => {
    if (user && isOwner) {
      loadPayments();
    }
  }, [user, isOwner]);

  const loadPayments = async () => {
    setLoadingPayments(true);
    setMessage("");

    try {
      const q = query(
        collectionGroup(db, "savings"),
        where("status", "==", "pending")
      );

      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((item) => ({
        id: item.id,
        ref: item.ref,
        ...item.data(),
      }));

      list.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setPayments(list);
    } catch (error) {
      console.error(error);
      setMessage("Payment list load করতে সমস্যা হয়েছে: " + error.message);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleConfirm = async (payment) => {
    const ok = window.confirm(
      "এই payment confirm করতে চান?"
    );

    if (!ok) return;

    setProcessingId(payment.id);
    setMessage("");

    try {
      await updateDoc(payment.ref, {
        status: "active",
        "payment.status": "confirmed",
        "payment.confirmedAt": serverTimestamp(),
        "payment.confirmedBy": user.email,
        updatedAt: serverTimestamp(),
      });

      setPayments((prev) =>
        prev.filter((item) => item.id !== payment.id)
      );

      setMessage("Payment successfully confirmed.");
    } catch (error) {
      console.error(error);
      setMessage("Confirm করতে সমস্যা হয়েছে: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (payment) => {
    const ok = window.confirm(
      "এই payment reject করতে চান?"
    );

    if (!ok) return;

    setProcessingId(payment.id);
    setMessage("");

    try {
      await updateDoc(payment.ref, {
        status: "rejected",
        "payment.status": "rejected",
        "payment.rejectedAt": serverTimestamp(),
        "payment.rejectedBy": user.email,
        updatedAt: serverTimestamp(),
      });

      setPayments((prev) =>
        prev.filter((item) => item.id !== payment.id)
      );

      setMessage("Payment rejected.");
    } catch (error) {
      console.error(error);
      setMessage("Reject করতে সমস্যা হয়েছে: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "—";

    return timestamp.toDate().toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return <div style={{ padding: 30 }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!isOwner) {
    return <Navigate to="/settings" replace />;
  }

  return (
    <div className="spv-root">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .spv-root {
          min-height: 100vh;
          background: var(--bg);
          padding: 18px 14px 40px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .spv-wrap {
          max-width: 650px;
          margin: 0 auto;
        }

        .spv-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .spv-back {
          width: 40px;
          height: 40px;
          border: 1px solid #E5E7EB;
          background: var(--card);
          border-radius: 11px;
          font-size: 24px;
          cursor: pointer;
          color: var(--text);
        }

        .spv-title {
          margin: 0;
          font-size: 22px;
          color: var(--text);
        }

        .spv-subtitle {
          margin: 3px 0 0;
          font-size: 12px;
          color: #9CA3AF;
        }

        .spv-message {
          padding: 12px 14px;
          border-radius: 10px;
          background: #EFF6FF;
          color: #1D4ED8;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .spv-empty {
          background: var(--card);
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 35px 20px;
          text-align: center;
          color: #6B7280;
        }

        .spv-empty-icon {
          font-size: 38px;
          margin-bottom: 10px;
        }

        .spv-card {
          background: var(--card);
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 16px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.04);
        }

        .spv-status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 999px;
          background: #FEF3C7;
          color: #92400E;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .spv-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .spv-item {
          padding: 10px;
          background: #F9FAFB;
          border-radius: 10px;
        }

        .spv-label {
          font-size: 10px;
          color: #9CA3AF;
          margin-bottom: 3px;
        }

        .spv-value {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          word-break: break-word;
        }

        .spv-payment {
          padding: 12px;
          border-radius: 11px;
          background: #F0FDF4;
          margin-bottom: 15px;
        }

        .spv-payment-title {
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 7px;
        }

        .spv-payment-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 12px;
          margin-top: 5px;
        }

        .spv-actions {
          display: flex;
          gap: 10px;
        }

        .spv-btn {
          flex: 1;
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .spv-confirm {
          background: #16A34A;
          color: white;
        }

        .spv-reject {
          background: #FEE2E2;
          color: #B91C1C;
        }

        .spv-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .spv-info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="spv-wrap">
        <div className="spv-header">
          <button
            className="spv-back"
            onClick={() => navigate("/settings")}
          >
            ‹
          </button>

          <div>
            <h1 className="spv-title">Payment Verification</h1>
            <p className="spv-subtitle">
              Review pending savings payments
            </p>
          </div>
        </div>

        {message && (
          <div className="spv-message">
            {message}
          </div>
        )}

        {loadingPayments ? (
          <div className="spv-empty">
            Loading pending payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="spv-empty">
            <div className="spv-empty-icon">✓</div>
            <div style={{ fontWeight: 800, marginBottom: 5 }}>
              No Pending Payments
            </div>
            <div style={{ fontSize: 12 }}>
              বর্তমানে কোনো payment verification-এর জন্য pending নেই।
            </div>
          </div>
        ) : (
          payments.map((payment) => {
            const customer = payment.customer || {};
            const plan = payment.plan || {};
            const pay = payment.payment || {};

            return (
              <div className="spv-card" key={payment.id}>
                <div className="spv-status">
                  PENDING PAYMENT
                </div>

                <div className="spv-info">
                  <div className="spv-item">
                    <div className="spv-label">NID Number</div>
                    <div className="spv-value">
                      {customer.nidNumber || "—"}
                    </div>
                  </div>

                  <div className="spv-item">
                    <div className="spv-label">Phone</div>
                    <div className="spv-value">
                      {customer.phone || "—"}
                    </div>
                  </div>

                  <div className="spv-item">
                    <div className="spv-label">Date of Birth</div>
                    <div className="spv-value">
                      {customer.dateOfBirth || "—"}
                    </div>
                  </div>

                  <div className="spv-item">
                    <div className="spv-label">Bank</div>
                    <div className="spv-value">
                      {plan.bank || "—"} ({plan.interestRate || 0}%)
                    </div>
                  </div>

                  <div className="spv-item">
                    <div className="spv-label">Saving Type</div>
                    <div className="spv-value">
                      {plan.frequency === "daily"
                        ? "Daily"
                        : "Weekly"}
                    </div>
                  </div>

                  <div className="spv-item">
                    <div className="spv-label">Saving Amount</div>
                    <div className="spv-value">
                      ৳{Number(
                        plan.installmentAmount ||
                        plan.weeklyAmount ||
                        plan.dailyAmount ||
                        0
                      ).toLocaleString("en-BD")}
                    </div>
                  </div>
                </div>

                <div className="spv-payment">
                  <div className="spv-payment-title">
                    First Installment Payment
                  </div>

                  <div className="spv-payment-row">
                    <span>Amount</span>
                    <strong>
                      ৳{Number(
                        pay.firstInstallment || 0
                      ).toLocaleString("en-BD")}
                    </strong>
                  </div>

                  <div className="spv-payment-row">
                    <span>Method</span>
                    <strong>{pay.method || "bKash"}</strong>
                  </div>

                  <div className="spv-payment-row">
                    <span>Receiver</span>
                    <strong>
                      {pay.receiverNumber || "01897889723"}
                    </strong>
                  </div>

                  <div className="spv-payment-row">
                    <span>Submitted</span>
                    <strong>
                      {formatDate(
                        pay.submittedAt || payment.createdAt
                      )}
                    </strong>
                  </div>
                </div>

                <div className="spv-actions">
                  <button
                    className="spv-btn spv-reject"
                    disabled={processingId === payment.id}
                    onClick={() => handleReject(payment)}
                  >
                    Reject
                  </button>

                  <button
                    className="spv-btn spv-confirm"
                    disabled={processingId === payment.id}
                    onClick={() => handleConfirm(payment)}
                  >
                    {processingId === payment.id
                      ? "Processing..."
                      : "Confirm Payment"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default SavingsPaymentVerification;