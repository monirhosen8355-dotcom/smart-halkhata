import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect } from "react";

function Dashboard() {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
  if (!user) return;

  const createShop = async () => {
    const shopRef = doc(db, "shops", user.uid);

    const shopSnap = await getDoc(shopRef);

    if (!shopSnap.exists()) {
      await setDoc(shopRef, {
        ownerEmail: user.email,
        createdAt: new Date(),
      });

      console.log("Shop Created");
    }
  };

  createShop();
}, [user]);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Smart Halkhata Dashboard</h1>

      <h3>Welcome</h3>

      <p>{user.email}</p>

      <div style={{ display: "flex", gap: "10px" }}>
  <button onClick={() => navigate("/customers")}>
    Customers
  </button>

  <button onClick={logout}>
    Logout
  </button>
</div>
    </div>
  );
}

export default Dashboard;