import { describe, it, expect } from 'vitest';
import { 
  sanitizeText, 
  validateAndSanitizeUrl, 
  validateAndSanitizePhone, 
  validateAndSanitizeListing, 
  validateAndSanitizeMessageText 
} from './security';

describe('Security Utility Validation Functions', () => {
  
  describe('sanitizeText', () => {
    it('should return an empty string for non-string inputs', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
      expect(sanitizeText(123)).toBe('');
      expect(sanitizeText({})).toBe('');
      expect(sanitizeText([])).toBe('');
    });

    it('should strip script tags and their inner content', () => {
      const input = 'Hello <script>alert("XSS")</script> World';
      expect(sanitizeText(input)).toBe('Hello  World');
    });

    it('should strip other HTML tags', () => {
      const input = '<p>This is <strong>bold</strong> text</p>';
      expect(sanitizeText(input)).toBe('This is bold text');
    });

    it('should trim surrounding whitespace', () => {
      const input = '   some text with whitespace   ';
      expect(sanitizeText(input)).toBe('some text with whitespace');
    });

    it('should HTML-encode special characters', () => {
      expect(sanitizeText('&')).toBe('&amp;');
      expect(sanitizeText('<')).toBe('&lt;');
      expect(sanitizeText('>')).toBe('&gt;');
      expect(sanitizeText('"')).toBe('&quot;');
      expect(sanitizeText("'")).toBe('&#x27;');
      expect(sanitizeText('/')).toBe('&#x2F;');
    });

    it('should truncate the output to the specified maxLength', () => {
      const input = 'abcdefghijklmnopqrstuvwxyz';
      expect(sanitizeText(input, 10)).toBe('abcdefghij');
    });

    it('should handle dynamic default maxLength', () => {
      const longInput = 'a'.repeat(1200);
      expect(sanitizeText(longInput).length).toBe(1000);
    });
  });

  describe('validateAndSanitizeUrl', () => {
    it('should return an empty string for non-string inputs', () => {
      expect(validateAndSanitizeUrl(null)).toBe('');
      expect(validateAndSanitizeUrl(123)).toBe('');
    });

    it('should allow valid HTTPS URLs', () => {
      const validUrl = 'https://images.unsplash.com/photo-12345';
      expect(validateAndSanitizeUrl(validUrl)).toBe(validUrl);
    });

    it('should reject non-HTTPS URLs', () => {
      const httpUrl = 'http://images.unsplash.com/photo-12345';
      expect(validateAndSanitizeUrl(httpUrl)).toBe('');
      
      const ftpUrl = 'ftp://files.example.com/photo.jpg';
      expect(validateAndSanitizeUrl(ftpUrl)).toBe('');
    });

    it('should reject invalid URL patterns', () => {
      expect(validateAndSanitizeUrl('not-a-url')).toBe('');
      expect(validateAndSanitizeUrl('https://')).toBe('');
    });

    it('should allow valid base64 image data URIs', () => {
      const validBase64Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      expect(validateAndSanitizeUrl(validBase64Png)).toBe(validBase64Png);
    });

    it('should reject malformed or unsafe data URIs', () => {
      const invalidDataUri = 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==';
      expect(validateAndSanitizeUrl(invalidDataUri)).toBe('');
      
      const malformedDataUri = 'data:image/png;base64,invalid@@chars';
      expect(validateAndSanitizeUrl(malformedDataUri)).toBe('');
    });

    it('should reject extremely large data URIs', () => {
      const largeBase64 = 'data:image/png;base64,' + 'A'.repeat(6 * 1024 * 1024); // ~6MB
      expect(validateAndSanitizeUrl(largeBase64)).toBe('');
    });
  });

  describe('validateAndSanitizePhone', () => {
    it('should return empty string for non-string inputs', () => {
      expect(validateAndSanitizePhone(null)).toBe('');
      expect(validateAndSanitizePhone(123)).toBe('');
    });

    it('should sanitize phone numbers, stripping unwanted characters', () => {
      const rawPhone = '+235 66 12-34-56 (Direct)';
      const expected = '+235 66 12-34-56 ';
      expect(validateAndSanitizePhone(rawPhone)).toBe(expected);
    });

    it('should throw an error if the phone length is less than 6 characters', () => {
      expect(() => validateAndSanitizePhone('+12')).toThrowError(
        'Numéro de téléphone invalide'
      );
    });

    it('should throw an error if the phone length is greater than 20 characters', () => {
      const longPhone = '+1234567890123456789012';
      expect(() => validateAndSanitizePhone(longPhone)).toThrowError(
        'Numéro de téléphone invalide'
      );
    });
  });

  describe('validateAndSanitizeListing', () => {
    const validListingRaw = {
      title: 'Belle voiture à vendre',
      description: 'Superbe opportunité de voiture de luxe en excellent état.',
      price: 15000000,
      category: 'Véhicules',
      city: "N'Djaména",
      condition: 'excellent',
      sellerPhone: '+235 66 00 00 00',
      images: ['https://images.unsplash.com/photo-1']
    };

    it('should throw error for non-object raw input', () => {
      expect(() => validateAndSanitizeListing(null)).toThrow('Données de publication invalides');
      expect(() => validateAndSanitizeListing('string')).toThrow('Données de publication invalides');
    });

    it('should successfully validate and return sanitized listing with all fields', () => {
      const result = validateAndSanitizeListing(validListingRaw);
      expect(result.title).toBe('Belle voiture à vendre');
      expect(result.price).toBe(15000000);
      expect(result.category).toBe('Véhicules');
      expect(result.city).toBe("N'Djaména");
      expect(result.condition).toBe('excellent');
      expect(result.sellerPhone).toBe('+235 66 00 00 00');
    });

    it('should throw error if title is too short', () => {
      const invalid = { ...validListingRaw, title: 'abc' };
      expect(() => validateAndSanitizeListing(invalid)).toThrow('Le titre doit contenir entre 5 et 80 caractères');
    });

    it('should throw error if description is too short', () => {
      const invalid = { ...validListingRaw, description: 'short' };
      expect(() => validateAndSanitizeListing(invalid)).toThrow('La description doit contenir entre 10 et 1500 caractères');
    });

    it('should throw error if price is negative, zero, or invalid', () => {
      const invalid1 = { ...validListingRaw, price: -50 };
      const invalid2 = { ...validListingRaw, price: 100000000 }; // too high
      const invalid3 = { ...validListingRaw, price: 'not-a-number' };

      expect(() => validateAndSanitizeListing(invalid1)).toThrow('Le prix doit être un nombre positif');
      expect(() => validateAndSanitizeListing(invalid2)).toThrow('Le prix doit être un nombre positif');
      expect(() => validateAndSanitizeListing(invalid3)).toThrow('Le prix doit être un nombre positif');
    });

    it('should throw error for invalid categories', () => {
      const invalid = { ...validListingRaw, category: 'InvalidCategory' };
      expect(() => validateAndSanitizeListing(invalid)).toThrow('Catégorie invalide');
    });

    it('should throw error for invalid cities', () => {
      const invalid = { ...validListingRaw, city: 'Paris' };
      expect(() => validateAndSanitizeListing(invalid)).toThrow('Ville invalide');
    });

    it('should throw error for invalid conditions', () => {
      const invalid = { ...validListingRaw, condition: 'damaged' };
      expect(() => validateAndSanitizeListing(invalid)).toThrow('État/Condition invalide');
    });

    it('should throw error if images is not a non-empty array or has no valid image URLs', () => {
      const invalid1 = { ...validListingRaw, images: [] };
      const invalid2 = { ...validListingRaw, images: ['http://http-not-allowed.com'] };

      expect(() => validateAndSanitizeListing(invalid1)).toThrow('Veuillez fournir au moins une image');
      expect(() => validateAndSanitizeListing(invalid2)).toThrow('Aucune image valide fournie');
    });

    it('should sanitize optional fields if provided', () => {
      const listingWithOptional = {
        ...validListingRaw,
        arrondissement: '1er Arrondissement <script>alert(1)</script>',
        quartier: 'Moursal',
        sellerWhatsApp: '+235 99 00 00 00'
      };
      const result = validateAndSanitizeListing(listingWithOptional);
      expect(result.arrondissement).toBe('1er Arrondissement');
      expect(result.quartier).toBe('Moursal');
      expect(result.sellerWhatsApp).toBe('+235 99 00 00 00');
    });
  });

  describe('validateAndSanitizeMessageText', () => {
    it('should throw an error for non-string, empty, or whitespace messages', () => {
      expect(() => validateAndSanitizeMessageText(null)).toThrow('Le message ne peut pas être vide');
      expect(() => validateAndSanitizeMessageText('')).toThrow('Le message ne peut pas être vide');
      expect(() => validateAndSanitizeMessageText('   ')).toThrow('Le message ne peut pas être vide');
    });

    it('should sanitize and return a valid message string', () => {
      const text = 'Hello <script>alert("hack")</script> & world!';
      const expected = 'Hello  &amp; world!';
      expect(validateAndSanitizeMessageText(text)).toBe(expected);
    });

    it('should throw an error if the message becomes empty after HTML tag strip and sanitization', () => {
      const text = '<script>alert("hack")</script>';
      expect(() => validateAndSanitizeMessageText(text)).toThrow('Contenu du message invalide ou vide après nettoyage');
    });
  });
});
