#!/usr/bin/env node

// Test all APIs
const newsKey = "ae4877f8045445f0b076d81c09336c8d";
const runwayKey = "key_65c809ce8fce1997e4bf2401fb74b112aa190efc4cecb821569aca6ece5e8305bea57a08f7e04eceeb146bf849597061624cae06086bb1f5d1c73a388e0b239a";

async function testNewsAPI() {
  try {
    console.log("\n📰 Testing NewsAPI...");
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=technology&sortBy=publishedAt&language=en&pageSize=3&apiKey=${newsKey}`
    );
    const data = await response.json();
    
    if (response.ok && data.articles?.length > 0) {
      console.log("✅ NewsAPI WORKING!");
      console.log(`   Total articles found: ${data.totalResults}`);
      console.log(`   ${data.articles[0].title}`);
      return true;
    } else {
      console.log("❌ NewsAPI FAILED!");
      return false;
    }
  } catch (error) {
    console.error("❌ NewsAPI Error:", error.message);
    return false;
  }
}

async function testRunwayML() {
  try {
    console.log("\n🎬 Testing Runway ML API...");
    const runwayKey = "key_65c809ce8fce1997e4bf2401fb74b112aa190efc4cecb821569aca6ece5e8305bea57a08f7e04eceeb146bf849597061624cae06086bb1f5d1c73a388e0b239a";
    
    // Try the correct endpoint with proper auth
    const response = await fetch("https://api.runwayml.com/v1/text_to_video", {
      method: "POST",
      headers: {
        "Authorization": runwayKey,  // Use key directly, not Bearer format
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: "A cinematic shot of technology and innovation",
        duration: 60,
        model: "gen3",
        quality: "high"
      })
    });
    const data = await response.json();
    
    console.log(`   Response Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data).substring(0, 200));
    
    if (response.ok || response.status === 201) {
      console.log("✅ Runway ML API VALID!");
      return true;
    } else if (response.status === 401 || response.status === 403) {
      console.log("⚠️ Runway ML Auth Error - trying alternate format...");
      
      // Try with Bearer format
      const response2 = await fetch("https://api.runwayml.com/v1/image_to_video", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${runwayKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: "A cinematic shot of technology",
          duration: 60,
          model: "gen3"
        })
      });
      
      if (response2.ok || response2.status === 201) {
        console.log("✅ Runway ML API VALID (with Bearer)!");
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("❌ Runway ML Error:", error.message);
    return false;
  }
}

async function testLocalAPI() {
  try {
    console.log("\n🌐 Testing Local Story Tracker API...");
    const response = await fetch("http://localhost:3000/api/story-tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "artificial intelligence", limit: 3 })
    });
    const data = await response.json();
    
    if (response.ok && data.count > 0) {
      console.log("✅ Story Tracker WORKING!");
      console.log(`   Articles found: ${data.count}`);
      console.log(`   ${data.articles[0].title}`);
      return true;
    } else {
      console.log("❌ Story Tracker FAILED!");
      return false;
    }
  } catch (error) {
    console.error("❌ Story Tracker Error:", error.message);
    return false;
  }
}

async function testVideoGeneration() {
  try {
    console.log("\n🎥 Testing Video Generation API...");
    const response = await fetch("http://localhost:3000/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Breaking news about quantum computing" })
    });
    const data = await response.json();
    
    if (response.ok && data.id) {
      console.log("✅ Video Generator WORKING!");
      console.log(`   Reel ID: ${data.id}`);
      console.log(`   Status: ${data.runwayStatus || data.status}`);
      console.log(`   Message: ${data.runwayMessage || 'Video queued'}`);
      if (data.script) {
        console.log(`   Script length: ${data.script.length} chars`);
      }
      return true;
    } else {
      console.log("❌ Video Generator FAILED!");
      return false;
    }
  } catch (error) {
    console.error("❌ Video Generator Error:", error.message);
    return false;
  }
}

(async () => {
  console.log("═══════════════════════════════════════════════════════");
  console.log("         NECTAR AI - API INTEGRATION TEST");
  console.log("═══════════════════════════════════════════════════════");
  
  const results = {
    newsAPI: await testNewsAPI(),
    runwayML: await testRunwayML(),
    storyTracker: await testLocalAPI(),
    videoGenerator: await testVideoGeneration()
  };

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("                      SUMMARY");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`📰 NewsAPI:           ${results.newsAPI ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🎬 Runway ML:         ${results.runwayML ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🔍 Story Tracker:     ${results.storyTracker ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🎥 Video Generator:   ${results.videoGenerator ? '✅ WORKING' : '❌ FAILED'}`);
  
  const allWorking = Object.values(results).every(r => r);
  console.log(`\n${allWorking ? '✅ ALL SYSTEMS GO!' : '⚠️ SOME SYSTEMS NEED ATTENTION'}`);
  console.log("═══════════════════════════════════════════════════════\n");
})();
