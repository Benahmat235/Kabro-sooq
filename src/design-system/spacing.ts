// L'échelle d'espacement utilise des multiples stricts de 8px.
// Cela garantit un rythme vertical et horizontal cohérent à travers toute l'application.
// Un espacement prévisible est crucial pour les utilisateurs sur mobile (touch targets).

export const spacing = {
  0: '0px',
  1: '4px',   // Demi-pas pour des ajustements très fins
  2: '8px',   // Espace entre icône et texte
  3: '12px',
  4: '16px',  // Padding standard pour les cartes et les conteneurs mobiles
  5: '20px',
  6: '24px',  // Espacement entre des groupes d'éléments liés
  8: '32px',  // Marge de section sur mobile
  10: '40px',
  12: '48px', // Touch target minimum recommandé ou espacement de sections importantes
  16: '64px', // Grands espacements pour les hero sections ou le footer
  20: '80px',
  24: '96px',
};
