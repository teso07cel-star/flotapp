const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');

async function commitChanges() {
  const dir = process.cwd();
  try {
    await git.add({ fs, dir, filepath: '.' });
    let sha = await git.commit({
      fs,
      dir,
      author: {
        name: 'Antigravity AI',
        email: 'ai@antigravity.com',
      },
      message: 'Mejoras premium: modo oscuro y nuevas secciones'
    });
    console.log('Committed successfully! SHA:', sha);
  } catch (err) {
    console.error('Error committing:', err);
  }
}

commitChanges();
