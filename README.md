# Airwise — Urban Air Quality Assistant

A lightweight, responsive air-quality dashboard that helps people make everyday outdoor plans with a clearer view of local conditions.

## Features

- Finds the user's approximate location with browser permission; falls back to New Delhi.
- Search for a city anywhere in the world.
- Shows current US AQI, six pollutant concentrations, a 24-hour AQI chart, and plain-language health guidance.
- Works without an API key or build step. The browser requests data directly from Open-Meteo.
- Responsive layout, accessible form labels, readable contrast, and clear loading/error feedback.

## Run locally

Open `index.html` in a modern browser. Location and live API requests work best from `http://localhost` or a hosted HTTPS page. No package installation is required.

## Data and interpretation

Air-quality and geocoding data come from [Open-Meteo](https://open-meteo.com/). The dashboard displays the provider's US AQI value and categories, alongside pollutant concentrations in μg/m³. Forecast values are estimates; local sensor coverage and conditions can vary. Health guidance is general information, not medical advice.

## Publish

This project is intentionally small and dependency-free. Create a **public** GitHub repository, add the files in this folder, and enable GitHub Pages (Settings → Pages → deploy from the main branch). Include the public repository link and a demo video link in the challenge platform submission.

