const fs = require('fs');
const path = 'index.html';
let content = fs.readFileSync(path, 'utf8');

const colors = ['tamsiruda', 'ruda', 'tamsipilka', 'juoda', 'vysnine', 'rusvairaudona', 'raudona', 'molioraudona', 'tamsizalia', 'balta'];

function addSizeColorAttrs(content, imgId) {
  const regex = new RegExp(`(data-image-id="${imgId}"[^>]*)`, 'g');
  return content.replace(regex, (match) => {
    let result = match;
    ['small', 'large'].forEach(size => {
      colors.forEach(color => {
        const attr = `data-url-${size}-${color}="https://bauen.lt/${imgId.replace('img-', '')}-${size === 'small' ? '125mm' : '150mm'}-${color}"`;
        if (!result.includes(attr)) {
          result = result.replace('style=', ` ${attr} style=`);
        }
      });
    });
    return result;
  });
}

// Update all products from img-04 to img-20
for (let i = 4; i <= 20; i++) {
  const imgId = `img-${String(i).padStart(2, '0')}`;
  content = addSizeColorAttrs(content, imgId);
}

fs.writeFileSync(path, content);
console.log('Updated all products with size-color URL attributes');