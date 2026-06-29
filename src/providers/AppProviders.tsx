import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { LocaleProvider } from './LocaleProvider';
import { LocationProvider } from './LocationProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <LocaleProvider>
        <LocationProvider>
          {children}
        </LocationProvider>
      </LocaleProvider>
    </AuthProvider>
  );
};
