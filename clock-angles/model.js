/* Integer arithmetic preserves the exact numerator for every sampled second. */
(function (root) {
  const END = 43200;
  function numerator(t) { const r = (11 * t) % 43200; return Math.min(r, 43200 - r); }
  function angle(t) { return numerator(t) / 120; }
  function time(t) {
    const ms = Math.round(t * 1000), whole = Math.floor(ms / 1000);
    const h = Math.floor(whole / 3600), m = Math.floor(whole / 60) % 60, s = whole % 60;
    const fraction = Number.isInteger(t) ? '' : '.' + String(ms % 1000).padStart(3, '0');
    return `${h % 12 || 12}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${fraction} ${h === 12 ? 'pm' : 'am'}`;
  }
  // Solve both branches of the triangular wave using exact decimal fractions.
  function occurrences(value) {
    const a = Number(value);
    if (String(value).trim() === '' || !Number.isFinite(a) || a < 0 || a > 180) throw new RangeError('Enter an angle from 0 to 180 degrees.');
    const [coefficient, exponent = '0'] = a.toString().split('e');
    const decimals = (coefficient.split('.')[1] || '').length - Number(exponent);
    let n = BigInt(coefficient.replace('.', '')), d = 1n;
    if (decimals >= 0) d = 10n ** BigInt(decimals); else n *= 10n ** BigInt(-decimals);
    const gcd = (x, y) => y ? gcd(y, x % y) : x;
    const results = [];
    const branches = a === 0 || a === 180 ? [n] : [n, 360n*d-n];
    for (let k=0; k<=11; k++) for (const branch of branches) {
      const raw = 43200n*BigInt(k)*d+120n*branch, denominator = 11n*d;
      if (raw > 43200n*denominator) continue;
      const divisor = gcd(raw, denominator), num = raw/divisor, den = denominator/divisor;
      const seconds = (43200*k + 120*(branch === n ? a : 360-a))/11;
      results.push({seconds, exact: den === 1n ? String(num) : `${num}/${den}`, wholeSecond: den === 1n});
    }
    return results.sort((a,b)=>a.seconds-b.seconds);
  }
  const samples = Array.from({length: END + 1}, (_, t) => angle(t));
  function csv() {
    return 'elapsed_seconds,time,minor_angle_degrees,exact_angle_numerator,exact_angle_denominator\r\n' +
      samples.map((a, t) => `${t},${time(t)},${a.toFixed(9)},${numerator(t)},120`).join('\r\n') + '\r\n';
  }
  const model = {END, numerator, angle, time, samples, csv, occurrences};
  if (typeof module !== 'undefined' && module.exports) module.exports = model;
  else root.ClockModel = model;
})(globalThis);
