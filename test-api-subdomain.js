import https from 'https';

const JSON2VIDEO_KEY = 'PETWcDyGFduZOScEf58xaYGO2fVfcfvr7RoN6oji';

console.log('🌐 Testing api.json2video.com with Various Paths...\n');

const endpoints = [
  { hostname: 'api.json2video.com', path: '/v1/render', method: 'POST' },
  { hostname: 'api.json2video.com', path: '/render', method: 'POST' },
  { hostname: 'api.json2video.com', path: '/', method: 'GET' },
  { hostname: 'json2video.com', path: '/api/', method: 'GET' },
  { hostname: 'json2video.com', path: '/backend/render', method: 'POST' },
];

const testEndpoint = (hostname, path, method) => {
  return new Promise((resolve) => {
    const options = {
      hostname: hostname,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${JSON2VIDEO_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`${method.padEnd(4)} ${hostname}${path}`);
        console.log(`     Status: ${res.statusCode}`);
        
        try {
          const json = JSON.parse(data);
          console.log(`     Response: ${JSON.stringify(json).substring(0, 80)}\n`);
        } catch (e) {
          console.log(`     Response: ${data.substring(0, 80)}\n`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`${method.padEnd(4)} ${hostname}${path}`);
      console.log(`     Error: ${e.code}\n`);
      resolve();
    });

    if (method === 'POST') {
      const body = JSON.stringify({
        "title": "Test",
        "scenes": [{ "duration": 3, "text": "Test" }]
      });
      req.write(body);
    }
    
    req.end();
  });
};

(async () => {
  for (const ep of endpoints) {
    await testEndpoint(ep.hostname, ep.path, ep.method);
  }
  console.log('Done testing!');
})();
