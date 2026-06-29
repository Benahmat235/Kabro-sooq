import React from 'react';
import { PackageOpen, SearchX, HeartCrack, MessageSquareOff, LucideIcon } from 'lucide-react';

export type EmptyStateVariant = 'no-ads' | 'no-results' | 'no-favorites' | 'no-messages';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const VARIANTS: Record<EmptyStateVariant, { icon: LucideIcon; title: string; description: string }> = {
  'no-ads': {
    icon: PackageOpen,
    title: 'Aucune annonce ici',
    description: 'Soyez le premier à publier dans cette catégorie et attirez les acheteurs !',
  },
  'no-results': {
    icon: SearchX,
    title: 'Aucun résultat trouvé',
    description: 'Essayez de modifier vos filtres ou de chercher avec d\'autres mots-clés.',
  },
  'no-favorites': {
    icon: HeartCrack,
    title: 'Pas encore de favoris',
    description: 'Sauvegardez les annonces qui vous plaisent pour les retrouver facilement ici.',
  },
  'no-messages': {
    icon: MessageSquareOff,
    title: 'Aucun message',
    description: 'Contactez des vendeurs ou publiez des annonces pour démarrer des discussions.',
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  variant, 
  icon: CustomIcon, 
  title: customTitle, 
  description: customDescription,
  actionLabel,
  onAction 
}) => {
  const defaultVariant = variant ? VARIANTS[variant] : VARIANTS['no-ads'];
  
  const Icon = CustomIcon || defaultVariant.icon;
  const title = customTitle || defaultVariant.title;
  const description = customDescription || defaultVariant.description;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#FDF6EC] rounded-2xl border border-[#C8762B]/10">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-[#E8D9C4]">
        <Icon className="h-8 w-8 text-[#C8762B]" strokeWidth={1.5} />
      </div>
      
      <h3 className="mb-2 font-playfair text-xl font-bold text-[#1C1008]">
        {title}
      </h3>
      
      <p className="mb-6 max-w-sm text-sm text-[#1C1008]/70">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-full bg-[#C8762B] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#b06522] active:scale-95 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
