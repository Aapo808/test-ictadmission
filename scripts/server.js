const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataFile = path.join(rootDir, 'sample-data', 'data.json');
const indexFile = path.join(rootDir, 'src', 'index.html');

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/entries' && req.method === 'GET') {
    fs.readFile(dataFile, 'utf8', (err, data) => {
      if (err) return sendJson(res, 500, { error: 'Unable to read data file' });
      try {
        const parsed = JSON.parse(data);
        sendJson(res, 200, parsed);
      } catch (parseErr) {
        sendJson(res, 500, { error: 'Invalid JSON data' });
      }
    });
    return;
  }

  if (req.url === '/api/entries' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const entry = JSON.parse(body);
        fs.readFile(dataFile, 'utf8', (readErr, data) => {
          if (readErr) return sendJson(res, 500, { error: 'Unable to read data file' });
          let entries = [];
          try {
            entries = JSON.parse(data);
          } catch (parseErr) {
            return sendJson(res, 500, { error: 'Invalid JSON data' });
          }
          if (!Array.isArray(entries)) entries = [];
          entries.unshift(entry);
          fs.writeFile(dataFile, JSON.stringify(entries, null, 2), (writeErr) => {
            if (writeErr) return sendJson(res, 500, { error: 'Unable to save entry' });
            sendJson(res, 200, entries);
          });
        });
      } catch (parseErr) {
        sendJson(res, 400, { error: 'Invalid request body' });
      }
    });
    return;
  }

  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(indexFile, 'utf8', (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Unable to load page');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(3000, () => {
  console.log('Local server running at http://localhost:3000');
});
