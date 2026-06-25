import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm animate-pulse" id="skeleton-card">
      {/* Image Skeleton */}
      <div className="aspect-[4/3] w-full rounded-xl bg-gray-200" />
      
      {/* Details Skeletons */}
      <div className="mt-4 space-y-2.5">
        <div className="h-3 w-1/4 rounded-full bg-gray-200" />
        <div className="h-4.5 w-11/12 rounded-full bg-gray-200" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-1/3 rounded-full bg-gray-200" />
          <div className="h-3 w-1/4 rounded-full bg-gray-200" />
        </div>
        <div className="flex items-center space-x-2 border-t border-gray-50 pt-2.5">
          <div className="h-6 w-6 rounded-full bg-gray-200" />
          <div className="h-3.5 w-1/2 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
};
