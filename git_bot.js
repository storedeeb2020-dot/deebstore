// ================================================
// 🤖 ELDEEB STORE — GitHub Auto-Push Bot
// ================================================
// 📌 Repository: https://github.com/storedeeb2020-dot/deebstore.git

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_URL = "https://github.com/storedeeb2020-dot/deebstore.git";
const WORK_DIR = __dirname;

function runCmd(cmd) {
  try {
    console.log(`\n⏳ Running: ${cmd}`);
    const output = execSync(cmd, { cwd: WORK_DIR, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    console.log(output.trim());
    return { success: true, output };
  } catch (err) {
    const errorMsg = err.stderr || err.stdout || err.message;
    console.error(`❌ Command failed: ${errorMsg.trim()}`);
    return { success: false, error: errorMsg };
  }
}

async function autoPush(customCommitMessage) {
  console.log("==========================================");
  console.log("🤖 Starting ELDEEB STORE GitHub Auto-Push");
  console.log("==========================================");

  // 1. Check if .git exists
  const isGitRepo = fs.existsSync(path.join(WORK_DIR, '.git'));
  if (!isGitRepo) {
    console.log("🔹 Initializing local Git repository...");
    runCmd('git init');
    runCmd(`git remote add origin ${REPO_URL}`);
  } else {
    // Verify or set remote
    const remoteRes = runCmd('git remote -v');
    if (!remoteRes.output || !remoteRes.output.includes('origin')) {
      runCmd(`git remote add origin ${REPO_URL}`);
    } else if (!remoteRes.output.includes('deebstore.git')) {
      runCmd(`git remote set-url origin ${REPO_URL}`);
    }
  }

  // 2. Stage changes
  console.log("🔹 Staging all modified and new files...");
  runCmd('git add .');

  // 3. Check status
  const statusRes = runCmd('git status --porcelain');
  if (!statusRes.output || statusRes.output.trim() === '') {
    console.log("✅ No new changes to commit. Everything is up to date!");
    return;
  }

  // 4. Generate Commit Message
  const timestamp = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });
  const commitMsg = customCommitMessage || `🚀 التحديث التلقائي — ${timestamp}`;

  console.log(`🔹 Committing changes: "${commitMsg}"`);
  runCmd(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);

  // 5. Ensure branch is main
  runCmd('git branch -M main');

  // 6. Push to Remote GitHub
  console.log("🔹 Pushing changes to GitHub (main branch)...");
  const pushRes = runCmd('git push -u origin main');

  if (pushRes.success) {
    console.log("\n🎉 SUCCESS! All changes have been pushed to GitHub:");
    console.log(`👉 ${REPO_URL}`);
  } else {
    console.log("\n⚠️ Authentication Notice:");
    console.log("If pushing failed due to permission/authentication, run:");
    console.log(`git remote set-url origin https://<YOUR_GITHUB_TOKEN>@github.com/storedeeb2020-dot/deebstore.git`);
    console.log("Or sign in to GitHub CLI / Credentials Manager.");
  }
}

// Allow CLI argument for commit message
const userMsg = process.argv.slice(2).join(' ');
autoPush(userMsg);
