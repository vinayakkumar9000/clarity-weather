
import React, { useRef } from 'react';
import { HourlyForecast } from '@/services/weatherService';
import WeatherIcon from './WeatherIcon';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface HourlyForecastCardProps {
  forecast: HourlyForecast[];
  className?: string;
}

const HourlyForecastCard: React.FC<HourlyForecastCardProps> = ({ forecast, className }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Filter next 24 hours
  const next24Hours = forecast.slice(0, 24);
  
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  return (
    <Card className={cn("relative overflow-hidden animate-fade-in animate-delay-100", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Hourly Forecast</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 relative">
        {/* Scroll buttons */}
        <button 
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-r-full p-1 shadow-md hover:bg-background/90 transition-colors"
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button 
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-l-full p-1 shadow-md hover:bg-background/90 transition-colors"
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
        
        {/* Scrollable container */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-none py-4 px-8"
        >
          {next24Hours.map((hour, index) => (
            <div 
              key={hour.time} 
              className={cn(
                "flex flex-col items-center justify-between min-w-[80px] px-2",
                index === 0 && "pl-0"
              )}
            >
              <div className="text-sm mb-1">
                {format(parseISO(hour.time), 'h a')}
              </div>
              
              <WeatherIcon weatherCode={hour.weatherCode} size={24} className="my-2" />
              
              <div className="text-sm font-medium mt-1">
                {Math.round(hour.temperature)}°
              </div>
              
              {hour.precipitationProbability !== undefined && hour.precipitationProbability > 0 && (
                <div className="text-xs text-blue-500 mt-1">
                  {hour.precipitationProbability}%
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HourlyForecastCard;
