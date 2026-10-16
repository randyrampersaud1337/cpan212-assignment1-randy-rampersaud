import { HttpError } from '../lib/http-error.js';

export function parseCity(value) {
  if (typeof value !== 'string') {
    throw new HttpError(400, 'Invalid query', {
      city: 'city is required and must be sent once',
    });
  }

  const city = value.trim();

  if (city.length < 2 || city.length > 60) {
    throw new HttpError(400, 'Invalid query', {
      city: 'city must be 2 to 60 characters',
    });
  }

  return city;
}

export function parseCities(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new HttpError(400, 'Invalid query', {
      cities: 'cities is required and must be sent once',
    });
  }

  const cities = value.split(',').map((name) => name.trim());

  if (cities.some((name) => name === '')) {
    throw new HttpError(400, 'Invalid query', {
      cities: 'cities must not contain an empty name',
    });
  }

  if (cities.length < 2 || cities.length > 5) {
    throw new HttpError(400, 'Invalid query', {
      cities: 'cities must list 2 to 5 names',
    });
  }

  for (const name of cities) {
    if (name.length < 2 || name.length > 60) {
      throw new HttpError(400, 'Invalid query', {
        cities: `"${name}" must be 2 to 60 characters`,
      });
    }
  }

  const seen = new Set();
  for (const name of cities) {
    const key = name.toLowerCase();
    if (seen.has(key)) {
      throw new HttpError(400, 'Invalid query', {
        cities: `"${name}" is listed more than once`,
      });
    }
    seen.add(key);
  }

  return cities;
}