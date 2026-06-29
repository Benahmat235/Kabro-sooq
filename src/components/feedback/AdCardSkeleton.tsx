import React from 'react';

interface AdCardSkeletonProps {
  count?: number;
}

export const AdCardSkeleton: React.FC<AdCardSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E8D9C4]/30 bg-[#FDF6EC] p-2.5 shadow-sm animate-pulse"
        >
          {/* Image Skeleton */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#E8D9C4]"></div>

          <div className="flex flex-1 flex-col pt-3 pb-1 px-1">
            {/* Category & Condition Row */}
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <div className="h-4 w-16 rounded bg-[#E8D9C4]"></div>
              <div className="h-4 w-12 rounded bg-[#E8D9C4]"></div>
            </div>

            {/* Title Skeleton */}
            <div className="h-5 w-3/4 rounded bg-[#E8D9C4] mb-2"></div>
            <div className="h-4 w-1/2 rounded bg-[#E8D9C4] mb-2"></div>

            {/* Location & Date */}
            <div className="mt-1 flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-[#E8D9C4]"></div>
              <div className="h-3 w-16 rounded bg-[#E8D9C4]"></div>
            </div>

            {/* Price */}
            <div className="mt-2.5 pt-1 border-t border-[#E8D9C4]/30">
              <div className="h-6 w-24 rounded bg-[#E8D9C4]"></div>
            </div>

            {/* Seller Info */}
            <div className="mt-3 flex items-center space-x-2 rounded-xl bg-[#E8D9C4]/20 p-1.5">
              <div className="h-6 w-6 rounded-full bg-[#E8D9C4]"></div>
              <div className="flex flex-col space-y-1">
                <div className="h-3 w-24 rounded bg-[#E8D9C4]"></div>
                <div className="h-2 w-16 rounded bg-[#E8D9C4]"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
