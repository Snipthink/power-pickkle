/* Power Pickkle – site behaviour. All data comes from js/config.js */
(function () {
  "use strict";
  var C = window.PP_CONFIG;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rupee = function (n) { return "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN"); };

  /* ---------- 1. Bind config values into the page ---------- */
  var o = C.offer, p = C.product;
  var mrpTotal = p.mrp * o.tubs;
  var hasFee = typeof o.deliveryFee === "number";
  var values = {
    netWeight: p.netWeightG + "g",
    offerTitle: o.title,
    offerTubs: String(o.tubs),
    offerTotal: o.totalWeightG + "g",
    offerPrice: rupee(o.price),
    offerMrp: rupee(mrpTotal),
    offerSave: mrpTotal > o.price ? "You save " + rupee(mrpTotal - o.price) : "",
    deliveryFee: hasFee ? (o.deliveryFee === 0 ? "FREE" : rupee(o.deliveryFee)) : "As shown on " + C.order.channel,
    payable: hasFee ? rupee(o.price + o.deliveryFee) : rupee(o.price) + " + " + C.order.channel + " charges, if any",
    deliveryNote: o.freeDeliveryNote || (hasFee ? "" : "Final price, offer availability and delivery/handling charges are shown in the " + C.order.channel + " app at checkout."),
    channel: C.order.channel,
    shelfMonths: String(p.shelfLife.months),
    shelfStatement: "*" + p.shelfLife.statement,
    afterOpening: p.shelfLife.afterOpening,
    mfrName: C.manufacturer.name,
    mfrAddress: C.manufacturer.address,
    fssai: C.manufacturer.fssai,
    allergens: C.ingredients.allergens,
    dietMark: C.ingredients.dietMark,
    year: String(C.brand.year)
  };
  $$("[data-cfg]").forEach(function (el) {
    var k = el.getAttribute("data-cfg");
    if (k in values) el.textContent = (k === "shelfStatement" && el.closest("details")) ? p.shelfLife.statement : values[k];
  });
  // swap images from config
  $$("[data-img]").forEach(function (img) {
    var path = img.getAttribute("data-img").split("."), v = C.images;
    path.forEach(function (k) { v = v && v[k]; });
    if (typeof v === "string") img.src = v;
  });
  // "pending verification" notes
  var pend = { shelfLife: p.shelfLife.verified, nutrition: C.nutrition.verified, ingredients: C.ingredients.verified, manufacturer: C.manufacturer.verified };
  $$("[data-pending]").forEach(function (el) { el.hidden = !!pend[el.getAttribute("data-pending")]; });
  if (!o.active) $$(".offer-seal, .sticky-order").forEach(function (el) { el.hidden = true; });

  // SEO: Product structured data from config
  var ld = document.createElement("script"); ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: "Power Pickkle – Boneless Fish Cubes Pickle",
    brand: { "@type": "Brand", name: C.brand.name }, description: p.category + " with paneer-like fish cubes in traditional Indian masala.",
    offers: { "@type": "Offer", priceCurrency: "INR", price: String(o.price), description: o.title + " – " + o.tubs + " × " + p.netWeightG + "g" } });
  document.head.appendChild(ld);

  /* ---------- 2. Packaging illustrations ---------- */
  if (window.PPTub) window.PPTub.renderAll();

  /* ---------- 3. Order CTA (WhatsApp / external checkout) ---------- */
  var toast = $("#toast"), toastT;
  function showToast(msg) {
    toast.textContent = msg; toast.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove("show"); }, 4200);
  }
  function orderHref(help) {
    if (help) return C.order.whatsappNumber ? "https://wa.me/" + C.order.whatsappNumber.replace(/\D/g, "") + "?text=" + encodeURIComponent("Hi Power Pickkle! I have a question.") : null;
    return C.order.checkoutUrl || null;
  }
  $$("[data-order]").forEach(function (a) {
    var help = a.hasAttribute("data-help"), href = orderHref(help);
    if (href) { a.href = href; a.target = "_blank"; a.rel = "noopener"; return; }
    if (help) { a.hidden = true; return; }
    a.addEventListener("click", function (e) { e.preventDefault(); showToast("Ordering link coming soon."); });
  });
  if (C.contact.email) {
    var ml = $("#mailLink"); ml.hidden = false; ml.href = "mailto:" + C.contact.email; $("span", ml).textContent = C.contact.email;
  }

  /* ---------- 4. Header, mobile menu, smooth scroll ---------- */
  var header = $(".site-header"), burger = $("#burger"), nav = $("#nav");
  function closeMenu() { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); document.body.classList.remove("menu-open"); }
  burger.addEventListener("click", function () {
    var open = !nav.classList.contains("open");
    nav.classList.toggle("open", open); burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMenu(); closeLb(); } });
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2 || a.hasAttribute("data-order") && a.getAttribute("href") !== "#order") return;
      var t = $(id); if (!t) return;
      e.preventDefault(); closeMenu();
      t.scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", id);
    });
  });

  var sticky = $("#stickyOrder"), hero = $(".hero"), offerSec = $("#order"), finalSec = $(".final");
  var navLinks = $$(".nav a:not(.nav-cta)");
  var sections = navLinks.map(function (a) { return $(a.getAttribute("href")); });
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 10);
    var pastHero = y > hero.offsetHeight - 120;
    var r1 = offerSec.getBoundingClientRect(), r2 = finalSec.getBoundingClientRect(), vh = window.innerHeight;
    var onOffer = (r1.top < vh && r1.bottom > 0) || (r2.top < vh && r2.bottom > 0);
    sticky.classList.toggle("show", pastHero && !onOffer);
    // active nav link
    var cur = 0;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < 140) cur = i; });
    navLinks.forEach(function (a, i) { a.classList.toggle("active", i === cur); });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- 5. Reveal on scroll ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach(function (el, i) { el.style.transitionDelay = (i % 6) * 60 + "ms"; io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- 6. Nutrition selector ---------- */
  var N = C.nutrition.rows, basis = 100;
  function val(r) { return basis === 100 ? r.per100 : r.per100 * p.netWeightG / 100; }
  function fmt(r) {
    if (r.notDetected) return basis === 100 ? "<" + r.per100 + " " + r.unit + " (not detected)" : "Not detected";
    return (r.lessThan ? "<" : "") + val(r).toFixed(2) + " " + r.unit;
  }
  var groups = [["macro", "Energy & macronutrients"], ["mineral", "Minerals"], ["vitamin", "Vitamins"]];
  function renderNut() {
    var energy = N.filter(function (r) { return r.group === "energy"; })[0];
    $("#kcal").textContent = val(energy).toFixed(2);
    var arc = $("#dialArc"), circ = 2 * Math.PI * 52;
    arc.style.strokeDasharray = circ;
    arc.style.strokeDashoffset = circ * (1 - (basis === 100 ? 1 : p.netWeightG / 100));
    var m = ["Protein", "Total Fat", "Total Carbohydrates"].map(function (k) { return N.filter(function (r) { return r.key === k; })[0]; });
    var max = Math.max.apply(null, m.map(function (r) { return r.per100; }));
    $("#macros").innerHTML = m.map(function (r) {
      return '<div class="mac"><div class="mac-top"><span>' + r.key.replace("Total ", "") + '</span><b>' + fmt(r) + '</b></div><div class="bar"><i style="width:' + (val(r) / max * 100) + '%"></i></div></div>';
    }).join("");
    $("#nutTable").innerHTML = groups.map(function (g) {
      var rows = N.filter(function (r) { return r.group === g[0] || (g[0] === "macro" && r.group === "energy"); });
      return '<table><caption>' + g[1] + '</caption><tbody>' + rows.map(function (r) {
        return '<tr class="' + (r.sub ? "sub" : "") + '"><th scope="row">' + r.key + '</th><td>' + fmt(r) + '</td></tr>';
      }).join("") + '</tbody></table>';
    }).join("");
    $$("[data-nut]").forEach(function (el) {
      var r = N.filter(function (x) { return x.key === el.getAttribute("data-nut"); })[0];
      if (r) el.textContent = fmt(r) + (basis === 100 ? " /100g" : " /tub");
    });
  }
  $$(".seg button").forEach(function (b) {
    b.addEventListener("click", function () {
      basis = +b.getAttribute("data-basis");
      $$(".seg button").forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); });
      renderNut();
    });
    b.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var other = $$(".seg button").filter(function (x) { return x !== b; })[0]; other.focus(); other.click(); }
    });
  });
  $("#nutNote").textContent = C.nutrition.note;
  renderNut();


  /* ---------- 8. Pairing gallery lightbox ---------- */
  var pairs = {
    chapati: ["Chapati", "Roll a cube inside a hot, soft chapati — the classic Power Pickkle bite."],
    paratha: ["Paratha", "Flaky paratha with a spoonful of spicy fish cubes makes a complete breakfast."],
    rice: ["Plain rice", "Mix a little masala oil into steaming rice for instant flavour."],
    dalrice: ["Dal rice", "Simple dal-chawal becomes a treat with tangy pickle on the side."],
    khichdi: ["Khichdi", "Comforting khichdi plus a bold, spicy companion."],
    picnic: ["Picnic meals", "Pack a tub with your snacks — puri, sandwiches or chura."]
  };
  var keys = Object.keys(pairs), lb = $("#lightbox"), lbIdx = 0, lastFocus;
  function openLb(i) {
    lbIdx = (i + keys.length) % keys.length;
    var k = keys[lbIdx], btn = $('[data-pair="' + k + '"]');
    $("#lbImg").src = $("img", btn).src; $("#lbImg").alt = pairs[k][0];
    $("#lbTitle").textContent = "Power Pickkle + " + pairs[k][0];
    $("#lbText").textContent = pairs[k][1];
    if (lb.hidden) { lastFocus = document.activeElement; lb.hidden = false; document.body.classList.add("menu-open"); $(".lb-close", lb).focus(); }
  }
  function closeLb() { if (lb.hidden) return; lb.hidden = true; document.body.classList.remove("menu-open"); if (lastFocus) lastFocus.focus(); }
  $$(".pair").forEach(function (b) { b.addEventListener("click", function () { openLb(keys.indexOf(b.getAttribute("data-pair"))); }); });
  $(".lb-close", lb).addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  $$("[data-lb]", lb).forEach(function (b) { b.addEventListener("click", function () { openLb(lbIdx + +b.getAttribute("data-lb")); }); });

  /* ---------- 9. Review carousel ---------- */
  var rv = (C.reviews || []).filter(function (r) { return r && r.name && r.text && !r.sample; });
  if (!rv.length) {
    $("#reviews").hidden = true;
    $$('a[href="#reviews"]').forEach(function (l) { l.hidden = true; });
  } else (function () {
  var track = $("#carTrack"), dotsEl = $("#carDots"), ci = 0, timer;
  var palette = ["#c8941e", "#a51c1c", "#1f5e2e", "#e07b16", "#7b3f00"];
  track.innerHTML = rv.map(function (r, i) {
    var initials = r.name.split(" ").map(function (w) { return w[0]; }).join("").slice(-2);
    var stars = "";
    for (var s = 0; s < 5; s++) stars += '<svg class="' + (s < r.rating ? "on" : "") + '"><use href="#i-star"/></svg>';
    return '<figure class="rev" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + " of " + rv.length + '">' +
      '<div class="stars" aria-label="' + r.rating + ' out of 5 stars">' + stars + '</div>' +
      '<blockquote>“' + r.text + '”</blockquote>' +
      '<figcaption><span class="avatar" style="background:' + palette[i % palette.length] + '">' + (r.photo ? '<img src="' + r.photo + '" alt="">' : initials) + '</span><span><b>' + r.name + '</b><small>' + r.city + '</small></span></figcaption></figure>';
  }).join("");
  function perView() { return window.innerWidth >= 1000 ? 3 : window.innerWidth >= 680 ? 2 : 1; }
  function pages() { return Math.max(1, rv.length - perView() + 1); }
  function buildDots() {
    dotsEl.innerHTML = "";
    for (var i = 0; i < pages(); i++) {
      var d = document.createElement("button");
      d.setAttribute("role", "tab"); d.setAttribute("aria-label", "Show review " + (i + 1));
      d.addEventListener("click", (function (n) { return function () { go(n); restart(); }; })(i));
      dotsEl.appendChild(d);
    }
  }
  function go(n) {
    ci = (n + pages()) % pages();
    var slide = track.children[0], gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.style.transform = "translateX(" + (-ci * (slide.getBoundingClientRect().width + gap)) + "px)";
    $$("button", dotsEl).forEach(function (d, i) { d.setAttribute("aria-selected", String(i === ci)); });
  }
  function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(ci + 1); }, 5500); }
  $(".car-btn.prev").addEventListener("click", function () { go(ci - 1); restart(); });
  $(".car-btn.next").addEventListener("click", function () { go(ci + 1); restart(); });
  var car = $("#carousel");
  car.addEventListener("mouseenter", function () { clearInterval(timer); });
  car.addEventListener("mouseleave", restart);
  car.addEventListener("focusin", function () { clearInterval(timer); });
  // swipe
  var sx = null;
  track.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
  track.addEventListener("touchend", function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) go(ci + (dx < 0 ? 1 : -1)); sx = null; restart();
  });
  var rT; window.addEventListener("resize", function () { clearTimeout(rT); rT = setTimeout(function () { buildDots(); go(Math.min(ci, pages() - 1)); }, 150); });
  buildDots(); go(0); restart();
  })();

  /* ---------- 10. FAQ accordion (one open at a time, animated) ---------- */
  $$("#faqList details").forEach(function (d) {
    var sum = $("summary", d), body = $("div", d);
    sum.addEventListener("click", function (e) {
      e.preventDefault();
      if (d.open) {
        body.style.height = body.scrollHeight + "px";
        requestAnimationFrame(function () { body.style.height = "0px"; });
        setTimeout(function () { d.open = false; body.style.height = ""; }, 260);
      } else {
        $$("#faqList details[open]").forEach(function (x) { if (x !== d) { x.open = false; } });
        d.open = true; body.style.height = "0px";
        requestAnimationFrame(function () { body.style.height = body.scrollHeight + "px"; });
        setTimeout(function () { body.style.height = ""; }, 280);
      }
    });
  });
})();
