const fs = require('fs');
const path = require('path');
const dir1 = 'C:/Users/USUARIO/.gemini/antigravity/brain/926c11a4-7ee5-4b8b-83e6-2f3b2e7e59d0';
const dir2 = 'C:/Users/USUARIO/.gemini/antigravity/brain/209a4f85-ac14-4849-a170-adff43f00361'; // current dir

let html = '<html><body><div style="display:flex; flex-wrap:wrap; gap:10px">';

function addDir(dirFullName) {
  if (fs.existsSync(dirFullName)) {
    const files = fs.readdirSync(dirFullName);
    for (let f of files) {
      if (f.endsWith('.png') || f.endsWith('.img') || f.endsWith('.jpg') || f.endsWith('.jpeg')) {
        let fullurl = 'file:///' + path.join(dirFullName, f).replace(/\\/g, '/');
        html += '<div style="margin: 20px; border: 1px solid black">';
        html += '<p style="max-width:300px; word-break:break-all">' + f + '</p>';
        html += '<img src="' + fullurl + '" style="max-width:300px; background:green" />';
        html += '</div>';
      }
    }
  }
}

addDir(dir1);
addDir(dir2);

html += '</div></body></html>';
fs.writeFileSync('C:/Users/USUARIO/.gemini/antigravity/scratch/flota-app/gallery.html', html);
console.log('Gallery written to scratch/flota-app/gallery.html');
