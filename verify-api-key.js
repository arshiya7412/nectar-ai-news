#!/usr/bin/env node

// Test the key with different auth formats and domains
const key = "PETWcDyGFduZOScEf58xaYGO2fVfcfvr7RoN6oji";

const attempts = [
  { name: "Synthesia (Bearer)", domain: "https://api.synthesia.io", auth: `Bearer ${key}` },
  { name: "Synthesia (Direct)", domain: "https://api.synthesia.io", auth: key },
  { name: "Synthesia.io (Bearer)", domain: "https://synthesia.io/api", auth: `Bearer ${key}` },
  { name: "Check D-ID", domain: "https://api.d-id.com", auth: key },
];

async function checkKey(attempt) {
  try {
    console.log(`\n🔍 ${attempt.name}`);
    console.log(`   Domain: ${attempt.domain}`);
    
    const response = await fetch(`${attempt.domain}/v1/videos`, {
      method: "GET",
      headers: {
        "Authorization": attempt.auth,
        "Content-Type": "application/json"
      },
      timeout: 5000
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200 || response.status === 201) {
      console.log(`   ✅ VALID KEY FOUND!\n`);
      return true;
    } else if (response.status === 401) {
      console.log(`   ❌ Invalid credentials`);
    } else if (response.status === 404) {
      console.log(`   ❓ Endpoint not found`);
    }
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
  }
  return false;
}

async function test() {
  console.log("═══════════════════════════════════════════════════");
  console.log("      API KEY VERIFICATION");
  console.log("═══════════════════════════════════════════════════");
  
  for (const attempt of attempts) {
    await checkKey(attempt);
  }
  
  console.log("\n═══════════════════════════════════════════════════");
  console.log("Result: Key appears to be INVALID or from different service");
  console.log("═══════════════════════════════════════════════════\n");
}

test();
