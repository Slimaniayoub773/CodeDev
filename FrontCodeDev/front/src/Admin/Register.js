import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaCode, FaUserPlus, FaRedo, FaEye, FaEyeSlash, FaTimesCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// CAPTCHA generation utility
const generateCaptcha = () => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    captcha += chars[randomIndex];
  }
  return captcha;
};

const generateCaptchaImage = (captchaText, width = 200, height = 80) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, width, height);
  
  // Add noise
  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.2)`;
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  // Draw text
  ctx.fillStyle = '#000';
  ctx.font = 'bold 30px Arial';
  
  // Distort each character
  for (let i = 0; i < captchaText.length; i++) {
    ctx.save();
    ctx.translate(30 + (i * 25), 50);
    ctx.rotate((Math.random() - 0.5) * 0.4);
    ctx.fillText(captchaText[i], 0, 0);
    ctx.restore();
  }
  
  return canvas.toDataURL();
};

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      if (captchaInput !== captcha) {
        toast.error("CAPTCHA verification failed. Please try again.");
        refreshCaptcha();
        setIsLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:8000/api/register', data);
      
      toast.success(
        <div className="flex items-center gap-2">
          <FaUserPlus className="text-green-500" />
          <span>Registration successful! Redirecting...</span>
        </div>
      );

      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(
        <div className="flex items-center gap-2">
          <FaUserPlus className="text-red-500" />
          <span>{error.response?.data?.message || 'Registration failed'}</span>
        </div>
      );
      refreshCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm w-full max-w-md border border-blue-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-3 rounded-full mb-3 text-white">
            <FaCode className="text-2xl" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Join CodeDev</h2>
          <p className="text-gray-500 text-sm mt-1">Start your coding journey today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('name', { 
                  required: 'Name is required',
                  minLength: { value: 3, message: 'Minimum 3 characters' }
                })}
                className="w-full pl-3 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Your full name"
              />
              <FaUser className="absolute right-3 top-3 text-gray-400" />
            </div>
            {errors.name && (
              <span className="text-red-500 text-xs mt-1 flex items-center">
                <FaTimesCircle className="mr-1 text-xs" />
                {errors.name.message}
              </span>
            )}
          </div>

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
                <FaTimesCircle className="mr-1 text-xs" />
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
                  minLength: { value: 6, message: 'Minimum 6 characters' }
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
                <FaTimesCircle className="mr-1 text-xs" />
                {errors.password.message}
              </span>
            )}
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>

          {/* CAPTCHA Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Verify you're human
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-50 rounded-lg p-2 flex justify-center items-center border border-gray-200">
                {captchaImage ? (
                  <img src={captchaImage} alt="CAPTCHA" className="h-10 object-contain" />
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
              <FaUserPlus className="text-sm" />
            )}
            <span className="text-sm">{isLoading ? 'Creating account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;