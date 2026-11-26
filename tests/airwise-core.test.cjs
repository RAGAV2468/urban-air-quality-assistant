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

test("builds a three-part general plan and includes the chosen location", () => {
  const plan = core.buildPlan(42, "general", { time: [], us_aqi: [] }, "2026-11-26T10:00", "Pune, India");
  assert.match(plan.intro, /Pune, India/);
  assert.equal(plan.cards.length, 3);
  assert.equal(plan.cards[0].title, "Keep your usual pace");
  assert.equal(plan.cards[1].title, "Ventilate when it suits");
  assert.equal(plan.cards[2].title, "Choose a lower-emission trip");
});

test("uses a cleaner forecast hour in the outdoor recommendation", () => {
  const plan = core.buildPlan(120, "general", {
    time: ["2026-11-26T10:00", "2026-11-26T11:00", "2026-11-26T12:00"],
    us_aqi: [120, 95, 101]
  }, "2026-11-26T10:00", "Delhi");
  assert.equal(plan.cards[0].title, "Use the cleaner forecast window");
  assert.match(plan.cards[0].body, /11:00/);
  assert.match(plan.cards[0].body, /AQI 95/);
});

test("adds extra caution for sensitive and outdoor-exercise profiles", () => {
  const forecast = { time: ["2026-11-26T10:00"], us_aqi: [125] };
  assert.equal(core.buildPlan(125, "sensitive", forecast, "2026-11-26T10:00", "Delhi").cards[0].title, "Move strenuous activity indoors");
  assert.equal(core.buildPlan(125, "active", forecast, "2026-11-26T10:00", "Delhi").cards[0].title, "Move strenuous activity indoors");
  assert.equal(core.buildPlan(125, "unknown", forecast, "2026-11-26T10:00", "Delhi").cards[0].title, "Keep your usual pace");
});

test("switches indoor and travel advice at elevated AQI thresholds", () => {
  const at100 = core.buildPlan(100, "general", null, null, "Delhi").cards;
  const at101 = core.buildPlan(101, "general", null, null, "Delhi").cards;
  const at150 = core.buildPlan(150, "general", null, null, "Delhi").cards;
  const at151 = core.buildPlan(151, "general", null, null, "Delhi").cards;
  assert.equal(at100[1].title, "Ventilate when it suits");
  assert.equal(at101[1].title, "Keep indoor air cleaner");
  assert.equal(at150[2].title, "Choose a lower-emission trip");
  assert.equal(at151[2].title, "Reduce time near busy roads");
});

test("returns no recommendations for an unavailable current AQI", () => {
  assert.deepEqual(core.buildPlan(null, "general", null, null, "Delhi"), { intro: "Waiting for a valid air quality reading.", cards: [] });
});

test("keeps chart values numeric, valid, and capped at 25 points", () => {
  assert.deepEqual(core.chartValues({ us_aqi: [20, "35", null, "<img>", -4, 60] }), [20, 35, 60]);
  assert.deepEqual(core.chartValues({ us_aqi: Array.from({ length: 30 }, (_, index) => index) }), Array.from({ length: 25 }, (_, index) => index));
  assert.deepEqual(core.chartValues({ us_aqi: "not-an-array" }), []);
});

