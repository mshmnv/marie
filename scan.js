// Запусти: node scan.js
// Сканирует папку photos/ и обновляет photos.json
// Суффикс _big сохраняется как есть

const fs   = require('fs');
const path = require('path');

const dir    = path.join(__dirname, 'photos');
const output = path.join(__dirname, 'data', 'photos.json');

const exts = ['.jpg', '.jpeg', '.png', '.webp'];

const files = fs.readdirSync(dir)
  .filter(f => exts.includes(path.extname(f).toLowerCase()))
  .sort((a, b) => {
    // Числовая сортировка по номеру в имени файла
    const numA = parseInt(a.match(/\d+/)?.[0] ?? '0');
    const numB = parseInt(b.match(/\d+/)?.[0] ?? '0');
    return numA - numB;
  });

fs.writeFileSync(output, JSON.stringify(files, null, 2));
console.log(`✓ photos.json обновлён: ${files.length} фото`);
files.forEach(f => console.log('  ' + f));
