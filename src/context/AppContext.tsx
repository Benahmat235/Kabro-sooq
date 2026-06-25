import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  setDoc,
  where,
  getDocs,
  FirestoreDataConverter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Listing, Chat, Message, LanguageType, CityType, PublicUserProfileDTO } from '../types';
import { MOCK_LISTINGS } from '../data/mockData';
import { sanitizeUserProfile } from '../utils/userDto';
import { 
  validateAndSanitizeListing, 
  validateAndSanitizeMessageText, 
  sanitizeText, 
  validateAndSanitizeUrl 
} from '../utils/security';

const listingConverter: FirestoreDataConverter<Listing> = {
  toFirestore(listing: Listing) {
    return listing;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Listing {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      title: data.title || '',
      description: data.description || '',
      price: data.price || 0,
      category: data.category || 'Véhicules',
      city: data.city || "N'Djaména",
      images: data.images || [],
      condition: data.condition || 'excellent',
      sellerId: data.sellerId || '',
      sellerName: data.sellerName || '',
      sellerPhone: data.sellerPhone || '',
      sellerWhatsApp: data.sellerWhatsApp || '',
      sellerIsVerified: !!data.sellerIsVerified,
      sellerResponseTime: data.sellerResponseTime || '',
      createdAt: data.createdAt || '',
      status: data.status || 'active',
      viewsCount: data.viewsCount || 0,
    };
  }
};

const chatConverter: FirestoreDataConverter<Chat> = {
  toFirestore(chat: Chat) {
    return chat;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Chat {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      listingId: data.listingId || '',
      listingTitle: data.listingTitle || '',
      listingPrice: data.listingPrice || 0,
      listingImage: data.listingImage || '',
      buyerId: data.buyerId || '',
      buyerName: data.buyerName || '',
      sellerId: data.sellerId || '',
      sellerName: data.sellerName || '',
      lastMessage: data.lastMessage || '',
      lastMessageAt: data.lastMessageAt || '',
      participantIds: data.participantIds || [],
      unreadCount: data.unreadCount,
    };
  }
};

const messageConverter: FirestoreDataConverter<Message> = {
  toFirestore(message: Message) {
    return message;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Message {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      senderId: data.senderId || '',
      text: data.text || '',
      createdAt: data.createdAt || '',
    };
  }
};

