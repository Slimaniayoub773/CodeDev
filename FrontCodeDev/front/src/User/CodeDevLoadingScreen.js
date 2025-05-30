import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const CodeDevLoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [tips, setTips] = useState([
    "Did you know? Taking short breaks improves learning retention.",
    "Pro tip: Practice coding daily for best results.",
    "Learning in small chunks is more effective than marathon sessions.",
    "The best programmers started exactly where you are now!",
    "Mistakes are just learning opportunities in disguise."
  ]);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 300);

    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(tipInterval);
    };
  }, [tips.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-white p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="text-center mb-8"
      >
        <motion.h1 
          className="text-6xl md:text-8xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-800"
          animate={{
            textShadow: [
              "0 0 8px rgba(29, 78, 216, 0.3)",
              "0 0 12px rgba(29, 78, 216, 0.4)",
              "0 0 8px rgba(29, 78, 216, 0.3)"
            ]
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
        >
          &lt;CodeDev /&gt;
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-blue-800 opacity-0 mb-6"
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Crafting your perfect learning environment...
        </motion.p>

        <motion.div
          className="max-w-md mx-auto bg-blue-50 rounded-lg p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <motion.p 
              key={currentTip}
              className="text-sm text-blue-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {tips[currentTip]}
            </motion.p>
          </div>
        </motion.div>
      </motion.div>

      <div className="w-full max-w-md">
        <motion.div 
          className="h-3 bg-blue-100 rounded-full overflow-hidden mb-2"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-900 to-blue-800"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%']
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "linear"
            }}
          />
        </motion.div>
        
        <motion.div 
          className="flex justify-between text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-blue-900 font-medium">Loading...</span>
          <span className="text-blue-800 font-bold">{Math.min(100, Math.round(progress))}%</span>
        </motion.div>
      </div>

      <motion.div
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-blue-800 rounded-full"
              animate={{
                y: [0, -10, 0],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CodeDevLoadingScreen;