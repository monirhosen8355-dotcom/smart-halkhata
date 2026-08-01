import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { logActivity } from "../utils/logActivity";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";


function Customers() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const { user } = useContext(AuthContext);
 const [customers, setCustomers] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [filterStatus, setFilterStatus] = useState("all");
const [sortOrder, setSortOrder] = useState("newest");
const [reminders, setReminders] = useState([]);
const navigate = useNavigate();

  useEffect(() => {
  if (!user) return;

  loadCustomers();
}, [user]);

const loadCustomers = async () => {
  if (!user) return;

  const snapshot = await getDocs(
    collection(db, "shops", user.uid, "customers")
  );

  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  setCustomers(data);

  await syncReminders(data);
};

const syncReminders = async (customerList) => {
  const dueCustomers = customerList.filter((c) => Number(c.due) > 0);

  const existingSnap = await getDocs(
    collection(db, "shops", user.uid, "notifications")
  );

  const existingMap = {};

  existingSnap.docs.forEach((d) => {
    existingMap[d.id] = { id: d.id, ...d.data() };
  });

  for (const customer of dueCustomers) {
    const reminderRef = doc(
      db,
      "shops",
      user.uid,
      "notifications",
      customer.id
    );

    if (!existingMap[customer.id]) {
      await setDoc(reminderRef, {
        customerId: customer.id,
        customerName: customer.name,
        due: customer.due,
        read: false,
        createdAt: new Date().toISOString(),
      });
    } else if (existingMap[customer.id].due !== customer.due) {
      await updateDoc(reminderRef, {
        due: customer.due,
        read: false,
      });
    }
  }

  const freshSnap = await getDocs(
    collection(db, "shops", user.uid, "notifications")
  );

  setReminders(
    freshSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((r) => r.due > 0)
  );
};

const markReminderRead = async (customerId) => {
  const reminderRef = doc(
    db,
    "shops",
    user.uid,
    "notifications",
    customerId
  );

  await updateDoc(reminderRef, {
    read: true,
  });

  setReminders((prev) =>
    prev.map((r) =>
      r.id === customerId ? { ...r, read: true } : r
    )
  );
};
  const handleAddCustomer = async () => {
  try {
    if (!name || !phone) {
      alert("সব তথ্য দিন");
      return;
    }

    const newCustomerRef = await addDoc(
  collection(db, "shops", user.uid, "customers"),
  {
    name,
    phone,
    due: 0,
    createdAt: serverTimestamp(),
  }
);

await logActivity(user.uid, {
  action: "Add Customer",
  customerName: name,
  customerId: newCustomerRef.id,
});

await loadCustomers();

setName("");
setPhone("");

alert("Customer Added");
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

  return (
    <div style={{ padding: "30px" }}>
      <h1>Customers</h1>

      <input
        type="text"
        placeholder="Customer Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br/>
      <br/>

      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleAddCustomer}>
        Add Customer
      </button>
      <hr />
      {reminders.length > 0 && (
  <div
    style={{
      border: "1px solid #ccc",
      padding: "15px",
      marginBottom: "20px",
    }}
  >
    <h3 style={{ marginTop: 0 }}>Due Reminders</h3>

    {reminders.map((r) => (
      <div
        key={r.id}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 0",
          borderBottom: "1px solid #eee",
          opacity: r.read ? 0.5 : 1,
        }}
      >
        <span>
          {r.customerName} — Due ৳{r.due}
        </span>

        {!r.read && (
          <button onClick={() => markReminderRead(r.id)}>
            Mark as Read
          </button>
        )}
      </div>
    ))}
  </div>
)}

<h2>Customer List</h2>

<input
  type="text"
  placeholder="Search by name or phone"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={{ marginBottom: "15px", display: "block" }}
/>

<div style={{ marginBottom: "15px" }}>
  <button onClick={() => setFilterStatus("all")}>All</button>{" "}
  <button onClick={() => setFilterStatus("due")}>Due</button>{" "}
  <button onClick={() => setFilterStatus("paid")}>Paid</button>
</div>
<div style={{ marginBottom: "15px" }}>
  <button onClick={() => setSortOrder("newest")}>
    Newest
  </button>

  <button onClick={() => setSortOrder("oldest")}>
    Oldest
  </button>
</div>
{customers

  .filter((customer) => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return true;

    return (
      customer.name?.toLowerCase().includes(term) ||
      customer.phone?.toLowerCase().includes(term)
    );
  })
  .filter((customer) => {
    if (filterStatus === "due")
      return Number(customer.due) > 0;

    if (filterStatus === "paid")
      return Number(customer.due) === 0;

    return true;
  })
  .sort((a, b) => {
  const aTime = a.createdAt?.toMillis
    ? a.createdAt.toMillis()
    : 0;

  const bTime = b.createdAt?.toMillis
    ? b.createdAt.toMillis()
    : 0;

  return sortOrder === "newest"
    ? bTime - aTime
    : aTime - bTime;
})
.map((customer) => (
  <div
    key={customer.id}
    style={{
      border: "1px solid #ccc",
      padding: "10px",
      marginTop: "10px",
    }}
  >
    <h3>{customer.name}</h3>
<p>{customer.phone}</p>

<button
  onClick={() => navigate(`/customer/${customer.id}`)}
>
  Details
</button>
  </div>
))}
    </div>
  );
}

export default Customers;