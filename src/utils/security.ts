import { z } from 'zod';
import { CategoryType, CityType, ConditionType, Listing, Message } from '../types';
import { CITIES } from '../data/mockData';

/**
 * Strips HTML tags/scripts and encodes special characters to prevent XSS (Cross-Site Scripting).
 * Truncates string to dynamic maxLength to prevent Denial of Service (DoS) / DB bloat.
 */
export function sanitizeText(val: unknown, maxLength: number = 1000): string {
  if (typeof val !== 'string') return '';
  
  // Strip script tags
  let cleaned = val.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  // Strip other HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  // HTML encode special characters
  cleaned = cleaned
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  // Truncate to maximum length
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }

  return cleaned;
}

/**
 * Validates and sanitizes a URL or a base64 encoded image string.
 * Prevents non-secure HTTP schemes or malicious payload injections.
 */
export function validateAndSanitizeUrl(val: unknown): string {
  if (typeof val !== 'string') return '';
  const trimmed = val.trim();

  // 1. Allow data-URLs for base64 local image uploads
  if (trimmed.startsWith('data:image/')) {
    if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(trimmed)) {
      // Limit base64 length to a reasonable size (e.g., 5MB)
      if (trimmed.length < 5 * 1024 * 1024) {
        return trimmed;
      }
    }
    return '';
  }

  // 2. Allow Unsplash or other valid public HTTPS images
  try {
    const url = new URL(trimmed);
    if (url.protocol === 'https:') {
      // Return safe parsed URL
      return url.toString();
    }
  } catch (e) {
    // Not a valid URL
  }

  return '';
}

/**
 * Validates and sanitizes a phone number.
 * Ensures the format is strictly digits, space, '+' or '-' and up to 20 characters.
 */
export function validateAndSanitizePhone(val: unknown): string {
  if (typeof val !== 'string') return '';
  const trimmed = val.trim();
  
  // Strict format check: allow +, -, spaces, and digits. Max 20 chars
  const cleanPhone = trimmed.replace(/[^\d+-\s]/g, '');
  if (cleanPhone.length >= 6 && cleanPhone.length <= 20) {
    return cleanPhone;
  }
  throw new Error("Numéro de téléphone invalide. Il doit contenir entre 6 et 20 caractères valides.");
}

// Predefined safe arrays for type checking
const ALLOWED_CATEGORIES: CategoryType[] = ["Véhicules", "Immobilier", "Téléphones", "Emploi", "Services", "Animaux"];
const ALLOWED_CITIES: CityType[] = CITIES;
const ALLOWED_CONDITIONS: ConditionType[] = ["new", "excellent", "good", "used"];

export const FORBIDDEN_KEYWORDS = [
  "arnaque", "scam", "drogue", "weed", "cocaine", "heroine", "cannabis", 
  "hacker", "hack", "pirater", "arme", "weapons", "violence", "casino", 
  "viagra", "porno", "sexe", "sex", "terrorisme", "terroriste"
];

/**
 * Checks if a string contains any forbidden keywords.
 * Returns the matching forbidden word if found, or null otherwise.
 */
export function hasForbiddenKeywords(text: string): string | null {
  const lower = text.toLowerCase();
  for (const word of FORBIDDEN_KEYWORDS) {
    if (lower.includes(word)) {
      return word;
    }
  }
  return null;
}

export interface RawListingInput {
  title?: unknown;
  description?: unknown;
  price?: unknown;
  category?: unknown;
  city?: unknown;
  condition?: unknown;
  sellerPhone?: unknown;
  sellerWhatsApp?: unknown;
  images?: unknown;
  arrondissement?: unknown;
  quartier?: unknown;
  quantity?: unknown;
}

/**
 * Zod schema for client-side and server-side listing validation.
 */
