
import React from 'react';
import { 
  Sun, 
  Moon,
  Cloud, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudFog, 
  CloudLightning, 
  CloudSun,
  LucideProps 
} from 'lucide-react';
import { weatherCodeMap, isDaytime, CurrentWeather, DailyForecast } from '@/services/weatherService';
import { cn } from '@/lib/utils';

interface WeatherIconProps extends Omit<LucideProps, 'icon'> {
  weatherCode: number;
  current?: CurrentWeather;
  daily?: DailyForecast[];
  size?: number;
  color?: string;
  className?: string;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  weatherCode, 
  current, 
  daily, 
  size = 24, 
  color,
  className,
  ...props 
}) => {
  // Determine if it's day or night if we have the data
  const daytime = current && daily ? isDaytime(current, daily) : true;
  
  // Get the appropriate icon name from our map
  const iconInfo = weatherCodeMap[weatherCode] || { label: 'Unknown', icon: 'cloud' };
  const iconName = iconInfo.icon;
  
  // Replace 'sun' with 'moon' at night for clear skies
  const adjustedIconName = !daytime && iconName === 'sun' ? 'moon' : iconName;
  
  // Map icon names to components
  const iconMap: Record<string, React.ReactElement> = {
    sun: <Sun size={size} />,
    moon: <Moon size={size} />,
    cloud: <Cloud size={size} />,
    'cloud-sun': <CloudSun size={size} />,
    'cloud-fog': <CloudFog size={size} />,
    'cloud-drizzle': <CloudDrizzle size={size} />,
    'cloud-rain': <CloudRain size={size} />,
    'cloud-snow': <CloudSnow size={size} />,
    'cloud-lightning': <CloudLightning size={size} />,
    'cloud-lightning-rain': <CloudLightning size={size} />,
  };
  
  const IconComponent = iconMap[adjustedIconName] || <Cloud size={size} />;
  
  return (
    <div 
      className={cn("inline-flex items-center justify-center", className)} 
      style={{ color: color || 'currentColor' }}
      {...props}
    >
      {React.cloneElement(IconComponent, { size, ...props })}
    </div>
  );
};

export default WeatherIcon;
