
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherData } from '@/services/weatherService';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Droplets, Umbrella, Sun, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetailedForecastCardProps {
  weatherData: WeatherData;
  className?: string;
}

const DetailedForecastCard: React.FC<DetailedForecastCardProps> = ({ weatherData, className }) => {
  const { hourly } = weatherData;
  
  // Prepare data for temperature chart - next 24 hours
  const temperatureData = hourly.slice(0, 24).map(hour => ({
    time: format(parseISO(hour.time), 'h a'),
    rawTime: hour.time,
    temperature: Math.round(hour.temperature),
    precipitation: hour.precipitation || 0,
    precipitationProbability: hour.precipitationProbability || 0,
    humidity: hour.humidity || 0,
  }));
  
  // Prepare data for UV index
  const dailyUvData = weatherData.daily.map(day => ({
    day: format(parseISO(day.date), 'EEE'),
    uvIndex: day.uvIndexMax || 0,
  }));
  
  return (
    <Card className={cn("overflow-hidden animate-fade-in animate-delay-300", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Detailed Forecast</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-6">
          {/* Temperature Chart */}
          <div>
            <h3 className="flex items-center text-sm font-medium mb-2">
              <Thermometer size={16} className="mr-1 text-orange-500" />
              Temperature (24 hours)
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={temperatureData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff7c43" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff7c43" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                    tickMargin={5}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickMargin={5}
                    tickFormatter={(value) => `${value}°`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}°C`, 'Temperature']}
                    labelFormatter={(time) => `Temperature at ${time}`}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0', 
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#ff7c43" 
                    strokeWidth={2}
                    fill="url(#tempGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Precipitation Chart */}
          <div>
            <h3 className="flex items-center text-sm font-medium mb-2">
              <Umbrella size={16} className="mr-1 text-blue-500" />
              Precipitation Probability
            </h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={temperatureData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                    tickMargin={5}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickMargin={5}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Probability']}
                    labelFormatter={(time) => `Precipitation at ${time}`}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0', 
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="precipitationProbability" 
                    fill="#3b82f6" 
                    barSize={15}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Humidity Chart */}
          <div>
            <h3 className="flex items-center text-sm font-medium mb-2">
              <Droplets size={16} className="mr-1 text-blue-300" />
              Humidity Levels
            </h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={temperatureData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                    tickMargin={5}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickMargin={5}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Humidity']}
                    labelFormatter={(time) => `Humidity at ${time}`}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0', 
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#60a5fa" 
                    strokeWidth={2}
                    fill="url(#humidityGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* UV Index Chart */}
          <div>
            <h3 className="flex items-center text-sm font-medium mb-2">
              <Sun size={16} className="mr-1 text-amber-500" />
              UV Index (7 Days)
            </h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyUvData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    tickMargin={5}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickMargin={5}
                    domain={[0, 12]}
                  />
                  <Tooltip 
                    formatter={(value) => [value, 'UV Index']}
                    labelFormatter={(day) => `UV Index for ${day}`}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0', 
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="uvIndex" 
                    name="UV Index"
                    fill="#f59e0b" 
                    barSize={20}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground text-center mt-6">
          Powered by Open-Meteo
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailedForecastCard;