export const listingSchema = z.object({
  title: z.string()
    .min(5, { message: "Le titre doit contenir au moins 5 caractères." })
    .max(80, { message: "Le titre ne doit pas dépasser 80 caractères." })
    .refine(val => !hasForbiddenKeywords(val), {
      message: "Le titre contient des mots-clés inappropriés ou interdits (ex: arnaque, drogue, arme)."
    }),
    
  description: z.string()
    .min(10, { message: "La description doit contenir au moins 10 caractères." })
    .max(1500, { message: "La description ne doit pas dépasser 1500 caractères." })
    .refine(val => !hasForbiddenKeywords(val), {
      message: "La description contient des mots-clés inappropriés ou interdits (ex: arnaque, drogue, arme)."
    }),
    
  price: z.preprocess(
    (val) => (val === '' || val === null || val === undefined) ? NaN : Number(val),
    z.number()
      .positive({ message: "Le prix doit être un nombre positif." })
      .max(99999999, { message: "Le prix doit être inférieur à 100 000 000." })
  ),
  
  category: z.string()
    .refine((val) => ALLOWED_CATEGORIES.includes(val as CategoryType), {
      message: "Catégorie invalide."
    })
    .transform(val => val as CategoryType),
    
  city: z.string()
    .refine((val) => ALLOWED_CITIES.includes(val as CityType), {
      message: "Ville invalide."
    })
    .transform(val => val as CityType),
    
  condition: z.string()
    .refine((val) => ALLOWED_CONDITIONS.includes(val as ConditionType), {
      message: "État/Condition invalide."
    })
    .transform(val => val as ConditionType),
    
  sellerPhone: z.string()
    .transform(v => typeof v === 'string' ? v.trim() : '')
    .refine((v) => {
      const cleanPhone = v.replace(/[^\d+-\s]/g, '');
      return cleanPhone.length >= 6 && cleanPhone.length <= 20;
    }, { message: "Numéro de téléphone invalide. Il doit contenir entre 6 et 20 caractères valides." })
    .transform(v => v.replace(/[^\d+-\s]/g, '')),
    
  sellerWhatsApp: z.string().optional().or(z.literal(''))
    .transform(v => typeof v === 'string' ? v.trim() : '')
    .refine((v) => {
      if (!v) return true;
      const cleanPhone = v.replace(/[^\d+-\s]/g, '');
      return cleanPhone.length >= 6 && cleanPhone.length <= 20;
    }, { message: "Numéro de téléphone WhatsApp invalide. Il doit contenir entre 6 et 20 caractères valides." })
    .transform(v => v ? v.replace(/[^\d+-\s]/g, '') : undefined),
    
  images: z.array(z.unknown())
    .min(1, { message: "Veuillez fournir au moins une image." })
    .transform((imgs) => imgs.map(img => validateAndSanitizeUrl(img)).filter(img => img !== ''))
    .refine((imgs) => imgs.length > 0, { message: "Aucune image valide fournie." }),
    
  arrondissement: z.string().optional()
    .transform(v => v ? sanitizeText(v, 100) : undefined),
    
  quartier: z.string().optional()
    .transform(v => v ? sanitizeText(v, 100) : undefined),
    
  quantity: z.preprocess(
    (val) => val === undefined ? 1 : Number(val),
    z.number()
      .int()
      .positive({ message: "La quantité doit être supérieure à 0." })
      .default(1)
  ).optional()
});

/**
 * Zod schema for chat message text.
 */
export const messageSchema = z.string()
  .min(1, { message: "Le message ne peut pas être vide." })
  .transform(text => sanitizeText(text, 2000))
  .refine(text => text !== '', { message: "Contenu du message invalide ou vide après nettoyage." })
  .refine(text => !hasForbiddenKeywords(text), {
    message: "Le message contient des mots inappropriés ou interdits."
  });

/**
 * Validates and sanitizes all fields of a Listing to enforce Zero-Trust guidelines before Firestore write.
 */
export function validateAndSanitizeListing(
  raw: unknown
): Omit<Listing, 'id' | 'createdAt' | 'viewsCount' | 'status' | 'sellerId' | 'sellerName' | 'sellerIsVerified' | 'sellerResponseTime'> {
  if (!raw || typeof raw !== 'object') {
    throw new Error("Données de publication invalides.");
  }

  const result = listingSchema.safeParse(raw);
  if (!result.success) {
    const firstError = result.error.issues[0];
    throw new Error(firstError.message);
  }

  const data = result.data;

  // Sanitize the text fields for standard safety post Zod parsing
  const title = sanitizeText(data.title, 80);
  const description = sanitizeText(data.description, 1500);
  const sellerPhone = data.sellerPhone;
  const sellerWhatsApp = data.sellerWhatsApp || sellerPhone;

  return {
    title,
    description,
    price: data.price,
    category: data.category,
    city: data.city,
    arrondissement: data.arrondissement,
    quartier: data.quartier,
    condition: data.condition,
    sellerPhone,
    sellerWhatsApp,
    images: data.images,
    quantity: data.quantity ?? 1
  };
}

/**
 * Validates and sanitizes chat messages.
 */
export function validateAndSanitizeMessageText(text: unknown): string {
  const result = messageSchema.safeParse(text);
  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }
  return result.data;
}
