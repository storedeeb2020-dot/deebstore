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

// Payment Logos Copy
const vfSrc = path.join(publicDir, 'الدفع عن طريق فودافون كاش من مصر.jpg');
const instaSrc = path.join(publicDir, 'انستا باي.jpg');
const vfDest = path.join(publicDir, 'vodafone-cash-official.jpg');
const instaDest = path.join(publicDir, 'instapay-official.jpg');

if (fs.existsSync(vfSrc)) {
  fs.copyFileSync(vfSrc, vfDest);
  console.log('Successfully copied vodafone-cash-official.jpg');
}

if (fs.existsSync(instaSrc)) {
  fs.copyFileSync(instaSrc, instaDest);
  console.log('Successfully copied instapay-official.jpg');
}

const codSrc = path.join(publicDir, 'دفع عند استلام.jpg');
const codDest = path.join(publicDir, 'cod-official.jpg');

if (fs.existsSync(codSrc)) {
  fs.copyFileSync(codSrc, codDest);
  console.log('Successfully copied cod-official.jpg');
}
