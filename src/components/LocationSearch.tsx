
import React, { useState, useEffect, useRef } from 'react';
import { WeatherLocation, searchLocations } from '@/services/weatherService';
import { useWeather } from '@/context/WeatherContext';
import { cn } from '@/lib/utils';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Search, X, Loader2, MapPin, Globe, Hash } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface LocationSearchProps {
  className?: string;
  onClose?: () => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ className, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<WeatherLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const { fetchWeather, savedLocations } = useWeather();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Try to get user's country from browser geolocation when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`
          );
          const data = await response.json();
          setUserCountry(data.timezone_abbreviation || null);
          
          // If we got location, add it as a suggestion
          if (latitude && longitude) {
            const locationName = await reverseGeocode(latitude, longitude);
            if (locationName) {
              const currentLocation: WeatherLocation = {
                id: `current-${latitude}-${longitude}`,
                name: `${locationName} (Current Location)`,
                latitude,
                longitude,
              };
              setResults([currentLocation]);
            }
          }
        } catch (error) {
          console.error('Error getting user location:', error);
        }
      }, (error) => {
        console.error('Geolocation error:', error);
      });
    }
  }, []);
  
  // Function to get location name from coordinates
  const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return result.name + (result.admin1 ? `, ${result.admin1}` : '') + (result.country ? `, ${result.country}` : '');
      }
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };
  
  // Debounce the search term to avoid too many requests
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Check if the search term is a postal/zip code
  const isPostalCode = (term: string): boolean => {
    // Simple regex for postal codes - can be expanded for different formats
    const postalRegex = /^[0-9]{4,6}$/;
    return postalRegex.test(term.trim());
  };
  
  // Search for locations when the debounced search term changes
  useEffect(() => {
    const search = async () => {
      if (debouncedSearchTerm.trim().length < 2) {
        setResults([]);
        return;
      }
      
      setIsSearching(true);
      
      try {
        if (isPostalCode(debouncedSearchTerm)) {
          // Search by postal code
          const locations = await searchLocations(debouncedSearchTerm, true);
          setResults(locations);
        } else {
          // Search by city name with optional country context
          const locations = await searchLocations(debouncedSearchTerm, false, userCountry);
          setResults(locations);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };
    
    search();
  }, [debouncedSearchTerm, userCountry]);
  
  const handleSelectLocation = async (location: WeatherLocation) => {
    await fetchWeather(location);
    setSearchTerm('');
    if (onClose) onClose();
  };
  
  return (
    <Command className={cn("rounded-lg border", className)}>
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandInput
          ref={inputRef}
          placeholder="Search by city name or postal code..."
          value={searchTerm}
          onValueChange={setSearchTerm}
          className="flex-1"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="h-4 w-4 opacity-50 hover:opacity-100"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      <CommandList>
        {isSearching ? (
          <div className="py-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-2">Searching locations...</p>
          </div>
        ) : (
          <>
            {debouncedSearchTerm.trim().length > 0 && results.length === 0 && (
              <CommandEmpty>No locations found</CommandEmpty>
            )}
            
            {debouncedSearchTerm.trim().length < 2 && savedLocations.length > 0 && (
              <CommandGroup heading="Saved Locations">
                {savedLocations.map((location) => (
                  <CommandItem
                    key={location.id}
                    value={location.name}
                    onSelect={() => handleSelectLocation(location)}
                    className="flex items-center"
                  >
                    {location.favorite ? (
                      <MapPin className="mr-2 h-4 w-4 text-primary" />
                    ) : (
                      <MapPin className="mr-2 h-4 w-4" />
                    )}
                    {location.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {results.length > 0 && (
              <CommandGroup heading={isPostalCode(debouncedSearchTerm) ? "Postal Code Results" : "Search Results"}>
                {results.map((location) => (
                  <CommandItem
                    key={location.id}
                    value={location.name}
                    onSelect={() => handleSelectLocation(location)}
                    className="flex items-center"
                  >
                    {location.id.startsWith('current') ? (
                      <Globe className="mr-2 h-4 w-4 text-blue-500" />
                    ) : isPostalCode(debouncedSearchTerm) ? (
                      <Hash className="mr-2 h-4 w-4 text-orange-500" />
                    ) : (
                      <MapPin className="mr-2 h-4 w-4" />
                    )}
                    {location.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
      
      <div className="py-2 px-3 text-xs text-muted-foreground text-center border-t">
        Powered by Open-Meteo APIs
      </div>
    </Command>
  );
};

export default LocationSearch;
