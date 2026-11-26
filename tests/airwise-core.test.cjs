const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../airwise-core.js");

test("classifies AQI values at every US AQI band boundary", () => {
  const cases = [[0,"Good"],[50,"Good"],[51,"Moderate"],[100,"Moderate"],[101,"Sensitive groups"],[150,"Sensitive groups"],[151,"Unhealthy"],[200,"Unhealthy"],[201,"Very unhealthy"],[300,"Very unhealthy"],[301,"Hazardous"]];
  for (const [aqi, label] of cases) assert.equal(core.band(aqi)[0], label, `AQI ${aqi}`);
});

test("does not turn invalid AQI values into reassuring guidance", () => {
  for (const value of [undefined, null, NaN, Infinity, -1, "bad"]) {
    assert.equal(core.band(value)[0], "Unavailable");
    assert.equal(core.tipFor(value)[0], "Waiting for a reading");
  }
});

test("selects the lowest valid forecast reading at or after the current time", () => {
  const hourly = { time: ["2026-11-26T09:00", "2026-11-26T10:00", "2026-11-26T11:00", "2026-11-26T12:00"], us_aqi: [8, 50, null, 22] };
  assert.deepEqual(core.bestForecast(hourly, "2026-11-26T10:00", 60), { value: 22, index: 3, time: "2026-11-26T12:00" });
});

test("handles missing, mismatched, and unusable forecast data", () => {
  assert.equal(core.bestForecast(null, "2026-11-26T10:00", 42).value, 42);
  assert.equal(core.bestForecast({ time: [], us_aqi: [] }, "", null), null);
  assert.equal(core.bestForecast({ time: ["2026-11-26T10:00"], us_aqi: ["bad"] }, "2026-11-26T10:00", 75).value, 75);
});

test("returns the current hour when no forecast time matches", () => {
  assert.deepEqual(core.bestForecast({ time: ["not-a-date"], us_aqi: [31] }, "2026-11-26T10:00", 80), { value: 31, index: 0, time: "not-a-date" });
});

test("normalizes numeric strings and rejects negative readings", () => {
  assert.equal(core.validAqi("42.5"), 42.5);
  assert.equal(core.validAqi(-0.1), null);
});

