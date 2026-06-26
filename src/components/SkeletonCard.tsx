import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm animate-pulse" id="skeleton-card">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
        {/* Favorite button skeleton */}
        <div className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-gray-200/80 shadow-xs" />
      </div>

      {/* Details info */}
      <div className="flex flex-1 flex-col pt-3 pb-1 px-1">
        {/* Category & Condition Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <div className="h-4 w-12 rounded bg-gray-200/70" />
          <div className="h-4 w-16 rounded bg-gray-200/70" />
        </div>

        {/* Listing Title */}
        <div className="h-4 w-11/12 rounded bg-gray-200/80 mt-1" />

        {/* Location, Date & Views Row */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 w-1/2 min-w-0">
            <div className="h-3 w-3 rounded bg-gray-200/70 shrink-0" />
            <div className="h-3 w-16 rounded bg-gray-200/70 truncate" />
          </div>
          <div className="flex items-center space-x-1.5 shrink-0 justify-end w-1/2">
            <div className="h-2.5 w-8 rounded bg-gray-200/70" />
            <span className="text-gray-200 text-[8px]">•</span>
            <div className="h-2.5 w-8 rounded bg-gray-200/70" />
          </div>
        </div>

        {/* Price Row */}
        <div className="mt-2.5 flex items-baseline justify-between pt-2 border-t border-gray-50">
          <div className="h-4.5 w-24 rounded bg-gray-200/80" />
        </div>

        {/* Seller info */}
        <div className="mt-3 flex items-center space-x-2 rounded-xl bg-gray-50/50 p-1.5 border border-gray-50/80">
          <div className="h-6 w-6 rounded-full bg-gray-200/80 shrink-0" />
          <div className="overflow-hidden flex-1 space-y-1">
            <div className="h-3 w-20 rounded bg-gray-200/80" />
            <div className="h-2.5 w-24 rounded bg-gray-200/70" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
      {Array.from({ length: 8 }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
};
