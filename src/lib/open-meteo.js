import { config } from '../config.js';
import { HttpError } from './http-error.js';

// This is the only file that calls fetch or knows Open-Meteo's URLs.

// Helper: fetch a URL and return the parsed JSON
async function fetchJson(url) {
  let res;

  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(config.upstreamTimeoutMs),
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new HttpError(504, 'Weather service timeout');
    }
    throw new HttpError(502, 'Could not reach weather service');
  }

  if (!res.ok) {
    throw new HttpError(502, 'Weather service returned an error');
  }

  try {
    return await res.json();
  } catch {
    throw new HttpError(502, 'Weather service sent bad data');
  }
}

// Look up a city and return the first result
export async function geocodeCity(name) {
  const url =
    'https://geocoding-api.open-meteo.com/v1/search?name=' +
    encodeURIComponent(name) +
    '&count=1';

  const data = await fetchJson(url);
  const place = data.results?.[0];

  if (!place) {
    throw new HttpError(404, 'City not found', {
      city: 'No results for ' + name,
    });
  }

  return {
    name: place.name,
    region: place.admin1,
    country: place.country,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
  };
}

// Get current weather and a 3-day forecast
export async function getForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '3',
  });

  return fetchJson(`${config.forecastUrl}/forecast?${params}`, 'forecast');
}