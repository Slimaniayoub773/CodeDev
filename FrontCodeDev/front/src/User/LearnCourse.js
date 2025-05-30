import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Nav';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiClock, FiCheckCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaRegCheckCircle } from 'react-icons/fa';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Footer from './Footer';
import CodeDevLoadingScreen from './CodeDevLoadingScreen';

const LearnCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progress, setProgress] = useState(0);
  const API_BASE_URL = 'http://localhost:8000/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseResponse, lessonsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/courses/${id}`),
          axios.get(`${API_BASE_URL}/courses/${id}/lessons`)
        ]);

        setCourse(courseResponse.data);
        setLessons(lessonsResponse.data);

        const firstIncomplete = lessonsResponse.data.find(lesson => !lesson.is_completed) || 
                              lessonsResponse.data[0];
        setActiveLesson(firstIncomplete);

        const completed = lessonsResponse.data
          .filter(lesson => lesson.is_completed)
          .map(lesson => lesson.id);
        setCompletedLessons(completed);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load course content. Please try again later.');
        toast.error('Failed to load course content.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (lessons.length > 0) {
      const completedCount = lessons.filter(lesson => lesson.is_completed).length;
      const calculatedProgress = Math.round((completedCount / lessons.length) * 100);
      setProgress(calculatedProgress);
    }
  }, [lessons]);

  const handleLessonClick = (lesson) => {
    setActiveLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markLessonComplete = async (lessonId) => {
    try {
      await axios.patch(`${API_BASE_URL}/lessons/${lessonId}`, {
        is_completed: true
      });

      const updatedLessons = lessons.map(lesson => 
        lesson.id === lessonId ? { ...lesson, is_completed: true } : lesson
      );
      setLessons(updatedLessons);

      if (!completedLessons.includes(lessonId)) {
        setCompletedLessons([...completedLessons, lessonId]);
      }

      toast.success('Lesson marked as completed!', {
        icon: '🎉',
        style: {
          background: '#4BB543',
          color: '#fff',
        }
      });

      const allCompleted = updatedLessons.every(lesson => lesson.is_completed);
      if (allCompleted) {
        toast.success("Congratulations! You've completed all lessons!", {
          icon: '🏆',
          autoClose: 5000,
          style: {
            background: '#4BB543',
            color: '#fff',
          }
        });
      } else {
        const currentIndex = lessons.findIndex(l => l.id === lessonId);
        if (currentIndex < lessons.length - 1) {
          setTimeout(() => {
            handleLessonClick(lessons[currentIndex + 1]);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error.response || error);
      toast.error('Failed to mark lesson as completed', {
        style: {
          background: '#FF3333',
          color: '#fff',
        }
      });
    }
  };

  const navigateLesson = (direction) => {
    const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < lessons.length) {
      handleLessonClick(lessons[newIndex]);
    }
  };

  const allLessonsCompleted = lessons.length > 0 && 
                            lessons.every(lesson => lesson.is_completed);

  if (loading) {
     return <CodeDevLoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Course</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center mx-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center border border-gray-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or may have been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Browse Available Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        toastClassName="rounded-lg shadow-lg"
        progressClassName="bg-white bg-opacity-30"
        bodyClassName="font-medium"
      />

      <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Sidebar with lessons */}
        <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto shadow-sm transform transition-all duration-300 hover:shadow-md">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{course.title}</h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{course.description}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center">
                <FiClock className="mr-1.5" />
                {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
              </span>
              <span className="flex items-center">
                <FiCheckCircle className="mr-1.5" />
                {completedLessons.length}/{lessons.length} completed
              </span>
            </div>
          </div>

          <nav className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Course Content</h3>
            <ul className="space-y-2">
              {lessons.map((lesson, index) => (
                <li key={lesson.id}>
                  <button
                    onClick={() => handleLessonClick(lesson)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                      activeLesson?.id === lesson.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                    } ${lesson.is_completed ? 'opacity-100' : 'opacity-90 hover:opacity-100'}`}
                  >
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-3 transition-all ${
                      lesson.is_completed
                        ? 'bg-green-100 text-green-600 shadow-inner'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {lesson.is_completed ? (
                        <FaRegCheckCircle className="text-green-500 text-sm" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="text-left truncate flex-1">
                      {lesson.title}
                    </span>
                    {lesson.is_completed && (
                      <span className="ml-2 text-green-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden transform transition-all duration-300 hover:shadow-md">
              <div className="p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-3 py-1 bg-white text-blue-600 text-xs font-semibold rounded-full shadow-sm">
                        Lesson {lessons.findIndex(l => l.id === activeLesson.id) + 1} of {lessons.length}
                      </span>
                      
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                      {activeLesson.title}
                    </h1>
                  </div>
                  <button
                    onClick={() => markLessonComplete(activeLesson.id)}
                    disabled={activeLesson.is_completed}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm ${
                      activeLesson.is_completed
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-md'
                    }`}
                  >
                    {activeLesson.is_completed ? (
                      <>
                        <FiCheckCircle className="text-lg" /> Completed
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Mark Complete
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="prose max-w-none">
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Explanation
                    </h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {activeLesson.explain}
                    </div>
                  </div>

                  {activeLesson.code_chunk && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                        <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                        </svg>
                        Code Example
                      </h3>
                      <SyntaxHighlighter 
                        language="javascript" 
                        style={vscDarkPlus}
                        showLineNumbers
                        wrapLines
                        className="rounded-lg text-sm border border-gray-700"
                        customStyle={{
                          padding: '1.25rem',
                          backgroundColor: '#1E1E1E',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          lineHeight: '1.5',
                        }}
                      >
                        {activeLesson.code_chunk}
                      </SyntaxHighlighter>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Lesson Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Created At</p>
                      <p className="text-gray-700 font-medium">
                        {new Date(activeLesson.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
                      <p className="text-gray-700 font-medium">
                        {new Date(activeLesson.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between gap-4">
                {lessons[lessons.findIndex(l => l.id === activeLesson.id) - 1] && (
                  <button
                    onClick={() => navigateLesson('prev')}
                    className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <FiChevronLeft className="text-lg" /> Previous Lesson
                  </button>
                )}
                
                <div className="flex-1"></div>
                
                {lessons[lessons.findIndex(l => l.id === activeLesson.id) + 1] ? (
                  <button
                    onClick={() => navigateLesson('next')}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    Next Lesson <FiChevronRight className="text-lg" />
                  </button>
                ) : allLessonsCompleted ? (
                  <button
                    onClick={() => navigate(`/courses/${id}/quiz`)}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg text-sm font-medium text-white hover:from-green-700 hover:to-teal-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    Complete Course <FiCheckCircle className="text-lg" />
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-5 py-2.5 bg-gray-200 rounded-lg text-sm font-medium text-gray-500 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Complete All Lessons First
                  </button>
                )}
              </div>
              
            </div>
            
          ) : (
            <div className="flex justify-center items-center h-96">
              <div className="bg-white p-8 rounded-xl shadow-md max-w-md text-center border border-gray-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Start Learning</h3>
                <p className="text-gray-600 mb-4">Select a lesson from the sidebar to begin your learning journey.</p>
                <button 
                  onClick={() => handleLessonClick(lessons[0])}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Start with First Lesson
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default LearnCourse;