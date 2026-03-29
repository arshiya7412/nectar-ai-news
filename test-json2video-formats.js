import https from 'https';

const JSON2VIDEO_KEY = 'PETWcDyGFduZOScEf58xaYGO2fVfcfvr7RoN6oji';

console.log('🎬 Testing JSON2Video API with Different Auth Formats...\n');

const testFormats = [
  {
    name: 'Authorization Header (Key format)',
    headers: {
      'Authorization': JSON2VIDEO_KEY,
      'Content-Type': 'application/json'
    }
  },
  {
    name: 'X-API-Key Header',
    headers: {
      'X-API-Key': JSON2VIDEO_KEY,
      'Content-Type': 'application/json'
    }
  },
  {
    name: 'Query Parameter',
    path: `/v1/account?api_key=${JSON2VIDEO_KEY}`,
    headers: {
      'Content-Type': 'application/json'
    }
  }
];

const testWithFormat = (format) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.json2video.com',
      port: 443,
      path: format.path || '/v1/account',
      method: 'GET',
      headers: format.headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✓ ${format.name} - Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log(`  ✅ THIS FORMAT WORKS!\n`);
          try {
            const json = JSON.parse(data);
            console.log(`  Response:`, json);
          } catch (e) {
            console.log(`  Response: ${data.substring(0, 100)}`);
          }
        } else {
          console.log(`  Error: ${data.substring(0, 100)}\n`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`❌ ${format.name} - Connection Error: ${e.message}\n`);
      resolve();
    });
    req.end();
  });
};

(async () => {
  for (const format of testFormats) {
    await testWithFormat(format);
  }
  console.log('🎉 Format testing complete!');
})();
