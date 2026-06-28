import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { MessageSquare, Calendar, Archive } from 'lucide-react';
import { Chat } from '../types';

export const ChatsList: React.FC = () => {
  const { language, chats, activeChatId, setActiveChatId, user } = useApp();
  const [showArchived, setShowArchived] = useState(false);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + " FCFA";
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
  };

  const visibleChats = chats.filter((c) => {
    const isArchived = user ? (c.archivedBy?.includes(user.uid) || false) : false;
    return showArchived ? isArchived : !isArchived;
  });

  const hasArchivedChats = user ? chats.some(c => c.archivedBy?.includes(user.uid)) : false;

  return (
    <div className="flex flex-col h-full bg-white">
      {hasArchivedChats && (
        <div className="p-3 border-b border-gray-100 flex justify-end">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center space-x-1.5 text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors bg-gray-50 hover:bg-primary-50 px-3 py-1.5 rounded-full"
          >
            <Archive className="h-3.5 w-3.5" />
            <span>{showArchived ? "Masquer les archives" : "Voir les archives"}</span>
          </button>
        </div>
      )}

      <div className="divide-y divide-gray-50" id="chats-list">
        {visibleChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center font-sans">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600 mb-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">
              {showArchived ? "Aucune conversation archivée" : getTranslation(language, 'noChats')}
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-[260px]">
              {showArchived ? "" : "Contactez un vendeur depuis l'aperçu d'une annonce pour entamer une conversation."}
            </p>
          </div>
        ) : (
          visibleChats.map((chat) => {
            const isSelected = activeChatId === chat.id;
            const otherParticipantName = user?.uid === chat.buyerId ? chat.sellerName : chat.buyerName;
            const chatUnreadCount = user ? (chat.unreadCount?.[user.uid] || 0) : 0;

            return (
              <button
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className={`w-full flex items-center space-x-3.5 p-4 text-left transition-colors ${isSelected ? 'bg-primary-50/50 border-l-4 border-primary-600' : 'hover:bg-gray-50/40 border-l-4 border-transparent'}`}
              >
                {/* Listing Thumbnail */}
                <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-gray-50">
                  <img 
                    src={chat.listingImage} 
                    alt={chat.listingTitle} 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Conversation text details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs truncate leading-tight ${chatUnreadCount > 0 ? 'font-black text-primary-900' : 'font-bold text-gray-800'}`}>
                      {otherParticipantName}
                    </p>
                    <span className={`text-[9px] font-mono font-bold ${chatUnreadCount > 0 ? 'text-primary-600' : 'text-gray-400'}`}>
                      {new Date(chat.lastMessageAt).toLocaleTimeString(language === 'EN' ? 'en' : 'fr', { hour: '2-digit', minute: '2-digit' })}

                </span>
              </div>

              <p className="text-[11px] font-bold text-primary-600 font-mono mt-0.5">
                {chat.listingTitle} — {formatPrice(chat.listingPrice)}
              </p>

              <div className="flex items-center justify-between mt-1">
                <p className={`text-[11px] truncate ${chatUnreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>
                  {chat.lastMessage}
                </p>
                {chatUnreadCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-600 px-1 text-[9px] font-bold text-white shrink-0 ml-2">
                    {chatUnreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })
      )}
      </div>
    </div>
  );
};
