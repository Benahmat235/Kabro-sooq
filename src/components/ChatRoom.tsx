import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { Send, ArrowLeft, Loader2, CheckCircle2, Check, CheckCheck, Smile, Star, Paperclip, X, AlertCircle, Archive, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { hasForbiddenKeywords } from '../utils/security';
import { uploadChatImage } from '../lib/firebase';

const QUICK_REPLIES = [
  "Est-ce disponible ?",
  "Quel est le prix final ?",
  "Où peut-on se rencontrer ?",
  "Pouvez-vous envoyer plus de photos ?",
  "Je suis intéressé(e)."
];

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
    reviews,
    submitReview,
    archiveChat,
    user 
  } = useApp();

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // File upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // Rating form states
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  // Auto-scroll messages list to the bottom on change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessages, filePreview]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isValid = isImage || file.type.startsWith('audio/') || file.type.includes('pdf') || file.type.includes('word') || file.type.includes('document');
      
      if (!isValid) {
        toast.error('Veuillez sélectionner un fichier valide (image, pdf, word, audio).');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas dépasser 10 Mo.');
        return;
      }
      
      setSelectedFile(file);
      
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview('file'); // Placeholder for non-image files
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!text.trim() && !selectedFile) || !activeChatId || sending || !user) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTypingLocal(false);
    updateTypingStatus(activeChatId, false);

    setSending(true);
    setShowEmojiPicker(false);
    try {
      let attachmentUrl = undefined;
      let isImage = false;

      if (selectedFile) {
        attachmentUrl = await uploadChatImage(selectedFile, user.uid);
        isImage = selectedFile.type.startsWith('image/');
      }

      await sendMessage(
        activeChatId, 
        text.trim(), 
        isImage ? attachmentUrl : undefined, 
        !isImage ? attachmentUrl : undefined,
        selectedFile && !isImage ? selectedFile.name : undefined,
        selectedFile && !isImage ? selectedFile.type : undefined
      );

      setText('');
      removeFile();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'envoi du message.");
    } finally {
      setSending(false);
    }
  };

  const handleQuickReply = async (reply: string) => {
    setText(reply);
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

  const handleReviewSubmit = async () => {
    if (!activeChat || !user) return;
    setIsSubmittingReview(true);
    try {
      await submitReview(
        activeChat.sellerId,
        activeChat.sellerName,
        rating,
        comment,
        activeChat.listingId,
        activeChat.listingTitle
      );
      setComment('');
      setRating(5);
      setShowRatingForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
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
  const otherUserId = user?.uid === activeChat.buyerId ? activeChat.sellerId : activeChat.buyerId;
  const isOtherUserTyping = activeChat.typing?.[otherUserId] === true;

  return (
    <div className="flex flex-col h-[500px] md:h-[600px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100" id="chat-room">
      
      {/* Top Conversation Header */}
      <div className="flex items-center space-x-3.5 bg-white border-b border-gray-100 px-4 py-3 shrink-0">
        <button
          onClick={() => setActiveChatId(null)}
          aria-label="Retourner à la liste des conversations"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-xs shadow-md shadow-primary-100 shrink-0" aria-hidden="true">
          {otherParticipantName.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-black text-gray-800 flex items-center space-x-1">
            <span>{otherParticipantName}</span>
          </h3>
          <p className="text-[10px] font-bold text-primary-600 font-mono mt-0.5">{activeChat.listingTitle}</p>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowSearch(!showSearch)}
            title="Rechercher"
            className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${showSearch ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'}`}
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={() => archiveChat(activeChatId!)}
            title="Archiver la conversation"
            className="flex items-center justify-center h-8 w-8 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
          >
            <Archive className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans la conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Embedded Mini Listing Header details */}
      <div className="bg-primary-50/50 px-4 py-2 border-b border-gray-100 flex items-center justify-between shrink-0 font-sans">
        <div className="flex items-center space-x-2">
          <img 
            src={activeChat.listingImage} 
            alt={activeChat.listingTitle} 
            className="h-8 w-8 rounded-md object-cover border border-primary-100"
            referrerPolicy="no-referrer"
          />
          <div>
            <span className="text-[10px] font-bold text-gray-800 line-clamp-1 leading-none">{activeChat.listingTitle}</span>
            <span className="text-[10px] font-black text-primary-600 font-mono tracking-tight mt-0.5 inline-block">
              {new Intl.NumberFormat('fr-FR').format(activeChat.listingPrice)} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Rating & Review prompt for the buyer */}
      {user?.uid === activeChat.buyerId && (() => {
        const existingReview = reviews.find(
          (r) => r.buyerId === user?.uid && r.listingId === activeChat.listingId
        );

        if (existingReview) {
          return (
            <div className="bg-green-50/75 border-b border-green-100 px-4 py-2 flex items-center justify-between shrink-0 font-sans text-[11px] text-green-800">
              <div className="flex items-center space-x-1.5 min-w-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <span className="truncate">
                  Vendeur noté : <strong>{existingReview.rating}/5</strong> — "{existingReview.comment}"
                </span>
              </div>
              <span className="text-[9px] text-green-600 font-bold shrink-0 uppercase tracking-wider ml-2">Enregistré</span>
            </div>
          );
        }

        return (
          <div className="bg-amber-50/70 border-b border-amber-100 px-4 py-2.5 shrink-0 font-sans">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-amber-900 leading-tight">Transaction réussie avec {activeChat.sellerName} ?</p>
                <p className="text-[9px] text-amber-700/80 mt-0.5">Donnez votre avis pour guider la communauté de Kabro Sooq.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRatingForm(!showRatingForm)}
                className="text-[10px] font-black uppercase text-amber-700 hover:text-amber-800 bg-white border border-amber-200 px-3 py-1.5 rounded-lg shadow-2xs transition-all duration-200 active:scale-95"
              >
                {showRatingForm ? 'Annuler' : 'Noter le vendeur'}
              </button>
            </div>

            {showRatingForm && (
              <div className="mt-3 bg-white border border-amber-100/80 rounded-xl p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Votre note :</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((_, idx) => {
                      const star = idx + 1;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform active:scale-125 p-0.5"
                        >
                          <Star 
                            className={`h-5 w-5 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    maxLength={300}
                    placeholder="Comment s'est passée la transaction ? (Ex: Ponctuel, honnête...)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-xs font-medium outline-none focus:bg-white focus:border-amber-500 transition-all text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={handleReviewSubmit}
                    disabled={isSubmittingReview || !comment.trim()}
                    className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-xs font-bold shadow-xs shadow-amber-100 disabled:opacity-50 transition-colors"
                  >
                    {isSubmittingReview ? '...' : 'Publier'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col">
        {loadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-[11px] font-bold text-gray-400 font-sans max-w-[200px]">Commencez la conversation en saisissant votre message ci-dessous.</p>
          </div>
        ) : (
          messages.filter(msg => {
            if (!searchQuery) return true;
            return msg.text?.toLowerCase().includes(searchQuery.toLowerCase()) || msg.attachmentName?.toLowerCase().includes(searchQuery.toLowerCase());
          }).map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
              >
                {/* Message pill bubble */}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed font-sans shadow-xs ${isMe ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}
                >
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      alt="Pièce jointe" 
                      className="max-w-[200px] max-h-[200px] rounded-lg mb-1.5 object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {msg.attachmentUrl && (
                    <a 
                      href={msg.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-2 p-2 rounded-lg mb-1.5 text-xs font-semibold ${isMe ? 'bg-primary-700 hover:bg-primary-800' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      <span className="truncate max-w-[150px]">{msg.attachmentName || "Fichier joint"}</span>
                    </a>
                  )}
                  {msg.text && <div>{msg.text}</div>}
                  {msg.flagged && (
                    <div className={`flex items-center space-x-1 mt-1 text-[10px] ${isMe ? 'text-red-200' : 'text-red-500'}`}>
                      <AlertCircle className="h-3 w-3" />
                      <span>Message signalé pour modération</span>
                    </div>
                  )}
                </div>
                {/* Timestamp & Seen indicator */}
                <div className="flex items-center space-x-1 mt-1.5 px-1">
                  <span className="text-[8px] text-gray-400 font-mono font-bold">
                    {new Date(msg.createdAt).toLocaleTimeString(language === 'EN' ? 'en' : 'fr', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (
                    msg.seen ? (
                      <span title="Vu" className="flex items-center space-x-0.5">
                        <span className="text-[8px] font-bold text-primary-500 uppercase tracking-wide">Lu</span>
                        <CheckCheck className="h-3 w-3 text-primary-500" />
                      </span>
                    ) : (
                      <span title="Envoyé" className="flex items-center space-x-0.5">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">Envoyé</span>
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

      {/* Quick Replies */}
      {user?.uid === activeChat.buyerId && (
        <div className="flex gap-2 overflow-x-auto p-2.5 bg-gray-50/50 border-t border-gray-100 scrollbar-hide">
          {QUICK_REPLIES.map((reply, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickReply(reply)}
              className="shrink-0 bg-white hover:bg-primary-50 border border-gray-200 hover:border-primary-200 text-[10px] text-gray-600 hover:text-primary-600 px-3 py-1.5 rounded-full font-medium transition-colors shadow-2xs"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* File Preview Area */}
      {filePreview && (
        <div className="bg-white px-4 py-3 border-t border-gray-100 relative">
          <div className="relative inline-flex items-center justify-center h-20 bg-gray-50 border border-gray-200 rounded-xl p-2 shadow-sm min-w-[80px]">
            {filePreview === 'file' ? (
              <span className="text-xs font-bold text-gray-500 truncate max-w-[150px]">
                {selectedFile?.name || "Fichier joint"}
              </span>
            ) : (
              <img src={filePreview} alt="Aperçu" className="h-full w-auto object-contain rounded" />
            )}
            <button 
              type="button"
              onClick={removeFile}
              className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

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
                      className="text-lg hover:bg-gray-50 rounded p-1 transition-colors active:scale-90 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                      className="text-lg hover:bg-gray-50 rounded p-1 transition-colors active:scale-90 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                      className="text-lg hover:bg-gray-50 rounded p-1 transition-colors active:scale-90 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*, application/pdf, audio/*, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Joindre un fichier"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            aria-expanded={showEmojiPicker}
            aria-label="Sélecteur d'émojis"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500 ${showEmojiPicker ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
          >
            <Smile className="h-5 w-5" aria-hidden="true" />
          </button>
          
          <input
            type="text"
            value={text}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={getTranslation(language, 'typeMessage')}
            aria-label={getTranslation(language, 'typeMessage')}
            className="flex-1 rounded-xl bg-gray-50 border border-gray-100 px-4 py-2.5 text-base font-medium outline-none focus:bg-white focus:border-primary-500 transition-colors"
          />
          <button
            type="submit"
            disabled={(!text.trim() && !selectedFile) || sending}
            aria-label="Envoyer le message"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white disabled:opacity-50 hover:bg-primary-700 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Send className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </form>
      </div>

    </div>
  );
};
