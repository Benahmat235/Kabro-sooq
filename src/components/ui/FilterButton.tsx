import React from 'react';

interface FilterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  variant?: 'blue' | 'orange';
  size?: 'sm' | 'md';
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  children,
  active = false,
  variant = 'blue',
  size = 'md',
  className = '',
  ...props
}) => {
  // Base classes for consistent sizing, border, font and transitions
  const baseClasses = 'flex items-center space-x-2 font-bold shrink-0 border transition-all duration-200 focus:outline-none focus:ring-2';

  // Size classes
  const sizeClasses = {
    sm: 'rounded-xl px-2.5 py-1.5 text-[11px] focus:ring-primary-500',
    md: 'rounded-2xl px-4 py-3 text-xs focus:ring-primary-500',
  }[size];

  // Variant & Active status classes
  let statusClasses = '';
  if (variant === 'orange') {
    statusClasses = active
      ? 'bg-primary-600 text-white border-primary-600 shadow-sm focus:ring-primary-500'
      : 'bg-white text-gray-700 border-gray-100 hover:border-primary-200 hover:text-primary-600 focus:ring-primary-500';
  } else {
    statusClasses = active
      ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-100'
      : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200';
  }

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${statusClasses} ${className}`}
      aria-pressed={active}
      {...props}
    >
      {children}
    </button>
  );
};
