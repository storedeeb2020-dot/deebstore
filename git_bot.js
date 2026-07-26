// ================================================
// 🚀 ELDEEB STORE — Standard GitHub Push Script
// ================================================

const { execSync } = require('child_process');
const path = require('path');

if (process.platform === 'win32') {
  const sys32 = process.env.SystemRoot ? path.join(process.env.SystemRoot, 'System32') : 'C:\\Windows\\System32';
  if (!process.env.PATH.includes(sys32)) process.env.PATH = `${sys32};${process.env.PATH}`;
}

const REPO_URL = "https://github.com/storedeeb2020-dot/deebstore.git";

function run(cmd) {
  try {
    execSync(cmd, { cwd: __dirname, stdio: 'inherit', env: process.env });
  } catch (e) {
    // Continue
  }
}

console.log("🚀 جاري رفع التحديثات...");
run('git init');
run(`git remote add origin ${REPO_URL}`);
run(`git remote set-url origin ${REPO_URL}`);
run('git add .');
run('git commit -m "تحديث المتجر"');
run('git branch -M main');
run('git push -u origin main');
console.log("✅ اكتملت العملية!");
