/* ==========================================================================
   Power Pickkle — swimming jellyfish
   • Moves in natural pulses (bell contracts → thrust → glides through "water").
   • When the visitor moves the cursor (or finger), it swims gently after it,
     keeping a polite distance — it never sits on top of the pointer.
   • When the cursor stops, it swims back to its resting spot and bobs there.
   • Purely decorative: pointer-events none, aria-hidden, honours reduced motion.
   Turn off with PP_CONFIG.effects.jellyfish = false.
   ========================================================================== */
(function () {
  "use strict";
  var C = window.PP_CONFIG || {};
  if (C.effects && C.effects.jellyfish === false) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- tuning ---------- */
  var IDLE_MS = 2200;        // no cursor movement for this long → go home
  var FOLLOW_GAP = 90;       // stays this far (px) from the cursor
  var THRUST = 2200;         // push during each bell contraction (px/s²)
  var DRAG = 1.4;            // water resistance (higher = stops sooner)
  var MAX_SPEED = 420;       // px/s
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
  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
    var following = cursor && now - lastMove < IDLE_MS;

    // target: near (not on) the cursor while it moves, else the resting spot
    var tx = home.x, ty = home.y;
    if (following) {
      var ax = pos.x - cursor.x, ay = pos.y - cursor.y, ad = Math.hypot(ax, ay) || 1;
      tx = cursor.x + ax / ad * FOLLOW_GAP; ty = cursor.y + ay / ad * FOLLOW_GAP + 20;
    }
    var dx = tx - pos.x, dy = ty - pos.y, dist = Math.hypot(dx, dy);

    // bell rhythm: quicker pulses when it has somewhere to go, lazy pulses at rest
    var urge = Math.min(1, dist / 220);
    phase += dt * (0.55 + urge * 1.25);
    var cyc = phase % 1;
    var pulse = cyc < 0.28 ? Math.sin(cyc / 0.28 * Math.PI) : 0;   // 0→1→0 contraction

    if (!reduce) {
      if (dist > 6 && cyc < 0.28) {
        var push = THRUST * urge * pulse;
        vel.x += dx / dist * push * dt; vel.y += dy / dist * push * dt;
      }
      // gentle idle bob around the resting spot
      if (!following && dist < 30) vel.y += Math.sin(t * 1.4) * 14 * dt;
      var drag = Math.exp(-DRAG * dt); vel.x *= drag; vel.y *= drag;
      var sp = Math.hypot(vel.x, vel.y);
      if (sp > MAX_SPEED) { vel.x *= MAX_SPEED / sp; vel.y *= MAX_SPEED / sp; }
      pos.x += vel.x * dt; pos.y += vel.y * dt;
    }

    // body tilts toward its swimming direction, settles upright when slow
    var speed = Math.hypot(vel.x, vel.y);
    var want = speed > 12 ? Math.atan2(vel.x, -vel.y) * Math.min(1, speed / 160) : 0;
    want = Math.max(-1.1, Math.min(1.1, want));
    angle += (want - angle) * Math.min(1, dt * 3);

    // tentacles trail behind the motion (expressed in the jelly's own frame)
    var ca = Math.cos(-angle), sa = Math.sin(-angle);
    var lvx = vel.x * ca - vel.y * sa, lvy = vel.x * sa + vel.y * ca;
    var trailX = -lvx * 0.09, trailY = Math.max(-30, -lvy * 0.05);

    bell.setAttribute("transform", "translate(60 34) scale(" + (1 - pulse * 0.13).toFixed(3) + " " + (1 + pulse * 0.07).toFixed(3) + ") translate(-60 -34)");
    var rootY = 58 - pulse * 3;
    tents.forEach(function (s) { s.el.setAttribute("d", strand(s, rootY, 7, 2.2, trailX, trailY, pulse)); });
    arms.forEach(function (s) { s.el.setAttribute("d", strand(s, rootY - 2, 5, 1.5, trailX * 0.8, trailY * 0.8, pulse)); });

    wrap.style.transform = "translate3d(" + (pos.x - 60).toFixed(1) + "px," + (pos.y - 34).toFixed(1) + "px,0) rotate(" + angle.toFixed(3) + "rad) scale(" + scale + ")";
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
