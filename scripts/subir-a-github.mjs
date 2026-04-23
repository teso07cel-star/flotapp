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
    console.log("\nIniciando repositorio local...");
    await git.init({ fs, dir });

    console.log("Agregando archivos...");
    const files = fs.readdirSync(dir).filter(f => !['node_modules', '.git', '.next'].includes(f));
    for (const file of files) {
       await git.add({ fs, dir, filepath: file });
    }

    console.log("Creando primer commit...");
    await git.commit({
      fs,
      dir,
      author: { name: 'Flotapp Admin', email: 'admin@flotapp.com' },
      message: 'Subida inicial automatizada'
    });

    console.log("Subiendo a GitHub (Push)...");
    await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      url: repoUrl,
      onAuth: () => ({ username: token })
    });

    console.log("\n¡SABELO! Ya está en GitHub. 🚀");
  } catch (err) {
    console.error("Error al subir:", err.message);
  } finally {
    rl.close();
  }
}

main();
