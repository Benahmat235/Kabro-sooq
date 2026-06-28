import React from 'react';
import { motion } from 'motion/react';

export const PageLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-start min-h-[400px] w-full p-4 pt-10" id="page-loader">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        
        {/* Header Skeleton */}
        <div className="flex items-center justify-between w-full">
          <motion.div 
            className="h-8 w-32 bg-gray-100 rounded-xl"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="flex gap-2">
            <motion.div 
              className="h-8 w-8 bg-gray-100 rounded-full"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
            />
            <motion.div 
              className="h-8 w-8 bg-gray-100 rounded-full"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <motion.div 
          className="w-full h-12 bg-gray-100 rounded-2xl"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />

        {/* Categories Skeleton */}
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div 
              key={i}
              className="h-10 w-24 shrink-0 bg-gray-100 rounded-xl"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 * i }}
            />
          ))}
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <motion.div 
                className="w-full aspect-square bg-gray-100 rounded-2xl"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 * i }}
              />
              <motion.div 
                className="h-4 w-3/4 bg-gray-100 rounded-md"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 * i + 0.1 }}
              />
              <motion.div 
                className="h-4 w-1/2 bg-gray-100 rounded-md"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 * i + 0.2 }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
