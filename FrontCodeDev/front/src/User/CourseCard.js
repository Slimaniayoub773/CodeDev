import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Nav';
import Footer from './Footer';
import CodeDevLoadingScreen from './CodeDevLoadingScreen';

const CourseCard = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoverRating, setHoverRating] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:8000/api';

  const isCourseRated = (courseId) => {
    try {
      const cookieName = `rated_${courseId}`;
      return document.cookie
        .split(';')
        .some(cookie => {
          const [name, value] = cookie.trim().split('=');
          return name === cookieName && value === 'true';
        });
    } catch (error) {
      console.error('Cookie check error:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/courses`);
        const coursesWithRatingStatus = response.data.map(course => ({
          ...course,
          rating: parseFloat(course.rating) || 0,
          rating_count: parseInt(course.rating_count) || 0,
          isRated: isCourseRated(course.id)
        }));
        
        setCourses(coursesWithRatingStatus);
        setFilteredCourses(coursesWithRatingStatus);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    let results = [...courses];
    
    if (searchTerm) {
      results = results.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (ratingFilter > 0) {
      results = results.filter(course => course.rating >= ratingFilter);
    }
    
    setFilteredCourses(results);
  }, [searchTerm, ratingFilter, courses]);

  const handleRating = async (courseId, rating) => {
    try {
      if (isCourseRated(courseId)) {
        toast.warning('You have already rated this course.');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/courses/${courseId}/rate`,
        { rating },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.success !== false) {
        setCourses(prevCourses => 
          prevCourses.map(course => {
            if (course.id === courseId) {
              return { 
                ...course, 
                rating: parseFloat(response.data.new_rating),
                rating_count: parseInt(response.data.rating_count),
                isRated: true
              };
            }
            return course;
          })
        );

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        document.cookie = `rated_${courseId}=true; expires=${expiryDate.toUTCString()}; path=/; ${
          process.env.NODE_ENV === 'production' ? 'secure; samesite=strict' : ''
        }`;

        toast.success('Rating submitted successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to save rating');
      }
    } catch (error) {
      console.error('Rating error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit rating. Please try again.');
    }
  };

  const renderStars = (courseId, currentRating, ratingCount) => {
    const displayRating = hoverRating[courseId] ?? currentRating;
    const course = filteredCourses.find(c => c.id === courseId);
    const isRated = course?.isRated;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`focus:outline-none transition-transform ${isRated ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:scale-125'}`}
            onMouseEnter={() => !isRated && setHoverRating(prev => ({ ...prev, [courseId]: star }))}
            onMouseLeave={() => !isRated && setHoverRating(prev => ({ ...prev, [courseId]: null }))}
            onClick={() => !isRated && handleRating(courseId, star)}
            disabled={isRated}
            aria-label={`Rate ${star} star`}
          >
            <svg
              className={`w-5 h-5 transition-colors ${star <= displayRating ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        <span className="ml-2 text-gray-600 text-sm font-medium">
          {currentRating.toFixed(1)} ({ratingCount})
        </span>
      </div>
    );
  };

  if (loading) {
     return <CodeDevLoadingScreen />;
  }

  return (
    <>
      <Navbar />
      <ToastContainer 
        position="top-center" 
        autoClose={3000}
        toastClassName="rounded-lg shadow-md"
        progressClassName="bg-blue-500"
      />
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Discover Our Courses</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Enhance your skills with our comprehensive programming courses
            </p>
          </div>
          
          <div className="mb-10">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="w-full md:w-2/3 relative">
                <input
                  type="text"
                  placeholder="Search courses by title or description..."
                  className="w-full px-6 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="absolute right-4 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <div className="w-full md:w-1/3 flex items-center">
                <label htmlFor="ratingFilter" className="mr-3 text-gray-600 font-medium whitespace-nowrap">
                  Filter by Rating:
                </label>
                <select
                  id="ratingFilter"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(Number(e.target.value))}
                >
                  <option value="0">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
              {searchTerm && ` matching "${searchTerm}"`}
              {ratingFilter > 0 && ` with ${ratingFilter}+ stars`}
            </p>
          </div>
          
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-700">No courses found</h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                {searchTerm || ratingFilter > 0
                  ? "We couldn't find any courses matching your criteria. Try adjusting your filters."
                  : "There are currently no courses available. Check back later!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <div 
                  key={course.id} 
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 hover:border-blue-100"
                >
                  <div className="relative h-48 overflow-hidden group">
                    {course.image ? (
                      <img
                        src={`${API_BASE_URL.replace('/api', '')}${course.image}`}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                        <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 8l-4-4-4 4m0 6l4-4 4 4" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <div className="text-white">
                        <p className="text-sm font-medium">
                          {course.start_date && new Date(course.start_date).toLocaleDateString()} - {course.end_date && new Date(course.end_date).toLocaleDateString()}
                        </p>
                        {course.duration && (
                          <p className="text-xs mt-1">{course.duration} weeks</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-xl text-gray-900 line-clamp-2">{course.title}</h3>
                        {course.price && (
                          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-2.5 py-0.5 rounded whitespace-nowrap ml-2">
                            ${course.price}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center mb-3">
                        <div className="flex items-center mr-3">
                          <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs text-gray-500">{course.duration || 'Flexible'} weeks</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-xs text-gray-500">{course.rating_count || 0} students</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        {renderStars(course.id, course.rating, course.rating_count)}
                        <button
                          onClick={() => navigate(`/courses/${course.id}`)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow hover:shadow-md flex items-center"
                        >
                          View Details
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseCard;