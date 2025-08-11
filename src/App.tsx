import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuthContext } from "./context/AuthContext";

// Auth Pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";

// Dashboard
import Home from "./pages/Dashboard/Home";

// Other Pages
import Calendar from "./pages/Calendar";
import Profile from "./pages/UserProfiles";
import FormElements from "./pages/Forms/FormElements";
import Tables from "./pages/Tables/BasicTables";
import BlankPage from "./pages/Blank";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import PieChart from "./pages/Charts/PieChart";
import QualityLabTracker from "./pages/QualityLabTracker/index";
import IODTrackerPage from "./pages/IODTracker";
import ProductInventoryManager from "./pages/InventoryTracker";
import Users from "./pages/UserManagement/users";
import RoleConfig from "./pages/UserManagement/roleConfig";
import PageNotFound from "./pages/OtherPage/NotFound";
import ProminentInventory from "./pages/ProminentInventory";

export default function App() {
  const { loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/forgot" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Home />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="profile" element={<Profile />} />
          <Route path="forms" element={<FormElements />} />
          <Route path="tables" element={<Tables />} />
          <Route path="blank" element={<BlankPage />} />
          <Route path="line-chart" element={<LineChart />} />
          <Route path="bar-chart" element={<BarChart />} />
          <Route path="pie-chart" element={<PieChart />} />
          <Route path="quality-lab" element={<QualityLabTracker />} />
          <Route path="inventory" element={<ProductInventoryManager />} />
          <Route path="prominent-inventory" element={<ProminentInventory />} />
          <Route path="iod-tracker" element={<IODTrackerPage />} />
          <Route path="users" element={<Users />} />
          <Route path="user-roles" element={<RoleConfig />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
}
