/* data.js - Product Database */

/**
 * FUTURE DATA STRUCTURE SCHEMA:
 * {
 *    id: Number,
 *    brand: String,
 *    name: String,
 *    category: "oils" | "bottles" | "perfume",
 *    quality: "Top" | "Premium" | "Standard",
 *    basePrice: Number, // For linear calc (Temporary)
 *    // Future Price List (Fixed prices for specific volumes)
 *    prices: {
 *        "30": 0,    // Price for 30g
 *        "50": 0,    // Price for 50g
 *        "500": 0,   // Price for 500g
 *        "1000": 0   // Price for 1kg
 *    }
 * }
 */

const BRANDS_LIST = [
    "Gulf Premium",
    "Swiss Arabian",
    "French Essence",
    "Al Haramain",
    "Rasasi",
    "Amouage",
    "Lattafa",
    "Ajmal",
    "Nishane",
    "Xerjoff"
];

// 1. OILS (Масла)
const catalogOils = [
    { id: 101, brand: "Gulf Premium", name: "Royal Oud", category: "oils", basePrice: 50, prices: { "30": 1500, "50": 2500, "500": 20000, "1000": 38000 } },
    { id: 102, brand: "Swiss Arabian", name: "Musk Tahara", category: "oils", basePrice: 30, prices: { "30": 900, "50": 1500, "500": 12000, "1000": 22000 } },
    { id: 103, brand: "Al Haramain", name: "Black Afghan", category: "oils", basePrice: 60, prices: { "30": 1800, "50": 3000, "500": 25000, "1000": 48000 } },
    { id: 104, brand: "Rasasi", name: "Amber Wood", category: "oils", basePrice: 45, prices: { "30": 1350, "50": 2250, "500": 18000, "1000": 35000 } },
    { id: 105, brand: "Amouage", name: "Molecule 02", category: "oils", basePrice: 40, prices: { "30": 1200, "50": 2000, "500": 16000, "1000": 30000 } },
    { id: 106, brand: "Maison Francis", name: "Baccarat Rouge", category: "oils", basePrice: 70, prices: { "30": 2100, "50": 3500, "500": 30000, "1000": 55000 } },
];

// 2. BOTTLES (Флаконы)
const catalogBottles = [
    { id: 201, name: "Glass 3ml Fancy", category: "bottles", basePrice: 15 },
    { id: 202, name: "Roll-on 6ml Standard", category: "bottles", basePrice: 10 },
    { id: 203, name: "Crystal 12ml Luxury", category: "bottles", basePrice: 40 },
    { id: 204, name: "Aroma Spray 50ml", category: "bottles", basePrice: 20 },
    { id: 205, name: "Plastic 100ml Bulk", category: "bottles", basePrice: 8 },
];

// 3. PERFUME / SOLUTION (Раствор)
const catalogPerfume = [
    { id: 301, brand: "Chanel", name: "Chance (Solution)", category: "perfume", basePrice: 80 },
    { id: 302, brand: "Dior", name: "Savage (Solution)", category: "perfume", basePrice: 90 },
    { id: 303, brand: "Tom Ford", name: "Cherry (Solution)", category: "perfume", basePrice: 120 },
    { id: 304, brand: "Creed", name: "Aventus (Solution)", category: "perfume", basePrice: 110 },
];
