import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 font-bold text-gray-700 outline-none transition-all duration-200 focus:border-blue-200 focus:bg-white focus:ring-2 focus:ring-blue-100 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};
