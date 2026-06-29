import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useCategoryCounts = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const newCounts: Record<string, number> = {};
        
        if (querySnapshot.empty) {
          // Mock data for preview when DB is empty
          setCounts({
            'vehicules': 245,
            'telephones-tablettes': 512,
            'immobilier': 128,
            'electronique': 89,
            'mode-vetements': 320,
            'emplois-services': 45
          });
        } else {
          querySnapshot.forEach((doc) => {
            newCounts[doc.id] = doc.data().adCount || 0;
          });
          setCounts(newCounts);
        }
      } catch (error) {
        console.error("Error fetching category counts:", error);
        // Fallback mock on error
        setCounts({
          'vehicules': 245,
          'telephones-tablettes': 512,
          'immobilier': 128,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return { counts, loading };
};
