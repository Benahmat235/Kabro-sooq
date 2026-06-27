import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-hot-toast';
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
  getDoc,
  arrayUnion,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  PartialWithFieldValue,
  SetOptions,
  DocumentData
} from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Listing, Chat, Message, LanguageType, CityType, PublicUserProfileDTO, FirestoreUserDoc, Review } from '../types';
import { MOCK_LISTINGS, MOCK_REVIEWS } from '../data/mockData';
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
    return {
      listingId: chat.listingId,
      listingTitle: chat.listingTitle,
      listingPrice: chat.listingPrice,
      listingImage: chat.listingImage,
      buyerId: chat.buyerId,
      buyerName: chat.buyerName,
      sellerId: chat.sellerId,
      sellerName: chat.sellerName,
      lastMessage: chat.lastMessage,
      lastMessageAt: chat.lastMessageAt,
      participantIds: chat.participantIds,
      unreadCount: chat.unreadCount || {},
      typing: chat.typing || {},
    };
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
      typing: data.typing || {},
    };
  }
};

const messageConverter: FirestoreDataConverter<Message> = {
  toFirestore(message: Message) {
    return {
      senderId: message.senderId,
      text: message.text,
      createdAt: message.createdAt,
      seen: message.seen || false,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Message {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      senderId: data.senderId || '',
      text: data.text || '',
      createdAt: data.createdAt || '',
      seen: data.seen || false,
    };
  }
};

const userProfileConverter: FirestoreDataConverter<FirestoreUserDoc> = {
  toFirestore(profile: PartialWithFieldValue<FirestoreUserDoc>, options?: SetOptions): DocumentData {
    if (options && 'merge' in options && options.merge) {
      const data: DocumentData = {};
      if (profile.uid !== undefined) data.uid = profile.uid;
      if (profile.name !== undefined) data.name = profile.name;
      if (profile.avatarUrl !== undefined) data.avatarUrl = profile.avatarUrl;
      if (profile.createdAt !== undefined) data.createdAt = profile.createdAt;
      if (profile.savedListings !== undefined) data.savedListings = profile.savedListings;
      if (profile.fcmTokens !== undefined) data.fcmTokens = profile.fcmTokens;
      return data;
    }
    return {
      uid: profile.uid || '',
      name: profile.name || '',
      avatarUrl: profile.avatarUrl || '',
      createdAt: profile.createdAt || '',
      savedListings: profile.savedListings || [],
      fcmTokens: profile.fcmTokens || []
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): FirestoreUserDoc {
    const data = snapshot.data();
    return {
      uid: snapshot.id,
      name: data.name || '',
      avatarUrl: data.avatarUrl || '',
      createdAt: data.createdAt || '',
      savedListings: data.savedListings || [],
      fcmTokens: data.fcmTokens || []
    };
  }
};

const reviewConverter: FirestoreDataConverter<Review> = {
  toFirestore(review: Review): DocumentData {
    return {
      id: review.id,
      sellerId: review.sellerId,
      sellerName: review.sellerName,
      buyerId: review.buyerId,
      buyerName: review.buyerName,
      buyerAvatarUrl: review.buyerAvatarUrl || '',
      rating: review.rating,
      comment: review.comment,
      listingId: review.listingId,
      listingTitle: review.listingTitle,
      createdAt: review.createdAt
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Review {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      sellerId: data.sellerId || '',
      sellerName: data.sellerName || '',
      buyerId: data.buyerId || '',
      buyerName: data.buyerName || '',
      buyerAvatarUrl: data.buyerAvatarUrl || '',
      rating: Number(data.rating) || 5,
      comment: data.comment || '',
      listingId: data.listingId || '',
      listingTitle: data.listingTitle || '',
      createdAt: data.createdAt || ''
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
  reviews: Review[];
  toggleFavorite: (listingId: string) => Promise<void>;
  addListing: (listingData: Omit<Listing, 'id' | 'createdAt' | 'viewsCount' | 'status' | 'sellerId' | 'sellerName' | 'sellerIsVerified' | 'sellerResponseTime'>) => Promise<void>;
  incrementListingViews: (listingId: string) => Promise<void>;
  markListingAsSold: (listingId: string) => Promise<void>;
  deleteListing: (listingId: string) => Promise<void>;
  startNewChat: (listing: Listing) => Promise<string>;
  sendMessage: (chatId: string, text: string) => Promise<void>;
  updateTypingStatus: (chatId: string, isTyping: boolean) => Promise<void>;
  submitReview: (sellerId: string, sellerName: string, rating: number, comment: string, listingId: string, listingTitle: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<LanguageType>('FR');
  const [selectedCity, setSelectedCity] = useState<CityType | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'home' | 'messages' | 'my-ads' | 'account'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

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
        const userRef = doc(db, 'users', currentUser.uid).withConverter(userProfileConverter);
        
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
        setActiveChatId(null);
      }
    });
    return unsubscribe;
  }, []);

  // Monitor user document for savedListings (favorites) using React Query
  const { data: savedListings = [] } = useQuery<string[]>({
    queryKey: ['savedListings', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const userRef = doc(db, 'users', user.uid).withConverter(userProfileConverter);
      try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return data.savedListings || [];
        }
        return [];
      } catch (error) {
        console.error("Failed to fetch saved listings:", error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 5000,
  });

  // Real-time synchronization of savedListings (favorites) across devices
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid).withConverter(userProfileConverter);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        queryClient.setQueryData(['savedListings', user.uid], data.savedListings || []);
      }
    }, (error) => {
      console.error("Error listening to user document updates:", error);
    });
    return unsubscribe;
  }, [user]);

  // FCM Real-time Notifications configuration
  useEffect(() => {
    if (!user) return;

    let active = true;
    let foregroundUnsubscribe: (() => void) | null = null;

    const setupFCM = async () => {
      try {
        const { getMessaging, getToken, onMessage, isSupported } = await import('firebase/messaging');
        
        const supported = await isSupported();
        if (!supported) {
          console.warn("FCM is not supported in this browser context (possibly due to iframe/sandbox rules). Background/Real-time push notifications will use local browser fallback.");
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn("Notification permission was denied by the user.");
          return;
        }

        const messaging = getMessaging();

        // Register service worker dynamically served by backend
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        const token = await getToken(messaging, {
          serviceWorkerRegistration: registration,
        });

        if (token && active) {
          console.log("FCM Registration Token retrieved successfully:", token);
          
          const userRef = doc(db, 'users', user.uid).withConverter(userProfileConverter);
          await updateDoc(userRef, {
            fcmTokens: arrayUnion(token)
          });
        }

        if (active) {
          foregroundUnsubscribe = onMessage(messaging, (payload) => {
            console.log("Foreground notification received:", payload);
            toast((t) => (
              <div className="flex flex-col space-y-1 p-0.5 font-sans">
                <div className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                  <span className="font-bold text-xs text-gray-800">{payload.notification?.title || 'Nouveau message'}</span>
                </div>
                <p className="text-[11px] text-gray-600 font-semibold leading-snug">{payload.notification?.body || ''}</p>
              </div>
            ), {
              duration: 5000,
              position: 'top-right',
              icon: '💬',
            });
          });
        }
      } catch (err) {
        console.error("Failed to configure FCM notifications:", err);
      }
    };

    setupFCM();

    return () => {
      active = false;
      if (foregroundUnsubscribe) {
        foregroundUnsubscribe();
      }
    };
  }, [user]);

  const toggleFavorite = async (listingId: string) => {
    if (!user) {
      toast.error("Veuillez vous connecter pour ajouter aux favoris.");
      throw new Error("Veuillez vous connecter pour ajouter aux favoris.");
    }
    const userRef = doc(db, 'users', user.uid).withConverter(userProfileConverter);
    const previousSaved = savedListings;
    try {
      const isSaved = previousSaved.includes(listingId);
      let newSaved;
      if (isSaved) {
        newSaved = previousSaved.filter(id => id !== listingId);
        toast.success("Annonce retirée des favoris");
      } else {
        newSaved = [...previousSaved, listingId];
        toast.success("Annonce ajoutée aux favoris !");
      }
      
      // Optimistic update
      queryClient.setQueryData(['savedListings', user.uid], newSaved);
      
      await setDoc(userRef, { savedListings: newSaved }, { merge: true });
    } catch (err) {
      console.error("Error toggling favorite:", err);
      // Revert on error
      queryClient.setQueryData(['savedListings', user.uid], previousSaved);
      toast.error("Erreur lors de la mise à jour des favoris.");
      throw new Error("Erreur lors de la mise à jour des favoris.");
    }
  };

  // Sync listings from Firestore with React Query
  const { data: listings = [], isLoading: loadingListings } = useQuery<Listing[]>({
    queryKey: ['listings'],
    queryFn: async () => {
      const listingsPath = 'listings';
      try {
        const q = query(collection(db, listingsPath).withConverter(listingConverter), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetchedListings: Listing[] = [];
        snapshot.forEach((doc) => {
          fetchedListings.push(doc.data());
        });
        
        // Merge fetched listings with mock listings
        const firebaseListingIds = new Set(fetchedListings.map((l: Listing) => l.id));
        const filteredMocks = MOCK_LISTINGS.filter((mock: Listing) => !firebaseListingIds.has(mock.id));
        
        return [...fetchedListings, ...filteredMocks];
      } catch (error) {
        console.error("Listing Sync Error, falling back to offline mocks: ", error);
        handleFirestoreError(error, OperationType.LIST, listingsPath);
        return MOCK_LISTINGS;
      }
    },
    staleTime: 10000,
    refetchInterval: 10000, // Background automatic refresh every 10s
  });

  // Sync chats from Firestore with React Query
  const { data: chats = [], isLoading: loadingChats } = useQuery<Chat[]>({
    queryKey: ['chats', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const chatsPath = 'chats';
      try {
        const q = query(
          collection(db, chatsPath).withConverter(chatConverter), 
          where('participantIds', 'array-contains', user.uid),
          orderBy('lastMessageAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const fetchedChats: Chat[] = [];
        snapshot.forEach((doc) => {
          fetchedChats.push(doc.data());
        });
        return fetchedChats;
      } catch (error) {
        console.error("Chat sync failed: ", error);
        handleFirestoreError(error, OperationType.LIST, chatsPath);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 5000,
    refetchInterval: 5000, // Background automatic refresh every 5s
  });

  // Sync active chat messages with React Query
  const { data: messages = [], isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ['messages', activeChatId, user?.uid],
    queryFn: async () => {
      if (!activeChatId || !user) return [];
      const messagesPath = `chats/${activeChatId}/messages`;
      try {
        const q = query(collection(db, messagesPath).withConverter(messageConverter), orderBy('createdAt', 'asc'));
        const snapshot = await getDocs(q);
        const fetchedMessages: Message[] = [];
        snapshot.forEach((docSnap) => {
          fetchedMessages.push(docSnap.data());
        });
        return fetchedMessages;
      } catch (error) {
        console.error("Messages sync failed: ", error);
        handleFirestoreError(error, OperationType.LIST, messagesPath);
        return [];
      }
    },
    enabled: !!activeChatId && !!user,
    staleTime: 3000,
    refetchInterval: 3000, // Background automatic refresh every 3s
  });

  // Automatically mark unread messages as seen when messages are loaded
  useEffect(() => {
    if (!activeChatId || !user || !messages.length) return;

    messages.forEach((msg) => {
      if (msg.senderId !== user.uid && !msg.seen) {
        const msgRef = doc(db, `chats/${activeChatId}/messages`, msg.id).withConverter(messageConverter);
        updateDoc(msgRef, { seen: true }).catch((err) => {
          console.error("Failed to mark message as seen:", err);
        });
      }
    });
  }, [activeChatId, user, messages]);

  // Reset current user's unread count when they are actively viewing a chat
  useEffect(() => {
    if (!activeChatId || !user || !chats.length) return;

    const activeChat = chats.find(c => c.id === activeChatId);
    if (!activeChat) return;

    const currentUnread = activeChat.unreadCount?.[user.uid] || 0;
    if (currentUnread > 0) {
      const chatsPath = 'chats';
      const chatRef = doc(db, chatsPath, activeChatId).withConverter(chatConverter);
      const newUnreadCount = {
        ...(activeChat.unreadCount || {}),
        [user.uid]: 0
      };
      updateDoc(chatRef, { unreadCount: newUnreadCount }).catch((err) => {
        console.error("Failed to clear unread count:", err);
      });
    }
  }, [activeChatId, chats, user]);

  const unreadCount = useMemo(() => {
    if (!user) return 0;
    return chats.reduce((acc, chat) => {
      const count = chat.unreadCount?.[user.uid] || 0;
      return acc + count;
    }, 0);
  }, [chats, user]);

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
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, listingsPath);
    }
  };

  // Increment listing views count
  const incrementListingViews = async (listingId: string) => {
    // Optimistic cache update for both mock and firestore listings
    queryClient.setQueryData<Listing[]>(['listings'], (oldListings) => {
      if (!oldListings) return [];
      return oldListings.map(l => l.id === listingId ? { ...l, viewsCount: (l.viewsCount || 0) + 1 } : l);
    });

    if (listingId.startsWith('lst-')) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${listingId}/increment-views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to securely increment views');
      }
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    } catch (error) {
      console.error("Failed secure views increment:", error);
    }
  };

  // Mark listing as sold
  const markListingAsSold = async (listingId: string) => {
    // Optimistic cache update for both mock and firestore listings
    queryClient.setQueryData<Listing[]>(['listings'], (oldListings) => {
      if (!oldListings) return [];
      return oldListings.map(l => l.id === listingId ? { ...l, status: 'sold' } : l);
    });

    if (listingId.startsWith('lst-')) {
      return;
    }

    const listingsPath = 'listings';
    try {
      const listingRef = doc(db, listingsPath, listingId).withConverter(listingConverter);
      await updateDoc(listingRef, {
        status: 'sold'
      });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${listingsPath}/${listingId}`);
    }
  };

  // Delete a listing
  const deleteListing = async (listingId: string) => {
    // Optimistic cache update for both mock and firestore listings
    queryClient.setQueryData<Listing[]>(['listings'], (oldListings) => {
      if (!oldListings) return [];
      return oldListings.filter(l => l.id !== listingId);
    });

    if (listingId.startsWith('lst-')) {
      return;
    }

    const listingsPath = 'listings';
    try {
      const listingRef = doc(db, listingsPath, listingId).withConverter(listingConverter);
      await updateDoc(listingRef, {
        status: 'archived'
      });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
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
      await setDoc(doc(db, chatsPath, newChatId).withConverter(chatConverter), newChat);
      setActiveChatId(newChatId);
      setActiveTab('messages');
      queryClient.invalidateQueries({ queryKey: ['chats', user.uid] });
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
      await setDoc(doc(db, messagesPath, messageId).withConverter(messageConverter), messageData);
      
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

      // Invalidate queries to fetch the updated conversation history and chat list
      queryClient.invalidateQueries({ queryKey: ['messages', chatId, user.uid] });
      queryClient.invalidateQueries({ queryKey: ['chats', user.uid] });

      // 3. Trigger real-time push notification for the recipient via our secure server endpoint
      if (otherUserId) {
        fetch('/api/notifications/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipientId: otherUserId,
            title: user.displayName || user.email?.split('@')[0] || "Nouveau message",
            body: sanitizedText,
            data: {
              chatId,
              type: 'chat'
            }
          })
        }).catch(err => {
          console.error("Error triggering push notification call:", err);
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, messagesPath);
    }
  };

  // Update typing status in Firestore
  const updateTypingStatus = async (chatId: string, isTyping: boolean) => {
    if (!user) return;
    try {
      const chatRef = doc(db, 'chats', chatId).withConverter(chatConverter);
      await updateDoc(chatRef, {
        [`typing.${user.uid}`]: isTyping
      });
    } catch (error) {
      console.error("Failed to update typing status:", error);
    }
  };

  // Sync reviews from Firestore with React Query
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews'],
    queryFn: async () => {
      const reviewsPath = 'reviews';
      try {
        const q = query(collection(db, reviewsPath).withConverter(reviewConverter), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetchedReviews: Review[] = [];
        snapshot.forEach((docSnap) => {
          fetchedReviews.push(docSnap.data());
        });
        
        // Merge with mock reviews for local testing/rich UX
        const firebaseReviewIds = new Set(fetchedReviews.map((r: Review) => r.id));
        const filteredMocks = MOCK_REVIEWS.filter((mock: Review) => !firebaseReviewIds.has(mock.id));
        
        return [...fetchedReviews, ...filteredMocks];
      } catch (error) {
        console.error("Review Sync Error, falling back to mock reviews: ", error);
        return MOCK_REVIEWS;
      }
    },
    staleTime: 10000,
    refetchInterval: 15000,
  });

  // Submit a new review
  const submitReview = async (
    sellerId: string, 
    sellerName: string, 
    rating: number, 
    comment: string, 
    listingId: string, 
    listingTitle: string
  ) => {
    if (!user) {
      toast.error("Veuillez vous connecter pour laisser un avis.");
      throw new Error("User must be logged in to review a seller.");
    }

    if (rating < 1 || rating > 5) {
      toast.error("La note doit être comprise entre 1 et 5.");
      throw new Error("Rating must be between 1 and 5.");
    }

    const sanitizedComment = sanitizeText(comment);
    const newReviewId = `rev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const buyerName = user.displayName || user.email?.split('@')[0] || "Acheteur";
    const buyerAvatarUrl = user.photoURL || undefined;

    const newReview: Review = {
      id: newReviewId,
      sellerId,
      sellerName,
      buyerId: user.uid,
      buyerName,
      buyerAvatarUrl,
      rating,
      comment: sanitizedComment,
      listingId,
      listingTitle,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'reviews', newReviewId).withConverter(reviewConverter), newReview);
      queryClient.setQueryData<Review[]>(['reviews'], (oldReviews = []) => {
        return [newReview, ...oldReviews];
      });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success("Votre avis a été publié avec succès ! Merci.");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `reviews/${newReviewId}`);
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
        reviews,
        toggleFavorite,
        addListing,
        incrementListingViews,
        markListingAsSold,
        deleteListing,
        startNewChat,
        sendMessage,
        updateTypingStatus,
        submitReview
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
