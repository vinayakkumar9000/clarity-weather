
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Sun, Moon, RefreshCw, Search } from 'lucide-react';
import { useWeather } from '@/context/WeatherContext';
import LocationsDrawer from './LocationsDrawer';
import LocationSearch from './LocationSearch';
import { cn } from '@/lib/utils';

interface NavBarProps {
  className?: string;
}

const NavBar: React.FC<NavBarProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const { refreshWeather, isLoading } = useWeather();
  const [searchOpen, setSearchOpen] = React.useState(false);
  
  return (
    <div className={cn("flex items-center justify-between py-2 px-4", className)}>
      <div className="flex items-center">
        <LocationsDrawer />
      </div>
      
      <div className="flex items-center gap-2">
        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Search Locations">
              <Search size={20} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <h2 className="text-lg font-semibold mb-4">Search Locations</h2>
            <LocationSearch onClose={() => setSearchOpen(false)} />
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={refreshWeather}
          disabled={isLoading}
          aria-label="Refresh Weather Data"
        >
          <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
      </div>
    </div>
  );
};

export default NavBar;
