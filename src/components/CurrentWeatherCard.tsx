
import React from 'react';
import { WeatherData, weatherCodeMap } from '@/services/weatherService';
import WeatherIcon from './WeatherIcon';
import { Droplets, Thermometer, Wind, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface CurrentWeatherCardProps {
  weatherData: WeatherData;
  className?: string;
}

const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({ weatherData, className }) => {
  const { current, location, daily } = weatherData;
  const weatherInfo = weatherCodeMap[current.weatherCode] || { label: 'Unknown', icon: 'cloud' };
  
  const formattedTemp = Math.round(current.temperature);
  const formattedDate = format(new Date(current.time), 'EEEE, MMM d, h:mm a');
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <div className="bg-primary/5 p-6 flex flex-col items-center justify-center gap-2 animate-fade-in">
          <div className="text-sm text-muted-foreground">{formattedDate}</div>
          <h2 className="text-xl font-medium">{location.name}</h2>
          
          <div className="flex flex-col items-center mt-4 mb-2">
            <WeatherIcon 
              weatherCode={current.weatherCode} 
              current={current} 
              daily={daily} 
              size={80} 
              className="text-primary animate-slide-up"
            />
            <div className="text-4xl font-semibold mt-3 mb-1">{formattedTemp}°</div>
            <div className="text-muted-foreground">{weatherInfo.label}</div>
          </div>
          
          <div className="w-full grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Thermometer size={18} className="text-orange-500" />
              <span className="text-sm">Feels like {Math.round(current.apparentTemperature || current.temperature)}°</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Droplets size={18} className="text-blue-500" />
              <span className="text-sm">Humidity {current.humidity}%</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Wind size={18} className="text-primary" />
              <span className="text-sm">Wind {Math.round(current.windSpeed)} km/h</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-primary" />
              <span className="text-sm">
                {(() => {
                  const dir = current.windDirection;
                  if (dir >= 337.5 || dir < 22.5) return 'N';
                  if (dir >= 22.5 && dir < 67.5) return 'NE';
                  if (dir >= 67.5 && dir < 112.5) return 'E';
                  if (dir >= 112.5 && dir < 157.5) return 'SE';
                  if (dir >= 157.5 && dir < 202.5) return 'S';
                  if (dir >= 202.5 && dir < 247.5) return 'SW';
                  if (dir >= 247.5 && dir < 292.5) return 'W';
                  return 'NW';
                })()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentWeatherCard;
