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

/**
 * Validates and sanitizes all fields of a Listing to enforce Zero-Trust guidelines before Firestore write.
 */
export function validateAndSanitizeListing(
  raw: any
): Omit<Listing, 'id' | 'createdAt' | 'viewsCount' | 'status' | 'sellerId' | 'sellerName' | 'sellerIsVerified' | 'sellerResponseTime'> {
  if (!raw || typeof raw !== 'object') {
    throw new Error("Données de publication invalides.");
  }

  // 1. Title Validation
  const title = sanitizeText(raw.title, 80);
  if (!title || title.length < 5) {
    throw new Error("Le titre doit contenir entre 5 et 80 caractères.");
  }

  // 2. Description Validation
  const description = sanitizeText(raw.description, 1500);
  if (!description || description.length < 10) {
    throw new Error("La description doit contenir entre 10 et 1500 caractères.");
  }

  // 3. Price Validation (Positive finite integer or decimal)
  const price = Number(raw.price);
  if (isNaN(price) || !isFinite(price) || price <= 0 || price > 99999999) {
    throw new Error("Le prix doit être un nombre positif inférieur à 100 000 000.");
  }

  // 4. Category Validation
  const category = raw.category as CategoryType;
  if (!ALLOWED_CATEGORIES.includes(category)) {
    throw new Error("Catégorie invalide.");
  }

  // 5. City Validation
  const city = raw.city as CityType;
  if (!ALLOWED_CITIES.includes(city)) {
    throw new Error("Ville invalide.");
  }

  // 6. Condition Validation
  const condition = raw.condition as ConditionType;
  if (!ALLOWED_CONDITIONS.includes(condition)) {
    throw new Error("État/Condition invalide.");
  }

  // 7. Seller Contacts Validation
  const sellerPhone = validateAndSanitizePhone(raw.sellerPhone);
  const sellerWhatsApp = raw.sellerWhatsApp ? validateAndSanitizePhone(raw.sellerWhatsApp) : sellerPhone;

  // 8. Images Validation
  if (!Array.isArray(raw.images) || raw.images.length === 0) {
    throw new Error("Veuillez fournir au moins une image.");
  }
  const images = (raw.images as unknown[])
    .map((img: unknown) => validateAndSanitizeUrl(img))
    .filter((img: string) => img !== '');

  if (images.length === 0) {
    throw new Error("Aucune image valide fournie.");
  }

  // 9. Arrondissement & Quartier validation for N'Djaména
  const arrondissement = raw.arrondissement ? sanitizeText(raw.arrondissement, 100) : undefined;
  const quartier = raw.quartier ? sanitizeText(raw.quartier, 100) : undefined;

  return {
    title,
    description,
    price,
    category,
    city,
    arrondissement,
    quartier,
    condition,
    sellerPhone,
    sellerWhatsApp,
    images
  };
}

/**
 * Validates and sanitizes chat messages.
 */
export function validateAndSanitizeMessageText(text: unknown): string {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error("Le message ne peut pas être vide.");
  }
  const sanitized = sanitizeText(text, 2000);
  if (!sanitized) {
    throw new Error("Contenu du message invalide ou vide après nettoyage.");
  }
  return sanitized;
}
