
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import {
  WeatherData,
  WeatherLocation,
  fetchWeatherData,
  getLastWeatherData,
  getSavedLocations,
  saveLocation,
  removeLocation,
  toggleFavoriteLocation,
  cacheWeatherData,
  getCachedWeather,
} from '@/services/weatherService';

interface WeatherContextType {
  currentWeather: WeatherData | null;
  savedLocations: WeatherLocation[];
  isLoading: boolean;
  error: string | null;
  fetchWeather: (location: WeatherLocation) => Promise<void>;
  addLocation: (location: WeatherLocation) => void;
  removeLocation: (locationId: string) => void;
  toggleFavorite: (locationId: string) => void;
  refreshWeather: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [savedLocations, setSavedLocations] = useState<WeatherLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved locations and last weather data on initial load
  useEffect(() => {
    const locations = getSavedLocations();
    setSavedLocations(locations);

    const lastWeather = getLastWeatherData();
    if (lastWeather) {
      setCurrentWeather(lastWeather);
    }
    
    // If we have saved locations but no last weather, fetch the first one
    if (locations.length > 0 && !lastWeather) {
      fetchWeather(locations[0]);
    }
  }, []);

  // Fetch weather data for a location
  const fetchWeather = useCallback(async (location: WeatherLocation) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First check if we have cached data that's less than 30 minutes old
      const cachedData = getCachedWeather(location.id);
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      
      if (cachedData && new Date(cachedData.lastUpdated) > thirtyMinutesAgo) {
        setCurrentWeather(cachedData);
        setIsLoading(false);
        return;
      }
      
      // Fetch fresh data
      const data = await fetchWeatherData(location);
      setCurrentWeather(data);
      cacheWeatherData(data);
      
      // Add to saved locations if not already there
      if (!savedLocations.some(loc => loc.id === location.id)) {
        addLocation(location);
      }
    } catch (err) {
      console.error('Error in fetchWeather:', err);
      setError('Failed to fetch weather data. Please try again.');
      
      toast({
        title: "Error fetching weather data",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [savedLocations]);

  // Refresh current weather data
  const refreshWeather = useCallback(async () => {
    if (currentWeather) {
      await fetchWeather(currentWeather.location);
      toast({
        title: "Weather data updated",
        description: `Latest data for ${currentWeather.location.name}`,
      });
    }
  }, [currentWeather, fetchWeather]);

  // Add location to saved locations
  const addLocation = useCallback((location: WeatherLocation) => {
    saveLocation(location);
    setSavedLocations(prev => {
      if (prev.some(loc => loc.id === location.id)) {
        return prev;
      }
      return [...prev, location];
    });
  }, []);

  // Remove location from saved locations
  const handleRemoveLocation = useCallback((locationId: string) => {
    removeLocation(locationId);
    setSavedLocations(prev => prev.filter(loc => loc.id !== locationId));
    
    // If we're removing the current weather location, switch to another one
    if (currentWeather?.location.id === locationId) {
      const remaining = savedLocations.filter(loc => loc.id !== locationId);
      if (remaining.length > 0) {
        fetchWeather(remaining[0]);
      } else {
        setCurrentWeather(null);
      }
    }
  }, [currentWeather, savedLocations, fetchWeather]);

  // Toggle favorite status
  const handleToggleFavorite = useCallback((locationId: string) => {
    toggleFavoriteLocation(locationId);
    setSavedLocations(prev => 
      prev.map(loc => 
        loc.id === locationId ? { ...loc, favorite: !loc.favorite } : loc
      )
    );
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        currentWeather,
        savedLocations,
        isLoading,
        error,
        fetchWeather,
        addLocation: addLocation,
        removeLocation: handleRemoveLocation,
        toggleFavorite: handleToggleFavorite,
        refreshWeather,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = (): WeatherContextType => {
  const context = useContext(WeatherContext);
  
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  
  return context;
};
