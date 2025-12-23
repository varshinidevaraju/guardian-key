import { useState, useCallback } from 'react';
import { LocationData } from '@/types/sos';

export function useGeolocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLocation = useCallback((): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);
      setError(null);

      if (!navigator.geolocation) {
        const err = 'Geolocation is not supported by this browser';
        setError(err);
        setIsLoading(false);
        reject(new Error(err));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          // Try to get address using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${locationData.latitude}&lon=${locationData.longitude}`
            );
            const data = await response.json();
            locationData.address = data.display_name;
          } catch (e) {
            console.log('Could not get address:', e);
          }

          setLocation(locationData);
          setIsLoading(false);
          resolve(locationData);
        },
        (err) => {
          setError(err.message);
          setIsLoading(false);
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  return { location, error, isLoading, getLocation };
}
