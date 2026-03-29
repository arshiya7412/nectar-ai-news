#!/usr/bin/env node

// Test Synthesia API with different endpoints
const synthesiaKey = "PETWcDyGFduZOScEf58xaYGO2fVfcfvr7RoN6oji";

const endpoints = [
  { name: "Videos List", url: "https://api.synthesia.io/v1/videos", method: "GET" },
  { name: "Video Templates", url: "https://api.synthesia.io/v1/templates", method: "GET" },
  { name: "Avatars", url: "https://api.synthesia.io/v1/avatars", method: "GET" },
  { name: "Voices", url: "https://api.synthesia.io/v1/voices", method: "GET" },
  { name: "Auth Check", url: "https://api.synthesia.io/v1/me", method: "GET" },
];

async function testEndpoint(endpoint) {
  try {
    const options = {
      method: endpoint.method,
      headers: {
        "Authorization": `Bearer ${synthesiaKey}`,
        "Content-Type": "application/json"
      }
    };

    const response = await fetch(endpoint.url, options);
    console.log(`${endpoint.name}: ${response.status} ${response.statusText}`);
    
    if (response.status === 200 || response.status === 201) {
      console.log(`  ✅ WORKING!\n`);
      return true;
    } else {
      console.log(`  ❌ Failed\n`);
      return false;
    }
  } catch (error) {
    console.log(`${endpoint.name}: Error - ${error.message}\n`);
    return false;
  }
}

async function testAll() {
  console.log("🔍 Testing Synthesia API with different endpoints...\n");
  
  let success = false;
  for (const endpoint of endpoints) {
    if (await testEndpoint(endpoint)) {
      success = true;
    }
  }
  
  if (!success) {
    console.log("⚠️  No endpoints working with this key.\n");
    console.log("The key format might be incorrect or it's not a Synthesia API key.\n");
  }
}

testAll();
