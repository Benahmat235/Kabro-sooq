import { Listing, CityType, CategoryType, Review } from '../types';
import tchadData from './tchadData.json';

export const CITIES: CityType[] = tchadData.tchad.regions.map(r => r.chef_lieu);

export interface CategoryDefinition {
  name: CategoryType;
  icon: string;
  subcategories?: string[];
}

export const CATEGORIES: CategoryDefinition[] = [
  { 
    name: "Véhicules", 
    icon: "Car",
    subcategories: ["Voitures", "Motos", "Camions", "Pièces détachées"]
  },
  { 
    name: "Immobilier", 
    icon: "Home",
    subcategories: ["Vente Appartement", "Location Appartement", "Maisons", "Terrains", "Bureaux & Commerces"]
  },
  { 
    name: "Électronique", 
    icon: "Smartphone", // Changed to general electronics
    subcategories: ["Téléphones & Smartphones", "Tablettes", "Ordinateurs", "TV & Son", "Accessoires"]
  },
  { 
    name: "Emploi & Services", 
    icon: "Briefcase",
    subcategories: ["Offres d'emploi", "Prestations de services", "Formations", "Cours particuliers"]
  },
  { 
    name: "Animaux", 
    icon: "PawPrint",
    subcategories: ["Chiens", "Chats", "Oiseaux", "Bétail", "Accessoires"]
  },
  {
    name: "Mode & Beauté",
    icon: "Shirt",
    subcategories: ["Vêtements", "Chaussures", "Montres & Bijoux", "Cosmétiques"]
  },
  {
    name: "Maison & Jardin",
    icon: "Sofa",
    subcategories: ["Meubles", "Décoration", "Bricolage", "Jardinage"]
  }
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "lst-1",
    title: "Toyota Hilux Double Cabine 4x4 (2018)",
    description: "Très belle Toyota Hilux Double Cabine année 2018, moteur diesel robuste D4D, boîte manuelle, climatisation d'origine très froide, suspension renforcée idéale pour les routes du Tchad. Tous les papiers sont à jour (Douane, Carte grise). Prix légèrement négociable.",
    price: 18500000,
    category: "Véhicules",
    city: "N'Djaména",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1000"
    ],
    condition: "excellent",
    sellerId: "sel-google-101",
    sellerName: "Ahmat Al-Hadj",
    sellerPhone: "+235 66 28 45 12",
    sellerWhatsApp: "+235 99 28 45 12",
    sellerIsVerified: true,
    sellerResponseTime: "Répond instantanément",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2h ago
    status: "active",
    viewsCount: 142
  },
  {
    id: "lst-2",
    title: "iPhone 15 Pro Max - 256 GB - Titane Naturel",
    description: "Je vends mon iPhone 15 Pro Max 256 Go en parfait état, couleur Titane Naturel. Batterie à 98% de sa capacité. Vendu avec sa boîte d'origine et son câble USB-C de charge rapide. Jamais réparé, aucune égratignure.",
    price: 850000,
    category: "Téléphones",
    city: "N'Djaména",
    images: [
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1000"
    ],
    condition: "excellent",
    sellerId: "sel-google-102",
    sellerName: "Youssouf Haroun",
    sellerPhone: "+235 63 15 44 88",
    sellerWhatsApp: "+235 95 15 44 88",
    sellerIsVerified: true,
    sellerResponseTime: "Répond rapidement",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5h ago
    status: "active",
    viewsCount: 89
  },
  {
    id: "lst-3",
    title: "Terrain de 400m² à vendre à Farcha",
    description: "Superbe opportunité d'investissement ! Terrain de 400 mètres carrés (20m x 20m) idéalement situé à Farcha, non loin de la route principale goudronnée. Quartier calme et résidentiel, accès facile à l'électricité et à l'eau de la SNE/STE. Acte de vente et attestation de propriété disponibles.",
    price: 15000000,
    category: "Immobilier",
    city: "N'Djaména",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000"
    ],
    condition: "new",
    sellerId: "sel-google-103",
    sellerName: "Moussa Ibrahim",
    sellerPhone: "+235 66 11 22 33",
    sellerWhatsApp: "+235 99 11 22 33",
    sellerIsVerified: false,
    sellerResponseTime: "Répond sous quelques heures",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    status: "active",
    viewsCount: 205
  },
  {
    id: "lst-4",
    title: "Moto Sanili 110cc - État Neuf",
    description: "Moto de marque Sanili 110cc, modèle récent, très faible consommation, moteur n'a jamais été ouvert. Parfaite pour circuler facilement à Moundou. Carte grise et plaque d'immatriculation d'origine. Prix fixe non négociable.",
    price: 525000,
    category: "Véhicules",
    city: "Moundou",
    images: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1000"
    ],
    condition: "new",
    sellerId: "sel-google-104",
    sellerName: "Arnaud Ndouba",
    sellerPhone: "+235 65 44 77 99",
    sellerWhatsApp: "+235 90 44 77 99",
    sellerIsVerified: true,
    sellerResponseTime: "Répond instantanément",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12h ago
    status: "active",
    viewsCount: 64
  },
  {
    id: "lst-5",
    title: "Moutons géants du Batha pour la Tabaski",
    description: "Gros béliers de race du Batha très bien engraissés pour l'Aïd El-Adha (Tabaski) ou autres cérémonies. Disponibles à Abéché avec possibilité d'expédition sécurisée vers N'Djaména par camion de transport. Bon prix, bêtes en excellente santé.",
    price: 110000,
    category: "Animaux",
    subcategory: "Bétail",
    city: "Abéché",
    images: [
      "https://images.unsplash.com/photo-1484557985045-def2550a47f9?auto=format&fit=crop&q=80&w=1000"
    ],
    condition: "excellent",
    sellerId: "sel-google-105",
    sellerName: "Mahamat Saleh",
    sellerPhone: "+235 66 99 88 77",
    sellerWhatsApp: "+235 99 99 88 77",
    sellerIsVerified: false,
    sellerResponseTime: "Répond rapidement",
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(), // 1.5 days ago
    status: "active",
    viewsCount: 154
  },
  {
    id: "lst-6",
    title: "Studio moderne meublé à louer à Sabangali",
    description: "Magnifique studio meublé et entièrement équipé à louer à Sabangali, N'Djaména. Comprend un salon climatisé, un grand lit double, TV écran plat avec abonnement Canal+, cuisine moderne équipée (frigo, micro-ondes), groupe électrogène de secours automatique, et sécurité 24h/24. Eau incluse, électricité à la charge du locataire (recharges SNE).",
    price: 250000,
    category: "Immobilier",
    city: "N'Djaména",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000"
    ],
    condition: "excellent",
    sellerId: "sel-google-106",
    sellerName: "Fatimé Abakar",
    sellerPhone: "+235 62 33 44 55",
    sellerWhatsApp: "+235 92 33 44 55",
    sellerIsVerified: true,
    sellerResponseTime: "Répond rapidement",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(), // 8h ago
    status: "active",
    viewsCount: 112
  },
  {
    id: "lst-7",
    title: "Technicien Climatisation & Froid à domicile",
    description: "Ingénieur frigoriste diplômé propose ses services professionnels à Sarh : installation, recharge en gaz R22 / R410, dépannage et entretien complet de vos climatiseurs split, réfrigérateurs et congélateurs. Travail soigné et garanti. Déplacement rapide à domicile ou au bureau.",
    price: 15000,
    category: "Services",
    city: "Sarh",
    images: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1000"
    ],
    condition: "good",
    sellerId: "sel-google-107",
    sellerName: "Jean-Pierre Madji",
    sellerPhone: "+235 65 12 78 34",
    sellerWhatsApp: "+235 90 12 78 34",
    sellerIsVerified: true,
    sellerResponseTime: "Répond sous quelques heures",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    status: "active",
    viewsCount: 45
  },
  {
    id: "lst-8",
    title: "Ordinateur Portable HP EliteBook Core i7",
    description: "Laptop HP EliteBook 840 G5 professionnel. Processeur Intel Core i7 8ème Génération, 16 Go de RAM, SSD de 512 Go (ultra rapide), écran tactile 14 pouces Full HD, clavier rétroéclairé QWERTY. Autonomie de la batterie environ 4-5 heures. Idéal pour professionnels et étudiants à Kélo.",
    price: 310000,
    category: "Téléphones",
    city: "Kélo",
    images: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=1000"
    ],
    condition: "good",
    sellerId: "sel-google-108",
    sellerName: "Christian Ngar",
    sellerPhone: "+235 66 54 32 10",
    sellerWhatsApp: "+235 99 54 32 10",
    sellerIsVerified: false,
    sellerResponseTime: "Répond rapidement",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(), // 18h ago
    status: "active",
    viewsCount: 78
  },
  {
    id: "lst-9",
    title: "Recherche Chauffeur Professionnel Catégorie B/C",
    description: "Entreprise logistique à N'Djaména recherche de toute urgence un chauffeur professionnel sérieux avec permis B et C valide. Expérience de 3 ans minimum dans la conduite de véhicules de livraison ou 4x4. Connaissance parfaite des rues de N'Djaména et des axes provinciaux requise. Salaire mensuel attractif.",
    price: 180000,
    category: "Emploi & Services",
    subcategory: "Offres d'emploi",
    city: "N'Djaména",
    images: [
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000"
    ],
    condition: "new",
    sellerId: "sel-google-109",
    sellerName: "Société TransChad Logistics",
    sellerPhone: "+235 66 12 12 12",
    sellerWhatsApp: "+235 99 12 12 12",
    sellerIsVerified: true,
    sellerResponseTime: "Répond sous quelques heures",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
    status: "active",
    viewsCount: 312
  },
  {
    id: "lst-10",
    title: "Générateur Diesel Kipor 5kVA Insonorisé",
    description: "Vends groupe électrogène Kipor 5kVA insonorisé en excellent état de fonctionnement. Parfait pour faire face aux délestages. Consomme très peu de gasoil (diesel). Démarrage électrique avec clé, batterie neuve installée. Idéal pour maison ou petit commerce à Am Timan.",
    price: 680000,
    category: "Services",
    city: "Am Timan",
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1000"
    ],
    condition: "good",
    sellerId: "sel-google-110",
    sellerName: "Ousmane Goukouni",
    sellerPhone: "+235 60 77 88 99",
    sellerWhatsApp: "+235 90 77 88 99",
    sellerIsVerified: false,
    sellerResponseTime: "Répond rapidement",
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(), // 30h ago
    status: "active",
    viewsCount: 52
  }
];

