import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TCHAD_CATEGORIES } from '../../data/categories';
import { useCategoryCounts } from '../../hooks/useCategoryCounts';
import { 
  Car, Home, Smartphone, Tv, Shirt, Briefcase, 
  Sofa, Wheat, GraduationCap, HeartPulse, Dumbbell, Package,
  LucideIcon
} from 'lucide-react';

const IconMap: Record<string, LucideIcon> = {
  Car, Home, Smartphone, Tv, Shirt, Briefcase, 
  Sofa, Wheat, GraduationCap, HeartPulse, Dumbbell, Package
};

export const CategoriesGrid: React.FC = () => {
  const { counts } = useCategoryCounts();

  const sortedCategories = useMemo(() => {
    return [...TCHAD_CATEGORIES].sort((a, b) => {
      const countA = counts[a.id] || 0;
      const countB = counts[b.id] || 0;
      return countB - countA;
    });
  }, [counts]);

  const displayLimit = 12;
  const categoriesToShow = sortedCategories.slice(0, displayLimit);
  const hasMore = sortedCategories.length > displayLimit;

  return (
    <div className="w-full">
      <style>{`
        @keyframes gridFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-grid-item {
          animation: gridFadeUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
      
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {categoriesToShow.map((cat, index) => {
          const isTop3 = index < 3;
          const count = counts[cat.id] || 0;
          const Icon = IconMap[cat.icon] || Package;

          return (
            <Link
              key={cat.id}
              to={`/categorie/${cat.slug}`}
              className={`
                animate-grid-item flex flex-col items-start p-4 md:p-5 rounded-2xl transition-all duration-300
                hover:shadow-sm group relative overflow-hidden border border-transparent hover:border-black/5
                ${isTop3 ? 'col-span-2' : 'col-span-1'}
              `}
              style={{
                backgroundColor: `${cat.color}15`,
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Saturate/darken bg on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ backgroundColor: `${cat.color}10` }}
              />
              
              <div className="flex w-full justify-between items-start mb-4 z-10 relative">
                <div 
                  className="transition-transform duration-300 group-hover:-translate-y-1"
                  style={{ color: cat.color }}
                >
                  <Icon className="w-10 h-10 md:w-12 md:h-12" strokeWidth={1.5} />
                </div>
                {count > 0 && (
                  <span 
                    className="text-xs font-bold px-2.5 py-1 rounded-full bg-white shadow-sm whitespace-nowrap"
                    style={{ color: cat.color }}
                  >
                    {count}
                  </span>
                )}
              </div>
              
              <div className="z-10 relative w-full mt-auto">
                <h3 className="font-sans text-[#1C1008] font-bold text-[15px] md:text-base leading-snug group-hover:text-black transition-colors">
                  {cat.label.fr}
                </h3>
                {isTop3 && (
                  <p className="text-xs text-[#1C1008]/60 mt-1 line-clamp-1">
                    {cat.subcategories.map(s => s.label.fr).join(', ')}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Link 
            to="/categories" 
            className="text-sm font-bold text-[#C8762B] hover:text-[#b06522] transition-colors flex items-center justify-center px-6 py-2.5 rounded-full border border-[#C8762B]/20 hover:bg-[#C8762B]/5"
          >
            Voir toutes les catégories
          </Link>
        </div>
      )}
    </div>
  );
};
