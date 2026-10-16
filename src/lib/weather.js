import { config } from '../config.js';
import { geocodeCity, getForecast } from './open-meteo.js';
import { describeWeatherCode } from './weather-codes.js';
import { Cache } from './cache.js';

const cache = new Cache(config.cacheTtlSeconds);

export async function getCityWeather(city) {
  const key = city.trim().toLowerCase();

  const stored = cache.get(key);
  if (stored) {
    return { ...stored, cached: true };
  }

  const location = await geocodeCity(city);
  const forecast = await getForecast(location.latitude, location.longitude);
  const fetchedAt = new Date().toISOString();

  const current = forecast.current;
  const daily = forecast.daily;

  const summary = {
    location,
    current: {
      time: current.time,
      temperatureC: current.temperature_2m,
      feelsLikeC: current.apparent_temperature,
      humidityPercent: current.relative_humidity_2m,
      windKmh: current.wind_speed_10m,
      weatherCode: current.weather_code,
      conditions: describeWeatherCode(current.weather_code),
    },
    daily: daily.time.map((date, i) => ({
      date,
      minC: daily.temperature_2m_min[i],
      maxC: daily.temperature_2m_max[i],
      precipitationChancePercent:
        daily.precipitation_probability_max?.[i] ?? null,
      weatherCode: daily.weather_code[i],
      conditions: describeWeatherCode(daily.weather_code[i]),
    })),
    fetchedAt,
    cached: false,
  };

  cache.set(key, summary);
  return summary;
}

export function getCacheStats() {
  return cache.stats();
}