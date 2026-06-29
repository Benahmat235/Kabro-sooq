// Polices choisies pour KabroSooq :
// - Playfair Display : Pour les titres (donne un aspect noble, précieux et digne, rappelant l'artisanat de valeur).
// - Noto Sans : Pour le corps de texte (extrêmement lisible sur de petits écrans, excellente prise en charge de multiples langues).
// - DM Sans : Pour les éléments d'interface utilisateur (boutons, badges, labels), géométrique et moderne.

export const fontFamilies = {
  heading: '"Playfair Display", serif',
  body: '"Noto Sans", sans-serif',
  ui: '"DM Sans", sans-serif',
};

// Échelle typographique conçue pour garantir la lisibilité sur mobile en premier lieu.
// L'audience tchadienne utilise majoritairement des smartphones, parfois anciens.
// Des tailles légèrement plus grandes pour les corps de texte améliorent l'expérience.
export const fontSizes = {
  xs: '0.75rem',    // 12px - Pour les métadonnées (date de l'annonce, vues)
  sm: '0.875rem',   // 14px - Pour les descriptions secondaires ou petits boutons
  base: '1rem',     // 16px - Base pour le corps du texte (lisibilité optimale)
  lg: '1.125rem',   // 18px - Pour les sous-titres et éléments mis en avant
  xl: '1.25rem',    // 20px - Titres de cartes d'annonces
  '2xl': '1.5rem',  // 24px - Titres de section
  '3xl': '1.875rem',// 30px - Titres de page
  '4xl': '2.25rem', // 36px - Titres principaux (hero headers)
};

export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};
