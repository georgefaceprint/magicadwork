import fs from 'fs';
import path from 'path';

const CONTENT_FILE = '/Users/afriwalletg/.gemini/antigravity-ide/brain/f0aad729-7565-4e01-865e-ac0e7f1b3428/.system_generated/steps/1178/content.md';
const INVENTORY_FILE = path.join(process.cwd(), 'src', 'data', 'inventory.json');

async function processMarkdown() {
  const content = fs.readFileSync(CONTENT_FILE, 'utf-8');
  const lines = content.split('\n');
  
  const products = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('### [') && line.includes('](')) {
      // Extract name from ### [Name](url)
      const nameMatch = line.match(/### \[([^\]]+)\]\(/);
      if (nameMatch && nameMatch[1].includes('-')) {
        const name = nameMatch[1];
        
        // Next line is usually [Name](url) again
        // Line after that is the description
        let description = '';
        let descIndex = i + 1;
        while (descIndex < lines.length && descIndex <= i + 3) {
            const nextLine = lines[descIndex].trim();
            if (nextLine && !nextLine.startsWith('[') && !nextLine.startsWith('###')) {
                description = nextLine;
                break;
            }
            descIndex++;
        }
        
        if (description) {
            products.push({
                name,
                description,
                image: 'https://images.unsplash.com/photo-1626223847701-4475477dc110?auto=format&fit=crop&w=800&q=80' // Placeholder
            });
        }
      }
    }
  }

  console.log(`Found ${products.length} products from markdown.`);

  const inventoryData = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf-8'));
  let addedCount = 0;

  for (const prod of products) {
    const nameLower = prod.name.toLowerCase();
    const descLower = prod.description.toLowerCase();

    if (inventoryData.some(item => item.name.toLowerCase() === nameLower)) {
        continue;
    }

    const categories = ['Inks', 'NUtec'];
    const compatibleBrands = ['NUtec'];

    let isEpsonHead = false;

    if (descLower.includes('mimaki')) {
        compatibleBrands.push('Mimaki');
    }
    
    if (descLower.includes('roland')) {
        compatibleBrands.push('Roland');
        isEpsonHead = true; // All Roland machines use Epson heads
    }

    if (descLower.includes('epson') || descLower.includes('dx4') || descLower.includes('dx5') || descLower.includes('dx7') || descLower.includes('i3200') || descLower.includes('xp600')) {
        isEpsonHead = true;
    }

    if (isEpsonHead) {
        categories.push('Epson Printheads');
        if (!compatibleBrands.includes('Epson')) {
            compatibleBrands.push('Epson');
        }
    }

    const newProduct = {
        id: `NUTEC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        name: `NUtec ${prod.name} Ink`,
        priceZAR: 850.00,
        categories: categories,
        compatibleBrands: compatibleBrands,
        stockStatus: 'In Stock',
        weightKg: 1.0,
        imageUrl: prod.image,
        description: prod.description
    };

    inventoryData.push(newProduct);
    addedCount++;
    console.log(`Added: ${newProduct.name} (Brands: ${compatibleBrands.join(', ')})`);
  }

  if (addedCount > 0) {
      fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventoryData, null, 2));
      console.log(`\nSuccessfully added ${addedCount} NUtec inks to inventory.json!`);
  } else {
      console.log('No new inks were added.');
  }
}

processMarkdown().catch(console.error);
