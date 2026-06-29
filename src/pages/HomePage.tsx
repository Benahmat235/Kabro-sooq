import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeTab } from '../components/HomeTab';
import { Listing } from '../types';
import { motion } from 'motion/react';
import { AppRoutes } from '../router';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleQuickView = useCallback((listing: Listing) => {
    navigate(AppRoutes.AD_DETAIL.replace(':id', listing.id));
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <HomeTab onQuickView={handleQuickView} />
    </motion.div>
  );
};

