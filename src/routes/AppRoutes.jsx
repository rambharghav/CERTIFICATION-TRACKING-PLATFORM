import { Routes, Route } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import Landing from "../features/public/Landing";
import Login from "../features/auth/Login";
import Signup from "../features/auth/Signup";

import Overview from "../features/student/Overview";
import MyCertifications from "../features/student/MyCertifications";
import Reminders from "../features/student/Reminders";
import Alerts from "../features/student/Alerts";
import Renewals from "../features/student/Renewals";
import Reports from "../features/student/Reports";
import Progress from "../features/student/Progress";
import Register from "../features/student/Register";
import Remarks from "../features/student/Remarks";

import AdminOverview from "../features/admin/AdminOverview";
import AdminAllCertifications from "../features/admin/AdminAllCertifications";
import AdminAllStudents from "../features/admin/AdminAllStudents";
import ExpiringCerts from "../features/admin/ExpiringCerts";
import RenewalManagement from "../features/admin/RenewalManagement";

function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PublicLayout />} />
      </Route>

      {/* AUTH */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* STUDENT ROUTES */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRole="student">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Overview />} />
        <Route path="register" element={<Register />} /> {/* ✅ fixed */}
        <Route path="progress" element={<Progress />} />
        <Route path="renewals" element={<Renewals />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="certifications" element={<MyCertifications />} />
        <Route path="reports" element={<Reports />} />
        <Route path="remarks" element={<Remarks />} />
      </Route>

      {/* ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* ✅ child paths must be relative */}
        <Route path="dashboard" element={<AdminOverview />} />
        <Route path="certifications" element={<AdminAllCertifications />} />
        <Route path="mystudents" element={<AdminAllStudents />} />
        <Route path="expiring" element={<ExpiringCerts />} />
        <Route path="renewals" element={<RenewalManagement />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;