interface AppContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  selectedCity: CityType | 'all';
  setSelectedCity: (city: CityType | 'all') => void;
  activeTab: 'home' | 'messages' | 'my-ads' | 'account';
  setActiveTab: (tab: 'home' | 'messages' | 'my-ads' | 'account') => void;
  user: User | null;
  loadingAuth: boolean;
  listings: Listing[];
  loadingListings: boolean;
  chats: Chat[];
  loadingChats: boolean;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  messages: Message[];
  loadingMessages: boolean;
  isOffline: boolean;
  unreadCount: number;
  savedListings: string[];
  toggleFavorite: (listingId: string) => Promise<void>;
  addListing: (listingData: Omit<Listing, 'id' | 'createdAt' | 'viewsCount' | 'status' | 'sellerId' | 'sellerName' | 'sellerIsVerified' | 'sellerResponseTime'>) => Promise<void>;
  incrementListingViews: (listingId: string) => Promise<void>;
  markListingAsSold: (listingId: string) => Promise<void>;
  deleteListing: (listingId: string) => Promise<void>;
  startNewChat: (listing: Listing) => Promise<string>;
  sendMessage: (chatId: string, text: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<LanguageType>('FR');
  const [selectedCity, setSelectedCity] = useState<CityType | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'home' | 'messages' | 'my-ads' | 'account'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [savedListings, setSavedListings] = useState<string[]>([]);
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const unreadCount = useMemo(() => {
    if (!user) return 0;
    return chats.reduce((acc, chat) => {
      const count = chat.unreadCount?.[user.uid] || 0;
      return acc + count;
    }, 0);
  }, [chats, user]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      
      // If user logs in, sync profile with Firestore
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        
        // Clean user object through our secure DTO filter before saving to public document
        const publicProfile: PublicUserProfileDTO = sanitizeUserProfile({
          uid: currentUser.uid,
          name: sanitizeText(currentUser.displayName || 'Utilisateur', 50),
          avatarUrl: validateAndSanitizeUrl(currentUser.photoURL || ''),
          createdAt: new Date().toISOString()
        });

        setDoc(userRef, publicProfile, { merge: true }).catch(err => {
          console.error("Error creating/updating user profile: ", err);
          handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
        });
      } else {
        setChats([]);
        setActiveChatId(null);
      }
    });
    return unsubscribe;
  }, []);

  // Monitor user document for savedListings (favorites)
  useEffect(() => {
    if (!user) {
      setSavedListings([]);
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSavedListings(data.savedListings || []);
      }
    });
    return unsubscribe;
  }, [user]);

  const toggleFavorite = async (listingId: string) => {
    if (!user) throw new Error("Veuillez vous connecter pour ajouter aux favoris.");
    const userRef = doc(db, 'users', user.uid);
    try {
      const isSaved = savedListings.includes(listingId);
      let newSaved;
      if (isSaved) {
        newSaved = savedListings.filter(id => id !== listingId);
      } else {
        newSaved = [...savedListings, listingId];
      }
      // Optimistic update
      setSavedListings(newSaved);
      await setDoc(userRef, { savedListings: newSaved }, { merge: true });
    } catch (err) {
      console.error("Error toggling favorite:", err);
      // Revert on error
      const isSaved = savedListings.includes(listingId);
      if (isSaved) {
        setSavedListings([...savedListings, listingId]);
      } else {
        setSavedListings(savedListings.filter(id => id !== listingId));
      }
      throw new Error("Erreur lors de la mise à jour des favoris.");
    }
  };

  // Sync listings from Firestore
  useEffect(() => {
    const listingsPath = 'listings';
    setLoadingListings(true);

    try {
      const q = query(collection(db, listingsPath).withConverter(listingConverter), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const fetchedListings: Listing[] = [];
          snapshot.forEach((doc) => {
            fetchedListings.push(doc.data());
          });
          
          // Merge fetched listings with mock listings (so user gets a rich catalog instantly!)
          // Make sure IDs don't conflict
          const firebaseListingIds = new Set(fetchedListings.map((l: Listing) => l.id));
          const filteredMocks = MOCK_LISTINGS.filter((mock: Listing) => !firebaseListingIds.has(mock.id));
          
          setListings([...fetchedListings, ...filteredMocks]);
          setLoadingListings(false);
        },
        (error) => {
          console.error("Listing Sync Error, falling back to offline mocks: ", error);
          setListings(MOCK_LISTINGS);
          setLoadingListings(false);
          handleFirestoreError(error, OperationType.LIST, listingsPath);
        }
      );
      return unsubscribe;
    } catch (error) {
      console.warn("Could not setup listings listener, offline or unauthorized:", error);
      setListings(MOCK_LISTINGS);
      setLoadingListings(false);
    }
  }, []);

  // Sync chats from Firestore
  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoadingChats(false);
      return;
    }

    const chatsPath = 'chats';
    setLoadingChats(true);

    try {
      const q = query(
        collection(db, chatsPath).withConverter(chatConverter), 
        where('participantIds', 'array-contains', user.uid),
        orderBy('lastMessageAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const fetchedChats: Chat[] = [];
          snapshot.forEach((doc) => {
            fetchedChats.push(doc.data());
          });
          setChats(fetchedChats);
          setLoadingChats(false);
        },
        (error) => {
          console.error("Chat sync failed: ", error);
          setLoadingChats(false);
          handleFirestoreError(error, OperationType.LIST, chatsPath);
        }
      );
      return unsubscribe;
    } catch (error) {
      console.warn("Could not register chats listener: ", error);
      setLoadingChats(false);
    }
  }, [user]);

  // Sync active chat messages
  useEffect(() => {
    if (!activeChatId || !user) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    const messagesPath = `chats/${activeChatId}/messages`;
    setLoadingMessages(true);

    try {
      const q = query(collection(db, messagesPath).withConverter(messageConverter), orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const fetchedMessages: Message[] = [];
          snapshot.forEach((doc) => {
            fetchedMessages.push(doc.data());
          });
          setMessages(fetchedMessages);
          setLoadingMessages(false);
        },
        (error) => {
          console.error("Messages sync failed: ", error);
          setLoadingMessages(false);
          handleFirestoreError(error, OperationType.LIST, messagesPath);
        }
      );
      return unsubscribe;
    } catch (error) {
      console.warn("Could not register messages listener: ", error);
      setLoadingMessages(false);
    }
  }, [activeChatId, user]);

  // Reset current user's unread count when they are actively viewing a chat
  useEffect(() => {
    if (!activeChatId || !user) return;

    const activeChat = chats.find(c => c.id === activeChatId);
    if (!activeChat) return;

    const currentUnread = activeChat.unreadCount?.[user.uid] || 0;
    if (currentUnread > 0) {
      const chatsPath = 'chats';
      const chatRef = doc(db, chatsPath, activeChatId);
      const newUnreadCount = {
        ...(activeChat.unreadCount || {}),
        [user.uid]: 0
      };
      updateDoc(chatRef, { unreadCount: newUnreadCount }).catch((err) => {
        console.error("Failed to clear unread count:", err);
      });
    }
  }, [activeChatId, chats, user]);

  // Function to publish a new listing
  const addListing = async (listingData: Omit<Listing, 'id' | 'createdAt' | 'viewsCount' | 'status' | 'sellerId' | 'sellerName' | 'sellerIsVerified' | 'sellerResponseTime'>) => {
    if (!user) throw new Error("Veuillez vous connecter pour publier.");
    
    // Zero-Trust Validation & Sanitization before writing to the database!
    const validatedListingData = validateAndSanitizeListing(listingData);
    
    const listingsPath = 'listings';
    const listingsRef = collection(db, listingsPath).withConverter(listingConverter);
    const newDocRef = doc(listingsRef); // Generates a random ID client-side
    
    const newListing: Listing = {
      ...validatedListingData,
      id: newDocRef.id,
      sellerId: user.uid,
      sellerName: sanitizeText(user.displayName || 'Vendeur', 50),
      sellerIsVerified: false,
      sellerResponseTime: 'Répond rapidement',
      status: 'active',
      viewsCount: 0,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(newDocRef, newListing);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, listingsPath);
    }
  };

  // Increment listing views count
  const incrementListingViews = async (listingId: string) => {
    // Only increment for listings stored in Firestore (starts with firebase random ids)
    if (listingId.startsWith('lst-')) {
      // Local state bump for mock listings
      setListings((prev: Listing[]) => prev.map((l: Listing) => l.id === listingId ? { ...l, viewsCount: l.viewsCount + 1 } : l));
      return;
    }

    const listingsPath = 'listings';
    try {
      const listingRef = doc(db, listingsPath, listingId);
      const currentListing = listings.find((l: Listing) => l.id === listingId);
      if (currentListing) {
        await updateDoc(listingRef, {
          viewsCount: currentListing.viewsCount + 1
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${listingsPath}/${listingId}`);
    }
  };

  // Mark listing as sold
  const markListingAsSold = async (listingId: string) => {
    if (listingId.startsWith('lst-')) {
      setListings((prev: Listing[]) => prev.map((l: Listing) => {
        if (l.id === listingId) {
          const updated: Listing = { ...l, status: 'sold' };
          return updated;
        }
        return l;
      }));
      return;
    }

    const listingsPath = 'listings';
    try {
      const listingRef = doc(db, listingsPath, listingId);
      await updateDoc(listingRef, {
        status: 'sold'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${listingsPath}/${listingId}`);
    }
  };

  // Delete a listing
  const deleteListing = async (listingId: string) => {
    if (listingId.startsWith('lst-')) {
      setListings((prev: Listing[]) => prev.filter((l: Listing) => l.id !== listingId));
      return;
    }

    const listingsPath = 'listings';
    try {
      const listingRef = doc(db, listingsPath, listingId);
      await updateDoc(listingRef, {
        status: 'archived'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${listingsPath}/${listingId}`);
    }
  };

  // Create or retrieve a chat conversation
  const startNewChat = async (listing: Listing): Promise<string> => {
    if (!user) throw new Error("Veuillez vous connecter pour envoyer un message.");
    if (user.uid === listing.sellerId) throw new Error("Vous ne pouvez pas chatter avec vous-même.");

    const chatsPath = 'chats';
    
    // Check if chat already exists
    const existingChat = chats.find((c: Chat) => c.listingId === listing.id && c.buyerId === user.uid);
    if (existingChat) {
      setActiveChatId(existingChat.id);
      setActiveTab('messages');
      return existingChat.id;
    }

    // Otherwise create a new chat
    const newChatId = `${user.uid}_${listing.sellerId}_${listing.id}`;
    const newChat: Chat = {
      id: newChatId,
      listingId: listing.id,
      listingTitle: listing.title,
      listingPrice: listing.price,
      listingImage: listing.images[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=300',
      buyerId: user.uid,
      buyerName: user.displayName || 'Acheteur',
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      lastMessage: "Conversation démarrée",
      lastMessageAt: new Date().toISOString(),
      participantIds: [user.uid, listing.sellerId],
      unreadCount: {
        [user.uid]: 0,
        [listing.sellerId]: 0
      }
    };

    try {
      await setDoc(doc(db, chatsPath, newChatId), newChat);
      setActiveChatId(newChatId);
      setActiveTab('messages');
      return newChatId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, chatsPath);
      return '';
    }
  };

  // Send a message inside a chat
  const sendMessage = async (chatId: string, text: string) => {
    if (!user) throw new Error("Veuillez vous connecter.");

    // Zero-Trust validation & sanitization of user message text
    const sanitizedText = validateAndSanitizeMessageText(text);

    const messagesPath = `chats/${chatId}/messages`;
    const messageId = `msg_${Date.now()}`;
    const messageData: Message = {
      id: messageId,
      senderId: user.uid,
      text: sanitizedText,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Add message document
      await setDoc(doc(db, messagesPath, messageId), messageData);
      
      // 2. Update parent chat last message metadata
      const chat = chats.find(c => c.id === chatId);
      const otherUserId = chat ? (user.uid === chat.buyerId ? chat.sellerId : chat.buyerId) : null;
      
      if (otherUserId) {
        const currentUnread = chat?.unreadCount?.[otherUserId] || 0;
        const newUnreadCount = {
          ...(chat?.unreadCount || {}),
          [otherUserId]: currentUnread + 1
        };
        
        await updateDoc(doc(collection(db, 'chats').withConverter(chatConverter), chatId), {
          lastMessage: sanitizedText,
          lastMessageAt: new Date().toISOString(),
          unreadCount: newUnreadCount
        });
      } else {
        await updateDoc(doc(collection(db, 'chats').withConverter(chatConverter), chatId), {
          lastMessage: sanitizedText,
          lastMessageAt: new Date().toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, messagesPath);
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        selectedCity,
        setSelectedCity,
        activeTab,
        setActiveTab,
        user,
        loadingAuth,
        listings,
        loadingListings,
        chats,
        loadingChats,
        activeChatId,
        setActiveChatId,
        messages,
        loadingMessages,
        isOffline,
        unreadCount,
        savedListings,
        toggleFavorite,
        addListing,
        incrementListingViews,
        markListingAsSold,
        deleteListing,
        startNewChat,
        sendMessage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
