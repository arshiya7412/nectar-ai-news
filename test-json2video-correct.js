import https from 'https';

const JSON2VIDEO_KEY = 'PETWcDyGFduZOScEf58xaYGO2fVfcfvr7RoN6oji';

console.log('🎬 Testing JSON2Video.com API with Correct Endpoints...\n');

const endpoints = [
  {
    name: 'Direct API Key Header',
    path: '/api/v1/account',
    headers: {
      'Authorization': `Bearer ${JSON2VIDEO_KEY}`,
      'Content-Type': 'application/json'
    }
  },
  {
    name: 'Query Parameter',
    path: `/api/v1/account?apikey=${JSON2VIDEO_KEY}`,
    headers: {
      'Content-Type': 'application/json'
    }
  },
  {
    name: 'X-API-Key Header',
    path: '/api/v1/account',
    headers: {
      'apikey': JSON2VIDEO_KEY,
      'Content-Type': 'application/json'
    }
  },
  {
    name: 'Create Video Test',
    path: '/api/v1/videos/create',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JSON2VIDEO_KEY}`,
      'Content-Type': 'application/json'
    },
    body: {
      "title": "Test",
      "scenes": [
        {
          "duration": 3,
          "text": "Hello World"
        }
      ]
    }
  },
  {
    name: 'Render Endpoint',
    path: '/api/v1/render',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${JSON2VIDEO_KEY}`,
      'Content-Type': 'application/json'
    },
    body: {
      "title": "Test Video",
      "scenes": [
        {
          "duration": 5,
          "text": "Test video generation"
        }
      ]
    }
  }
];

const testEndpoint = (endpoint) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'json2video.com',
      port: 443,
      path: endpoint.path,
      method: endpoint.method || 'GET',
      headers: endpoint.headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const status = res.statusCode;
        console.log(`\n✓ ${endpoint.name}`);
        console.log(`  Status: ${status}`);
        
        let success = false;
        if (status === 200 || status === 201) {
          success = true;
          console.log(`  ✅ SUCCESS!`);
        } else if (status === 401 || status === 403) {
          console.log(`  ⚠️  Auth Error`);
        }
        
        try {
          const json = JSON.parse(data);
          console.log(`  Response: ${JSON.stringify(json).substring(0, 150)}`);
        } catch (e) {
          if (data.includes('html') || data.includes('<!DOCTYPE')) {
            console.log(`  Response: HTML error page`);
          } else {
            console.log(`  Response: ${data.substring(0, 100)}`);
          }
        }
        resolve(success);
      });
    });

    req.on('error', (e) => {
      console.log(`\n✓ ${endpoint.name} - ❌ Error: ${e.message}`);
      resolve(false);
    });

    if (endpoint.body) {
      req.write(JSON.stringify(endpoint.body));
    }
    req.end();
  });
};

(async () => {
  console.log('Testing different authentication methods on json2video.com...\n');
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) successCount++;
  }
  
  console.log(`\n\n📊 Results: ${successCount}/${endpoints.length} endpoints successful`);
})();
