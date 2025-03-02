
// Types for the weather data
export interface WeatherLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  favorite?: boolean;
}

export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  time: string;
  humidity?: number;
  apparentTemperature?: number;
  precipitation?: number;
  pressure?: number;
  uvIndex?: number;
}

export interface DailyForecast {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  sunrise: string;
  sunset: string;
  precipitationProbability?: number;
  precipitationSum?: number;
  uvIndexMax?: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitation?: number;
  precipitationProbability?: number;
  windSpeed?: number;
  humidity?: number;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  startTime: string;
  endTime: string;
}

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  alerts: WeatherAlert[];
  lastUpdated: string;
}

// Maps OpenMeteo weather codes to more descriptive names and icons
export const weatherCodeMap: Record<number, { label: string, icon: string }> = {
  0: { label: 'Clear sky', icon: 'sun' },
  1: { label: 'Mainly clear', icon: 'sun' },
  2: { label: 'Partly cloudy', icon: 'cloud-sun' },
  3: { label: 'Overcast', icon: 'cloud' },
  45: { label: 'Fog', icon: 'cloud-fog' },
  48: { label: 'Depositing rime fog', icon: 'cloud-fog' },
  51: { label: 'Light drizzle', icon: 'cloud-drizzle' },
  53: { label: 'Moderate drizzle', icon: 'cloud-drizzle' },
  55: { label: 'Dense drizzle', icon: 'cloud-drizzle' },
  56: { label: 'Light freezing drizzle', icon: 'cloud-drizzle' },
  57: { label: 'Dense freezing drizzle', icon: 'cloud-drizzle' },
  61: { label: 'Slight rain', icon: 'cloud-rain' },
  63: { label: 'Moderate rain', icon: 'cloud-rain' },
  65: { label: 'Heavy rain', icon: 'cloud-rain' },
  66: { label: 'Light freezing rain', icon: 'cloud-snow' },
  67: { label: 'Heavy freezing rain', icon: 'cloud-snow' },
  71: { label: 'Slight snow fall', icon: 'cloud-snow' },
  73: { label: 'Moderate snow fall', icon: 'cloud-snow' },
  75: { label: 'Heavy snow fall', icon: 'cloud-snow' },
  77: { label: 'Snow grains', icon: 'cloud-snow' },
  80: { label: 'Slight rain showers', icon: 'cloud-rain' },
  81: { label: 'Moderate rain showers', icon: 'cloud-rain' },
  82: { label: 'Violent rain showers', icon: 'cloud-lightning-rain' },
  85: { label: 'Slight snow showers', icon: 'cloud-snow' },
  86: { label: 'Heavy snow showers', icon: 'cloud-snow' },
  95: { label: 'Thunderstorm', icon: 'cloud-lightning' },
  96: { label: 'Thunderstorm with slight hail', icon: 'cloud-lightning' },
  99: { label: 'Thunderstorm with heavy hail', icon: 'cloud-lightning' },
};

// OpenMeteo API service
const API_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

// Default parameters for weather data requests
const DEFAULT_PARAMS = {
  current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index',
  hourly: 'temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature,uv_index',
  daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,uv_index_max',
  timezone: 'auto',
  forecast_days: '7',
};

