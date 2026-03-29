import https from 'https';
import crypto from 'crypto';

const JSON2VIDEO_KEY = 'PETWcDyGFduZOScEf58xaYGO2fVfcfvr7RoN6oji';

console.log('🎬 Testing JSON2Video API with Alternative Methods...\n');

// Try with just the key in various formats
const testVariants = [
  {
    name: 'Plain Authorization Header',
    headers: {
      'Authorization': JSON2VIDEO_KEY,
      'Content-Type': 'application/json'
    }
  },
  {
    name: 'Base64 Encoded Key',
    headers: {
      'Authorization': Buffer.from(`${JSON2VIDEO_KEY}:`).toString('base64'),
      'Content-Type': 'application/json'
    }
  },
  {
    name: 'Content-Type Only',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    query: `?key=${JSON2VIDEO_KEY}`
  },
  {
    name: 'Token Header',
    headers: {
      'Token': JSON2VIDEO_KEY,
      'Content-Type': 'application/json'
    }
  },
  {
    name: 'API-Token Header',
    headers: {
      'API-Token': JSON2VIDEO_KEY,
      'Content-Type': 'application/json'
    }
  }
];

const testVariant = (variant) => {
  return new Promise((resolve) => {
    const path = variant.query ? `/v1/account${variant.query}` : '/v1/account';
    const options = {
      hostname: 'api.json2video.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: variant.headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✓ ${variant.name} - Status: ${res.statusCode}`);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`  ✅ SUCCESS\n`);
          try {
            const json = JSON.parse(data);
            console.log(`  Data:`, JSON.stringify(json, null, 2).substring(0, 200));
          } catch (e) {}
        } else {
          let error = data;
          try {
            const json = JSON.parse(data);
            error = json.message || data.substring(0, 80);
          } catch (e) {}
          console.log(`  Error: ${error}\n`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`❌ ${variant.name} - Error: ${e.message}\n`);
      resolve();
    });
    req.end();
  });
};

(async () => {
  for (const variant of testVariants) {
    await testVariant(variant);
  }
  console.log('🎉 Variant testing complete!');
  console.log('\n📝 If none work above, the key might not be for json2video.com');
  console.log('   Possible alternatives: json2video.ai, json2video.io, or another service');
})();
