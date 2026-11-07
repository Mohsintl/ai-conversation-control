const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFile(src, destDir) {
  ensureDir(destDir);
  const dest = path.join(destDir, path.basename(src));
  fs.copyFileSync(src, dest);
}

function main() {
  const root = process.cwd();
  const distExtension = path.join(root, 'dist', 'extension');
  const distPopup = path.join(distExtension, 'popup');
  const distOnboarding = path.join(distExtension, 'onboarding');
  const distIcons = path.join(distExtension, 'icons');

  copyFile(path.join(root, 'extension', 'manifest.json'), distExtension);
  copyFile(path.join(root, 'extension', 'popup', 'popup.html'), distPopup);
  copyFile(path.join(root, 'extension', 'popup', 'popup.css'), distPopup);
  copyFile(
    path.join(root, 'extension', 'onboarding', 'onboarding.html'),
    distOnboarding
  );
  copyFile(
    path.join(root, 'extension', 'onboarding', 'onboarding.css'),
    distOnboarding
  );

  // Copy icons
  if (fs.existsSync(path.join(root, 'extension', 'icons'))) {
    ensureDir(distIcons);
    const iconFiles = fs.readdirSync(path.join(root, 'extension', 'icons'));
    iconFiles.forEach(file => {
      copyFile(path.join(root, 'extension', 'icons', file), distIcons);
    });
  }
}

main();
