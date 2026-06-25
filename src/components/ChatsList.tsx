import React from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { MessageSquare, Calendar } from 'lucide-react';
import { Chat } from '../types';

export const ChatsList: React.FC = () => {
  const { language, chats, activeChatId, setActiveChatId, user } = useApp();

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + " FCFA";
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
  };

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center font-sans">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-gray-800">{getTranslation(language, 'noChats')}</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-[260px]">Contactez un vendeur depuis l'aperçu d'une annonce pour entamer une conversation.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50 bg-white" id="chats-list">
      {chats.map((chat) => {
        const isSelected = activeChatId === chat.id;
        const otherParticipantName = user?.uid === chat.buyerId ? chat.sellerName : chat.buyerName;
        const chatUnreadCount = user ? (chat.unreadCount?.[user.uid] || 0) : 0;

        return (
          <button
            key={chat.id}
            onClick={() => handleChatSelect(chat.id)}
            className={`w-full flex items-center space-x-3.5 p-4 text-left transition-colors ${isSelected ? 'bg-blue-50/50 border-l-4 border-blue-600' : 'hover:bg-gray-50/40 border-l-4 border-transparent'}`}
          >
            {/* Listing Thumbnail */}
            <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-gray-50">
              <img 
                src={chat.listingImage} 
                alt={chat.listingTitle} 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Conversation text details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-xs truncate leading-tight ${chatUnreadCount > 0 ? 'font-black text-blue-900' : 'font-bold text-gray-800'}`}>
                  {otherParticipantName}
                </p>
                <span className={`text-[9px] font-mono font-bold ${chatUnreadCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                  {new Date(chat.lastMessageAt).toLocaleTimeString(language === 'EN' ? 'en' : 'fr', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-[11px] font-bold text-blue-600 font-mono mt-0.5">
                {chat.listingTitle} — {formatPrice(chat.listingPrice)}
              </p>

              <div className="flex items-center justify-between mt-1">
                <p className={`text-[11px] truncate ${chatUnreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>
                  {chat.lastMessage}
                </p>
                {chatUnreadCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white shrink-0 ml-2">
                    {chatUnreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
