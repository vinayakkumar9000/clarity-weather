
import React, { useEffect } from 'react';
import { useWeather } from '@/context/WeatherContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import NavBar from '@/components/NavBar';
import CurrentWeatherCard from '@/components/CurrentWeatherCard';
import HourlyForecastCard from '@/components/HourlyForecastCard';
import DailyForecastCard from '@/components/DailyForecastCard';
import LocationSearch from '@/components/LocationSearch';
import { MapPin, Search } from 'lucide-react';

const Index = () => {
  const { currentWeather, isLoading, savedLocations } = useWeather();
  const [searchOpen, setSearchOpen] = React.useState(false);
  
  useEffect(() => {
    // If there's no current weather data and no saved locations, open the search dialog
    if (!currentWeather && savedLocations.length === 0 && !isLoading) {
      setSearchOpen(true);
    }
  }, [currentWeather, savedLocations, isLoading]);
  
  if (isLoading && !currentWeather) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <h2 className="text-xl font-medium">Loading Weather Data</h2>
            <p className="text-muted-foreground mt-2">Please wait while we fetch the latest information</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentWeather) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
              <div className="mb-8">
                <MapPin size={48} className="mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-medium mb-2">Welcome to Clarity Weather</h2>
                <p className="text-muted-foreground mb-6">
                  Get started by searching for a location to view the current weather and forecast.
                </p>
                
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Search size={16} className="mr-2" />
                    Search Locations
                  </Button>
                </DialogTrigger>
              </div>
              <DialogContent>
                <h2 className="text-lg font-semibold mb-4">Search Locations</h2>
                <LocationSearch onClose={() => setSearchOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <CurrentWeatherCard weatherData={currentWeather} />
          
          <HourlyForecastCard forecast={currentWeather.hourly} />
          
          <DailyForecastCard forecast={currentWeather.daily} />
        </div>
      </main>
    </div>
  );
};

export default Index;
