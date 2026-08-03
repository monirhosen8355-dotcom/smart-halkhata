import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import BottomNavigation from "../components/BottomNavigation";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

function StaffManagement() {
  const { user } = useContext(AuthContext);

  const [staffList, setStaffList] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [editingId, setEditingId] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    if (user) loadStaff();
  }, [user]);

  const loadStaff = async () => {
    const snapshot = await getDocs(collection(db, "shops", user.uid, "staff"));
    setStaffList(
      snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    );
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("staff");
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      alert("Name and email are required");
      return;
    }

    if (editingId) {
      const ref = doc(db, "shops", user.uid, "staff", editingId);
      await updateDoc(ref, {
        name: name.trim(),
        email: email.trim(),
        role,
      });
    } else {
      await addDoc(collection(db, "shops", user.uid, "staff"), {
        name: name.trim(),
        email: email.trim(),
        role,
        active: true,
        createdAt: serverTimestamp(),
      });
    }

    resetForm();
    await loadStaff();
  };

  const handleEdit = (staff) => {
    setEditingId(staff.id);
    setName(staff.name);
    setEmail(staff.email);
    setRole(staff.role);
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm("Delete this staff member?")) return;
    await deleteDoc(doc(db, "shops", user.uid, "staff", staffId));
    await loadStaff();
  };

  const toggleActive = async (staff) => {
    const ref = doc(db, "shops", user.uid, "staff", staff.id);
    await updateDoc(ref, { active: !staff.active });
    await loadStaff();
  };

  if (!user) return <h2 style={{ padding: "30px", fontFamily: "system-ui" }}>Loading...</h2>;

  const cardBase = {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  };

  const inputStyle = {
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const primaryBtn = (bg, color = "#fff") => ({
    padding: "11px 22px",
    borderRadius: "10px",
    border: "none",
    background: bg,
    color,
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  });

  const initials = (staffName) => (staffName || "?").trim().charAt(0).toUpperCase();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "32px 20px 120px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ margin: 0, fontSize: "26px", color: "#111827" }}>
            Staff Management
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6B7280", fontSize: "14px" }}>
  Manage who has access to your shop and their roles
</p>

<div
  style={{
    marginTop: "14px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#FEF3C7",
    color: "#92400E",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
  }}
>
  🚧 Coming Soon
</div>
        </div>

        {/* Add / Edit Staff card */}
        <div style={{ ...cardBase, padding: "24px", marginBottom: "24px" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "16px" }}>
            {editingId ? "✏️ Edit Staff" : "+ Add New Staff"}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <input
              placeholder="Staff Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Staff Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ ...inputStyle, background: "#fff" }}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSave} style={primaryBtn("#2563EB")}>
              {editingId ? "Update Staff" : "Add Staff"}
            </button>
            {editingId && (
              <button onClick={resetForm} style={primaryBtn("#F3F4F6", "#374151")}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Staff List */}
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#6B7280", marginBottom: "14px" }}>
          Staff List
        </div>

        {staffList.length === 0 ? (
          <div
            style={{
              ...cardBase,
              padding: "40px",
              textAlign: "center",
              color: "#9CA3AF",
              fontSize: "14px",
            }}
          >
            No staff members added yet.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {staffList.map((staff) => {
              const isHovered = hoveredCard === staff.id;

              return (
                <div
                  key={staff.id}
                  onMouseEnter={() => setHoveredCard(staff.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    ...cardBase,
                    padding: "20px",
                    boxShadow: isHovered
                      ? "0 12px 24px rgba(0,0,0,0.10)"
                      : "0 2px 6px rgba(0,0,0,0.04)",
                    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: staff.role === "admin" ? "#EEF2FF" : "#EFF6FF",
                        color: staff.role === "admin" ? "#4F46E5" : "#2563EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "18px",
                        flexShrink: 0,
                      }}
                    >
                      {initials(staff.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "15.5px", fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {staff.name}
                      </div>
                      <div style={{ fontSize: "13px", color: "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {staff.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: staff.role === "admin" ? "#EEF2FF" : "#F3F4F6",
                        color: staff.role === "admin" ? "#4F46E5" : "#374151",
                        textTransform: "capitalize",
                      }}
                    >
                      {staff.role}
                    </span>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: staff.active ? "#F0FDF4" : "#FEF2F2",
                        color: staff.active ? "#16A34A" : "#DC2626",
                      }}
                    >
                      {staff.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleEdit(staff)}
                      style={{ ...primaryBtn("#2563EB"), flex: 1, padding: "9px 0" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(staff)}
                      style={{ ...primaryBtn("#F3F4F6", "#374151"), flex: 1, padding: "9px 0" }}
                    >
                      {staff.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(staff.id)}
                      style={{ ...primaryBtn("#fff", "#DC2626"), border: "1px solid #FCA5A5", flex: 1, padding: "9px 0" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
          <BottomNavigation />
    </div>
  );
}

export default StaffManagement;