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
import SavingsPaymentVerification from "./pages/SavingsPaymentVerification";import About from "./pages/About";
import Reports from "./pages/Reports";
import Loen from "./pages/Loen";
import Savings from "./pages/Savings";
import Calculator from "./pages/Calculator";
import ReportDetails from "./pages/ReportDetails";
import PageLoader from "./components/PageLoader";
import ProtectedRoute from "./routes/ProtectedRoute";

import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

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
      } catch (error) {
        console.error("Theme loading error:", error);
      }
    };

    loadTheme();
  }, [user]);

 return ( 
  <BrowserRouter> 
    <PageLoader />
    <LanguageProvider>
        <Routes>

          {/* Login */}
          <Route path="/" element={<Login />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Customers */}
          <Route path="/customers" element={<Customers />} />

          <Route
            path="/customer/:id"
            element={<CustomerDetails />}
          />

          {/* Shop Profile */}
          <Route
            path="/shop-profile"
            element={<ShopProfile />}
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={<Settings />}
          />

          {/* Business Overview */}
          <Route
            path="/business-overview"
            element={<BusinessOverview />}
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/report-details/:id"
            element={<ReportDetails />}
          />

          {/* Loan */}
          <Route
            path="/loen"
            element={<Loen />}
          />

          {/* Savings */}
<Route
  path="/savings"
  element={<Savings />}
/>
<Route path="/calculator" element={<Calculator />} />

          {/* Staff Management */}
          <Route
            path="/staff-management"
            element={<StaffManagement />}
          />

          {/* Change Password */} 
          <Route 
            path="/change-password" 
            element={<ChangePassword />} 
          />

          {/* Savings Payment Verification */}
          <Route 
            path="/savings-payment-verification" 
            element={<SavingsPaymentVerification />} 
          />

          {/* About */}
          <Route
            path="/about"
            element={<About />}
          />

          {/* Help & Support */}
          <Route
            path="/help-support"
            element={<HelpSupport />}
          />

          {/* 404 */}
          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;