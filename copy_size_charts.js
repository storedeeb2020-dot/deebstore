const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const src1 = path.join(__dirname, 'logo', 'next is yours nxt', '1.png');
const src2 = path.join(__dirname, 'logo', 'next is yours nxt', '2.png');

const dest1 = path.join(publicDir, 'size-chart-tshirt.png');
const dest2 = path.join(publicDir, 'size-chart-pants.png');

if (fs.existsSync(src1)) {
  fs.copyFileSync(src1, dest1);
  console.log('Successfully copied size-chart-tshirt.png');
}

if (fs.existsSync(src2)) {
  fs.copyFileSync(src2, dest2);
  console.log('Successfully copied size-chart-pants.png');
}
