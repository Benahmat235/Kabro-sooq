import React from 'react';
import { ChatsList } from '../components/ChatsList';
import { ChatRoom } from '../components/ChatRoom';
import { motion } from 'motion/react';

export const MessagesPage: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans"
    >
      {/* Conversations list column */}
      <div className="md:col-span-1 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden h-[500px] md:h-[600px] overflow-y-auto">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-800">Messages</h3>
        </div>
        <ChatsList />
      </div>

      {/* Conversation active workspace */}
      <div className="md:col-span-2">
        <ChatRoom />
      </div>
    </motion.div>
  );
};
