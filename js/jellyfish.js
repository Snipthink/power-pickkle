/* ==========================================================================
   Power Pickkle — swimming jellyfish
   Behaves like a real jellyfish in the sea:
   • Stays upright. Each bell contraction pushes it gently upward; between
     pulses it sinks slowly and drifts sideways with the "current".
   • Moving the cursor (or a finger) wakes it up: it starts wandering around
     its own area of the screen — it does NOT chase the cursor.
   • It keeps its distance: if the cursor comes near, it drifts away.
   • When the cursor stops, it floats back to its resting spot and hovers there.
   • Purely decorative: pointer-events none, aria-hidden, honours reduced motion.
   Turn off with PP_CONFIG.effects.jellyfish = false.
   ========================================================================== */
(function () {
  "use strict";
  var C = window.PP_CONFIG || {};
  if (C.effects && C.effects.jellyfish === false) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- tuning ---------- */
  var IDLE_MS = 3000;        // no cursor movement for this long → float home
  var KEEP_AWAY = 300;       // px it keeps between itself and the cursor
  var THRUST = 520;          // upward push during each bell contraction (px/s²)
  var SINK = 24;             // slow sinking between pulses (px/s²)
  var DRAG = 1.1;            // water resistance
  var MAX_SPEED = 150;       // px/s — unhurried, ocean-like
  var N_TENT = 6, N_ARM = 3, SEG = 9;

  /* ---------- build SVG ---------- */
  var NS = "http://www.w3.org/2000/svg";
  var wrap = document.createElement("div");
  wrap.className = "jelly";
  wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML =
    '<svg viewBox="0 0 120 230" width="120" height="230" xmlns="' + NS + '">' +
      '<defs>' +
        '<radialGradient id="jbell" cx=".45" cy=".25" r=".85">' +
          '<stop offset="0" stop-color="#fffbea" stop-opacity=".98"/>' +
          '<stop offset=".45" stop-color="#f7d774" stop-opacity=".82"/>' +
          '<stop offset=".85" stop-color="#f08a1c" stop-opacity=".62"/>' +
          '<stop offset="1" stop-color="#c62a1f" stop-opacity=".5"/>' +
        '</radialGradient>' +
        '<linearGradient id="jarm" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#f3b13a" stop-opacity=".85"/>' +
          '<stop offset="1" stop-color="#e07b16" stop-opacity="0"/>' +
        '</linearGradient>' +
        '<linearGradient id="jten" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#e3a03a" stop-opacity=".75"/>' +
          '<stop offset="1" stop-color="#f08a1c" stop-opacity="0"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<g class="j-tents"></g>' +
      '<g class="j-arms"></g>' +
      '<g class="j-bell">' +
        '<path d="M12 60C12 22 34 6 60 6s48 16 48 54c-7 4-14-1-21 3-7-4-13 1-20-1-6 2-13-3-20 1-7-4-13 2-21-2-6 3-10 0-14-1z" fill="url(#jbell)" stroke="#d99a2b" stroke-opacity=".55" stroke-width="1.2"/>' +
        '<path d="M24 52c4-22 18-34 36-34" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="3" stroke-linecap="round"/>' +
        '<g fill="#e07b16" fill-opacity=".45">' +
          '<path d="M40 44c3-8 9-10 12-6-2 5-7 8-12 6z"/><path d="M80 44c-3-8-9-10-12-6 2 5 7 8 12 6z"/>' +
          '<path d="M52 34c3-6 9-6 10-2-2 4-6 5-10 2z"/><path d="M68 34c-3-6-9-6-10-2 2 4 6 5 10 2z"/>' +
        '</g>' +
        '<circle cx="47" cy="27" r="2.6" fill="#fff" fill-opacity=".9"/>' +
      '</g>' +
    '</svg>';
  document.body.appendChild(wrap);

  var svg = wrap.firstChild, bell = svg.querySelector(".j-bell");
  var tentG = svg.querySelector(".j-tents"), armG = svg.querySelector(".j-arms");
  var tents = [], arms = [];
  for (var i = 0; i < N_TENT; i++) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("fill", "none"); p.setAttribute("stroke", "url(#jten)");
    p.setAttribute("stroke-width", "1.6"); p.setAttribute("stroke-linecap", "round");
    tentG.appendChild(p);
    tents.push({ el: p, x: 18 + i * (84 / (N_TENT - 1)), len: 120 + (i % 3) * 22, ph: i * 1.3 });
  }
  for (var k = 0; k < N_ARM; k++) {
    var a = document.createElementNS(NS, "path");
    a.setAttribute("fill", "none"); a.setAttribute("stroke", "url(#jarm)");
    a.setAttribute("stroke-width", k === 1 ? "6" : "4.5"); a.setAttribute("stroke-linecap", "round");
    armG.appendChild(a);
    arms.push({ el: a, x: 46 + k * 14, len: 78 + (k === 1 ? 14 : 0), ph: k * 2.1 });
  }

  /* ---------- state ---------- */
  var scale = 1, W = 0, H = 0;
  var pos = { x: 0, y: 0 }, vel = { x: 0, y: 0 }, home = { x: 0, y: 0 };
  var cursor = null, lastMove = -1e9, angle = 0, phase = 0, t = 0;

  function layout() {
    W = window.innerWidth; H = window.innerHeight;
    scale = W < 640 ? 0.42 : W < 1000 ? 0.5 : 0.6;
    wrap.style.setProperty("--js", scale);
    // resting spot: right side, lower third (clear of the mobile order bar)
    home.x = W - 70 * scale - (W < 640 ? 26 : 60);
    home.y = H - (W < 960 ? 190 : 170);
  }
  layout();
  pos.x = home.x; pos.y = home.y;
  window.addEventListener("resize", layout);

  function onMove(x, y) { cursor = { x: x, y: y }; lastMove = performance.now(); }
  window.addEventListener("mousemove", function (e) { onMove(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener("touchmove", function (e) { var p = e.touches[0]; if (p) onMove(p.clientX, p.clientY); }, { passive: true });
  document.addEventListener("mouseleave", function () { lastMove = -1e9; });

  /* ---------- tentacle path ---------- */
  function strand(s, rootY, swayAmp, speed, trailX, trailY, pulse) {
    var d = "M" + s.x.toFixed(1) + " " + rootY, px = s.x, py = rootY, step = s.len / SEG;
    for (var j = 1; j <= SEG; j++) {
      var f = j / SEG;
      var sway = Math.sin(t * speed - j * 0.55 + s.ph) * swayAmp * f;
      var x = s.x + (s.x - 60) * 0.12 * f * (1 - pulse * 0.6) + sway + trailX * f * f;
      var y = rootY + step * j * (1 - pulse * 0.08) + trailY * f * f;
      var cx = (px + x) / 2, cy = (py + y) / 2;
      d += " Q" + px.toFixed(1) + " " + py.toFixed(1) + " " + cx.toFixed(1) + " " + cy.toFixed(1);
      px = x; py = y;
    }
    return d + " L" + px.toFixed(1) + " " + py.toFixed(1);
  }

  /* ---------- animation loop ---------- */
  var wander = { x: 0, y: 0 }, nextPick = 0;
  function clampX(x) { return Math.max(70, Math.min(W - 70, x)); }
  function clampY(y) { return Math.max(130, Math.min(H - 110, y)); }

  // choose a new spot to drift to, inside its own area and away from the cursor
  function pickWander(now) {
    var rx = W < 640 ? W * 0.35 : Math.min(420, W * 0.3), ry = Math.min(260, H * 0.32);
    for (var tries = 0; tries < 8; tries++) {
      var x = clampX(home.x - Math.random() * rx * 1.4 + rx * 0.2);
      var y = clampY(home.y - Math.random() * ry * 1.2 + ry * 0.2);
      if (!cursor || Math.hypot(x - cursor.x, y - cursor.y) > KEEP_AWAY) { wander.x = x; wander.y = y; break; }
    }
    nextPick = now + 2600 + Math.random() * 2400;
  }

  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
    var awake = cursor && now - lastMove < IDLE_MS;

    // where it would like to be: wandering while the visitor is active, home otherwise
    var tx = home.x, ty = home.y, away = 0, axn = 0, ayn = 0;
    if (awake) {
      if (now > nextPick || Math.hypot(wander.x - pos.x, wander.y - pos.y) < 30) pickWander(now);
      tx = wander.x; ty = wander.y;
    }
    if (cursor && now - lastMove < IDLE_MS) {
      var cx = pos.x - cursor.x, cy = pos.y - cursor.y, cd = Math.hypot(cx, cy) || 1;
      if (cd < KEEP_AWAY) {
        away = 1 - cd / KEEP_AWAY; axn = cx / cd; ayn = cy / cd;
        if (Math.hypot(tx - cursor.x, ty - cursor.y) < KEEP_AWAY) {   // re-route away from the cursor
          tx = clampX(pos.x + axn * 240); ty = clampY(pos.y + ayn * 200); wander.x = tx; wander.y = ty;
        }
      }
    }
    var dx = tx - pos.x, dy = ty - pos.y, dist = Math.hypot(dx, dy);

    // bell rhythm: lazy at rest, a little livelier when awake or travelling
    var urge = Math.min(1, dist / 200);
    phase += dt * (0.5 + (awake ? 0.25 : 0) + urge * 0.35 + away * 0.4);
    var cyc = phase % 1;
    var pulse = cyc < 0.3 ? Math.sin(cyc / 0.3 * Math.PI) : 0;    // 0→1→0 contraction

    if (!reduce) {
      if (cyc < 0.3) {
        // a jellyfish pushes *up* with each pulse, steering only slightly sideways
        // depth control: ~0.24 balances sinking; more if it is below its spot or
        // already sinking, less (down to 0 — just drift down) if above it.
        var ux = Math.max(-0.85, Math.min(0.85, dx / 120)), uy = -1;
        var strength = Math.max(0, Math.min(1.1, 0.18 - dy / 260 + vel.y / 220)) + Math.min(0.45, Math.abs(dx) / 420) + away * 0.6;
        var ul = Math.hypot(ux, uy) || 1;
        vel.x += (ux / ul) * THRUST * strength * pulse * dt;
        vel.y += (uy / ul) * THRUST * strength * pulse * dt;
      }
      vel.y += SINK * dt;                                   // sinks gently between pulses
      vel.x += Math.sin(t * 0.35 + 1.3) * 5 * dt;            // faint ocean current
      if (away) { vel.x += axn * 150 * away * dt; vel.y += ayn * 70 * away * dt; }
      var drag = Math.exp(-DRAG * dt); vel.x *= drag; vel.y *= drag;
      var sp = Math.hypot(vel.x, vel.y);
      if (sp > MAX_SPEED) { vel.x *= MAX_SPEED / sp; vel.y *= MAX_SPEED / sp; }
      pos.x += vel.x * dt; pos.y += vel.y * dt;
      // soft edges of the "tank"
      if (pos.x < 60) vel.x += 40 * dt; if (pos.x > W - 60) vel.x -= 40 * dt;
      if (pos.y < 110) vel.y += 50 * dt; if (pos.y > H - 90) vel.y -= 60 * dt;
    }

    // stays upright — only the faintest sway with the water, never turns its head
    var want = Math.max(-0.08, Math.min(0.08, vel.x / 900)) + Math.sin(t * 0.6) * 0.025;
    angle += (want - angle) * Math.min(1, dt * 0.9);

    // tentacles stream behind the motion
    var trailX = -vel.x * 0.14, trailY = Math.max(-26, Math.min(18, -vel.y * 0.08));

    bell.setAttribute("transform", "translate(60 34) scale(" + (1 - pulse * 0.13).toFixed(3) + " " + (1 + pulse * 0.07).toFixed(3) + ") translate(-60 -34)");
    var rootY = 58 - pulse * 3;
    tents.forEach(function (s) { s.el.setAttribute("d", strand(s, rootY, 7, 2.2, trailX, trailY, pulse)); });
    arms.forEach(function (s) { s.el.setAttribute("d", strand(s, rootY - 2, 5, 1.5, trailX * 0.8, trailY * 0.8, pulse)); });

    wrap.style.transform = "translate3d(" + (pos.x - 60).toFixed(1) + "px," + (pos.y - 34).toFixed(1) + "px,0) rotate(" + angle.toFixed(3) + "rad) scale(" + scale + ")";
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
