const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const m = require('./model.js');

test('angle finder solves both branches, sorted and without duplicate endpoints', () => {
  for (const a of [0, 30, 60, 90, 120, 150, 180, 42.5, 0.001, 179.999]) {
    const matches=m.occurrences(a);
    assert.equal(matches.length,a===0?12:a===180?11:22);
    matches.forEach((match,i)=>{
      assert.ok(match.seconds>=0 && match.seconds<=43200);
      assert.ok(Math.abs(m.angle(match.seconds)-a)<1e-9);
      if(i)assert.ok(matches[i-1].seconds<match.seconds);
      const [n,d='1']=match.exact.split('/');
      assert.ok(Math.abs(Number(n)/Number(d)-match.seconds)<1e-9);
    });
    assert.equal(matches.filter(v=>v.wholeSecond).length,m.samples.filter(v=>Math.abs(v-a)<1e-12).length);
  }
  assert.equal(m.occurrences(30)[0].exact,'3600/11');
  assert.equal(m.time(m.occurrences(30)[0].seconds),'12:05:27.273 am');
  assert.equal(m.occurrences(0).at(-1).seconds,43200);
  assert.ok(m.occurrences(180).some(v=>v.seconds===21600 && v.wholeSecond));
  for(const bad of ['', -1, 181, NaN, Infinity, 'invalid']) assert.throws(()=>m.occurrences(bad),RangeError);
});

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
