
import React, { useState, useEffect, useRef } from 'react';
import { WeatherLocation, searchLocations } from '@/services/weatherService';
import { useWeather } from '@/context/WeatherContext';
import { cn } from '@/lib/utils';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Search, X, Loader2, MapPin } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface LocationSearchProps {
  className?: string;
  onClose?: () => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ className, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<WeatherLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { fetchWeather, savedLocations } = useWeather();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Debounce the search term to avoid too many requests
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Search for locations when the debounced search term changes
  useEffect(() => {
    const search = async () => {
      if (debouncedSearchTerm.trim().length < 2) {
        setResults([]);
        return;
      }
      
      setIsSearching(true);
      
      try {
        const locations = await searchLocations(debouncedSearchTerm);
        setResults(locations);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };
    
    search();
  }, [debouncedSearchTerm]);
  
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
          placeholder="Search locations..."
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
            {debouncedSearchTerm.trim().length > 0 && (
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
                    <MapPin className="mr-2 h-4 w-4 text-primary" />
                    {location.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {results.length > 0 && (
              <CommandGroup heading="Search Results">
                {results.map((location) => (
                  <CommandItem
                    key={location.id}
                    value={location.name}
                    onSelect={() => handleSelectLocation(location)}
                    className="flex items-center"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {location.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </Command>
  );
};

export default LocationSearch;
