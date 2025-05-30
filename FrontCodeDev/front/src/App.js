
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Admin/Dashboard";
import Users from "./Admin/Users";
import Courses from "./Admin/Courses";
import Lessons from "./Admin/Lessons";
import Progress from "./Admin/Progress";
import Quizzes from "./Admin/Quizzes";
import Certifications from "./Admin/Certifications";
import Comments from "./Admin/Comments";
import Login from "./Admin/Login";
import Inscriptions from "./Admin/Inscriptions";
import BlockedUsers from "./Admin/UserBlocked";
import Register from "./Admin/Register";
import Home from "./User/Home";
import CourseCard from "./User/CourseCard";
import Course from "./User/Course";
import NotFound from "./User/NotFound";
import LearnCourse from "./User/LearnCourse";
import PrivateRoute from "./Admin/PrivateRoute";
import UserProfile from "./User/UserProfile";
import QuizComponent from "./User/CourseQuizzes";
import CertificateViewer from './User/CertificateViewer'; // Keep only one import
import CertificateViewerAdmin from "./Admin/CertificateViewerAdmin";
import ContactUs from "./User/ContactUs";
import NotificationCenter from "./Admin/NotificationCenter";
import ContactMessages from "./Admin/ContactMessages";
import ForgotPassword from "./Admin/ForgotPassword ";
import ResetPassword from "./Admin/ResetPassword";
import AboutUs from "./User/AboutUs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes (محمية بـ PrivateRoute) */}
        <Route path="/admin/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/admin/Blocked" element={<PrivateRoute><BlockedUsers /></PrivateRoute>} />
        <Route path="/admin/courses" element={<PrivateRoute><Courses /></PrivateRoute>} />
        <Route path="/admin/lessons" element={<PrivateRoute><Lessons /></PrivateRoute>} />
        <Route path="/admin/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />
        <Route path="/admin/quizzes" element={<PrivateRoute><Quizzes /></PrivateRoute>} />
        <Route path="/admin/certifications" element={<PrivateRoute><Certifications /></PrivateRoute>} />
        <Route path="/admin/comments" element={<PrivateRoute><Comments /></PrivateRoute>} />
        <Route path="/admin/inscriptions" element={<PrivateRoute><Inscriptions /></PrivateRoute>} />
        <Route path="/admin/notifications" element={<PrivateRoute><NotificationCenter /></PrivateRoute>} />
        <Route path="/admin/ContactMessages" element={<PrivateRoute><ContactMessages /></PrivateRoute>} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} /> 
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CourseCard />} />
        <Route path="/courses/:id" element={<Course />} />
        <Route path="/learn/:id" element={<LearnCourse />} />
        <Route path="/courses/:courseId/quiz" element={<QuizComponent />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/certificate/:courseId" element={<CertificateViewer />} />
        <Route path="/certificates/:id" element={<CertificateViewerAdmin />} />
        <Route path="/ContactUs" element={<ContactUs />} />
        <Route path="/About" element={<AboutUs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;