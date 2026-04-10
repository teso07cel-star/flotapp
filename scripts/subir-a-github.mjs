import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  const dir = process.cwd();
  
  console.log("=========================================");
  console.log("   AUTOMATIZADOR DE SUBIDA A GITHUB");
  console.log("=========================================");
  
  const repoUrl = await question("1. Pega la URL de tu repositorio de GitHub (ej: https://github.com/nombre/proyecto): ");
  const token = await question("2. Pega tu Token de Acceso Profesional (el codigo largo de GitHub): ");

  if (!repoUrl || !token) {
    console.error("Faltan datos. Reintenta.");
    process.exit(1);
  }

  try {
    const cleanRepoUrl = repoUrl.trim().replace(/\.\.git$/, '.git');
    console.log(`\nIniciando repositorio local (URL: ${cleanRepoUrl})...`);
    await git.init({ fs, dir });

    // Detectar la rama actual automáticamente
    const currentBranch = await git.currentBranch({ fs, dir }) || 'main';
    console.log(`Detectada rama operativa: '${currentBranch}'`);

    console.log("Agregando archivos...");
    const files = fs.readdirSync(dir).filter(f => !['node_modules', '.git', '.next'].includes(f));
    for (const file of files) {
       await git.add({ fs, dir, filepath: file });
    }

    console.log("Creando commit...");
    await git.commit({
      fs,
      dir,
      author: { name: 'Flotapp Admin', email: 'admin@flotapp.com' },
      message: 'Actualización táctica de despliegue (Node 24 + Prisma Resilience)'
    });

    console.log(`Subiendo a GitHub (Rama: ${currentBranch})...`);
    
    console.log(`Detectada rama: ${currentBranch}. Empujando a GitHub...`);
    try {
      await git.push({
        fs,
        http,
        dir,
        remote: 'origin',
        ref: currentBranch, 
        remoteRef: currentBranch,
        url: cleanRepoUrl,
        force: true,
        onAuth: () => ({ username: token })
      });
      console.log(`[OK] Rama ${currentBranch} actualizada con éxito.`);
    } catch (e) {
      console.log(`[ERROR] Falló la subida: ${e.message}`);
    }

    console.log("\n¡SABELO! Ya está en GitHub en todas las ramas. 🚀");
    console.log("Vercel ya debería estar actualizando tu sitio ahora mismo.");
  } catch (err) {
    console.error("Error al subir:", err.message);
  } finally {
    rl.close();
  }
}

main();
