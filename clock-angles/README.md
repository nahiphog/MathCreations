# Clock angles

Open `index.html` directly in a browser. No installation, build, server, or internet connection is required. This separate page can also be served at `/MathCreations/clock-angles/` by the repository's existing GitHub Pages setup once deployed.

The graph contains 43,201 samples, one for every integer second from midnight through noon, inclusive. Both hands move continuously. For elapsed seconds t, the clockwise relative angle is r = (11t/120) mod 360; the minor angle is min(r, 360-r). Integer arithmetic computes the exact angle numerator, with denominator 120, before division.

Scroll to zoom horizontally, drag to pan, and click or hover to inspect. The zoom buttons focus on the selected time when it is visible. Use the slider, numeric input, or presets to select a second. When the graph is focused, left/right arrows move by one second (Shift: one minute), Home/End select the endpoints, and +/- zoom. Earlier/Later buttons offer keyboard and touch panning. Playback speed is adjustable and stops at noon. At a visible interval of 180 seconds or less, sample points appear.

The plotted line connects recorded samples. Most mathematical peaks and meetings fall between integer seconds, so their exact turning points are not recorded. There are eleven full mathematical periods of 43,200/11 seconds in the interval.

The angle finder accepts any angle from 0 to 180 degrees, including decimals, with presets for multiples of 30 degrees. It solves both branches of the continuous model and lists every matching time (22 occurrences for interior angles, 12 for 0 degrees including both endpoints, and 11 for 180 degrees). Clock times are rounded to milliseconds; exact elapsed seconds are included as reduced fractions. Selecting a result displays the clock at that instant without snapping it to a recorded second. Purple graph markers and a horizontal reference line show the current search. The original one-second dataset is unchanged.

`clock-minor-angles-12-hours.csv` contains the complete dataset. The download button regenerates the same dataset locally. Decimal angles have nine decimal places; the final two columns give the exact angle as numerator/denominator, without requiring decimal rounding.

Run `node --test clock-angles/model.test.cjs` from the repository root to verify all samples against independently calculated hand positions, the requested examples, symmetry, and CSV completeness.
