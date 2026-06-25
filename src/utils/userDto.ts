import { User } from 'firebase/auth';

/**
 * Public User Profile Data Transfer Object.
 * Excludes sensitive personal fields like email, auth tokens, passwords, secrets, or PII.
 */
export interface PublicUserProfileDTO {
  uid: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

/**
 * Strips all sensitive data from a raw user object (from Firebase Auth or Firestore)
 * and returns only the safe, public fields required for the UI.
 *
 * @param rawUser Any object representing user data
 * @returns A safe, sanitized PublicUserProfileDTO
 */
export function sanitizeUserProfile(rawUser: any): PublicUserProfileDTO {
  if (!rawUser) {
    return {
      uid: '',
      name: 'Utilisateur anonyme',
      avatarUrl: '',
      createdAt: new Date().toISOString(),
    };
  }

  // Explicitly select only non-sensitive public fields to prevent field injection
  const uid = typeof rawUser.uid === 'string' ? rawUser.uid : (rawUser.id || '');
  const name = typeof rawUser.name === 'string' 
    ? rawUser.name 
    : (typeof rawUser.displayName === 'string' ? rawUser.displayName : 'Utilisateur');
  
  const avatarUrl = typeof rawUser.avatarUrl === 'string'
    ? rawUser.avatarUrl
    : (typeof rawUser.photoURL === 'string' ? rawUser.photoURL : '');

  const createdAt = typeof rawUser.createdAt === 'string'
    ? rawUser.createdAt
    : new Date().toISOString();

  // Explicitly construct the DTO to make sure no extra hidden fields (e.g. email, password, tokens) are passed
  return {
    uid,
    name,
    avatarUrl,
    createdAt
  };
}

/**
 * Contextual DTO helper to scrub any potentially sensitive Firebase user object.
 * Safe for client state consumption or logging.
 */
export function sanitizeAuthUser(user: User | null): { uid: string; displayName: string; photoURL: string } | null {
  if (!user) return null;
  return {
    uid: user.uid,
    displayName: user.displayName || 'Utilisateur',
    photoURL: user.photoURL || ''
  };
}
