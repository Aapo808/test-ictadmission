const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const sampleDir = path.join(rootDir, 'sample-data');
const distDir = path.join(rootDir, 'dist');

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

function copyRecursive(sourcePath, targetPath) {
  if (!fs.existsSync(sourcePath)) return;
  fs.mkdirSync(targetPath, { recursive: true });

  for (const entry of fs.readdirSync(sourcePath, { withFileTypes: true })) {
    const sourceEntryPath = path.join(sourcePath, entry.name);
    const targetEntryPath = path.join(targetPath, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(sourceEntryPath, targetEntryPath);
    } else {
      fs.copyFileSync(sourceEntryPath, targetEntryPath);
    }
  }
}

copyRecursive(srcDir, distDir);
copyRecursive(sampleDir, path.join(distDir, 'sample-data'));
console.log('Built static site in dist/');
