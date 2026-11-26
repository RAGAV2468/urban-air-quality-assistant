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

  function chartValues(hourly) {
    const values = Array.isArray(hourly && hourly.us_aqi) ? hourly.us_aqi : [];
    return values.slice(0, 25).map(validAqi).filter((value) => value !== null);
  }

  function buildPlan(currentAqi, profile, hourly, currentTime, label) {
    const n = validAqi(currentAqi);
    if (n === null) return { intro: "Waiting for a valid air quality reading.", cards: [] };
    const safeProfile = ["general", "sensitive", "active"].includes(profile) ? profile : "general";
    const forecast = bestForecast(hourly, currentTime, n) || { value: n, index: 0, time: null };
    const lower = forecast.value < n - 5;
    const when = forecast.time ? forecast.time.slice(11, 16) : "";
    const sensitive = safeProfile === "sensitive";
    const active = safeProfile === "active";
    let outdoorTitle, outdoorBody, outdoorWhy;
    if (n > 150 || (sensitive || active) && n > 100) {
      outdoorTitle = "Move strenuous activity indoors";
      outdoorBody = lower ? `Keep outdoor time brief. The forecast’s lowest point is around ${when} local time (AQI ${Math.round(forecast.value)}); check again before planning outside.` : "Keep outdoor time brief and choose an indoor activity while the forecast remains elevated.";
      outdoorWhy = `the current estimate is ${n} US AQI${sensitive ? ", and this plan adds extra caution for sensitive groups." : "."}`;
    } else if (lower) {
      outdoorTitle = "Use the cleaner forecast window";
      outdoorBody = `If you need to be outside, consider around ${when} local time, when the forecast is lower at about AQI ${Math.round(forecast.value)}. Recheck conditions before heading out.`;
      outdoorWhy = `the current estimate is ${n} US AQI and the forecast varies through the day.`;
    } else {
      outdoorTitle = "Keep your usual pace";
      outdoorBody = `The current estimate is ${n} US AQI. Follow local guidance and take breaks if you notice symptoms.`;
      outdoorWhy = "the forecast does not show a clearly cleaner upcoming hour.";
    }
    const elevated = n > 100;
    const indoor = elevated
      ? ["Keep indoor air cleaner", "Keep windows closed while outdoor air is elevated. If available, use a HEPA purifier or recirculating ventilation and avoid adding smoke indoors.", "outdoor pollution is currently elevated at the selected city location."]
      : ["Ventilate when it suits", "When outdoor air is comfortable, briefly air out rooms. Avoid indoor smoke and keep cooking ventilation on.", `the current estimate is ${n} US AQI; conditions can change, so check again later.`];
    const high = n > 150;
    const travel = high
      ? ["Reduce time near busy roads", "Combine errands or use enclosed transit or a shared ride when practical. Avoid a long outdoor walk or ride during elevated conditions."]
      : ["Choose a lower-emission trip", "For a trip, consider transit, sharing a ride, or combining errands. For short walks, choose a route away from heavy traffic when possible."];
    const place = typeof label === "string" && label.trim() ? label.trim() : "your selected location";
    return {
      intro: `A ${sensitive ? "more cautious" : active ? "movement-focused" : "practical"} plan for ${place}, based on the current US AQI and local hourly forecast.`,
      cards: [
        { icon: "◷", label: "OUTDOOR ROUTINE", title: outdoorTitle, body: outdoorBody, why: outdoorWhy },
        { icon: "⌂", label: "AT HOME", title: indoor[0], body: indoor[1], why: indoor[2] },
        { icon: "↗", label: "SUSTAINABLE SWAP", title: travel[0], body: travel[1], why: "fewer vehicle trips can reduce emissions, while route choices can also reduce time near traffic." }
      ]
    };
  }

  return { validAqi, band, tipFor, bestForecast, chartValues, buildPlan };
});

