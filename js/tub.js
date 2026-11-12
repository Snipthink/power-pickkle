/* ==========================================================================
   Power Pickkle packaging renderer.
   The real pack is a deep-black tapered (frustum) tub — wide at the top,
   narrower at the base — with a lid carrying a round brand sticker.
   Variants:  data-tub="closed" | "open" | "lid" (top-down view of the lid)
   Swap for real product photos later by replacing the element contents.
   ========================================================================== */
(function () {
  var uid = 0;
  var LOGO = "assets/img/logo.webp";

  function cfg() { return window.PP_CONFIG || {}; }
  function img(key, fallback) { var c = cfg(); return (c.images && c.images[key]) || fallback; }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  var P = 'font-family="Poppins,sans-serif"', D = 'font-family="Playfair Display,Georgia,serif"';

  /* Round lid sticker — modelled on the real Power Pickkle label layout.
     Drawn in a 400×400 box centred on (0,0); callers scale it by 0.5. */
  function sticker(id) {
    var c = cfg(), pr = c.product || { netWeightG: 35, mrp: 99, shelfLife: { months: 3 } };
    var ing = ((c.ingredients && c.ingredients.list) || []).map(function (t) {
      return t.replace(/^Acidity regulator – /, "").replace(/^Preservative – /, "").replace(/\[Confirm from label\]/, "—");
    }).slice(0, 16);
    var nut = ((c.nutrition && c.nutrition.rows) || []).filter(function (r) { return !r.sub; }).slice(0, 11);
    var m = c.manufacturer || {};
    var g = '';
    // base, rings
    g += '<circle r="200" fill="url(#gold' + id + ')"/>' +
         '<circle r="191" fill="#fffdf6"/><circle r="191" fill="url(#paper' + id + ')"/>' +
         '<circle r="184" fill="none" stroke="#c8941e" stroke-width="1.4"/>' +
         '<circle r="179" fill="none" stroke="#e3b341" stroke-width=".8" stroke-dasharray="2 3"/>';
    // logo + non-veg mark + ®-free tagline already inside logo art
    g += '<image href="' + LOGO + '" x="-122" y="-182" width="244" height="84.6"/>';
    g += '<g transform="translate(-132 -118)"><rect x="-8" y="-8" width="16" height="16" fill="#fff" stroke="#7b3f00" stroke-width="1.8"/><path d="M0 -4.5 4.6 4H-4.6z" fill="#7b3f00"/></g>';
    // ingredients column
    g += '<g transform="translate(-168 -90)">' +
         '<rect x="0" y="0" width="86" height="15" rx="7.5" fill="#fff" stroke="#e07b16" stroke-width="1.2"/>' +
         '<text x="43" y="10.6" text-anchor="middle" font-size="7.6" font-weight="700" letter-spacing=".6" fill="#7b3f00" ' + P + '>INGREDIENTS</text>';
    ing.forEach(function (t, i) {
      var y = 26 + i * 9;
      g += '<path d="M4 ' + (y - 3) + 'l3 3-3 3-3-3z" fill="#e07b16"/><text x="10" y="' + (y + 2.3) + '" font-size="6.3" font-weight="500" fill="#2a1a12" ' + P + '>' + esc(t.length > 26 ? t.slice(0, 25) + "…" : t) + '</text>';
    });
    g += '</g>';
    // centre food photo
    g += '<circle cx="0" cy="-12" r="66" fill="url(#gold' + id + ')"/><circle cx="0" cy="-12" r="61" fill="#5c1608"/>' +
         '<image href="' + img("stickerFood", "assets/img/sticker-food.jpg") + '" x="-61" y="-73" width="122" height="122" clip-path="url(#fc' + id + ')" preserveAspectRatio="xMidYMid slice"/>' +
         '<circle cx="0" cy="-12" r="61" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.2"/>';
    // MRP badge (scalloped)
    var sc = ''; for (var k = 0; k < 24; k++) { var a = k / 24 * Math.PI * 2, rr = k % 2 ? 31 : 35; sc += (k ? 'L' : 'M') + (Math.cos(a) * rr).toFixed(1) + ' ' + (Math.sin(a) * rr).toFixed(1); }
    g += '<g transform="translate(124 -84)"><path d="' + sc + 'Z" fill="url(#gold' + id + ')"/><circle r="27" fill="#a51c1c"/><circle r="24" fill="none" stroke="#f7d774" stroke-width=".9" stroke-dasharray="1.6 1.8"/>' +
         '<text y="-9" text-anchor="middle" font-size="7" font-weight="600" fill="#ffe9a8" ' + P + '>MRP</text>' +
         '<text y="7" text-anchor="middle" font-size="17" font-weight="700" fill="#fff" ' + P + '>₹' + pr.mrp + '</text>' +
         '<text y="17" text-anchor="middle" font-size="6.2" font-weight="700" letter-spacing=".8" fill="#ffe9a8" ' + P + '>ONLY</text></g>';
    // nutrition panel
    g += '<g transform="translate(80 -40)"><rect width="92" height="' + (24 + nut.length * 8.4) + '" rx="5" fill="#fff" stroke="#c8941e" stroke-width="1"/>' +
         '<rect width="92" height="16" rx="5" fill="#1f5e2e"/><rect y="10" width="92" height="6" fill="#1f5e2e"/>' +
         '<text x="46" y="7.4" text-anchor="middle" font-size="5.2" font-weight="700" fill="#fff" letter-spacing=".4" ' + P + '>NUTRITIONAL INFORMATION</text>' +
         '<text x="46" y="13.6" text-anchor="middle" font-size="4.6" fill="#ffe9a8" ' + P + '>Approx. per 100 g</text>';
    nut.forEach(function (r, i) {
      var y = 25 + i * 8.4;
      g += '<text x="5" y="' + y + '" font-size="5.4" fill="#2a1a12" ' + P + '>' + esc(r.key.replace("Total ", "").replace("Folate (Vitamin B9)", "Folate")) + '</text>' +
           '<text x="87" y="' + y + '" text-anchor="end" font-size="5.4" font-weight="600" fill="#2a1a12" ' + P + '>' + (r.lessThan ? "&lt;" : "") + r.per100 + ' ' + r.unit + '</text>' +
           (i < nut.length - 1 ? '<path d="M5 ' + (y + 2.6) + 'h82" stroke="#efe2c4" stroke-width=".5"/>' : '');
    });
    g += '</g>';
    // net weight plaque
    g += '<g transform="translate(0 70)"><rect x="-44" y="-15" width="88" height="34" rx="6" fill="#fff" stroke="url(#gold' + id + ')" stroke-width="2.4"/>' +
         '<text y="-4" text-anchor="middle" font-size="6.4" font-weight="700" letter-spacing="1" fill="#7b3f00" ' + P + '>NET WEIGHT</text>' +
         '<text y="14" text-anchor="middle" font-size="21" font-weight="800" fill="#2a1a12" ' + D + ' style="font-variant-numeric:lining-nums">' + pr.netWeightG + 'g</text></g>';
    // ribbons
    g += '<path d="M-118 96h236l-8 7 8 7h-236l8-7z" fill="#a51c1c"/>' +
         '<text y="106" text-anchor="middle" font-size="7" font-weight="700" letter-spacing=".5" fill="#fff" ' + P + '>BEST BEFORE ' + ((pr.shelfLife && pr.shelfLife.months) || 3) + ' MONTHS FROM PACKAGING*</text>' +
         '<text y="121" text-anchor="middle" font-size="6.2" font-weight="600" fill="#1f5e2e" letter-spacing=".4" ' + P + '>BONELESS FISH CUBES · READY TO EAT · STORE IN REFRIGERATOR</text>';
    // footer: fssai | manufacturer | barcode
    g += '<path d="M-150 128h300" stroke="#e3b341" stroke-width=".8"/>';
    g += '<g transform="translate(-84 142)"><text x="0" y="0" text-anchor="middle" font-size="13" font-style="italic" font-weight="700" fill="#1c3f94" font-family="Georgia,serif">fssai</text>' +
         '<text y="9" text-anchor="middle" font-size="4.6" fill="#2a1a12" ' + P + '>Lic. No.</text><text y="15.5" text-anchor="middle" font-size="4.8" font-weight="600" fill="#2a1a12" ' + P + '>' + esc(m.fssai || "") + '</text></g>';
    g += '<g transform="translate(4 139)"><text text-anchor="middle" font-size="5" font-weight="600" letter-spacing=".8" fill="#7b3f00" ' + P + '>MANUFACTURED BY</text>' +
         '<text y="11" text-anchor="middle" font-size="9.4" font-weight="800" fill="#a51c1c" ' + D + '>' + esc(m.name || "") + '</text>';
    var addr = (m.address || "").split(", "), half = Math.ceil(addr.length / 2);
    g += '<text y="19.5" text-anchor="middle" font-size="4.9" fill="#2a1a12" ' + P + '>' + esc(addr.slice(0, half).join(", ")) + ',</text>' +
         '<text y="26" text-anchor="middle" font-size="4.9" fill="#2a1a12" ' + P + '>' + esc(addr.slice(half).join(", ")) + '</text></g>';
    var bars = ''; var bw = [1,2,1,1,3,1,2,1,1,2,3,1,1,2,1,3,1,1,2,1,2,1,1,3,1,2]; var bx = 0;
    bw.forEach(function (w, i) { if (i % 2 === 0) bars += '<rect x="' + bx + '" width="' + (w * .7) + '" height="18" fill="#111"/>'; bx += w * .7; });
    g += '<g transform="translate(64 133)"><rect x="-3" y="-3" width="' + (bx + 6) + '" height="28" fill="#fff"/>' + bars + '<text x="' + (bx / 2) + '" y="23.5" text-anchor="middle" font-size="3.6" fill="#111" ' + P + '>BARCODE</text></g>';
    return '<g transform="scale(.5)">' + g + '</g>';
  }

  function defs(id) {
    return '<defs>' +
      '<linearGradient id="body' + id + '" x1="0" x2="1"><stop offset="0" stop-color="#030303"/><stop offset=".18" stop-color="#2b2b2b"/><stop offset=".3" stop-color="#0d0d0d"/><stop offset=".78" stop-color="#070707"/><stop offset=".93" stop-color="#262626"/><stop offset="1" stop-color="#050505"/></linearGradient>' +
      '<linearGradient id="lidside' + id + '" x1="0" x2="1"><stop offset="0" stop-color="#050505"/><stop offset=".22" stop-color="#3a3a3a"/><stop offset=".4" stop-color="#111"/><stop offset=".85" stop-color="#0a0a0a"/><stop offset="1" stop-color="#2a2a2a"/></linearGradient>' +
      '<radialGradient id="lidtop' + id + '" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#3a3a3a"/><stop offset=".5" stop-color="#121212"/><stop offset="1" stop-color="#000"/></radialGradient>' +
      '<linearGradient id="gold' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7d774"/><stop offset=".45" stop-color="#c8941e"/><stop offset=".7" stop-color="#f3cf6a"/><stop offset="1" stop-color="#9c6b10"/></linearGradient>' +
      '<radialGradient id="paper' + id + '" cx=".5" cy=".4" r=".7"><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#f1dfb5" stop-opacity=".7"/></radialGradient>' +
      '<radialGradient id="inner' + id + '" cx=".5" cy=".5" r=".55"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>' +
      '<radialGradient id="shadow' + id + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3b2510" stop-opacity=".35"/><stop offset="1" stop-color="#3b2510" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="fc' + id + '"><circle cx="0" cy="-12" r="61"/></clipPath>' +
      '</defs>';
  }

  // Geometry for the 3/4 view (viewBox 0 0 300 300)
  var CX = 150, R = 124, K = 0.5, RB = 84, TOP = 112, BASE = 262;

  function body(id) {
    var ry = R * K, rby = RB * K * 0.55;
    return '' +
      '<ellipse cx="150" cy="' + (BASE + 14) + '" rx="120" ry="16" fill="url(#shadow' + id + ')"/>' +
      '<path d="M' + (CX - R) + ' ' + TOP + ' L' + (CX - RB) + ' ' + BASE + ' A' + RB + ' ' + rby + ' 0 0 0 ' + (CX + RB) + ' ' + BASE + ' L' + (CX + R) + ' ' + TOP + ' A' + R + ' ' + ry + ' 0 0 1 ' + (CX - R) + ' ' + TOP + 'Z" fill="url(#body' + id + ')"/>' +
      // moulded ridges near the rim
      '<path d="M' + (CX - R + 3) + ' ' + (TOP + 12) + ' A' + (R - 3) + ' ' + ry + ' 0 0 0 ' + (CX + R - 3) + ' ' + (TOP + 12) + '" fill="none" stroke="#333" stroke-width="1.2"/>' +
      '<path d="M' + (CX - R + 5) + ' ' + (TOP + 18) + ' A' + (R - 5) + ' ' + ry + ' 0 0 0 ' + (CX + R - 5) + ' ' + (TOP + 18) + '" fill="none" stroke="#000" stroke-width="1.4"/>' +
      // soft specular stripe
      '<path d="M' + (CX - R + 30) + ' ' + (TOP + 30) + ' L' + (CX - RB + 22) + ' ' + (BASE - 6) + '" stroke="#fff" stroke-opacity=".10" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M' + (CX + R - 26) + ' ' + (TOP + 34) + ' L' + (CX + RB - 18) + ' ' + (BASE - 10) + '" stroke="#fff" stroke-opacity=".05" stroke-width="5" stroke-linecap="round"/>';
  }

  function closed(id) {
    var ry = R * K, LR = R + 4, lry = LR * K, LT = TOP - 16;
    return defs(id) + body(id) +
      // lid side band
      '<path d="M' + (CX - LR) + ' ' + LT + ' L' + (CX - LR) + ' ' + (TOP + 2) + ' A' + LR + ' ' + lry + ' 0 0 0 ' + (CX + LR) + ' ' + (TOP + 2) + ' L' + (CX + LR) + ' ' + LT + 'Z" fill="url(#lidside' + id + ')"/>' +
      // lid top
      '<ellipse cx="150" cy="' + LT + '" rx="' + LR + '" ry="' + lry + '" fill="url(#lidtop' + id + ')"/>' +
      '<ellipse cx="150" cy="' + LT + '" rx="' + (LR - 6) + '" ry="' + (lry - 2.5) + '" fill="none" stroke="#2c2c2c" stroke-width="1.5"/>' +
      // sticker in perspective
      '<g transform="translate(150 ' + LT + ') scale(1.04 ' + (1.04 * K) + ')">' + sticker(id) + '</g>' +
      // gloss on lid
      '<ellipse cx="110" cy="' + (LT - 22) + '" rx="60" ry="8" fill="#fff" opacity=".07" transform="rotate(-8 110 ' + (LT - 22) + ')"/>';
  }

  function open(id) {
    var ry = R * K, ir = R - 9, iry = ir * K;
    return defs(id).replace('</defs>',
        '<clipPath id="mouth' + id + '"><ellipse cx="150" cy="' + TOP + '" rx="' + ir + '" ry="' + iry + '"/></clipPath></defs>') +
      body(id) +
      '<ellipse cx="150" cy="' + TOP + '" rx="' + R + '" ry="' + ry + '" fill="#1a1a1a"/>' +
      '<ellipse cx="150" cy="' + TOP + '" rx="' + (R - 2) + '" ry="' + (ry - 1) + '" fill="none" stroke="#444" stroke-width="2"/>' +
      '<g clip-path="url(#mouth' + id + ')">' +
        '<rect x="20" y="' + (TOP - iry) + '" width="260" height="' + (iry * 2) + '" fill="#7a2410"/>' +
        '<image href="' + img("tubFood", "assets/img/tub-food.jpg") + '" x="' + (150 - ir - 20) + '" y="' + (TOP - iry - 34) + '" width="' + (ir * 2 + 40) + '" height="' + (iry * 2 + 70) + '" preserveAspectRatio="xMidYMid slice"/>' +
        '<ellipse cx="150" cy="' + TOP + '" rx="' + ir + '" ry="' + iry + '" fill="url(#inner' + id + ')"/>' +
      '</g>' +
      '<ellipse cx="150" cy="' + TOP + '" rx="' + ir + '" ry="' + iry + '" fill="none" stroke="#000" stroke-width="3"/>';
  }

  function lid(id) {
    return defs(id) +
      '<ellipse cx="150" cy="158" rx="140" ry="138" fill="#000" opacity=".18" filter="blur(6px)"/>' +
      '<circle cx="150" cy="150" r="142" fill="url(#lidtop' + id + ')"/>' +
      '<circle cx="150" cy="150" r="136" fill="none" stroke="#2e2e2e" stroke-width="2"/>' +
      '<circle cx="150" cy="150" r="129" fill="none" stroke="#000" stroke-width="3"/>' +
      '<g transform="translate(150 150) scale(1.2)">' + sticker(id) + '</g>' +
      '<path d="M40 110 A120 120 0 0 1 120 30" stroke="#fff" stroke-opacity=".18" stroke-width="6" fill="none" stroke-linecap="round"/>';
  }

  function render(el) {
    var kind = el.getAttribute("data-tub");
    var id = "t" + (++uid);
    var inner = kind === "lid" ? lid(id) : kind === "open" ? open(id) : closed(id);
    var label = kind === "open" ? "Open Power Pickkle tub with boneless fish cubes" : "Power Pickkle tub";
    el.innerHTML = '<svg viewBox="0 0 300 300" role="img" aria-label="' + label + '" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
  }

  window.PPTub = { renderAll: function (root) { (root || document).querySelectorAll("[data-tub]").forEach(render); } };
})();
