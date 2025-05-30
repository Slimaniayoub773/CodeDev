import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaCode, FaLock, FaEnvelope, FaSignInAlt, FaRedo, FaEye, FaEyeSlash } from 'react-icons/fa';
import { generateCaptcha, generateCaptchaImage } from './generateCaptcha';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize CAPTCHA
  useEffect(() => {
    refreshCaptcha();
  }, []);

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptcha(newCaptcha);
    setCaptchaImage(generateCaptchaImage(newCaptcha));
    setCaptchaInput('');
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Verify CAPTCHA first
      if (captchaInput !== captcha) {
        toast.error("CAPTCHA verification failed. Please try again.", {
          position: "top-center",
        });
        refreshCaptcha();
        setIsLoading(false);
        return;
      }

      // Proceed with login
      const response = await axios.post('http://localhost:8000/api/login', data);
      
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from server');
      }

      const { token, role, user } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('role', role);
      
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('utilisateur_id', user.id);
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      toast.success("Login successful! Redirecting...", {
        position: "top-center",
        autoClose: 3000,
      });

      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];

      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Login failed. Please try again.';
      
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });

      refreshCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm w-full max-w-sm md:max-w-md border border-blue-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-3 rounded-full mb-3 text-white">
            <FaCode className="text-2xl" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">CodeDev</h2>
          <p className="text-gray-500 text-sm mt-1">Sign in to continue learning</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full pl-3 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="your@email.com"
              />
              <FaEnvelope className="absolute right-3 top-3 text-gray-400" />
            </div>
            {errors.email && (
              <span className="text-red-500 text-xs mt-1 flex items-center">
                <FaTimesCircle className="mr-1" />
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-blue-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-500 text-xs mt-1 flex items-center">
                <FaTimesCircle className="mr-1" />
                {errors.password.message}
              </span>
            )}
          </div>

          {/* CAPTCHA Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Verify you're human
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-50 rounded-lg p-2 flex justify-center items-center border border-gray-200">
                {captchaImage ? (
                  <img 
                    src={captchaImage} 
                    alt="CAPTCHA" 
                    className="h-10 object-contain"
                  />
                ) : (
                  <div className="h-10 w-full flex items-center justify-center text-gray-400 text-sm">
                    Loading...
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition"
                aria-label="Refresh CAPTCHA"
              >
                <FaRedo className="text-sm" />
              </button>
            </div>
            <input
              type="text"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Enter CAPTCHA"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 ${isLoading ? 'opacity-80' : ''}`}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FaSignInAlt className="text-sm" />
            )}
            <span className="text-sm">{isLoading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-gray-500 text-sm">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Register
            </a>
          </p>
          <a href="/forgot-password" className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;