#!/usr/bin/env node

// Test API keys validity
const newsKey = "ae4877f8045445f0b076d81c09336c8d";
const heygenKey = "sk-6476751ee2bc4c369decfcddb1fe74c1";

async function testNewsAPI() {
  try {
    console.log("🔍 Testing NewsAPI...");
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=bitcoin&sortBy=publishedAt&language=en&pageSize=5&apiKey=${newsKey}`
    );
    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ NewsAPI WORKING!");
      console.log(`   Status: ${response.status}`);
      console.log(`   Articles found: ${data.articles?.length || 0}`);
      if (data.articles?.length > 0) {
        console.log(`   First: ${data.articles[0].title}`);
      }
    } else {
      console.log("❌ NewsAPI FAILED!");
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error("❌ NewsAPI Error:", error);
  }
}

async function testHeyGen() {
  try {
    console.log("\n🎬 Testing HeyGen API...");
    const response = await fetch("https://api.heygen.com/v1/avatar/list", {
      method: "GET",
      headers: {
        "X-API-KEY": heygenKey,
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ HeyGen WORKING!");
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
    } else {
      console.log("❌ HeyGen FAILED!");
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error("❌ HeyGen Error:", error);
  }
}

async function testLocalAPI() {
  try {
    console.log("\n🌐 Testing local Story Tracker API...");
    const response = await fetch("http://localhost:3000/api/story-tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "bitcoin", limit: 3 })
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Story Tracker WORKING!");
      console.log(`   Articles found: ${data.count}`);
      console.log(`   Is using real API: ${data.articles?.length > 0 ? 'Checking...' : 'Using fallback'}`);
    } else {
      console.log("❌ Story Tracker FAILED!");
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error}`);
    }
  } catch (error) {
    console.error("❌ Story Tracker Error:", error);
  }
}

(async () => {
  await testNewsAPI();
  await testHeyGen();
  await testLocalAPI();
})();
