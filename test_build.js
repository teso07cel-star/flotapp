const { execSync } = require('child_process');

try {
  console.log("Ejecutando next build usando path absoluto...");
  const npxPath = require.resolve('next/dist/bin/next');
  execSync(`node "${npxPath}" build`, { stdio: 'inherit' });
  console.log("Build exitoso.");
} catch (e) {
  console.error("Build flasheo un error.");
  process.exit(1);
}
