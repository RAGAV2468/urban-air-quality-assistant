# Airwise — urban air-quality companion

Airwise helps people understand city-level air quality and make more informed everyday plans.

## Pages and features

- **Overview:** Search for a city, see current US AQI, six pollutant concentrations, a 24-hour AQI outlook, and general health guidance.
- **Live map:** Pan and zoom an OpenStreetMap street map centered on the selected city. The marker represents the coordinates used for the modelled reading; it is not a sensor location or neighborhood pollution layer.
- **Daily plan:** Choose a general, sensitive-group, or outdoor-activity profile to see practical guidance based on the current AQI and hourly forecast. Recommendations use transparent rules and are general information, not medical advice.
- **About:** Explains data sources, forecast limitations, and how to interpret the map and guidance.
- Optional browser location lookup, with a New Delhi fallback.
- Responsive layout and keyboard-visible focus states.

## Data and services

Air-quality, geocoding, and forecast data come from [Open-Meteo](https://open-meteo.com/). Map rendering uses [Leaflet](https://leafletjs.com/) and OpenStreetMap tiles. OpenStreetMap attribution is shown on the map. The map is loaded only when the Live map page is opened and requests tiles for the visible viewport.

The dashboard shows Open-Meteo's US AQI values and pollutant concentrations in μg/m³. Forecast values are estimates, model coverage varies, and local conditions can differ from city-level readings.

**AI transparency:** The deployed app does not currently call a generative AI service. Daily plan suggestions are rule-based and grounded in AQI and forecast data. OpenAI Codex assisted with development and documentation.

## Quality checks

Run `npm test` with Node.js 20 or later. The dependency-free test suite checks US AQI band boundaries, safe handling of invalid readings, and selection of forecast windows. GitHub Actions runs the same suite for pushes and pull requests.

## Run locally

Open index.html in a modern browser. Location, map tiles, and live API requests work best from an HTTPS page or local web server. No build step is required.

## Live demo and source

- Live app: https://ragav2468.github.io/urban-air-quality-assistant/
- Public source repository: https://github.com/RAGAV2468/urban-air-quality-assistant

The repository is dependency-light and intended to remain under the 10 MB submission limit.
