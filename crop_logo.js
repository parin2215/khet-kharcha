const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const scriptDir = __dirname;
const outputDir = path.join(scriptDir, 'mobile', 'src', 'assets');
const outputPath = path.join(outputDir, 'logo.png');

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Write a default 1x1 transparent PNG base64 placeholder first to ensure build won't fail
const placeholderBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
try {
  fs.writeFileSync(outputPath, Buffer.from(placeholderBase64, 'base64'));
  console.log(`[INFO] Created default placeholder logo at ${outputPath}`);
} catch (err) {
  console.error(`[ERROR] Failed to write placeholder logo: ${err.message}`);
}

// 2. Try to run python crop_logo.py, python3 crop_logo.py or py crop_logo.py to perform actual crop
const commands = ['python', 'python3', 'py'];
let success = false;

for (const cmd of commands) {
  try {
    console.log(`[INFO] Attempting to run crop script using ${cmd}...`);
    const scriptPath = path.join(scriptDir, 'crop_logo.py');
    execSync(`${cmd} "${scriptPath}"`, { stdio: 'inherit', cwd: scriptDir });
    success = true;
    console.log(`[INFO] Successfully cropped circular logo using ${cmd}!`);
    break;
  } catch (err) {
    // Silent fail and try next command
  }
}

if (!success) {
  console.log('[WARNING] Could not run python logo crop script. Keeping the placeholder logo.');
  console.log('[WARNING] Please install Python and Pillow (pip install Pillow) if you want to crop the custom logo.');
}
