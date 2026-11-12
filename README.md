# Power Pickkle — website

Static site (HTML/CSS/vanilla JS), no build step. Works on GitHub Pages from the repo root.

## Edit content
Everything changeable lives in **`js/config.js`**: price, offer, delivery fee, WhatsApp number / checkout URL,
nutrition (per 100 g — per 35 g is calculated), ingredients, allergens, manufacturer, image paths and reviews.

## Before launch — must do
- [x] Nutrition verified against the FAIR Lab test report (zinc removed — not in report).
- [ ] Verify FSSAI no. and address against the final label (the ingredients section was removed from the page; the lid sticker art still lists them), then set `verified: true` (removes the on-page "pending" notes).
- [ ] Confirm shelf-life & storage wording (`product.shelfLife`) matches the validated label.
- [ ] Set `order.checkoutUrl` to the exact Blinkit product link (currently a Blinkit search for "power pickkle"). Optional: `order.whatsappNumber` shows a footer help button.
- [ ] Make sure the ₹99 Buy 1 Get 1 offer matches what Blinkit actually shows (`offer` in config).
- [ ] Add `contact.email`.
- [ ] Add genuine customer reviews (with permission) to `reviews` in config — the section stays hidden until you do.
- [ ] Replace placeholder photos in `assets/img/` (cropped from the design mockup) with real photography — especially real product shots of the black tub.
- [ ] Review `policies.html` draft text.
- [ ] Confirm brand-story and flavour copy (index.html #story, #flavour) reads true for your business.
- [x] Live at https://snipthink.github.io/power-pickkle/ (GitHub Pages, branch `main`, root).

## Packaging illustration
`js/tub.js` draws the actual pack format — black tapered tub, wide at the top, lid with round brand sticker — using the real logo (`assets/img/logo.png`). Use `data-tub="closed|open|lid"` on any element.

## Deploy
Push to GitHub → Settings → Pages → Deploy from branch `main`, folder `/ (root)`.
