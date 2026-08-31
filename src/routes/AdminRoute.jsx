import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function AdminRoute({ children }) {
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setIsAdmin(false);
        setChecked(true);
        return;
      }

      try {
        // forceRefresh: true — যাতে সদ্য বসানো admin claim পুরনো cached
        // token-এর কারণে miss না হয়
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        setIsAdmin(tokenResult.claims && tokenResult.claims.admin === true);
      } catch (err) {
        console.error("Admin claim check failed:", err);
        setIsAdmin(false);
      } finally {
        setChecked(true);
      }
    });

    return unsubscribe;
  }, []);

  if (!checked) {
    return <div style={styles.loadingWrapper}>লোড হচ্ছে...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div style={styles.deniedWrapper}>
        <div style={styles.deniedTitle}>অ্যাক্সেস নেই</div>
        <p style={styles.deniedText}>
          এই একাউন্টের Admin অনুমতি নেই। ভুল একাউন্টে লগইন করলে সঠিক একাউন্ট দিয়ে
          আবার চেষ্টা করুন।
        </p>
      </div>
    );
  }

  return children;
}

const styles = {
  loadingWrapper: {
    padding: "40px 16px",
    textAlign: "center",
    color: "#64748B",
    fontSize: "14px",
  },
  deniedWrapper: {
    padding: "40px 20px",
    textAlign: "center",
  },
  deniedTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#DC2626",
    marginBottom: "8px",
  },
  deniedText: {
    fontSize: "13px",
    color: "#64748B",
    lineHeight: 1.6,
  },
};