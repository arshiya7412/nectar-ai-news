import https from 'https';

const JSON2VIDEO_KEY = 'PETWcDyGFduZOScEf58xaYGO2fVfcfvr7RoN6oji';

console.log('🌐 Testing Different JSON2Video Domains...\n');

const domains = [
  'api.json2video.ai',
  'api.json2video.io',
  'api.json2video.co',
  'json2video.com',
  'json2video.ai',
  'json2video.io'
];

const testDomain = (domain) => {
  return new Promise((resolve) => {
    const options = {
      hostname: domain,
      port: 443,
      path: '/account',
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
        let status = `Status: ${res.statusCode}`;
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`✅ ${domain} - SUCCESS (${status})`);
        } else if (res.statusCode === 401 || res.statusCode === 403) {
          console.log(`⚠️  ${domain} - Auth Error (${status})`);
        } else if (res.statusCode === 404) {
          console.log(`❌ ${domain} - Not Found (${status})`);
        } else {
          console.log(`⏳ ${domain} - ${status}`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`❌ ${domain} - Error: ${e.code}`);
      resolve();
    });

    setTimeout(() => {
      req.abort();
      console.log(`⏱️  ${domain} - Timeout`);
      resolve();
    }, 3000);

    req.end();
  });
};

(async () => {
  for (const domain of domains) {
    await testDomain(domain);
  }
  console.log('\n✅ Domain scanning complete!');
})();
