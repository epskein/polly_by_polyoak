import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router"
import SignIn from "./pages/AuthPages/SignIn"
import SignUp from "./pages/AuthPages/SignUp"
import NotFound from "./pages/OtherPage/NotFound"
import UserProfiles from "./pages/UserProfiles"
import Videos from "./pages/UiElements/Videos"
import Images from "./pages/UiElements/Images"
import Alerts from "./pages/UiElements/Alerts"
import Badges from "./pages/UiElements/Badges"
import Avatars from "./pages/UiElements/Avatars"
import Buttons from "./pages/UiElements/Buttons"
import LineChart from "./pages/Charts/LineChart"
import PieChart from "./pages/Charts/PieChart"
import BarChart from "./pages/Charts/BarChart"
import Calendar from "./pages/Calendar"
import BasicTables from "./pages/Tables/BasicTables"
import FormElements from "./pages/Forms/FormElements"
import Blank from "./pages/Blank"
import AppLayout from "./layout/AppLayout"
import { ScrollToTop } from "./components/common/ScrollToTop"
import Home from "./pages/Dashboard/Home"
import InventoryTracker from "./pages/InventoryTracker/index"
import { useAuthContext } from "./context/AuthContext"
import { AuthProvider } from "./context/AuthContext"
import Users from "./pages/UserManagement/users"
import QualityLabTracker from "./pages/QualityLabTracker/index"

function AppRoutes() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Auth Routes */}
        <Route path="/signin" element={user ? <Navigate to="/" /> : <SignIn />} />

        {/* Protected Routes */}
        <Route element={user ? <AppLayout /> : <Navigate to="/signin" />}>
          <Route index path="/" element={<Home />} />
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />
          <Route path="/form-elements" element={<FormElements />} />
          <Route path="/basic-tables" element={<BasicTables />} />
          <Route path="/users" element={<Users />} />
          <Route path="/inventory-tracker" element={<InventoryTracker />} />
          <Route path="/quality-lab-tracker" element={<QualityLabTracker />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
          <Route path="/pie-chart" element={<PieChart />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

