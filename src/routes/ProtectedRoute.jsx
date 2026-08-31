import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  if (!authChecked) {
    return <div style={styles.loadingWrapper}>লোড হচ্ছে...</div>;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
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
};