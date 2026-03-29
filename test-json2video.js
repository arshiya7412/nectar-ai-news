import https from 'https';

const JSON2VIDEO_KEY = 'PETWcDyGFduZOScEf58xaYGO2fVfcfvr7RoN6oji';

console.log('🎬 Testing JSON2Video API Key...\n');

// Test 1: Get account info
const testAccountInfo = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.json2video.com',
      port: 443,
      path: '/v1/account',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JSON2VIDEO_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✓ Account Info - Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`  Credits: ${json.credits || 'N/A'}`);
            console.log(`  ✅ KEY IS VALID\n`);
          } catch (e) {
            console.log(`  Response: ${data.substring(0, 100)}\n`);
          }
        } else {
          console.log(`  Error: ${data.substring(0, 100)}\n`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`❌ Connection Error: ${e.message}\n`);
      resolve();
    });
    req.end();
  });
};

// Test 2: List existing videos
const testListVideos = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.json2video.com',
      port: 443,
      path: '/v1/videos',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JSON2VIDEO_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✓ List Videos - Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log(`  ✅ VIDEOS ENDPOINT WORKS\n`);
        } else {
          console.log(`  Error: ${data.substring(0, 100)}\n`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`❌ Connection Error: ${e.message}\n`);
      resolve();
    });
    req.end();
  });
};

// Test 3: Create a simple video
const testCreateVideo = () => {
  return new Promise((resolve) => {
    const payload = {
      "title": "Test Video",
      "scenes": [
        {
          "duration": 3,
          "text": "Hello World"
        }
      ]
    };

    const postData = JSON.stringify(payload);

    const options = {
      hostname: 'api.json2video.com',
      port: 443,
      path: '/v1/videos',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JSON2VIDEO_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✓ Create Video - Status: ${res.statusCode}`);
        if (res.statusCode === 201 || res.statusCode === 200) {
          console.log(`  ✅ VIDEO CREATION WORKS`);
          try {
            const json = JSON.parse(data);
            console.log(`  Video ID: ${json.id || json.videoId || 'N/A'}\n`);
          } catch (e) {}
        } else {
          console.log(`  Error: ${data.substring(0, 150)}\n`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`❌ Connection Error: ${e.message}\n`);
      resolve();
    });

    req.write(postData);
    req.end();
  });
};

(async () => {
  await testAccountInfo();
  await testListVideos();
  await testCreateVideo();
  console.log('🎉 JSON2Video API Testing Complete!');
})();