export const MOCK_WEATHER: Record<CityType, { temp: number; condition: string }> = {
  "N'Djaména": { temp: 41, condition: "Ensoleillé" },
  "Moundou": { temp: 36, condition: "Légèrement nuageux" },
  "Sarh": { temp: 35, condition: "Averses" },
  "Abéché": { temp: 39, condition: "Chaud et Sec" },
  "Kélo": { temp: 37, condition: "Ensoleillé" },
  "Am Timan": { temp: 38, condition: "Nuageux" },
  "Doba": { temp: 36, condition: "Éclaircies" },
  "Pala": { temp: 37, condition: "Ensoleillé" }
};

export const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-1",
    sellerId: "sel-google-101",
    sellerName: "Ahmat Al-Hadj",
    buyerId: "buyer-abc-1",
    buyerName: "Mahamat Saleh",
    rating: 5,
    comment: "Excellent vendeur ! La Toyota Hilux était exactement comme décrite. Ahmat est très honnête et disponible pour toutes les démarches administratives.",
    listingId: "lst-1",
    listingTitle: "Toyota Hilux Double Cabine 4x4 (2018)",
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString() // 5 days ago
  },
  {
    id: "rev-2",
    sellerId: "sel-google-101",
    sellerName: "Ahmat Al-Hadj",
    buyerId: "buyer-abc-2",
    buyerName: "Idriss Djimet",
    rating: 4,
    comment: "Transaction fluide et rapide. Personne sérieuse et ponctuelle.",
    listingId: "lst-mock-prev-1",
    listingTitle: "Moto à vendre",
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString()
  },
  {
    id: "rev-3",
    sellerId: "sel-google-102",
    sellerName: "Youssouf Haroun",
    buyerId: "buyer-abc-3",
    buyerName: "Fatimé Zara",
    rating: 5,
    comment: "L'iPhone 15 est impeccable ! Youssouf a pris le temps de tout me montrer et de m'aider à transférer mes données. Je recommande vivement !",
    listingId: "lst-2",
    listingTitle: "iPhone 15 Pro Max - 256 GB",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString() // 2 days ago
  },
  {
    id: "rev-4",
    sellerId: "sel-google-104",
    sellerName: "Arnaud Ndouba",
    buyerId: "buyer-abc-4",
    buyerName: "Jean-Pierre",
    rating: 5,
    comment: "Moto Sanili achetée en excellent état. Arnaud est d'une grande gentillesse et très pro.",
    listingId: "lst-4",
    listingTitle: "Moto Sanili 110cc - État Neuf",
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString() // 1 day ago
  }
];
