import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import NotFound from "./pages/NotFound";
import StaffManagement from "./pages/StaffManagement";
import ShopProfile from "./pages/ShopProfile";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route
  path="/customer/:id"
  element={<CustomerDetails />}
/>
<Route
  path="/shop-profile"
  element={<ShopProfile />}
/>

<Route
  path="/settings"
  element={<Settings />}
/>
<Route
  path="/staff"
  element={<StaffManagement />}
/>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;