import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MyAdsTab } from '../components/MyAdsTab';
import { motion } from 'motion/react';

export const MyAdsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MyAdsTab 
        onPublishClick={() => navigate('/publish')} 
      />
    </motion.div>
  );
};
