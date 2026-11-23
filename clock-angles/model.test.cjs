const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const m = require('./model.js');

test('every second agrees with independently calculated hand positions', () => {
  assert.equal(m.samples.length, 43201);
  for (let t = 0; t <= 43200; t++) {
    const minute = (t % 3600) / 3600 * 360;
    const hour = t / 43200 * 360;
    const difference = Math.abs(minute - hour);
    const expected = Math.min(difference, 360 - difference);
    assert.ok(Math.abs(m.samples[t] - expected) < 1e-9, `second ${t}`);
    assert.ok(m.samples[t] >= 0 && m.samples[t] <= 180);
    assert.equal(m.samples[t], m.samples[43200-t]);
  }
});
test('examples and inclusive endpoints', () => {
  for (const [t, angle] of [[0,0],[10800,90],[21600,180],[32400,90],[43200,0]]) assert.equal(m.samples[t],angle);
  assert.equal(m.time(0),'12:00:00 am');
  assert.equal(m.time(43199),'11:59:59 am');
  assert.equal(m.time(43200),'12:00:00 pm');
});
test('saved CSV matches export and includes all samples in order', () => {
  const csv=m.csv();
  assert.equal(fs.readFileSync(path.join(__dirname,'clock-minor-angles-12-hours.csv'),'utf8'),csv);
  const rows=csv.trim().split('\r\n').slice(1);
  assert.equal(rows.length,43201);
  rows.forEach((row,t)=>{
    const [elapsed,label,decimal,numerator,denominator]=row.split(',');
    assert.equal(Number(elapsed),t);
    assert.equal(label,m.time(t));
    assert.ok(Math.abs(Number(decimal)-m.samples[t])<=5.1e-10);
    assert.equal(Number(numerator)/Number(denominator),m.samples[t]);
  });
});
