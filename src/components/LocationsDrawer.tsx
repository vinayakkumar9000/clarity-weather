
import React from 'react';
import { useWeather } from '@/context/WeatherContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MapPin, X, Star, Plus } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import LocationSearch from './LocationSearch';

const LocationsDrawer = () => {
  const { savedLocations, fetchWeather, removeLocation, toggleFavorite, currentWeather } = useWeather();
  const [open, setOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  
  // Sort locations with favorites first
  const sortedLocations = [...savedLocations].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return 0;
  });
  
  const handleSelectLocation = async (locationId: string) => {
    const location = savedLocations.find(loc => loc.id === locationId);
    if (location) {
      await fetchWeather(location);
      setOpen(false);
    }
  };
  
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Saved Locations">
            <MapPin size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle className="text-lg">Saved Locations</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <h2 className="text-lg font-semibold mb-4">Search Locations</h2>
                <LocationSearch onClose={() => setSearchOpen(false)} />
              </DialogContent>
            </Dialog>
            
            <div className="space-y-2 mt-6">
              {sortedLocations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-2">No saved locations</p>
                  <p className="text-sm">Search and add locations to see them here</p>
                </div>
              ) : (
                sortedLocations.map((location) => (
                  <div 
                    key={location.id} 
                    className={`
                      flex items-center justify-between p-3 rounded-md
                      ${location.id === currentWeather?.location.id ? 'bg-primary/10' : 'hover:bg-muted'}
                    `}
                  >
                    <button
                      className="flex-1 flex items-center text-left"
                      onClick={() => handleSelectLocation(location.id)}
                    >
                      <MapPin size={16} className="mr-2 flex-shrink-0" />
                      <span className="truncate">{location.name}</span>
                    </button>
                    
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleFavorite(location.id)}
                        aria-label={location.favorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star
                          size={16}
                          className={location.favorite ? "fill-yellow-500 text-yellow-500" : ""}
                        />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 ml-1 text-destructive hover:text-destructive"
                        onClick={() => removeLocation(location.id)}
                        aria-label="Remove location"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default LocationsDrawer;
