import https from 'https';

const JSON2VIDEO_KEY = 'PETWcDyGFduZOScEf58xaYGO2fVfcfvr7RoN6oji';

console.log('🔍 Testing JSON2Video REST Patterns...\n');

// Common REST API paths for video services
const commonPaths = [
  '/v1/render',
  '/v1/videos',
  '/v1/projects',
  '/rest/render',
  '/api/render',
  '/api/videos',
  '/api/projects',
  '/json2video/render',
  '/json2video/api/render',
  '/render',
  '/videos',
  '/projects'
];

// Test each path with Bearer token
const testPath = (path) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'json2video.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JSON2VIDEO_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      const status = res.statusCode;
      let icon = '❌';
      let desc = '';
      
      if (status === 200 || status === 201 || status === 202) {
        icon = '✅';
        desc = 'SUCCESS';
      } else if (status === 401 || status === 403) {
        icon = '⚠️ ';
        desc = 'Auth Error';
      } else if (status === 404) {
        icon = '❌';
        desc = 'Not Found';
      } else if (status === 405) {
        icon = '⚠️ ';
        desc = 'Method Not Allowed (endpoint exists!)';
      } else {
        icon = '⏳';
        desc = `Status ${status}`;
      }
      
      console.log(`${icon} ${path.padEnd(30)} - ${desc}`);
      resolve(status);
    });

    req.on('error', (e) => {
      console.log(`❌ ${path.padEnd(30)} - Error: ${e.code}`);
      resolve(0);
    });

    req.end();
  });
};

(async () => {
  for (const path of commonPaths) {
    await testPath(path);
  }
  console.log('\n💡 If you see "405 Method Not Allowed", that endpoint exists - try POST instead');
})();
