// small helpers shared by the whole server
const MAX_BODY = 6 * 1024 * 1024; // 6 MB (a photo sent as base64 can be big)

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// JSON.stringify turns the object into text, because res.end() only accepts text/bytes
function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(status === 204 ? undefined : JSON.stringify(body)); // 204 means "no content"
}

// reads the request body and returns it as an object (JSON or normal HTML form data)
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new HttpError(413, 'Request is too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8');
      if (!text.trim()) return resolve({});
      const type = req.headers['content-type'] || '';
      if (type.includes('application/json')) {
        try {
          const data = JSON.parse(text);
          return resolve(data && typeof data === 'object' ? data : {});
        } catch (e) {
          return reject(new HttpError(400, 'Request body is not valid JSON'));
        }
      }
      if (type.includes('application/x-www-form-urlencoded')) {
        return resolve(Object.fromEntries(new URLSearchParams(text)));
      }
      resolve({});
    });
    req.on('error', reject);
  });
}

module.exports = { HttpError, send, readBody };
