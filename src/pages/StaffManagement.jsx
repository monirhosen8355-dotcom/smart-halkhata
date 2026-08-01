import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
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

  if (!user) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: "30px" }}>
      <h1>Staff Management</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Staff Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br /><br />

        <input
          placeholder="Staff Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        <br /><br />

        <button onClick={handleSave}>
          {editingId ? "Update Staff" : "Add Staff"}
        </button>{" "}
        {editingId && <button onClick={resetForm}>Cancel</button>}
      </div>

      <hr />

      <h2>Staff List</h2>
      {staffList.map((staff) => (
        <div
          key={staff.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginTop: "10px",
          }}
        >
          <h3>{staff.name} — {staff.role}</h3>
          <p>{staff.email}</p>
          <p>Status: {staff.active ? "Active" : "Inactive"}</p>

          <button onClick={() => handleEdit(staff)}>Edit</button>{" "}
          <button onClick={() => toggleActive(staff)}>
            {staff.active ? "Deactivate" : "Activate"}
          </button>{" "}
          <button onClick={() => handleDelete(staff.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default StaffManagement;