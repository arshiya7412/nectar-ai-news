#!/usr/bin/env node

// Test the new Runway ML API key
const newRunwayKey = "key_923313e2cf4c9b3a15043a494207f836146c0ffe036b024acebd2f14c65dfc529edec66726b51d4b8c80c4fc3a0f924d7af0fc8365da04ee31ee03bff4b8b26e";

async function testNewKey() {
  console.log("🔍 Testing NEW Runway ML API Key...\n");

  try {
    const response = await fetch("https://api.runwayml.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": newRunwayKey,
        "Content-Type": "application/json"
      }
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log(`Response:`, JSON.stringify(data).substring(0, 200));

    if (response.ok) {
      console.log("\n✅ NEW KEY IS VALID! Ready to go.\n");
      return true;
    } else if (response.status === 401) {
      console.log("\n❌ Unauthorized - Invalid key\n");
      return false;
    } else {
      console.log(`\n❓ Unknown response\n`);
      return false;
    }
  } catch (error) {
    console.error("Error:", error.message);
    return false;
  }
}

testNewKey();
