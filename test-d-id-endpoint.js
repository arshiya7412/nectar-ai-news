import http from 'http';

console.log('🎬 Testing D-ID Video Generation Integration...\n');

const testVideoGeneration = () => {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      prompt: "AI Revolution in India's Tech Industry"
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/generate-video',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}\n`);
        try {
          const json = JSON.parse(data);
          console.log('✅ Video Generation Response:');
          console.log(`  ID: ${json.id}`);
          console.log(`  Title: ${json.title}`);
          console.log(`  Status: ${json.status}`);
          console.log(`  Provider: ${json.provider}`);
          console.log(`  Message: ${json.didMessage}`);
          console.log(`  Estimated Time: ${json.estimatedTime}`);
          console.log(`\n  Script Preview:`);
          console.log(`  ${json.script.substring(0, 150)}...`);
          console.log(`\n  Scenes:`);
          json.scenes.forEach((scene) => {
            console.log(`    ${scene.number}. ${scene.name} (${scene.duration})`);
          });
        } catch (e) {
          console.log('Response:', data);
        }
        resolve();
      });
    }).on('error', (e) => {
      console.log(`Error: ${e.message}`);
      resolve();
    });

    req.write(payload);
    req.end();
  });
};

// Run test
console.log('Starting test...\n');
testVideoGeneration().then(() => {
  console.log('\n✅ Test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
