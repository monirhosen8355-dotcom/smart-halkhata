import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import NotFound from "./pages/NotFound";
import StaffManagement from "./pages/StaffManagement";
import ShopProfile from "./pages/ShopProfile";
import HelpSupport from "./pages/HelpSupport";
import Settings from "./pages/Settings";
import BusinessOverview from "./pages/BusinessOverview";
import ChangePassword from "./pages/ChangePassword";
import About from "./pages/About";
import Reports from "./pages/Reports";
import ReportDetails from "./pages/ReportDetails";


import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import Notifications from "./pages/Notifications";

function App() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const loadTheme = async () => {
      if (!user) {
        document.documentElement.removeAttribute("data-theme");
        return;
      }

      try {
        const snap = await getDoc(
          doc(db, "shops", user.uid, "settings", "preferences")
        );

        const darkMode = snap.exists() && snap.data().darkMode;

        document.documentElement.setAttribute(
          "data-theme",
          darkMode ? "dark" : "light"
        );
      } catch (e) {
        console.error(e);
      }
    };

    loadTheme();
  }, [user]);
  return (
    <BrowserRouter>
  <LanguageProvider>
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
  path="/business-overview"
  element={<BusinessOverview />}
/>

<Route
  path="/reports"
  element={<Reports />}
/>

<Route
  path="/notifications"
  element={<Notifications />}
/>

<Route
  path="/report-details/:id"
  element={<ReportDetails />}
/>
<Route
  path="/staff-management"
  element={<StaffManagement />}
/>

<Route
  path="/change-password"
  element={<ChangePassword />}
/>
<Route
  path="/about"
  element={<About />}
/>

<Route
  path="/help-support"
  element={<HelpSupport />}
/>
        <Route path="*" element={<NotFound />} />
      </Routes>
  
  </LanguageProvider>
</BrowserRouter>
  );
}

export default App;