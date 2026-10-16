# City Weather API

An Express service that turns a city name into weather by calling the free Open-Meteo API. It returns current weather and a 3-day forecast for one city, compares 2 to 5 cities at once, and caches answers so repeated questions don't call Open-Meteo again.

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`. The server starts on http://localhost:4000. It also runs with no `.env` file, using the defaults below.

## Environment variables

| Variable | Default | What it controls |
| --- | --- | --- |
| PORT | 4000 | The port the server listens on |
| GEOCODING_URL | https://geocoding-api.open-meteo.com/v1 | Base URL of the geocoding API |
| FORECAST_URL | https://api.open-meteo.com/v1 | Base URL of the forecast API |
| UPSTREAM_TIMEOUT_MS | 5000 | How long to wait for each Open-Meteo request |
| CACHE_TTL_SECONDS | 600 | How long a cached answer stays valid |

## Endpoints

### GET /api/weather?city=Toronto

Current weather and a 3-day forecast for one city. Returns 200 with `{ data, attribution }`. Returns 400 for a bad `city`, 404 when the city isn't found, 502 or 504 when Open-Meteo fails or is too slow.

Example: `curl -i "http://localhost:4000/api/weather?city=Toronto"`

### GET /api/compare?cities=Toronto,Vancouver,Halifax

The same lookup for 2 to 5 cities, started at the same time. Returns 200 with a result for each city (`ok: true` with `weather`, or `ok: false` with `error`), plus a `summary` with `succeeded`, `failed`, `warmest` and `coldest`. Returns 400 for a bad `cities` value.

Example: `curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax"`

### GET /api/cache/stats

Returns 200 with `{ data: { entries, hits, misses, ttlSeconds } }`.

Example: `curl -i "http://localhost:4000/api/cache/stats"`

## Testing

Run these in Git Bash on Windows, in this order, on a freshly started server.

```bash
# 1. Weather for a city: 200
curl -i "http://localhost:4000/api/weather?city=Toronto"

# 2. The same city again (cached): 200
curl -i "http://localhost:4000/api/weather?city=toronto"

# 3. Weather without a city: 400
curl -i "http://localhost:4000/api/weather"

# 4. Weather for a city that doesn't exist: 404
curl -i "http://localhost:4000/api/weather?city=Qwertyville"

# 5. Compare three cities: 200
curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax"

# 6. Compare with one city that doesn't exist: 200
curl -i "http://localhost:4000/api/compare?cities=Vancouver,Halifax,Qwertyville"

# 7. Compare too many cities: 400
curl -i "http://localhost:4000/api/compare?cities=a1,b2,c3,d4,e5,f6"

# 8. Compare with a repeated city: 400
curl -i "http://localhost:4000/api/compare?cities=Toronto,Halifax,toronto"

# 9. Cache stats: 200
curl -i "http://localhost:4000/api/cache/stats"

# 10. Unknown route: 404
curl -i "http://localhost:4000/api/nothing"
```

## Data source

Weather data by [Open-Meteo.com](https://open-meteo.com/).

## AI use

I used Claude (an AI assistant) to help me understand the starter project and debug the code in `src/lib`, `src/routes`, `src/validators` and `src/middleware`. I ran and tested every endpoint myself.