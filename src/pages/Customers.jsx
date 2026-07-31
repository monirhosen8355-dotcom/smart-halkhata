import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";


function Customers() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const { user } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
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
};
  const handleAddCustomer = async () => {
  try {
    if (!name || !phone) {
      alert("সব তথ্য দিন");
      return;
    }

    await addDoc(
      collection(db, "shops", user.uid, "customers"),
      {
        name,
        phone,
        due: 0,
        createdAt: serverTimestamp(),
      }
    );

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

<h2>Customer List</h2>

{customers.map((customer) => (
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