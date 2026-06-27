import React from 'react';
import { MapPin } from 'lucide-react';

interface CitySelectorProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  city: string;
  active?: boolean;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  city,
  active = false,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`w-full rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 flex items-center space-x-2.5 ${
        active
          ? 'bg-blue-50 text-blue-700 font-bold'
          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
      } ${className}`}
      {...props}
    >
      <span className="text-blue-500 text-sm shrink-0">
        <MapPin className="h-4 w-4" aria-hidden="true" />
      </span>
      <span>{city}</span>
    </button>
  );
};
