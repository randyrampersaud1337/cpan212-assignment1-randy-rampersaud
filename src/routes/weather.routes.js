import { Router } from 'express';
import { parseCity, parseCities } from '../validators/weather-query.js';
import { getCityWeather } from '../lib/weather.js';

export const weatherRouter = Router();

const attribution =
  'Weather data by Open-Meteo.com (https://open-meteo.com/)';

weatherRouter.get('/weather', async (req, res) => {
  const city = parseCity(req.query.city);
  const data = await getCityWeather(city);
  res.json({ data, attribution });
});

weatherRouter.get('/compare', async (req, res) => {
  const names = parseCities(req.query.cities);

  const results = await Promise.allSettled(
    names.map((name) => getCityWeather(name))
  );

  const cities = results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return { city: names[i], ok: true, weather: result.value };
    }

    const reason = result.reason;
    const planned = typeof reason?.status === 'number';

    if (!planned) {
      console.error(reason);
    }

    return {
      city: names[i],
      ok: false,
      error: {
        status: planned ? reason.status : 500,
        message: planned ? reason.message : 'Internal server error',
      },
    };
  });

  let warmest = null;
  let coldest = null;
  let warmestTemp = -Infinity;
  let coldestTemp = Infinity;
  let succeeded = 0;

  for (const entry of cities) {
    if (!entry.ok) continue;
    succeeded += 1;

    const temp = entry.weather.current.temperatureC;
    if (temp > warmestTemp) {
      warmestTemp = temp;
      warmest = entry.weather.location.name;
    }
    if (temp < coldestTemp) {
      coldestTemp = temp;
      coldest = entry.weather.location.name;
    }
  }

  res.json({
    data: {
      cities,
      summary: {
        succeeded,
        failed: cities.length - succeeded,
        warmest,
        coldest,
      },
    },
    attribution,
  });
});