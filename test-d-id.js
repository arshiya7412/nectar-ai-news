import https from 'https';

const D_ID_KEY = 'YXJzaGl5YXNhbmEyMDA2QGdtYWlsLmNvbQ:hlVE04--CcNHyCjYJTNo4';

console.log('🎬 Testing D-ID API with Your Key...\n');

// Create Basic Auth header
const basicAuth = Buffer.from(D_ID_KEY).toString('base64');

console.log('Testing D-ID endpoints:\n');

const endpoints = [
  {
    name: 'Get Agents',
    path: '/agents',
    method: 'GET'
  },
  {
    name: 'Get Animates',
    path: '/animates',
    method: 'GET'
  },
  {
    name: 'Create Animation',
    path: '/animate',
    method: 'POST',
    body: {
      "source_url": "https://d-id-public-bucket.s3.amazonaws.com/alice.jpg",
      "script": {
        "type": "text",
        "input": "Hello! I'm excited to present this video!"
      },
      "config": {
        "fluent": true,
        "pad_audio": 0.0
      }
    }
  }
];

const testEndpoint = (endpoint) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.d-id.com',
      port: 443,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const status = res.statusCode;
        let icon = '❌';
        
        if (status === 200 || status === 201) {
          icon = '✅';
        } else if (status === 401 || status === 403) {
          icon = '⚠️ ';
        }
        
        console.log(`${icon} ${endpoint.name.padEnd(25)} - Status: ${status}`);
        
        try {
          const json = JSON.parse(data);
          const preview = JSON.stringify(json).substring(0, 100);
          console.log(`   Response: ${preview}\n`);
        } catch (e) {
          console.log(`   Response: ${data.substring(0, 80)}\n`);
        }
        
        resolve(status);
      });
    });

    req.on('error', (e) => {
      console.log(`❌ ${endpoint.name.padEnd(25)} - Error: ${e.message}\n`);
      resolve(0);
    });

    if (endpoint.body) {
      req.write(JSON.stringify(endpoint.body));
    }
    req.end();
  });
};

(async () => {
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
  console.log('✅ D-ID API Testing Complete!');
})();
