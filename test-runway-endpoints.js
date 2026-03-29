#!/usr/bin/env node

// Test different Runway ML endpoints with new key
const newRunwayKey = "key_923313e2cf4c9b3a15043a494207f836146c0ffe036b024acebd2f14c65dfc529edec66726b51d4b8c80c4fc3a0f924d7af0fc8365da04ee31ee03bff4b8b26e";

const endpoints = [
  { name: "List Models", url: "https://api.runwayml.com/v1/models", method: "GET" },
  { name: "Create Video (POST)", url: "https://api.runwayml.com/v1/video_requests", method: "POST" },
  { name: "Text to Video", url: "https://api.runwayml.com/v1/text_to_video", method: "POST" },
  { name: "List Videos", url: "https://api.runwayml.com/v1/videos", method: "GET" },
  { name: "Inference", url: "https://api.runwayml.com/v1/inferences", method: "POST" },
];

async function testEndpoint(endpoint) {
  try {
    const opts = {
      method: endpoint.method,
      headers: {
        "Authorization": newRunwayKey,
        "Content-Type": "application/json"
      }
    };

    if (endpoint.method === "POST") {
      opts.body = JSON.stringify({
        model: "gen3",
        text: "Breaking news cinematic video"
      });
    }

    const response = await fetch(endpoint.url, opts);
    console.log(`✓ ${endpoint.name}`);
    console.log(`  Status: ${response.status}`);
    
    if (response.status >= 200 && response.status < 400) {
      console.log(`  ✅ SUCCESS\n`);
      return true;
    } else {
      console.log(`  ❌ Failed\n`);
      return false;
    }
  } catch (error) {
    console.log(`✗ ${endpoint.name}`);
    console.log(`  Error: ${error.message}\n`);
    return false;
  }
}

async function testAll() {
  console.log("🔍 Testing Runway ML Endpoints with NEW Key...\n");
  
  let success = false;
  for (const endpoint of endpoints) {
    if (await testEndpoint(endpoint)) {
      success = true;
    }
  }
  
  if (success) {
    console.log("✅ Found working endpoint!");
  } else {
    console.log("⚠️  No endpoints responded successfully");
    console.log("The key might be for a different Runway service.\n");
  }
}

testAll();
