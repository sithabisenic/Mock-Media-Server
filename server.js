const http = require('http');
const fs = require('fs');
const path = require('path');
const { initDataFile, readData, writeData } = require('./utils/fileHandler');

const port = 3000;
initDataFile();

const server = http.createServer((req, res) => {
  const { url, method } = req;

  // Serve API doc HTML on root path
  if (url === '/' && method === 'GET') {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(htmlPath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }

  const validPaths = ['/movies', '/series', '/songs'];
  if (!validPaths.includes(url)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: '404 Not Found' }));
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const db = readData();
    let collection = db[url.slice(1)];

    if (method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(collection));
    } else if (method === 'POST') {
      const newItem = JSON.parse(body);
      newItem.id = collection.length ? collection[collection.length - 1].id + 1 : 1;
      collection.push(newItem);
      db[url.slice(1)] = collection;
      writeData(db);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(collection));
    } else if (method === 'PUT') {
      const updatedItem = JSON.parse(body);
      const index = collection.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        collection[index] = updatedItem;
        db[url.slice(1)] = collection;
        writeData(db);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(collection));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Item not found' }));
      }
    } else if (method === 'DELETE') {
      const { id } = JSON.parse(body);
      const newCollection = collection.filter(item => item.id !== id);
      db[url.slice(1)] = newCollection;
      writeData(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newCollection));
    } else {
      res.writeHead(405);
      res.end(JSON.stringify({ message: 'Method not allowed' }));
    }
  });
});

server.listen(port, () => {
  console.log(`Mock Media Server running at http://localhost:${port}`);
});

