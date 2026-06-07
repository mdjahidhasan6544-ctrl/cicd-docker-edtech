import { Navigate, NavLink, Outlet, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Sidebar from "./components/Sidebar.jsx";
import AdminCourseManager from "./pages/AdminCourseManager.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminLiveClasses from "./pages/AdminLiveClasses.jsx";
import AdminPayments from "./pages/AdminPayments.jsx";
import AdminStudents from "./pages/AdminStudents.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import LessonPlayer from "./pages/LessonPlayer.jsx";
import LiveClasses from "./pages/LiveClasses.jsx";
import Login from "./pages/Login.jsx";
import MarketingHome from "./pages/MarketingHome.jsx";
import PaymentSubmit from "./pages/PaymentSubmit.jsx";
import PracticeHub from "./pages/PracticeHub.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";

function StudentLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">Admin console</p>
            <h1>Operational controls</h1>
          </div>
          <nav className="top-links">
            <NavLink to="/admin">Overview</NavLink>
            <NavLink to="/admin/students">Students</NavLink>
            <NavLink to="/admin/payments">Payments</NavLink>
          </nav>
        </header>
        <main className="page-shell admin-page-shell">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function HomeRedirect() {
  const { loading, user } = useAuth();

  if (loading) {
    return <div className="screen-state">Loading session...</div>;
  }

  if (!user) {
    return <MarketingHome />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/lessons/:id" element={<LessonPlayer />} />
        <Route path="/live-classes" element={<LiveClasses />} />
        <Route path="/payments" element={<PaymentSubmit />} />
        <Route path="/practice" element={<PracticeHub />} />
        <Route path="/profile" element={<StudentProfile />} />
      </Route>

      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/courses" element={<AdminCourseManager />} />
        <Route path="/admin/live-classes" element={<AdminLiveClasses />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
