import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { Send, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export const ChatRoom: React.FC = () => {
  const { 
    language, 
    activeChatId, 
    setActiveChatId, 
    chats, 
    messages, 
    loadingMessages, 
    sendMessage, 
    user 
  } = useApp();

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  // Auto-scroll messages list to the bottom on change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeChatId || sending) return;

    setSending(true);
    try {
      await sendMessage(activeChatId, text.trim());
      setText('');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi du message.");
    } finally {
      setSending(false);
    }
  };

  if (!activeChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 font-sans">
        <p className="text-sm font-bold text-gray-500">Sélectionnez une conversation pour commencer à discuter.</p>
      </div>
    );
  }

  const otherParticipantName = user?.uid === activeChat.buyerId ? activeChat.sellerName : activeChat.buyerName;

  return (
    <div className="flex flex-col h-[500px] md:h-[600px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100" id="chat-room">
      
      {/* Top Conversation Header */}
      <div className="flex items-center space-x-3.5 bg-white border-b border-gray-100 px-4 py-3 shrink-0">
        <button
          onClick={() => setActiveChatId(null)}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-100 shrink-0">
          {otherParticipantName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="text-xs font-black text-gray-800 flex items-center space-x-1">
            <span>{otherParticipantName}</span>
          </h3>
          <p className="text-[10px] font-bold text-blue-600 font-mono mt-0.5">{activeChat.listingTitle}</p>
        </div>
      </div>

      {/* Embedded Mini Listing Header details */}
      <div className="bg-blue-50/50 px-4 py-2 border-b border-gray-100 flex items-center justify-between shrink-0 font-sans">
        <div className="flex items-center space-x-2">
          <img 
            src={activeChat.listingImage} 
            alt={activeChat.listingTitle} 
            className="h-8 w-8 rounded-md object-cover border border-blue-100"
            referrerPolicy="no-referrer"
          />
          <div>
            <span className="text-[10px] font-bold text-gray-800 line-clamp-1 leading-none">{activeChat.listingTitle}</span>
            <span className="text-[10px] font-black text-blue-600 font-mono tracking-tight mt-0.5 inline-block">
              {new Intl.NumberFormat('fr-FR').format(activeChat.listingPrice)} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col">
        {loadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-[11px] font-bold text-gray-400 font-sans max-w-[200px]">Commencez la conversation en saisissant votre message ci-dessous.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
              >
                {/* Message pill bubble */}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed font-sans shadow-xs ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}
                >
                  {msg.text}
                </div>
                {/* Timestamp */}
                <span className="text-[8px] text-gray-400 font-mono font-bold mt-1.5 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString(language === 'EN' ? 'en' : 'fr', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Form bottom area */}
      <form onSubmit={handleSend} className="bg-white border-t border-gray-100 p-3 shrink-0 flex items-center space-x-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={getTranslation(language, 'typeMessage')}
          className="flex-1 rounded-xl bg-gray-50 border border-gray-100 px-4 py-2.5 text-xs font-medium outline-none focus:bg-white focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition-colors shrink-0"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>

    </div>
  );
};
