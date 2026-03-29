import http from 'http';

console.log('🔐 Testing Authentication Endpoints...\n');

// Test Sign Up
const testSignUp = () => {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      email: "user@example.com",
      password: "password123",
      type: "Investor",
      interests: ["Markets", "Technology"],
      language: "English"
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
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
        console.log(`✅ Sign Up - Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(`   User ID: ${json.user.id}`);
          console.log(`   Email: ${json.user.email}`);
          console.log(`   Type: ${json.user.type}\n`);
          resolve(json.user.id);
        } catch (e) {
          console.log('   Response:', data);
          resolve();
        }
      });
    }).on('error', (e) => {
      console.log(`❌ Error: ${e.message}`);
      resolve();
    });

    req.write(payload);
    req.end();
  });
};

// Test Login
const testLogin = () => {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      email: "user@example.com",
      password: "password123"
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
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
        console.log(`✅ Login - Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(`   User ID: ${json.user.id}`);
          console.log(`   Token: ${json.token}\n`);
          resolve(json.user.id);
        } catch (e) {
          console.log('   Response:', data);
          resolve();
        }
      });
    }).on('error', (e) => {
      console.log(`❌ Error: ${e.message}`);
      resolve();
    });

    req.write(payload);
    req.end();
  });
};

// Test Get Profile
const testGetProfile = (userId) => {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ userId });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/user/profile',
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
        console.log(`✅ Get Profile - Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(`   User ID: ${json.id}`);
          console.log(`   Name: ${json.name}`);
          console.log(`   Email: ${json.email}`);
          console.log(`   Type: ${json.type}\n`);
          resolve();
        } catch (e) {
          console.log('   Response:', data);
          resolve();
        }
      });
    }).on('error', (e) => {
      console.log(`❌ Error: ${e.message}`);
      resolve();
    });

    req.write(payload);
    req.end();
  });
};

// Run all tests
(async () => {
  console.log('🚀 Starting Authentication Tests...\n');
  const userId = await testSignUp();
  await testLogin();
  if (userId) {
    await testGetProfile(userId);
  }
  console.log('✅ All Authentication Tests Completed!');
  process.exit(0);
})();
