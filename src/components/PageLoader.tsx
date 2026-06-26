import React from 'react';
import { motion } from 'motion/react';

export const PageLoader: React.FC = () => {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[400px] w-full py-12 px-4"
      id="page-loader"
    >
      <div className="relative flex items-center justify-center">
        {/* Outer pulse ring */}
        <motion.div 
          className="absolute h-16 w-16 rounded-full border border-blue-100 bg-blue-50/30"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 0.2, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Middle pulsing ring */}
        <motion.div 
          className="absolute h-12 w-12 rounded-full border border-blue-200 bg-blue-100/40"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 0.4, 0.8],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />

        {/* Spinner */}
        <motion.div
          className="h-8 w-8 rounded-full border-3 border-gray-100 border-t-3 border-t-blue-600 shadow-xs"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <motion.p
        className="mt-6 text-xs font-bold text-gray-400 uppercase tracking-widest"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Chargement...
      </motion.p>
    </div>
  );
};
