import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, Legend,
  ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import axios from 'axios';
import { 
  FiUsers, FiBook, FiAward, FiClock, 
  FiMenu, FiTrendingUp, FiActivity,
  FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { FaChalkboardTeacher, FaGraduationCap } from 'react-icons/fa';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { toast } from 'react-toastify';

// Axios Configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Custom color palette with better contrast
const COLORS = {
  primary: '#4F46E5',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  dark: '#1F2937',
  light: '#F3F4F6'
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.info,
  COLORS.danger,
  COLORS.dark
];

// Custom tooltip component with better styling
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-xl rounded-lg border border-gray-200 min-w-[200px]">
        <p className="font-bold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between py-1">
            <div className="flex items-center">
              <span 
                className="inline-block w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="text-sm text-gray-600">{entry.name}</span>
            </div>
            <span className="font-semibold text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// StatCard component with improved design
const StatCard = ({ icon, title, value, change, isPositive, color = COLORS.primary }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold mt-1 text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isPositive ? (
              <FiTrendingUp className="mr-1" />
            ) : (
              <FiActivity className="mr-1 transform rotate-180" />
            )}
            {change}%
          </span>
          <span className="ml-2 text-sm text-gray-500">vs last month</span>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    completed: 0,
    pending: 0,
    activeStudents: 0
  });
  
  const [monthlyData, setMonthlyData] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [studentProgress, setStudentProgress] = useState([]);

  useEffect(() => {
    const fetchData = async () => { 
      try {
        const [statsRes, monthlyRes, coursesRes, activityRes, progressRes] = await Promise.all([
          api.get('/stats', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }),
          api.get('/monthly-registrations', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }),
          api.get('/top-courses', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }),
          api.get('/student-activity', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }),
          api.get('/student-progress', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          })
        ]);

        setStats({
          ...statsRes.data,
          activeStudents: activityRes.data.activeStudents
        });
        
        setMonthlyData(monthlyRes.data);
        setCoursesData(coursesRes.data);
        setActivityData(activityRes.data.activity);
        setStudentProgress(progressRes.data);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
    
  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          {/* Code brackets with logo */}
          <div className="flex items-center mb-8">
            <span className="text-5xl text-gray-400 font-mono mr-2">{'<'}</span>
            <span className="text-4xl font-bold tracking-wider">
              <span className="text-blue-600">Code</span>
              <span className="text-blue-800">Dev</span>
            </span>
            <span className="text-5xl text-gray-400 font-mono ml-2">{'/>'}</span>
          </div>

          {/* Coding-themed loading animation */}
          <div className="w-64 space-y-6">
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full animate-progress"></div>
            </div>
            
            <div className="flex justify-center space-x-3">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-3 h-3 bg-blue-600 rounded-full opacity-70"
                  style={{
                    animation: `pulse 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Status text */}
          <p className="text-gray-600 font-mono text-sm mt-6">
            <span className="inline-block border-r-2 border-blue-600 pr-1 animate-typing">
              Initializing learning environment...
            </span>
          </p>

          {/* Console-like footer */}
          <div className="absolute bottom-8 text-xs text-gray-400 font-mono">
            [status] Loading modules...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 overflow-auto h-full">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <button 
                className="md:hidden text-gray-500 hover:text-gray-600 mr-4"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu size={24} />
              </button>
              
              <h1 className="text-xl font-bold text-gray-900">Learning Management Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 max-w-7xl mx-auto">
          {/* Overview Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={<FiUsers className="text-primary-600" size={20} />}
                title="Total Students"
                value={stats.totalStudents}
                change={12}
                isPositive={true}
                color={COLORS.primary}
              />
              <StatCard 
                icon={<FaChalkboardTeacher className="text-secondary-600" size={20} />}
                title="Active Students"
                value={stats.activeStudents}
                change={8}
                isPositive={true}
                color={COLORS.secondary}
              />
              <StatCard 
                icon={<FiBook className="text-accent-600" size={20} />}
                title="Available Courses"
                value={stats.totalCourses}
                change={5}
                isPositive={true}
                color={COLORS.accent}
              />
              <StatCard 
                icon={<FiAward className="text-info-600" size={20} />}
                title="Certificates Issued"
                value={stats.certificatesIssued || 0}
                change={15}
                isPositive={true}
                color={COLORS.info}
              />
            </div>
          </div>

          {/* Main Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Monthly Registrations */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Monthly Registrations</h2>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={monthlyData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      cursor={{ fill: '#F3F4F6' }}
                    />
                    <Line 
                      type="monotone"
                      dataKey="registrations" 
                      name="Registrations" 
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      dot={{ r: 4, fill: COLORS.primary }}
                      activeDot={{ r: 6, fill: COLORS.primary }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Courses Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Top Courses</h2>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={coursesData}
                    margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid horizontal={true} vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      type="number" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis 
                      dataKey="course"
                      type="category" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="students" 
                      name="Students" 
                      fill={COLORS.secondary}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Recent Student Activity</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activityData.map((activity, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FiUsers className="text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{activity.student}</div>
                            <div className="text-sm text-gray-500">{activity.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{activity.course}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          activity.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activity.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.lastActivity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-primary-600 h-2.5 rounded-full" 
                            style={{ width: `${activity.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{activity.progress}% complete</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;