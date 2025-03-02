
import React from 'react';
import { DailyForecast } from '@/services/weatherService';
import WeatherIcon from './WeatherIcon';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';

interface DailyForecastCardProps {
  forecast: DailyForecast[];
  className?: string;
}

const DailyForecastCard: React.FC<DailyForecastCardProps> = ({ forecast, className }) => {
  return (
    <Card className={cn("overflow-hidden animate-fade-in animate-delay-200", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">7-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {forecast.map((day, index) => (
            <div 
              key={day.date} 
              className={cn(
                "flex items-center justify-between py-2",
                index !== forecast.length - 1 && "border-b border-border"
              )}
            >
              <div className="flex-1 font-medium">
                {index === 0 
                  ? 'Today' 
                  : index === 1 
                    ? 'Tomorrow' 
                    : format(parseISO(day.date), 'EEE')}
              </div>
              
              <div className="flex items-center gap-3">
                <WeatherIcon weatherCode={day.weatherCode} size={24} />
                
                <div className="flex gap-2 w-[85px]">
                  <span className="font-medium">{Math.round(day.temperatureMax)}°</span>
                  <span className="text-muted-foreground">{Math.round(day.temperatureMin)}°</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyForecastCard;
