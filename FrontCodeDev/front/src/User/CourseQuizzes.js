import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowRightIcon, 
  TrophyIcon,
  ClockIcon,
  LightBulbIcon,
  ChartBarIcon,
  HomeIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import Navbar from './Nav';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion'; 
import Footer from './Footer';
import CodeDevLoadingScreen from './CodeDevLoadingScreen';

const QuizComponent = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [showConfetti, setShowConfetti] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const correctMessages = [
  "Great job! You're really getting this!",
  "Perfect! You nailed it!",
  "Excellent work! Keep it up!",
  "You're on fire! Correct again!",
  "Brilliant! That's the right answer!",
  "Outstanding! Your knowledge shines!",
  "Well done! You're mastering this!",
  "Correct! You're making great progress!",
  "Awesome! That's exactly right!",
  "Superb! Your understanding is impressive!"
];
const [currentMessage, setCurrentMessage] = useState("");
  const [stats, setStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    timeSpent: 0
  });
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [timerStart, setTimerStart] = useState(Date.now());
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch quizzes for the specific course
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!courseId) {
          throw new Error('Course ID is missing');
        }

       const response = await axios.get(`/api/quizzesu?course_id=${courseId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (response.data.length === 0) {
          setError('No quizzes available for this course.');
        } else {
          setQuizzes(response.data);
          setStats(prev => ({
            ...prev,
            totalQuestions: response.data.length
          }));
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [courseId]);

  // Timer logic
  useEffect(() => {
    if (!loading && quizzes.length > 0 && !showResult && !quizCompleted) {
      setTimerStart(Date.now());
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        const timeSpentOnQuestion = Math.floor((Date.now() - timerStart) / 1000);
        setStats(prev => ({
          ...prev,
          timeSpent: prev.timeSpent + timeSpentOnQuestion
        }));
      };
    }
  }, [currentQuizIndex, showResult, quizCompleted, loading]);

  const handleOptionSelect = (option) => {
    if (!showResult) {
      setSelectedOption(option);
    }
  };

  const handleTimeUp = useCallback(() => {
    if (!showResult && selectedOption === null) {
      const timeSpentOnQuestion = Math.floor((Date.now() - timerStart) / 1000);
      setStats(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + timeSpentOnQuestion,
        incorrectAnswers: prev.incorrectAnswers + 1
      }));
      setShowResult(true);
      setIsCorrect(false);
    }
  }, [showResult, selectedOption, timerStart]);

  const checkAnswer = useCallback(() => {
  if (selectedOption === null) return;

  const currentQuiz = quizzes[currentQuizIndex];
  const correct = selectedOption === currentQuiz.correct_answer;
  const timeSpentOnQuestion = Math.floor((Date.now() - timerStart) / 1000);
  
  setIsCorrect(correct);
  setStats(prev => ({
    ...prev,
    timeSpent: prev.timeSpent + timeSpentOnQuestion,
    correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
    incorrectAnswers: correct ? prev.incorrectAnswers : prev.incorrectAnswers + 1
  }));
  
  if (correct) {
    setScore(score + 1);
    // Select a random congratulatory message
    const randomMessage = correctMessages[Math.floor(Math.random() * correctMessages.length)];
    setCurrentMessage(randomMessage);
  }
  
  setShowResult(true);
  setTimeRemaining(0);

  if (currentQuizIndex === quizzes.length - 1) {
    handleQuizCompletion();
  }
}, [selectedOption, quizzes, currentQuizIndex, score, timerStart]);

  const handleQuizCompletion = async () => {
    try {
      setSubmitting(true);
      const percentage = Math.round((score / quizzes.length) * 100);
      
      if (courseId) {
        const result = await submitQuizToBackend();
        console.log('Quiz submitted successfully:', result);
        
        if (percentage >= 70) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      } else {
        console.error('Course ID is missing');
      }
      
      setQuizCompleted(true);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      setError('Failed to save quiz results. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitQuizToBackend = async () => {
    try {
      const utilisateurId = localStorage.getItem('utilisateur_id');
      const percentage = Math.round((score / quizzes.length) * 100);
      
      if (!utilisateurId) {
        throw new Error('User ID not found in local storage');
      }
      if (!courseId) {
        throw new Error('Course ID is missing');
      }

      const response = await axios.post('/api/submitQuiz', {
        utilisateur_id: utilisateurId,
        course_id: courseId, 
        score: percentage
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Detailed error:', error);
      throw error;
    }
  };

  const restartQuiz = () => {
    setCurrentQuizIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowResult(false);
    setQuizCompleted(false);
    setTimeRemaining(20);
    setError(null);
    setStats({
      totalQuestions: quizzes.length,
      correctAnswers: 0,
      incorrectAnswers: 0,
      timeSpent: 0
    });
    setTimerStart(Date.now());
  };

  const nextQuestion = useCallback(() => {
    setSelectedOption(null);
    setIsCorrect(null);
    setShowResult(false);
    setTimeRemaining(20);
    setError(null);
    setTimerStart(Date.now());
    
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      const percentage = Math.round((score / quizzes.length) * 100);
      if (percentage >= 70) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      setQuizCompleted(true);
    }
  }, [currentQuizIndex, quizzes.length, score]);

  const getOptionClasses = (option) => {
    let baseClasses = "p-4 text-left rounded-xl border-2 transition-all duration-200 flex items-start cursor-pointer";
    
    if (showResult) {
      if (option === quizzes[currentQuizIndex]?.correct_answer) {
        return `${baseClasses} border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm`;
      }
      if (option === selectedOption && !isCorrect) {
        return `${baseClasses} border-rose-500 bg-rose-50 text-rose-800 shadow-sm`;
      }
      return `${baseClasses} border-gray-200 opacity-70`;
    }
    
    if (selectedOption === option) {
      return `${baseClasses} border-blue-500 bg-blue-50 text-blue-800 shadow-sm`;
    }
    
    return `${baseClasses} border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm`;
  };

  if (loading) {
     return <CodeDevLoadingScreen />;
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4"
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="p-4 bg-amber-100 rounded-full">
              <ExclamationTriangleIcon className="w-12 h-12 text-amber-500" />
            </div>
            <motion.h3 variants={itemVariants} className="text-2xl font-bold text-gray-800">Error Loading Quiz</motion.h3>
            <motion.p variants={itemVariants} className="text-gray-600">{error}</motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all font-medium flex-1 flex items-center justify-center"
              >
                <ArrowRightIcon className="w-5 h-5 mr-2 transform rotate-180" />
                Go Back
              </button>
              <button
                onClick={restartQuiz}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-800 rounded-xl hover:bg-gray-50 transition-all font-medium flex-1 flex items-center justify-center"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Try Again
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  if (quizzes.length === 0 && !loading) {
    return (<>
      <Navbar />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4"
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="p-4 bg-blue-100 rounded-full">
              <BookOpenIcon className="w-12 h-12 text-blue-500" />
            </div>
            <motion.h3 variants={itemVariants} className="text-2xl font-bold text-gray-800">No Quiz Available</motion.h3>
            <motion.p variants={itemVariants} className="text-gray-600">This course doesn't have any quiz questions yet.</motion.p>
            <motion.div variants={itemVariants} className="w-full">
              <button
                onClick={() => navigate(-1)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium flex items-center justify-center"
              >
                <ArrowRightIcon className="w-5 h-5 mr-2 transform rotate-180" />
                Return to Course
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
      <Footer />
      </>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / quizzes.length) * 100);
    const averageTimePerQuestion = stats.timeSpent > 0 ? Math.round(stats.timeSpent / quizzes.length) : 0;
    const passed = percentage >= 70;
    
    return (<>
      <Navbar />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      >
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            colors={['#3B82F6', '#10B981', '#F59E0B', '#6366F1']}
          />
        )}
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto p-6"
        >
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-8 text-center">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative mx-auto w-44 h-44 mb-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 blur-xl"></div>
                <div className="relative flex items-center justify-center w-full h-full">
                  <div className={`w-36 h-36 rounded-full flex items-center justify-center shadow-inner ${
                    percentage >= 90 ? 'bg-gradient-to-br from-amber-100 to-amber-200' :
                    passed ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
                    'bg-gradient-to-br from-gray-100 to-gray-200'
                  }`}>
                    <TrophyIcon className={`w-24 h-24 ${
                      percentage >= 90 ? 'text-amber-500' :
                      passed ? 'text-blue-500' :
                      'text-gray-400'
                    }`} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-800">{percentage}%</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.h2 
                variants={itemVariants}
                className="text-3xl font-bold text-gray-800 mb-3"
              >
                {percentage >= 90 ? 'Excellent Work!' : 
                 passed ? 'Congratulations!' : 'Quiz Completed'}
              </motion.h2>
              
              <motion.p 
                variants={itemVariants}
                className="text-xl text-gray-600 mb-8"
              >
                You answered {score} out of {quizzes.length} questions correctly.
              </motion.p>
              
              <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
              >
                <motion.div 
                  variants={itemVariants}
                  className="bg-emerald-50 p-5 rounded-xl border border-emerald-100"
                >
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                    <span className="font-medium text-emerald-700">Correct</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{stats.correctAnswers}</p>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="bg-rose-50 p-5 rounded-xl border border-rose-100"
                >
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <XCircleIcon className="w-6 h-6 text-rose-500" />
                    <span className="font-medium text-rose-700">Incorrect</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{stats.incorrectAnswers}</p>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="bg-indigo-50 p-5 rounded-xl border border-indigo-100"
                >
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <ClockIcon className="w-6 h-6 text-indigo-500" />
                    <span className="font-medium text-indigo-700">Avg Time</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{averageTimePerQuestion}s</p>
                </motion.div>
              </motion.div>
              
              {percentage >= 90 && (
                <motion.div 
                  variants={itemVariants}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl mb-6"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <TrophyIcon className="w-5 h-5" />
                    <p className="font-medium">Outstanding performance! You've mastered this material.</p>
                  </div>
                </motion.div>
              )}
              
              {passed && (
                <motion.div 
                  variants={itemVariants}
                  className="mb-6"
                >
                  <button
                    onClick={() => {
                      if (courseId) {
                        navigate(`/certificate/${courseId}`);
                      } else {
                        setError('Cannot generate certificate: course ID is missing');
                      }
                    }}
                    className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all font-medium shadow-lg flex items-center justify-center"
                  >
                    <TrophyIcon className="w-6 h-6 mr-3" />
                    View Your Certificate
                  </button>
                </motion.div>
              )}
              
              {!passed && (
                <motion.div 
                  variants={itemVariants}
                  className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <AcademicCapIcon className="w-5 h-5" />
                    <p className="font-medium">Review the material and try again to improve your score.</p>
                  </div>
                </motion.div>
              )}
              
              <motion.div 
                variants={containerVariants}
                className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4"
              >
                <motion.button
                  variants={itemVariants}
                  onClick={restartQuiz}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md flex items-center justify-center"
                >
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  Retake Quiz
                </motion.button>
                <motion.button
                  variants={itemVariants}
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-800 rounded-xl hover:bg-gray-50 transition-all font-medium shadow-sm flex items-center justify-center"
                >
                  <HomeIcon className="w-5 h-5 mr-2" />
                  Return Home
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      <Footer />
      </>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];
  const options = [
    currentQuiz.option_1,
    currentQuiz.option_2,
    currentQuiz.option_3,
    currentQuiz.option_4
  ].filter(option => option);

  return (
    <>
      <Navbar />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Quiz Header */}
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Knowledge Check</h2>
                  <p className="text-gray-600">Test your understanding of the course material</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="block text-xs text-gray-500 font-medium">Question</span>
                    <span className="block font-bold text-gray-800">
                      {currentQuizIndex + 1} / {quizzes.length}
                    </span>
                  </div>
                  <div className="text-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="block text-xs text-gray-500 font-medium">Score</span>
                    <span className="block font-bold text-blue-600">
                      {score} / {quizzes.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Quiz Content */}
            <div className="p-6 sm:p-8">
              {/* Timer */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-2" /> Time Remaining
                  </span>
                  <span className={`text-sm font-medium ${
                    timeRemaining > 10 ? 'text-emerald-600' : 
                    timeRemaining > 5 ? 'text-amber-500' : 'text-rose-600'
                  }`}>
                    {timeRemaining}s
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-1000 ${
                      timeRemaining > 10 ? 'bg-emerald-500' : 
                      timeRemaining > 5 ? 'bg-amber-500' : 'bg-rose-500'
                    }`} 
                    style={{ width: `${(timeRemaining / 20) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Question */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-gray-800 leading-relaxed">
                  {currentQuiz.question}
                </h3>
                {currentQuiz.code_snippet && (
                  <pre className="mt-4 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm font-mono">
                    <code>{currentQuiz.code_snippet}</code>
                  </pre>
                )}
              </motion.div>
              
              {/* Options */}
              <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 gap-3 mb-8"
              >
                {options.map((option, index) => (
                  <motion.button
                    key={index}
                    variants={itemVariants}
                    className={getOptionClasses(option)}
                    onClick={() => handleOptionSelect(option)}
                    disabled={showResult}
                    whileHover={!showResult ? { scale: 1.02 } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        {showResult && option === currentQuiz.correct_answer ? (
                          <CheckCircleIcon className="w-6 h-6 mr-3 text-emerald-500" />
                        ) : showResult && option === selectedOption && !isCorrect ? (
                          <XCircleIcon className="w-6 h-6 mr-3 text-rose-500" />
                        ) : (
                          <div className="w-6 h-6 mr-3 flex items-center justify-center bg-gray-100 rounded-full text-gray-700 font-medium">
                            {String.fromCharCode(65 + index)}
                          </div>
                        )}
                      </div>
                      <span className="text-left">{option}</span>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
              
              {/* Action Buttons */}
              {!showResult ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row justify-between gap-4"
                >
                  <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium border border-gray-300"
                  >
                    Exit Quiz
                  </button>
                  <button
                    onClick={checkAnswer}
                    disabled={selectedOption === null}
                    className={`px-6 py-3 rounded-xl font-medium text-white transition-all flex items-center justify-center ${
                      selectedOption === null ? 
                        'bg-gray-400 cursor-not-allowed' : 
                        'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md'
                    }`}
                  >
                    Submit Answer
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  <div className={`p-5 rounded-xl ${
  isCorrect ? 
    'bg-emerald-50 border border-emerald-200 text-emerald-800' : 
    'bg-rose-50 border border-rose-200 text-rose-800'
}`}>
  <div className="flex items-start">
    {isCorrect ? (
      <>
        <CheckCircleIcon className="w-6 h-6 mr-3 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">{currentMessage}</p>
          {currentQuiz.explanation && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 flex items-center">
                <LightBulbIcon className="w-4 h-4 mr-2 text-amber-500" />
                Explanation
              </p>
              <p className="mt-1 text-sm">{currentQuiz.explanation}</p>
            </div>
          )}
        </div>
      </>
    ) : (
      <>
        <XCircleIcon className="w-6 h-6 mr-3 text-rose-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">
            Incorrect. The correct answer is: {currentQuiz.correct_answer}
          </p>
          {currentQuiz.explanation && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 flex items-center">
                <LightBulbIcon className="w-4 h-4 mr-2 text-amber-500" />
                Explanation
              </p>
              <p className="mt-1 text-sm">{currentQuiz.explanation}</p>
            </div>
          )}
        </div>
      </>
    )}
  </div>
</div>
                  
                  <button
                    onClick={nextQuestion}
                    disabled={submitting}
                    className={`w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl transition-all flex items-center justify-center shadow-md ${
                      submitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-800'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : currentQuizIndex < quizzes.length - 1 ? (
                      <>
                        Next Question <ArrowRightIcon className="w-5 h-5 ml-2" />
                      </>
                    ) : (
                      'View Results'
                    )}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default QuizComponent;