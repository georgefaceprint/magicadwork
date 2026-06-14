/**
 * Courier Guy / Shiplogic Integration Service
 * 
 * This service implements the integration with Shiplogic (the logistics technology platform 
 * powering The Courier Guy).
 * 
 * Documented API Endpoint:
 * - Rates & Quotes: POST https://api.shiplogic.com/v1/rates
 * - Sandbox/Testing Endpoint: POST https://sandbox.shiplogic.com/api/v1/rates
 * 
 * Required Headers:
 * - Authorization: Bearer <API_KEY>
 * - Content-Type: application/json
 * 
 * To go live:
 * 1. Register for an account at https://tcg.shiplogic.com or https://sandbox.shiplogic.com
 * 2. Generate an API Key under the Developer / API section.
 * 3. Place your key in your environment file: VITE_COURIER_GUY_API_KEY=your_key_here
 */

// Retrieve the API Key from Vite environment variables (fallback to null)
const API_KEY = import.meta.env.VITE_COURIER_GUY_API_KEY || null;
const USE_SANDBOX = import.meta.env.VITE_COURIER_GUY_USE_SANDBOX !== 'false'; // defaults to true for safety

const SHIPLOGIC_LIVE_URL = 'https://api.shiplogic.com/v1/rates';
const SHIPLOGIC_SANDBOX_URL = 'https://sandbox.shiplogic.com/api/v1/rates';

/**
 * Standard Magic Adwork Dispatch Headquarters (Jeppestown, Johannesburg)
 */
const SENDER_ADDRESS = {
  company: "Magic Adwork",
  street_address: "289 Fox Street",
  local_area: "Jeppestown",
  city: "Johannesburg",
  code: "2094",
  country: "ZA"
};

/**
 * Packs shopping cart items into shipping parcels based on weight and dimension profiles.
 * Machines are packaged individually as freight pallets/crates.
 * Small inks/parts are aggregated into standard shipping boxes.
 * 
 * @param {Array} cartItems - Array of { product, qty }
 * @returns {Array} List of parcels with weight, length, width, and height in cm
 */
export function packItemsIntoParcels(cartItems) {
  const parcels = [];
  let smallItemsWeight = 0;

  cartItems.forEach(item => {
    const isMachine = item.product.category === 'Machines & Equipment';
    const weight = Number(item.product.weightKg) || 0.1;
    const qty = Number(item.qty) || 1;

    if (isMachine) {
      // Machines are handled as heavy/bulky freight items
      for (let i = 0; i < qty; i++) {
        parcels.push({
          weight: weight,
          length: weight > 100 ? 120 : 80,  // pallet size in cm
          width: weight > 100 ? 100 : 60,
          height: weight > 100 ? 150 : 80
        });
      }
    } else {
      // Inks and parts are aggregated into standard courier boxes
      smallItemsWeight += (weight * qty);
    }
  });

  // Aggregate small items into boxes (max 15kg per box)
  if (smallItemsWeight > 0) {
    const maxBoxWeight = 15; // kg
    let remainingWeight = smallItemsWeight;

    while (remainingWeight > 0) {
      const boxWeight = Math.min(remainingWeight, maxBoxWeight);
      // Determine size roughly based on weight
      const sizeFactor = boxWeight / maxBoxWeight;
      const length = Math.round(20 + sizeFactor * 25);
      const width = Math.round(15 + sizeFactor * 20);
      const height = Math.round(15 + sizeFactor * 20);

      parcels.push({
        weight: Number(boxWeight.toFixed(2)),
        length,
        width,
        height
      });
      
      remainingWeight -= boxWeight;
    }
  }

  return parcels;
}

/**
 * Fetches real-time shipping quotes from The Courier Guy / Shiplogic.
 * If no API key is configured, it falls back to a realistic local simulation.
 * 
 * @param {Object} deliveryAddress - { street, suburb, postalCode }
 * @param {Array} cartItems - Array of { product, qty }
 * @returns {Promise<Object>} Promise resolving to rates dictionary: { economy: number, express: number, deliveryDays: number }
 */
