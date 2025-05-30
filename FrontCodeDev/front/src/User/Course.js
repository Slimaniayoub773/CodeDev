import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Nav';
import Footer from './Footer';
import CodeDevLoadingScreen from './CodeDevLoadingScreen';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const API_BASE_URL = 'http://localhost:8000/api';

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/courses/${id}`);
        setCourse(response.data);
      } catch (error) {
        console.error('Error fetching course details:', error);
        toast.error('Failed to load course details');
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    const checkEnrollment = async () => {
      const utilisateurId = localStorage.getItem('utilisateur_id');
      if (utilisateurId) {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/user-courses/check?utilisateur_id=${utilisateurId}&course_id=${id}`
          );
          setEnrolled(res.data.enrolled);
        } catch (err) {
          console.error("Enrollment check error:", err);
        }
      }
    };

    fetchCourse();
    checkEnrollment();
  }, [id, navigate]);

  const handleEnroll = async () => {
  const utilisateurId = localStorage.getItem('utilisateur_id');
  const token = localStorage.getItem('authToken'); // Get the token from storage

  if (!utilisateurId || !token) {
    toast.error('Please login first');
    navigate('/login', { state: { from: `/courses/${id}` } });
    return;
  }

  setEnrollmentLoading(true);
  try {
    await axios.post(`${API_BASE_URL}/user-courses`, {
      utilisateur_id: utilisateurId,
      course_id: id,
      inscription_date: new Date().toISOString().split('T')[0],
      status: 'En attente',
    }, {
      headers: {
        'Authorization': `Bearer ${token}` // Add the authorization header
      }
    });

    setEnrolled(true);
    toast.success('Successfully enrolled in course!');
    setTimeout(() => {
      navigate(`/learn/${id}`);
    }, 1500);
  } catch (error) {
    console.error('Enrollment error:', error);
    toast.error(error.response?.data?.message || 'Failed to enroll in course');
  } finally {
    setEnrollmentLoading(false);
  }
};  if (loading) {
     return <CodeDevLoadingScreen />;
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Course Not Found</h2>
          <p className="text-gray-500 mb-6">
            The course you're looking for doesn't exist or may have been removed.
          </p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  // Format dates if they exist
  const formatDate = (dateString) => {
    if (!dateString) return 'Flexible';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-sm border border-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Courses
          </button>

          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
            <div className="relative h-64 md:h-96 overflow-hidden">
              <img
                src={
                  `${API_BASE_URL.replace('/api', '')}${course.image}`
                }
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  e.target.src = '/placeholder-course.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-6 md:p-8">
                <div>
                  <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md mb-2 font-medium">
                    {course.start_date ? 'Ongoing Course' : 'Self-Paced'}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{course.title}</h1>
                  <div className="flex items-center text-white/90">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      {formatDate(course.start_date)} - {formatDate(course.end_date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <span className="text-yellow-500 text-lg mr-1">★</span>
                    <span className="font-medium text-gray-800">
                      {course.rating?.toFixed(1) || '4.5'}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      ({course.rating_count || 0} ratings)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (enrolled) {
                      navigate(`/learn/${id}`);
                    } else {
                      handleEnroll();
                    }
                  }}
                  disabled={enrollmentLoading}
                  className={`px-6 py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                    enrolled
                      ? 'bg-green-500 hover:bg-green-600 shadow-md'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md'
                  } ${enrollmentLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {enrollmentLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : enrolled ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Continue Learning
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Enroll Now
                    </>
                  )}
                </button>
              </div>

              <div className="prose max-w-none text-gray-700 mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">About This Course</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Course Duration
                    </h4>
                    <p className="text-gray-600">
                      {course.start_date && course.end_date
                        ? `${formatDate(course.start_date)} - ${formatDate(course.end_date)}`
                        : 'Self-paced learning'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      Course Level
                    </h4>
                    <p className="text-gray-600">All Levels</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetails;