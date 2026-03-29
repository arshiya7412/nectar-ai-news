#!/usr/bin/env node

// Test Synthesia API Key
const synthesiaKey = "PETWcDyGFduZOScEf58xaYGO2fVfcfvr7RoN6oji";

async function testSynthesiaKey() {
  console.log("🔍 Testing Synthesia API Key...\n");

  try {
    // Test with Synthesia's base endpoint
    const response = await fetch("https://api.synthesia.io/v1/videos", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${synthesiaKey}`,
        "Content-Type": "application/json"
      }
    });

    console.log(`Status Code: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);

    const data = await response.json();
    console.log(`Response:`, JSON.stringify(data).substring(0, 300));

    if (response.ok || response.status === 200) {
      console.log("\n✅ VALID KEY! Ready to use.\n");
      return true;
    } else if (response.status === 401) {
      console.log("\n❌ INVALID KEY - Authentication failed\n");
      return false;
    } else if (response.status === 403) {
      console.log("\n❌ FORBIDDEN - Key may not have permission\n");
      return false;
    } else {
      console.log(`\n⚠️ Unexpected status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.error("Error:", error.message);
    return false;
  }
}

testSynthesiaKey();
