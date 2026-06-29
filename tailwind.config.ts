import type { Config } from 'tailwindcss';
import { colors, radii } from './src/design-system/tokens';
import { fontFamilies, fontSizes } from './src/design-system/typography';
import { spacing } from './src/design-system/spacing';

// Configuration Tailwind CSS de KabroSooq.
// Ces paramètres sont spécifiquement adaptés pour une interface de place de marché 
// en Afrique Centrale (contexte d'usage, lisibilité mobile, identité locale).
const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        surface: colors.surface,
        text: colors.text,
        'surface-hover': colors.surfaceHover,
        'border-color': colors.border,
      },
      fontFamily: {
        heading: [fontFamilies.heading], // Playfair Display
        body: [fontFamilies.body],       // Noto Sans
        ui: [fontFamilies.ui],           // DM Sans
      },
      fontSize: {
        xs: fontSizes.xs,
        sm: fontSizes.sm,
        base: fontSizes.base,
        lg: fontSizes.lg,
        xl: fontSizes.xl,
        '2xl': fontSizes['2xl'],
        '3xl': fontSizes['3xl'],
        '4xl': fontSizes['4xl'],
      },
      spacing: {
        ...spacing,
      },
      borderRadius: {
        sm: radii.sm,
        md: radii.md,
        lg: radii.lg,
        xl: radii.xl,
        // Exclusion délibérée des valeurs au-delà de 24px pour respecter la contrainte de design
      },
      backgroundColor: {
        DEFAULT: colors.surface, // Remplace le fond blanc pur
      },
      textColor: {
        DEFAULT: colors.text,    // Remplace le texte noir pur
      }
    },
  },
  plugins: [],
};

export default config;
