/* Integer arithmetic preserves the exact numerator for every sampled second. */
(function (root) {
  const END = 43200;
  function numerator(t) { const r = (11 * t) % 43200; return Math.min(r, 43200 - r); }
  function angle(t) { return numerator(t) / 120; }
  function time(t) {
    const h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, s = t % 60;
    return `${h % 12 || 12}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${h === 12 ? 'pm' : 'am'}`;
  }
  const samples = Array.from({length: END + 1}, (_, t) => angle(t));
  function csv() {
    return 'elapsed_seconds,time,minor_angle_degrees,exact_angle_numerator,exact_angle_denominator\r\n' +
      samples.map((a, t) => `${t},${time(t)},${a.toFixed(9)},${numerator(t)},120`).join('\r\n') + '\r\n';
  }
  const model = {END, numerator, angle, time, samples, csv};
  if (typeof module !== 'undefined' && module.exports) module.exports = model;
  else root.ClockModel = model;
})(globalThis);
