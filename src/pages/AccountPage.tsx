import React from 'react';
import { AccountTab } from '../components/AccountTab';
import { motion } from 'motion/react';

export const AccountPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AccountTab />
    </motion.div>
  );
};
