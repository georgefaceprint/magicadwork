import axios from 'axios';
import * as cheerio from 'cheerio';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

const INVENTORY_FILE = path.join(process.cwd(), 'src', 'data', 'inventory.json');
const EXCEL_FILE = path.join(process.cwd(), 'ink for online.xlsx');
const INKS_URL = 'https://nutecdigital.com/product-category/inks/';

async function updateNUtec() {
  console.log('Loading inventory...');
  const inventoryData = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf-8'));
  
  // 1. Fetch real images from NUtec
  console.log('Fetching real images from NUtec website...');
  const res = await axios.get(INKS_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  const $ = cheerio.load(res.data);
  
  const imagesMap = {}; // Maps product name to image URL
  
  // They use WooCommerce, images are in .product
  $('.product, .type-product').each((i, el) => {
    // NUtec often has multiple ways to find the name
    let name = $(el).find('.woocommerce-loop-product__title, h2, h3').text().trim() || $(el).find('a').first().text().trim();
    const imgUrl = $(el).find('img').attr('src');
    
    if (name && imgUrl) {
      imagesMap[name.toLowerCase()] = imgUrl;
    }
  });

  // If the standard product loops didn't work, let's search broadly
  if (Object.keys(imagesMap).length === 0) {
    $('h3').each((i, el) => {
      const link = $(el).find('a');
      if (link.length > 0) {
        const name = link.text().trim();
        const imgUrl = $(el).parent().parent().find('img').attr('src') || $(el).prevAll('img').first().attr('src');
        if (name && imgUrl) {
          imagesMap[name.toLowerCase()] = imgUrl;
        }
      }
    });
  }

  console.log(`Found ${Object.keys(imagesMap).length} images.`);

  // 2. Load Excel File
  console.log('Loading pricing from Excel...');
  const workbook = xlsx.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const excelData = xlsx.utils.sheet_to_json(worksheet);
  
  console.log(`Loaded ${excelData.length} rows from Excel.`);
  
  // Map excel rows for easy searching
  // Let's assume the excel has columns like 'Item' or 'Name' or 'Description', and 'Price' or 'Retail Price'
  const pricingData = excelData.map(row => {
    // Collect all string values in the row to form a searchable text
    const searchString = Object.values(row).join(' ').toLowerCase();
    
    // Find the price column. Typically named Price, Retail, ZAR, etc. Or just find a number
    let price = 850; // Fallback
    for (const [key, val] of Object.entries(row)) {
        if (typeof val === 'number' && val > 0 && val < 50000) {
             // Let's assume the largest number is the price, or a number ending in .00
             if (val > price) price = val;
        }
        // If the key explicitly says price
        if (key.toLowerCase().includes('price') && typeof val === 'number') {
             price = val;
             break;
        }
    }
    return { searchString, price };
  });

  // 3. Update Inventory
  let updatedCount = 0;
  for (const item of inventoryData) {
    if (item.categories?.includes('NUtec')) {
      const originalName = item.name.replace('NUtec ', '').replace(' Ink', '').trim().toLowerCase();
      
      // Assign real image if found
      if (imagesMap[originalName]) {
          item.imageUrl = imagesMap[originalName];
      }
      
      // Assign real price
      // Look for a row in excel that contains the product code (e.g., 'a20-hyb')
      const match = pricingData.find(p => p.searchString.includes(originalName));
      if (match) {
          item.priceZAR = match.price;
          console.log(`Matched price for ${originalName}: R ${match.price}`);
      } else {
          // If no exact match on code, try partial match without hyphen
          const partialMatch = pricingData.find(p => p.searchString.includes(originalName.replace('-', '')));
          if (partialMatch) {
              item.priceZAR = partialMatch.price;
              console.log(`Matched (partial) price for ${originalName}: R ${partialMatch.price}`);
          } else {
              console.log(`Could not find price in excel for ${originalName}`);
          }
      }
      
      updatedCount++;
    }
  }

  // Save back to inventory
  fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventoryData, null, 2));
  console.log(`Successfully updated images and prices for ${updatedCount} NUtec inks.`);
}

updateNUtec().catch(console.error);
