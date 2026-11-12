/* ==========================================================================
   POWER PICKKLE — CENTRAL SITE CONFIGURATION
   Edit this one file to change price, offer, nutrition, contact & checkout.
   Brand spelling is POWER PICKKLE (double K) — never drop the second K.

   ⚠ Fields marked `verified: false` were transcribed from the design mockup,
     NOT from the printed label or the laboratory report. Check every value
     against the approved lab report / final label, then set verified: true
     to remove the on-page "pending verification" notes.
   ========================================================================== */
window.PP_CONFIG = {
  brand: {
    name: "Power Pickkle",
    tagline: "Instant Energy in Every Bite!", // registered tagline — used only as the brand line
    siteUrl: "https://example.github.io/power-pickkle/", // TODO: set final URL (used for SEO/share)
    year: 2026
  },

  product: {
    name: "Power Pickkle",
    category: "Ready-to-eat boneless fish pickle",
    packaging: "Black tapered tub with sealed lid",
    netWeightG: 35,
    mrp: 99, // MRP per tub, ₹ (as printed on label)
    shelfLife: {
      months: 3,
      // Exact wording must match the validated storage instructions on the label.
      statement: "Best before 3 months from packaging when stored as per instructions on the pack.",
      afterOpening: "Refrigerate after opening and consume as directed on the pack.",
      verified: false
    }
  },

  offer: {
    active: true,
    title: "BUY 1 GET 1 FREE",
    tubs: 2,
    totalWeightG: 70,
    price: 99, // promotional price for the combo, ₹
    // Orders are fulfilled by Blinkit, so delivery/handling charges are shown in the Blinkit app.
    // Leave null to show "As shown on Blinkit". Set a number (₹) only if you want to display a fixed fee.
    deliveryFee: null,
    freeDeliveryNote: "" // e.g. "Free delivery within Madhubani" — optional
  },

  order: {
    // ALL "Order" buttons open Blinkit.
    // TODO: replace with the exact Power Pickkle product link from Blinkit
    // (open the product in Blinkit -> Share -> Copy link). Until then, a Blinkit search for the brand is used.
    channel: "Blinkit",
    checkoutUrl: "https://blinkit.com/s/?q=power%20pickkle",
    // Optional: WhatsApp number for the footer "Chat on WhatsApp" help button only (digits, e.g. "919876543210").
    // The button is hidden while this is empty.
    whatsappNumber: "",
    message: "Hi Power Pickkle! I'd like to order the Power Combo (Buy 1 Get 1 Free – 2 × 35g). Please share delivery charges and payment details."
  },

  // Decorative effects
  effects: {
    jellyfish: true // swimming jellyfish that gently follows the cursor
  },

  contact: {
    email: "",  // TODO: add support email
    phone: "",  // TODO: add phone (display format)
    instagram: "",
    facebook: ""
  },

  manufacturer: {
    name: "Bhartiye Matsya Vinyas",
    address: "House No. 36, Laxmipur, Madhepur, Madhubani, Bihar – 847408, India",
    fssai: "10426320000030",
    verified: false
  },

  nutrition: {
    // Source: laboratory test report (FAIR Lab), received 25 June. Per 100 g.
    verified: true,
    note: "Values per laboratory test report. Nutritional values may vary from batch to batch.",
    // Per 100 g. Per-35 g values are calculated automatically.
    rows: [
      { group: "energy", key: "Energy", unit: "kcal", per100: 185.78 },
      { group: "macro", key: "Protein", unit: "g", per100: 11.07 },
      { group: "macro", key: "Total Fat", unit: "g", per100: 8.98 },
      { group: "macro", key: "Saturated Fat", unit: "g", per100: 4.15, sub: true },
      { group: "macro", key: "Monounsaturated Fat", unit: "g", per100: 3.64, sub: true },
      { group: "macro", key: "Polyunsaturated Fat", unit: "g", per100: 1.19, sub: true },
      { group: "macro", key: "Omega-3", unit: "g", per100: 0.09, sub: true },
      { group: "macro", key: "Omega-6", unit: "g", per100: 1.07, sub: true },
      { group: "macro", key: "Total Carbohydrates", unit: "g", per100: 14.67 },
      { group: "macro", key: "Dietary Fibre", unit: "g", per100: 1.0, sub: true },
      { group: "macro", key: "Total Sugars", unit: "g", per100: 0.5, lessThan: true, notDetected: true, sub: true },
      { group: "mineral", key: "Sodium", unit: "mg", per100: 732.57 },
      { group: "mineral", key: "Potassium", unit: "mg", per100: 311.25 },
      { group: "mineral", key: "Calcium", unit: "mg", per100: 65.72 },
      { group: "mineral", key: "Iron", unit: "mg", per100: 3.85 },
      { group: "mineral", key: "Magnesium", unit: "mg", per100: 31.32 },
      { group: "vitamin", key: "Vitamin A", unit: "mcg", per100: 313.75 },
      { group: "vitamin", key: "Vitamin B6", unit: "mg", per100: 0.37 },
      { group: "vitamin", key: "Folate (Vitamin B9)", unit: "mcg", per100: 14.14 },
      { group: "vitamin", key: "Vitamin E", unit: "mg", per100: 3.24 }
    ]
  },

  ingredients: {
    verified: false,
    list: [
      "Basa fish", "Mustard oil", "Salt", "Cumin", "[Confirm from label]",
      "Red chilli powder", "Green chilli paste", "Coriander", "Cardamom",
      "Black pepper", "Clove", "Garlic paste", "Ginger paste",
      "Acidity regulator – Citric acid (INS 330)", "Vinegar",
      "Preservative – Sodium benzoate (INS 211)"
    ],
    allergens: "Contains fish. Not suitable for people allergic to fish.", // TODO: add any further allergen declarations exactly as on the label
    dietMark: "Non-vegetarian"
  },

  // Photography. PLACEHOLDER crops from the design mockup, AI-upscaled 4× (Real-ESRGAN).
  // Replace with real product & lifestyle photography (same file names, or edit paths here).
  images: {
    closeup: "assets/img/closeup-spoon.jpg",
    tubFood: "assets/img/tub-food.jpg",       // shown inside the open tub (top-down view of the cubes)
    stickerFood: "assets/img/sticker-food.jpg", // round photo on the lid sticker
    spices: "assets/img/spices.jpg",
    lifestyle: {
      bachelor: "assets/img/life-bachelor.jpg",
      picnic: "assets/img/life-picnic.jpg",
      office: "assets/img/life-office.jpg",
      family: "assets/img/life-family.jpg",
      travel: "assets/img/life-travel.jpg"
    },
    pairing: {
      chapati: "assets/img/pair-chapati.jpg",
      paratha: "assets/img/pair-paratha.jpg",
      rice: "assets/img/pair-rice.jpg",
      dalrice: "assets/img/pair-dalrice.jpg",
      khichdi: "assets/img/pair-khichdi.jpg",
      picnic: "assets/img/pair-picnic.jpg"
    }
  },

  // CUSTOMER REVIEWS — genuine reviews only, published with the customer's permission
  // (e.g. copied from your Blinkit product page, WhatsApp messages or feedback forms).
  // The "What our customers say" section stays hidden until at least one review is added here.
  // Format (one line per review; photo is optional, e.g. "assets/img/reviews/name.jpg"):
  //   { name: "Customer's real name", city: "Siliguri", rating: 5, text: "Their words, unedited." },
  reviews: [
  ]
};
