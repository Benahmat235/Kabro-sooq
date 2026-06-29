import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CityDocument } from '../types/firestore';

interface LocationContextType {
  city: CityDocument | null;
  setCity: (city: CityDocument | null) => void;
  nearbyAds: any[];
  requestGeolocation: () => void;
  geoError: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const DEFAULT_CITY: CityDocument = {
  id: 'ndjamena',
  name_fr: "N'Djamena",
  name_ar: "انجمينا",
  region: "Chari-Baguirmi",
  lat: 12.1131,
  lng: 15.0491
};

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [city, setCity] = useState<CityDocument | null>(() => {
    const saved = localStorage.getItem('sooq_city');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_CITY;
      }
    }
    return DEFAULT_CITY;
  });

  const [nearbyAds, setNearbyAds] = useState<any[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (city) {
      localStorage.setItem('sooq_city', JSON.stringify(city));
    } else {
      localStorage.removeItem('sooq_city');
    }
  }, [city]);

  const requestGeolocation = () => {
    if ('geolocation' in navigator) {
      setGeoError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // You would typically reverse geocode these coordinates
          // to find the closest city, but for now we'll just mock it.
          const { latitude, longitude } = position.coords;
          console.log(`User location: ${latitude}, ${longitude}`);
          
          // Fallback logic could be implemented here to find the nearest CityDocument
          // based on the obtained lat and lng. 
        },
        (error) => {
          let msg = "Erreur de géolocalisation inconnue.";
          if (error.code === 1) {
            msg = "Accès à la localisation refusé. Veuillez activer les permissions de localisation dans votre navigateur.";
          } else if (error.code === 2) {
            msg = "Position non disponible.";
          } else if (error.code === 3) {
            msg = "Délai d'attente dépassé.";
          }
          setGeoError(msg);
        }
      );
    } else {
      setGeoError("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  return (
    <LocationContext.Provider value={{ city, setCity, nearbyAds, requestGeolocation, geoError }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
