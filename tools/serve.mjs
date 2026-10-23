// Servidor local para ver o site como no GitHub Pages: serve a raiz do repositório,
// abre index.html de cada pasta e redireciona /pasta para /pasta/. Só lê arquivos, só em 127.0.0.1.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(fileURLToPath(new URL('..', import.meta.url)));
const port = 4173;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json', '.vcf': 'text/vcard; charset=utf-8'
};

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = normalize(join(root, path));
  if (file !== root && !file.startsWith(root.endsWith(sep) ? root : root + sep)) { res.writeHead(403).end(); return; }
  if (path.split('/').some(p => p.startsWith('.'))) { res.writeHead(404).end('404'); return; } // não serve .git, .claude...
  try {
    const s = await stat(file);
    if (s.isDirectory()) {
      if (!path.endsWith('/')) { res.writeHead(301, { Location: path + '/' }).end(); return; }
      file = join(file, 'index.html');
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404');
  }
}).listen(port, '127.0.0.1', () => console.log(`Site em http://localhost:${port}`));
