(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.AirwiseCore = api;
})(typeof globalThis === "undefined" ? this : globalThis, function () {
  "use strict";

  function validAqi(value) {
    if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) return null;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : null;
  }

  function band(value) {
    const n = validAqi(value);
    if (n === null) return ["Unavailable", "Air quality reading is unavailable.", "#68766e"];
    if (n <= 50) return ["Good", "Air quality is good. It’s a lovely time to get outside.", "#2c8a57"];
    if (n <= 100) return ["Moderate", "Air is acceptable. If you’re unusually sensitive, take it a little easier outdoors.", "#a3a628"];
    if (n <= 150) return ["Sensitive groups", "People with asthma or other sensitivities may want to reduce prolonged outdoor exertion.", "#d58432"];
    if (n <= 200) return ["Unhealthy", "Consider shorter outdoor activities, especially if you have a heart or lung condition.", "#cf6043"];
    if (n <= 300) return ["Very unhealthy", "Limit time outside. Keep windows closed and choose indoor activity if possible.", "#9c527f"];
    return ["Hazardous", "Stay indoors where possible, close windows, and follow local public-health advice.", "#75465f"];
  }

  function tipFor(value) {
    const n = validAqi(value);
    if (n === null) return ["Waiting for a reading", "Guidance will appear when a valid air quality reading is available."];
    if (n <= 50) return ["Enjoy the fresh air", "Great conditions for a walk, cycle, or outdoor workout."];
    if (n <= 100) return ["Make it a comfortable day", "Most people can enjoy their usual activities. Sensitive individuals should watch for symptoms."];
    if (n <= 150) return ["Take it at your pace", "Sensitive groups may benefit from shorter, gentler outdoor activity and taking breaks."];
    if (n <= 200) return ["Choose a lighter outdoor plan", "Reduce prolonged exertion outdoors; consider moving exercise indoors."];
    return ["Give your lungs a break", "Keep outdoor time brief, close windows, and use cleaner indoor air if available."];
  }

  function bestForecast(hourly, currentTime, currentAqi) {
    const times = Array.isArray(hourly && hourly.time) ? hourly.time : [];
    const values = Array.isArray(hourly && hourly.us_aqi) ? hourly.us_aqi : [];
    const current = validAqi(currentAqi);
    const start = Math.max(0, times.findIndex((time) => typeof time === "string" && typeof currentTime === "string" && time >= currentTime));
    let best = null;
    for (let i = start; i < Math.min(times.length, values.length); i += 1) {
      const value = validAqi(values[i]);
      if (value !== null && (!best || value < best.value)) best = { value, index: i, time: times[i] };
    }
    if (!best && current !== null) return { value: current, index: start, time: times[start] || null };
    return best;
  }

  return { validAqi, band, tipFor, bestForecast };
});

