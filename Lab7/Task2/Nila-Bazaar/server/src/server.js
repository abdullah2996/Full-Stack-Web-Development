const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { HttpError, send, readBody } = require('./lib');
const { readToken } = require('./auth');
const { db, uploadDir } = require('./store');

//  tiny router: add(method, '/api/x/:id', { auth }, handler) ]
const routes = [];
function add(method, pattern, options, handler) {
  const keys = [];
  const regex = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, key) => { keys.push(key); return '([^/]+)'; }) + '/?$');
  routes.push({ method, regex, keys, auth: !!options.auth, handler });
}
['auth', 'products', 'reviews', 'cart', 'orders'].forEach(name => require('./routes/' + name)(add));

const IMAGE_MIME = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

// GET /uploads/<file>  -> product photos that were uploaded
function serveUpload(res, pathname) {
  const file = path.join(uploadDir, path.basename(pathname)); // basename blocks "../" tricks
  const type = IMAGE_MIME[path.extname(file)];
  if (!type || !fs.existsSync(file)) return send(res, 404, { error: 'File not found' });
  res.writeHead(200, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*' });
  fs.createReadStream(file).pipe(res);
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET' && pathname === '/api/health') return send(res, 200, { status: 'ok' });
  if (req.method === 'GET' && pathname.startsWith('/uploads/')) return serveUpload(res, pathname);

  let pathMatched = false;
  for (const route of routes) {
    const match = route.regex.exec(pathname);
    if (!match) continue;
    pathMatched = true;
    if (route.method !== req.method) continue;

    const params = {};
    route.keys.forEach((key, i) => { params[key] = decodeURIComponent(match[i + 1]); });

    let user = null;
    if (route.auth) {
      const header = req.headers.authorization || '';
      const payload = readToken(header.startsWith('Bearer ') ? header.slice(7) : null);
      if (!payload) throw new HttpError(401, 'Login required (missing, invalid or expired token)');
      user = db.users.find(u => u.id === payload.id);
      if (!user) throw new HttpError(401, 'Account no longer exists');
    }

    const body = ['POST', 'PUT'].includes(req.method) ? await readBody(req) : {};
    const [status, data] = route.handler({ params, query: Object.fromEntries(url.searchParams), body, user });
    return send(res, status, data);
  }

  if (pathMatched) throw new HttpError(405, 'Method not allowed for this URL');
  throw new HttpError(404, 'Endpoint not found');
}

const server = http.createServer((req, res) => {
  handle(req, res).catch(err => {
    if (err instanceof HttpError) return send(res, err.status, { error: err.message });
    console.error(err);
    send(res, 500, { error: 'Something went wrong on the server' });
  });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log('Nila Bazaar API running on http://localhost:' + PORT);
    console.log('Try: http://localhost:' + PORT + '/api/products');
  });
}

module.exports = server;
