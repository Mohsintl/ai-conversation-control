const esbuild = require('esbuild');
const path = require('path');

async function main() {
  const root = process.cwd();
  const entry = path.join(
    root,
    'dist',
    'extension',
    'content',
    'content-script.js'
  );
  const outfile = path.join(
    root,
    'dist',
    'extension',
    'content',
    'content-script.js'
  );

  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    sourcemap: true,
    outfile,
    allowOverwrite: true
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
