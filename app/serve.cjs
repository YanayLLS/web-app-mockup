const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname);
const TYPES = {
  '.html':'text/html','.js':'application/javascript','.mjs':'application/javascript',
  '.css':'text/css','.json':'application/json','.fbx':'application/octet-stream',
  '.glb':'application/octet-stream','.gltf':'model/gltf+json','.obj':'text/plain',
  '.stl':'application/octet-stream','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'
};
http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/digital-twin-scene.html';
  const filePath = path.join(ROOT, url);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found: ' + url); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}).listen(9000, () => console.log('Ready: http://localhost:9000'));