export async function getCourierGuyRates(deliveryAddress, cartItems) {
  const parcels = packItemsIntoParcels(cartItems);
  const totalWeight = parcels.reduce((sum, p) => sum + p.weight, 0);

  // 1. Check if the production API Key is set. If not, trigger simulated sandbox behavior.
  if (!API_KEY) {
    return simulateCourierGuyRates(deliveryAddress, totalWeight);
  }

  // 2. Build the exact payload schema required by Shiplogic API
  const payload = {
    collection_address: SENDER_ADDRESS,
    delivery_address: {
      street_address: deliveryAddress.street,
      local_area: deliveryAddress.suburb,
      city: "Johannesburg", // Assume Gauteng Metro context
      code: deliveryAddress.postalCode,
      country: "ZA"
    },
    parcels: parcels.map(p => ({
      submitted_weight_kg: p.weight,
      submitted_length_cm: p.length,
      submitted_width_cm: p.width,
      submitted_height_cm: p.height
    })),
    declared_value: cartItems.reduce((sum, item) => sum + (item.product.priceZAR * item.qty), 0)
  };

  try {
    const endpoint = USE_SANDBOX ? SHIPLOGIC_SANDBOX_URL : SHIPLOGIC_LIVE_URL;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Courier Guy API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse rates from Shiplogic structure.
    // Shiplogic returns a list of rates matching different services.
    let economyRate = null;
    let expressRate = null;
    let deliveryDays = 3;

    if (data.rates && Array.isArray(data.rates)) {
      data.rates.forEach(serviceRate => {
        const code = (serviceRate.service_code || '').toLowerCase();
        const price = Number(serviceRate.rate || serviceRate.price || 0);

        // Handle cents to decimal conversion safety
        // Standard courier rates are generally under R50,000. If we receive a price that is > 10000
        // AND the baseline weight-based estimate is much smaller, we divide by 100.
        let parsedPrice = price;
        const isLikelyCents = parsedPrice > 10000 && totalWeight < 100 && parsedPrice % 1 === 0;
        if (isLikelyCents) {
          parsedPrice = parsedPrice / 100;
        }

        // Map Shiplogic service codes to our economy/express tiers
        if (code.includes('eco') || code.includes('road') || code.includes('economy')) {
          economyRate = parsedPrice;
          deliveryDays = serviceRate.estimated_days || 3;
        } else if (code.includes('exp') || code.includes('overnight') || code.includes('express')) {
          expressRate = parsedPrice;
        }
      });
    }

    // Default fallbacks if certain rate types weren't returned
    const finalEconomy = economyRate || (95 + totalWeight * 4.5);
    const finalExpress = expressRate || (165 + totalWeight * 9);

    return {
      economy: Math.round(finalEconomy),
      express: Math.round(finalExpress),
      deliveryDays,
      isLive: true
    };

  } catch (error) {
    console.warn("Courier Guy API call failed, falling back to simulation:", error);
    // Graceful fallback to simulator so checkout is never blocked
    return simulateCourierGuyRates(deliveryAddress, totalWeight);
  }
}

/**
 * Local simulation of Courier Guy rates using distance metrics from Jeppestown HQ.
 */
function simulateCourierGuyRates(deliveryAddress, totalWeight) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Distance estimation based on popular JHB suburbs
      const suburbDistances = {
        'Jeppestown (HQ Local)': { km: 2, days: 1 },
        'Johannesburg CBD': { km: 4, days: 1 },
        'Rosebank': { km: 11, days: 1 },
        'Sandton': { km: 16, days: 1 },
        'Randburg': { km: 19, days: 2 },
        'Roodepoort': { km: 23, days: 2 },
        'Soweto': { km: 24, days: 2 },
        'Kempton Park': { km: 28, days: 2 },
        'Midrand': { km: 32, days: 2 },
        'Benoni': { km: 34, days: 2 },
        'Pretoria CBD': { km: 58, days: 2 }
      };

      const matched = suburbDistances[deliveryAddress.suburb] || { km: 25, days: 2 };
      
      // Courier billing structure:
      // Economy: Base R95 + R4.50/kg + R1.00/km
      // Express: Base R165 + R9.00/kg + R2.00/km
      const economyBase = 95;
      const expressBase = 165;

      const economyCost = economyBase + (totalWeight * 4.5) + (matched.km * 1.0);
      const expressCost = expressBase + (totalWeight * 9.0) + (matched.km * 2.0);

      resolve({
        economy: Math.round(economyCost),
        express: Math.round(expressCost),
        deliveryDays: matched.days,
        isLive: false
      });
    }, 450); // Simulate API latency
  });
}
