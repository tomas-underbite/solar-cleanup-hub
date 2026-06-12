const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const args = process.argv.slice(2);
let port = 8080;
let dir = '.';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' || args[i] === '-p') port = parseInt(args[++i], 10);
  else if (args[i] === '--dir' || args[i] === '-d') dir = args[++i];
  else if (!args[i].startsWith('-')) dir = args[i];
}

const mime = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.xml': 'application/xml',
  '.txt': 'text/plain', '.pdf': 'application/pdf', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.mp4': 'video/mp4'
};

function send(res, code, body, headers = {}) {
  res.writeHead(code, headers);
  res.end(body);
}

http.createServer((req, res) => {
  let pathname = decodeURIComponent(url.parse(req.url).pathname);
  if (pathname.endsWith('.html') && pathname !== '/index.html') {
    const clean = pathname.slice(0, -5);
    return send(res, 301, '', { Location: clean });
  }
  let fp = path.join(dir, pathname);
  try {
    let stat = fs.existsSync(fp) && fs.statSync(fp);
    if (stat && stat.isDirectory()) fp = path.join(fp, 'index.html');
    if (!fs.existsSync(fp)) {
      const html = fp + '.html';
      if (fs.existsSync(html)) fp = html;
      else return send(res, 404, 'Not found');
    }
    const ext = path.extname(fp).toLowerCase();
    send(res, 200, fs.readFileSync(fp), { 'Content-Type': mime[ext] || 'application/octet-stream' });
  } catch (e) {
    send(res, 500, 'Server error: ' + e.message);
  }
}).listen(port, '0.0.0.0', () => console.log(`Serving ${dir} on :${port}`));
