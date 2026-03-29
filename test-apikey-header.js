import https from 'https';

const JSON2VIDEO_KEY = 'PETWcDyGFduZOScEf58xaYGO2fVfcfvr7RoN6oji';

console.log('🔑 Testing JSON2Video with apikey Header...\n');

const testEndpoint = (hostname, path, headers, body = null) => {
  return new Promise((resolve) => {
    const options = {
      hostname: hostname,
      port: 443,
      path: path,
      method: body ? 'POST' : 'GET',
      headers: headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const status = res.statusCode;
        let icon = status >= 200 && status < 300 ? '✅' : status >= 400 && status < 500 ? '⚠️ ' : '❌';
        
        console.log(`${icon} Status: ${status} - ${hostname}${path}`);
        
        try {
          const json = JSON.parse(data);
          const preview = JSON.stringify(json).substring(0, 100);
          console.log(`   Response: ${preview}`);
        } catch (e) {
          console.log(`   Response: ${data.substring(0, 100)}`);
        }
        console.log('');
        resolve(status);
      });
    });

    req.on('error', (e) => {
      console.log(`❌ Error: ${e.code} - ${hostname}${path}\n`);
      resolve(0);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

(async () => {
  console.log('Creating test video...\n');
  
  // Test with apikey header (most common for JSON2Video)
  await testEndpoint('api.json2video.com', '/v1/render', {
    'apikey': JSON2VIDEO_KEY,
    'Content-Type': 'application/json'
  }, {
    "title": "Test",
    "scenes": [
      {
        "duration": 5,
        "text": "Hello from NECTAR AI News!"
      }
    ]
  });

  // Also test without Bearer prefix
  await testEndpoint('api.json2video.com', '/v1/render', {
    'Authorization': JSON2VIDEO_KEY,
    'Content-Type': 'application/json'
  }, {
    "title": "Test 2",
    "scenes": [
      {
        "duration": 5,
        "text": "Video test"
      }
    ]
  });

  // Test with query string
  await testEndpoint('api.json2video.com', `/v1/render?apikey=${JSON2VIDEO_KEY}`, {
    'Content-Type': 'application/json'
  }, {
    "title": "Test 3",
    "scenes": [
      {
        "duration": 5,
        "text": "Query string auth"
      }
    ]
  });
})();
