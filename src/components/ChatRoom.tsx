import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { Send, ArrowLeft, Loader2, CheckCircle2, Check, CheckCheck, Smile } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ChatRoom: React.FC = () => {
  const { 
    language, 
    activeChatId, 
    setActiveChatId, 
    chats, 
    messages, 
    loadingMessages, 
    sendMessage, 
    updateTypingStatus,
    user 
  } = useApp();

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  // Auto-scroll messages list to the bottom on change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessages]);

  // Clean up typing state on unmount or active chat change
  useEffect(() => {
    return () => {
      if (activeChatId && isTypingLocal) {
        updateTypingStatus(activeChatId, false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [activeChatId]);

  const handleInputChange = (val: string) => {
    setText(val);

    if (!activeChatId || !user) return;

    if (!isTypingLocal) {
      setIsTypingLocal(true);
      updateTypingStatus(activeChatId, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingLocal(false);
      updateTypingStatus(activeChatId, false);
    }, 2500);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeChatId || sending) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTypingLocal(false);
    updateTypingStatus(activeChatId, false);

    setSending(true);
    setShowEmojiPicker(false);
    try {
      await sendMessage(activeChatId, text.trim());
      setText('');
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'envoi du message.");
    } finally {
      setSending(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setText(prev => prev + emoji);
    if (!activeChatId || !user) return;
    
    // Trigger typing state for emoji insertions
    if (!isTypingLocal) {
      setIsTypingLocal(true);
      updateTypingStatus(activeChatId, true);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingLocal(false);
      updateTypingStatus(activeChatId, false);
    }, 2500);
  };

  if (!activeChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 font-sans">
        <p className="text-sm font-bold text-gray-500">Sélectionnez une conversation pour commencer à discuter.</p>
      </div>
    );
  }

  const otherParticipantName = user?.uid === activeChat.buyerId ? activeChat.sellerName : activeChat.buyerName;
  const otherUserId = user?.uid === activeChat.buyerId ? activeChat.sellerId : activeChat.buyerId;
  const isOtherUserTyping = activeChat.typing?.[otherUserId] === true;

  return (
    <div className="flex flex-col h-[500px] md:h-[600px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100" id="chat-room">
      
      {/* Top Conversation Header */}
      <div className="flex items-center space-x-3.5 bg-white border-b border-gray-100 px-4 py-3 shrink-0">
        <button
          onClick={() => setActiveChatId(null)}
          aria-label="Retourner à la liste des conversations"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-100 shrink-0" aria-hidden="true">
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
                {/* Timestamp & Seen indicator */}
                <div className="flex items-center space-x-1 mt-1.5 px-1">
                  <span className="text-[8px] text-gray-400 font-mono font-bold">
                    {new Date(msg.createdAt).toLocaleTimeString(language === 'EN' ? 'en' : 'fr', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (
                    msg.seen ? (
                      <span title="Vu" className="flex items-center">
                        <CheckCheck className="h-3 w-3 text-blue-500" />
                      </span>
                    ) : (
                      <span title="Envoyé" className="flex items-center">
                        <Check className="h-3 w-3 text-gray-400" />
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {/* Real-time typing status of other user */}
        {isOtherUserTyping && (
          <div className="flex flex-col max-w-[75%] self-start items-start">
            <div className="rounded-2xl px-3.5 py-2 bg-white text-gray-500 border border-gray-100 rounded-bl-none flex items-center space-x-1.5 shadow-xs">
              <span className="text-[10px] font-medium font-sans italic">{otherParticipantName} est en train d'écrire</span>
              <div className="flex space-x-1">
                <span className="h-1 w-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1 w-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1 w-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Typing Form & Emoji Picker bottom area */}
      <div className="relative shrink-0">
        {showEmojiPicker && (
          <div className="absolute bottom-full left-3 mb-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50">
            <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-2">
              <span className="text-[10px] font-black text-gray-500 tracking-wider uppercase font-sans">Émojis rapides</span>
              <button 
                type="button" 
                onClick={() => setShowEmojiPicker(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold font-sans"
              >
                Fermer
              </button>
            </div>
            
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-tight mb-1">Visages</p>
                <div className="grid grid-cols-6 gap-1">
                  {['😀', '😂', '😍', '😊', '😎', '🤔', '😅', '😢', '😡', '😮', '😜', '🥳'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      aria-label={`Insérer l'émoji ${emoji}`}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-lg hover:bg-gray-50 rounded p-1 transition-colors active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-tight mb-1">Gestes & Symboles</p>
                <div className="grid grid-cols-6 gap-1">
                  {['👍', '👎', '👌', '✌️', '👏', '🙌', '🙏', '👋', '❤️', '🔥', '✨', '💯'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      aria-label={`Insérer l'émoji ${emoji}`}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-lg hover:bg-gray-50 rounded p-1 transition-colors active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-tight mb-1">Objets & Commerce</p>
                <div className="grid grid-cols-6 gap-1">
                  {['📦', '🚗', '🏠', '📱', '💼', '🤝'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      aria-label={`Insérer l'émoji ${emoji}`}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-lg hover:bg-gray-50 rounded p-1 transition-colors active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="bg-white border-t border-gray-100 p-3 flex items-center space-x-2" aria-label="Saisie du message">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            aria-expanded={showEmojiPicker}
            aria-label="Sélecteur d'émojis"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${showEmojiPicker ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
          >
            <Smile className="h-5 w-5" aria-hidden="true" />
          </button>
          
          <input
            type="text"
            value={text}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={getTranslation(language, 'typeMessage')}
            aria-label={getTranslation(language, 'typeMessage')}
            className="flex-1 rounded-xl bg-gray-50 border border-gray-100 px-4 py-2.5 text-xs font-medium outline-none focus:bg-white focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            aria-label="Envoyer le message"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Send className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </form>
      </div>

    </div>
  );
};
