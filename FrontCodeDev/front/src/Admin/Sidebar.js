import { Link } from "react-router-dom";
import {
  FiX,
  FiHome,
  FiUsers,
  FiBook,
  FiClipboard,
  FiMessageSquare,
  FiHelpCircle,
  FiEdit,
  FiAward,
  FiLock,
  FiLogOut
} from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('api/logout', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 h-screen bg-gradient-to-b from-blue-900 to-blue-700 shadow-xl transform 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:w-64 flex flex-col`}
        aria-label="Sidebar"
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-white lg:hidden hover:text-blue-200 transition-colors"
          aria-label="Close sidebar"
        >
          <FiX size={24} />
        </button>

        {/* Logo/branding section */}
        <div className="p-6 text-center border-b border-blue-600">
          <div className="mx-auto bg-white rounded-full p-2 w-16 h-16 flex items-center justify-center shadow-lg">
            <img
              src="/trans_bg.png"
              alt="Admin Logo"
              className="h-12 w-12 object-contain"
              loading="lazy"
            />
          </div>
          <h2 className="mt-2 text-white font-semibold text-lg">Admin Panel</h2>
        </div>

        {/* Navigation menu */}
        <nav className="mt-4 flex-1 flex flex-col overflow-y-auto">
          <ul className="space-y-1 px-3 flex-1">
            <NavItem to="/admin/dashboard" icon={<FiHome />} text="Dashboard" />
            <NavItem to="/admin/users" icon={<FiUsers />} text="Users" />
            <NavItem to="/admin/courses" icon={<FiBook />} text="Courses" />
            <NavItem to="/admin/lessons" icon={<FiClipboard />} text="Lessons" />
            <NavItem 
              to="/admin/ContactMessages" 
              icon={<FiMessageSquare />} 
              text="Messages" 
            />
            <NavItem to="/admin/quizzes" icon={<FiHelpCircle />} text="Quizzes" />
            <NavItem to="/admin/inscriptions" icon={<FiEdit />} text="Enrollments" />
            <NavItem to="/admin/certifications" icon={<FiAward />} text="Certifications" />
            <NavItem to="/admin/blocked" icon={<FiLock />} text="Blocked Users" />
          </ul>

          {/* Logout section */}
          <div className="p-3 border-t border-blue-600">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3 w-full rounded-lg text-white hover:bg-blue-600 transition-colors group"
              aria-label="Logout"
            >
              <FiLogOut className="text-xl group-hover:scale-110 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}

// Reusable NavItem component
function NavItem({ to, icon, text }) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center space-x-3 p-3 rounded-lg text-white hover:bg-blue-600 transition-colors group"
        aria-current={window.location.pathname === to ? "page" : undefined}
      >
        <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
        <span className="font-medium">{text}</span>
      </Link>
    </li>
  );
}

export default Sidebar;