// Function to fetch weather data for a location
export const fetchWeatherData = async (location: WeatherLocation): Promise<WeatherData> => {
  try {
    // Build URL with query parameters
    const params = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      ...DEFAULT_PARAMS,
    });
    
    const response = await fetch(`${API_ENDPOINT}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the API response into our WeatherData format
    return {
      location,
      current: {
        temperature: data.current.temperature_2m,
        weatherCode: data.current.weather_code,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        time: data.current.time,
        humidity: data.current.relative_humidity_2m,
        apparentTemperature: data.current.apparent_temperature,
        precipitation: data.current.precipitation,
        pressure: data.current.surface_pressure,
        uvIndex: data.current.uv_index,
      },
      daily: data.daily.time.map((time: string, index: number) => ({
        date: time,
        temperatureMax: data.daily.temperature_2m_max[index],
        temperatureMin: data.daily.temperature_2m_min[index],
        weatherCode: data.daily.weather_code[index],
        sunrise: data.daily.sunrise[index],
        sunset: data.daily.sunset[index],
        precipitationProbability: data.daily.precipitation_probability_max?.[index],
        precipitationSum: data.daily.precipitation_sum[index],
        uvIndexMax: data.daily.uv_index_max[index],
      })),
      hourly: data.hourly.time.map((time: string, index: number) => ({
        time,
        temperature: data.hourly.temperature_2m[index],
        weatherCode: data.hourly.weather_code[index],
        precipitation: data.hourly.precipitation[index],
        precipitationProbability: data.hourly.precipitation_probability[index],
        windSpeed: data.hourly.wind_speed_10m[index],
        humidity: data.hourly.relative_humidity_2m[index],
      })),
      alerts: [], // OpenMeteo doesn't provide alerts in their free tier
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Function to search for locations based on a query
export const searchLocations = async (
  query: string, 
  isPostalCode: boolean = false, 
  countryContext?: string | null
): Promise<WeatherLocation[]> => {
  try {
    let apiUrl = 'https://geocoding-api.open-meteo.com/v1/search';
    let params: Record<string, string> = {
      count: '8',
      language: 'en',
      format: 'json'
    };
    
    if (isPostalCode) {
      params.postal_code = query;
    } else {
      params.name = query;
      // Add country context if available to improve local results
      if (countryContext) {
        params.timezone = countryContext;
      }
    }
    
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${apiUrl}?${queryString}`);
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results) {
      return [];
    }
    
    return data.results.map((result: any) => ({
      id: `${result.id || result.name}-${result.latitude}-${result.longitude}`,
      name: result.name + (result.admin1 ? `, ${result.admin1}` : '') + (result.country ? `, ${result.country}` : ''),
      latitude: result.latitude,
      longitude: result.longitude,
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

// Helper function to determine if it's daytime
export const isDaytime = (current: CurrentWeather, daily: DailyForecast[]): boolean => {
  if (!current || !daily || daily.length === 0) return true;
  
  const currentDate = new Date(current.time);
  const todayForecast = daily[0];
  const sunrise = new Date(todayForecast.sunrise);
  const sunset = new Date(todayForecast.sunset);
  
  return currentDate >= sunrise && currentDate <= sunset;
};

// Local storage functions for saved locations
export const getSavedLocations = (): WeatherLocation[] => {
  try {
    const saved = localStorage.getItem('savedLocations');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error getting saved locations:', e);
    return [];
  }
};

export const saveLocation = (location: WeatherLocation): void => {
  try {
    const savedLocations = getSavedLocations();
    const exists = savedLocations.some(loc => loc.id === location.id);
    
    if (!exists) {
      localStorage.setItem('savedLocations', JSON.stringify([...savedLocations, location]));
    }
  } catch (e) {
    console.error('Error saving location:', e);
  }
};

export const removeLocation = (locationId: string): void => {
  try {
    const savedLocations = getSavedLocations();
    localStorage.setItem('savedLocations', JSON.stringify(
      savedLocations.filter(loc => loc.id !== locationId)
    ));
  } catch (e) {
    console.error('Error removing location:', e);
  }
};

export const toggleFavoriteLocation = (locationId: string): void => {
  try {
    const savedLocations = getSavedLocations();
    const updated = savedLocations.map(loc => 
      loc.id === locationId ? { ...loc, favorite: !loc.favorite } : loc
    );
    
    localStorage.setItem('savedLocations', JSON.stringify(updated));
  } catch (e) {
    console.error('Error toggling favorite location:', e);
  }
};

// Cache the weather data
export const cacheWeatherData = (data: WeatherData): void => {
  try {
    localStorage.setItem(`weather-${data.location.id}`, JSON.stringify(data));
    localStorage.setItem('lastWeatherData', JSON.stringify(data));
  } catch (e) {
    console.error('Error caching weather data:', e);
  }
};

export const getCachedWeather = (locationId: string): WeatherData | null => {
  try {
    const cached = localStorage.getItem(`weather-${locationId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.error('Error getting cached weather:', e);
    return null;
  }
};

export const getLastWeatherData = (): WeatherData | null => {
  try {
    const cached = localStorage.getItem('lastWeatherData');
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.error('Error getting last weather data:', e);
    return null;
  }
};
