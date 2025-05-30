import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaEnvelope, FaGraduationCap, FaCalendarAlt, 
  FaEdit, FaSave, FaLock, FaUpload, FaCertificate,
  FaBook, FaChartLine, FaTrash, FaPlus
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Nav';
import Footer from './Footer';
import CodeDevLoadingScreen from './CodeDevLoadingScreen';
axios.defaults.baseURL = 'http://localhost:8000';
const Profile = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    role: 'user',
    is_blocked: false
  });
  const [passwordErrors, setPasswordErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [stats, setStats] = useState({
    completedCourses: 0,
    inProgressCourses: 0,
    certificationCount: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user data
        const userResponse = await axios.get('api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUser(userResponse.data);
        setFormData({
          name: userResponse.data.name,
          email: userResponse.data.email,
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
          role: userResponse.data.role || 'user',
          is_blocked: userResponse.data.is_blocked || false
        });

        if (userResponse.data.avatar) {
          setAvatarPreview(userResponse.data.avatar);
        }

        // Fetch user's courses
        const coursesResponse = await axios.get('/api/user/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCourses(coursesResponse.data);

        // Fetch certificates
        const certsResponse = await axios.get('/api/user/certificates', {
  headers: { 'Authorization': `Bearer ${token}` }
});


        setCertificates(certsResponse.data);

        const completed = coursesResponse.data.filter(c => c.status === 'Complété').length;
        const inProgress = coursesResponse.data.filter(c => c.status === 'En cours').length;
        const certCount = certsResponse.data.length;

        setStats({
          completedCourses: completed,
          inProgressCourses: inProgress,
          certificationCount: certCount
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswords = () => {
    const errors = {};
    let isValid = true;

    if (formData.newPassword && !formData.oldPassword) {
      errors.oldPassword = 'Current password is required to change password';
      isValid = false;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters';
      isValid = false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
      };
  
      // Only include passwords if they're being changed
      if (formData.newPassword) {
        if (!formData.oldPassword) {
          toast.error('Current password is required to change password');
          return;
        }
        payload.oldPassword = formData.oldPassword;
        payload.newPassword = formData.newPassword;
      }
  
      const response = await axios.put('/api/user', payload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      setUser(response.data);
      setEditMode(false);
      toast.success('Profile updated successfully!');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (error) {
      console.error('Update error:', error.response?.data);
      
      // Handle password error specifically
      if (error.response?.data?.message?.includes('password is incorrect')) {
        setPasswordErrors(prev => ({
          ...prev,
          oldPassword: 'The current password you entered is incorrect'
        }));
        toast.error('Current password is incorrect');
      } 
      // Handle other validation errors
      else if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          toast.error(`${field}: ${messages.join(', ')}`);
        });
      } else {
        toast.error(error.response?.data?.message || 'Update failed');
      }
    }
  };
  const handleUnenroll = async (courseId) => {
    if (window.confirm('Are you sure you want to unenroll from this course?')) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`/api/user/courses/${courseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setCourses(courses.filter(c => c.id !== courseId));
        toast.success('Successfully unenrolled from course');
      } catch (error) {
        console.error('Error unenrolling:', error);
        toast.error('Failed to unenroll from course');
      }
    }
  };

  if (loading) {
     return <CodeDevLoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between">
            <div className="flex items-center md:items-end space-x-4">
              <div className="relative group">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-indigo-600 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
  <FaUser className="text-white text-4xl md:text-6xl" />
</div>
                {editMode && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer p-2 bg-white bg-opacity-80 rounded-full text-indigo-700 hover:bg-opacity-100 transition-all">
                      <FaUpload className="text-lg" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className="text-white">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-white bg-opacity-20 border-b border-white text-white focus:outline-none focus:ring-1 focus:ring-white w-full"
                    />
                  ) : (
                    user.name
                  )}
                </h1>
                <p className="text-sm md:text-base opacity-90">
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={editMode ? handleSubmit : () => setEditMode(true)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${editMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-white text-indigo-700 hover:bg-gray-100'} shadow-md`}
              >
                {editMode ? (
                  <>
                    <FaSave /> <span>Save</span>
                  </>
                ) : (
                  <>
                    <FaEdit /> <span>Edit Profile</span>
                  </>
                )}
              </button>
              {editMode && (
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      name: user.name,
                      email: user.email,
                      oldPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                      role: user.role,
                      is_blocked: user.is_blocked
                    });
                    setAvatarPreview(user.avatar || null);
                    setPasswordErrors({
                      oldPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="px-4 py-2 rounded-lg flex items-center space-x-2 bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-md transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

     {/* Main Content */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-12">
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    {/* Stats Bar */}
    <div className="bg-gray-50 px-6 py-4 border-b">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Changed from 3 to 2 columns */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="bg-indigo-100 p-3 rounded-full mr-4">
            <FaBook className="text-indigo-600 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Courses Enrolled</p>
            <p className="text-2xl font-bold text-gray-800">{courses.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <FaCertificate className="text-blue-600 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Certifications</p>
            <p className="text-2xl font-bold text-gray-800">{stats.certificationCount}</p>
          </div>
        </div>
      </div>
    </div>
          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
            {/* Sidebar */}
            <div className="lg:col-span-1 bg-gray-50 p-6 border-r">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Account</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <FaEnvelope className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        {editMode ? (
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : (
                          <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaCalendarAlt className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Joined</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {user.last_login_at && (
                      <div className="flex items-center space-x-3">
                        <FaLock className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Last Login</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(user.last_login_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Password Change Fields */}
                    {editMode && (
                      <div className="pt-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                          <input
  type="password"
  name="oldPassword"
  value={formData.oldPassword}
  onChange={handleInputChange}
  className={`w-full px-3 py-2 border ${
    passwordErrors.oldPassword ? 'border-red-500' : 'border-gray-300'
  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
  placeholder="Enter current password to change"
/>
{passwordErrors.oldPassword && (
  <p className="mt-1 text-sm text-red-600">{passwordErrors.oldPassword}</p>
)}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter new password"
                          />
                          {passwordErrors.newPassword && (
                            <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Confirm new password"
                          />
                          {passwordErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {user.role === 'admin' && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Admin Status</h3>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {user.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                      {editMode && (
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="is_blocked"
                            checked={formData.is_blocked}
                            onChange={(e) => setFormData({...formData, is_blocked: e.target.checked})}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Block User</span>
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 p-6">
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'courses' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    My Courses
                  </button>
                  <button
                    onClick={() => setActiveTab('certificates')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'certificates' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Certificates
                  </button>
                </nav>
              </div>

              {/* Courses Tab */}
              {activeTab === 'courses' && (
                <div>
                  {courses.length === 0 ? (
                    <div className="text-center py-12">
                      <FaGraduationCap className="mx-auto text-gray-400 text-5xl mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No courses enrolled yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Start your learning journey by exploring our courses</p>
                      <div className="mt-6">
                        <Link
                          to="/courses"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Browse Courses
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {courses.map(course => (
                        <div key={course.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/4 mb-4 md:mb-0">
                              <Link to={`/courses/${course.id}`}>
                              <img 
  src={course.image ? `http://localhost:8000${course.image}` : ''} 
  alt={course.title} 
  className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity"
/>

                              </Link>
                            </div>
                            <div className="md:w-3/4 md:pl-5">
                              <div className="flex justify-between items-start">
                                <div>
                                  <Link to={`/courses/${course.id}`} className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                                    {course.title}
                                  </Link>
                                  <p className="text-sm text-gray-500 mt-1">By {course.instructor || 'Unknown Instructor'}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${course.status === 'Complété' ? 'bg-green-100 text-green-800' : course.status === 'Annulé' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {course.status}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{course.description || 'No description available.'}</p>
                              
                              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center space-x-4">
                                  <span className="text-xs text-gray-500">
                                    <span className="font-medium">Enrolled:</span> {new Date(course.inscription_date).toLocaleDateString()}
                                  </span>
                                  {course.completed_at && (
                                    <span className="text-xs text-gray-500">
                                      <span className="font-medium">Completed:</span> {new Date(course.completed_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Link
                                    to={`/courses/${course.id}`}
                                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    Continue
                                  </Link>
                                  <button
                                    onClick={() => handleUnenroll(course.id)}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                  >
                                    <FaTrash className="mr-1" /> Unenroll
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Certificates Tab */}
              {/* Certificates Tab */}
{activeTab === 'certificates' && (
  <div>
    {certificates.length === 0 ? (
      <div className="text-center py-12">
        <FaCertificate className="mx-auto text-gray-400 text-5xl mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No certificates earned yet</h3>
        <p className="mt-1 text-sm text-gray-500">Complete courses to earn certificates</p>
        <div className="mt-6">
          <Link
            to="/courses"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map(cert => (
          <div key={cert.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="bg-indigo-50 p-3 rounded-lg mb-4">
              <FaCertificate className="text-indigo-600 text-4xl mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{cert.course_title}</h3>
            <p className="text-sm text-gray-500 mb-3">Issued on {new Date(cert.issue_date).toLocaleDateString()}</p>
            <div className="flex justify-between items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Verified
              </span>
              <Link
                to={`/certificate/${cert.course_id}`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View Certificate
              </Link>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
            </div>  
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;