import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import Nav from './Nav';
import Footer from './Footer';

const slides = [
  {
    title: "Learn React",
    description: "Build modern user interfaces with this popular JavaScript library",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    courseId: "react-course"
  },
  {
    title: "Master Python",
    description: "Versatile language for web, data, and automation",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    courseId: "python-course"
  },
  {
    title: "Discover Laravel",
    description: "Elegant PHP framework for web artisans",
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    courseId: "laravel-course"
  }
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        // Take only the first 3 courses
        setCourses(data.slice(0, 3));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleStartLearning = () => {
    navigate('/courses'); // Navigate to courses page instead of specific course
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      
      {/* Hero Slider */}
      <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden shadow-lg">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0 relative">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
              </div>
              <div className="relative h-full flex flex-col justify-center items-start text-white px-8 md:px-16 lg:px-24 max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{slide.title}</h2>
                <p className="text-xl md:text-2xl mb-8 text-gray-100">{slide.description}</p>
                <button 
                  onClick={handleStartLearning}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 transition-all font-semibold text-lg rounded-md shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Start Learning Now
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-md transition-all backdrop-blur-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-md transition-all backdrop-blur-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${currentSlide === index ? 'bg-white w-8' : 'bg-white/50 w-3 hover:w-5'}`}
            />
          ))}
        </div>
      </div>
      
      {/* Welcome Animation Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-blue-600">CodeDev</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Your journey to becoming a skilled developer starts here. We provide comprehensive courses 
              designed by industry experts to help you master in-demand technologies.
            </p>
            <button 
              onClick={() => navigate('/about')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Learn More About Us
            </button>
          </div>
          <div className="md:w-1/2">
            <Player
              autoplay
              loop
              src="https://assets5.lottiefiles.com/packages/lf20_ikvz7qhc.json"
              style={{ height: '400px', width: '100%' }}
            />
          </div>
        </div>
      </section>
      
      {/* Courses Section */}
      <section className="py-16 px-6 md:px-12 lg:px-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Courses</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p>Loading courses...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>Error: {error}</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                    <img 
                      src={`http://localhost:8000${course.image}`}
                      alt={course.title} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h3>
                      <p className="text-gray-600 mb-4">{course.description}</p>
                      <div className="flex justify-end">
                        <button 
                          onClick={() => navigate(`/courses/${course.id}`)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                        >
                          View Course
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <button 
                  onClick={() => navigate('/courses')}
                  className="px-8 py-3 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  Browse All Courses
                </button>
              </div>
            </>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Home;