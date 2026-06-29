export const colors = {
  primary: '#C8762B',   // Ocre : Rappelle la terre cuite, la poussière des marchés et la chaleur sahélienne. Évite les couleurs "tech" froides pour plus d'ancrage local.
  secondary: '#1A1209', // Marron très sombre : Substitut au noir pur. Donne un contraste doux mais lisible, essentiel pour les écrans de faible qualité sous le soleil.
  accent: '#F0C060',    // Or : Symbolise la valeur et le commerce. Attire l'œil sur les actions clés sans agresser visuellement.
  surface: '#FDF6EC',   // Sable/Off-white : Réduit la fatigue visuelle par rapport au blanc pur (#FFFFFF), surtout pour de longues sessions de navigation sur mobile.
  text: '#1C1008',      // Marron profond : Offre un excellent contraste sur la couleur "surface" tout en restant dans des tons naturels et chaleureux.
  
  // Variations sémantiques basées sur nos couleurs clés
  surfaceHover: '#F7E7CE',
  border: '#E8D4BB',
  error: '#DC2626', // Rouge standard mais légèrement atténué si besoin, gardons un rouge universel pour les erreurs critiques.
  success: '#16A34A', // Vert standard pour la réussite (ex: annonce publiée).
};

export const radii = {
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px', // Limite maximale demandée pour le border-radius, garantit un aspect structuré mais convivial.
  full: '9999px',
};
