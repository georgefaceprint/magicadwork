const fs = require('fs');

const inventoryPath = './src/data/inventory.json';
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

inventory.forEach(item => {
  if (item.category === 'Inks & Powders') {
    if (item.name.toLowerCase().includes('uv') || item.name.includes('Amethyst') || item.name.includes('Ruby') || item.name.includes('Topaz')) {
      item.image = '/nutec_uv.png';
    } else {
      item.image = '/nutec_solvent.png';
    }
  }
});

fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
console.log('Images assigned successfully.');
