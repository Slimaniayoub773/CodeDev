import React, { useState, useEffect, useRef } from "react";
import {
  FaGraduationCap,
  FaSignInAlt,
  FaUserPlus,
  FaEnvelope,
  FaBars,
  FaTimes,
  FaHome,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaUserCircle,
  FaInfoCircle
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// Reusable NavLink component
const NavLink = ({ icon, text, to }) => (
  <Link
    to={to}
    className="flex items-center px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-300 group"
  >
    <span className="mr-2 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </span>
    <span className="group-hover:font-semibold transition-all duration-300">
      {text}
    </span>
  </Link>
);

// Reusable Mobile NavLink component
const MobileNavLink = ({ icon, text, to }) => (
  <Link
    to={to}
    className="flex items-center px-3 py-3 rounded-md text-base font-medium hover:bg-blue-700 transition-colors duration-300"
  >
    <span className="mr-3">{icon}</span>
    {text}
  </Link>
);

// Reusable Auth Button component
const AuthButton = ({ icon, text, style, to, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`${style} px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-all duration-300 hover:shadow-lg`}
  >
    <span>{icon}</span>
    <span>{text}</span>
  </Link>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const scrollerRef = useRef(null);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses');
        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setLoading(false);
      }
    };

    fetchCourses();

    // Check login status and fetch user data
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
      fetchUserData(token);
    }

    // Close profile menu when clicking outside
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleScroll = (direction) => {
    const container = scrollerRef.current;
    const scrollAmount = 300;

    if (container) {
      if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
      setScrollPosition(container.scrollLeft);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      // Clear local storage and update state
      localStorage.removeItem('authToken');
      localStorage.removeItem('utilisateur_id');
      setIsLoggedIn(false);
      setUserData(null);
      setShowProfileMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo - Clickable to home */}
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2 hover:opacity-90 transition-opacity">
              <div className="bg-white p-1 rounded-full">
                <img
                  src="/trans_bg.png"
                  alt="Admin Logo"
                  className="h-14 w-14 object-contain"
                />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
                CodeDev
              </span>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex space-x-6">
              <NavLink icon={<FaHome />} text="Home" to="/" />
              <NavLink icon={<FaGraduationCap />} text="Courses" to="/courses" />
              <NavLink icon={<FaInfoCircle />} text="About Us" to="/about" />
              <NavLink icon={<FaEnvelope />} text="Contact" to="/ContactUs" />
            </div>

            {/* Auth Buttons - Show different buttons based on login status */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="relative" ref={profileMenuRef}>
                  <button 
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-2 focus:outline-none hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                      {userData?.avatar ? (
                        <img 
                          src={userData.avatar} 
                          alt="Profile" 
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <FaUserCircle className="text-white text-xl" />
                      )}
                    </div>
                    <span className="text-white font-medium">
                      {userData?.name || 'Profile'}
                    </span>
                  </button>
                  
                  {/* Profile Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-blue-100">
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center"
                      >
                        <FaUserCircle className="inline mr-2 text-blue-600" /> My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center"
                      >
                        <FaSignOutAlt className="inline mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <AuthButton
                    icon={<FaSignInAlt />}
                    text="Login"
                    style="bg-blue-700 hover:bg-blue-600"
                    to="/login"
                  />
                  <AuthButton
                    icon={<FaUserPlus />}
                    text="Register"
                    style="bg-white text-blue-900 hover:bg-gray-100"
                    to="/register"
                  />
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-700 focus:outline-none transition duration-150 ease-in-out"
              >
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Course Scroller */}
        <div className="bg-black py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center">
              <button 
                onClick={() => handleScroll('left')}
                className={`p-2 rounded-full mr-2 ${scrollPosition === 0 ? 'text-gray-500' : 'text-white hover:bg-gray-800'}`}
                disabled={scrollPosition === 0}
              >
                <FaChevronLeft size={20} />
              </button>

              <div 
                ref={scrollerRef}
                className="flex-1 overflow-x-hidden whitespace-nowrap scroll-smooth"
              >
                <div className="inline-flex space-x-8">
                  {loading ? (
                    [...Array(8)].map((_, i) => (
                      <div key={i} className="inline-block h-8 bg-gray-700 rounded-full animate-pulse w-32"></div>
                    ))
                  ) : ( 
                    courses.map(course => (
                      <Link 
                        key={course.id}
                        to={`/courses/${course.id}`}
                        className="inline-block text-white hover:text-yellow-300 font-medium px-4 py-2 rounded-md hover:bg-gray-800 transition text-lg"
                      >
                        {course.title}
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <button 
                onClick={() => handleScroll('right')}
                className="p-2 rounded-full text-white hover:bg-gray-800 ml-2"
              >
                <FaChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isOpen ? "block" : "hidden"} bg-blue-800`}>
          <div className="px-2 pt-2 pb-4 space-y-2">
            <MobileNavLink icon={<FaHome />} text="Home" to="/" />
            <MobileNavLink icon={<FaGraduationCap />} text="Courses" to="/courses" />
            <MobileNavLink icon={<FaInfoCircle />} text="About Us" to="/about" />
            <MobileNavLink icon={<FaEnvelope />} text="Contact" to="/contact" />

            <div className="pt-4 mt-2 border-t border-blue-700 flex flex-col space-y-3 px-2">
              {isLoggedIn ? (
                <>
                  <MobileNavLink 
                    icon={<FaUserCircle />} 
                    text="My Profile" 
                    to="/profile" 
                  />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center space-x-2"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <AuthButton
                    icon={<FaSignInAlt />}
                    text="Login"
                    style="bg-blue-700 hover:bg-blue-600 w-full"
                    to="/login"
                  />
                  <AuthButton
                    icon={<FaUserPlus />}
                    text="Register"
                    style="bg-white text-blue-900 hover:bg-gray-100 w-full"
                    to="/register"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;