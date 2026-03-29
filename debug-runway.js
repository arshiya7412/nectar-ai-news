#!/usr/bin/env node

// Debug Runway ML API
const runwayKey = "key_65c809ce8fce1997e4bf2401fb74b112aa190efc4cecb821569aca6ece5e8305bea57a08f7e04eceeb146bf849597061624cae06086bb1f5d1c73a388e0b239a";

async function debugRunwayML() {
  console.log("🔍 Debugging Runway ML API...\n");

  const endpoints = [
    {
      name: "Text to Video",
      url: "https://api.runwayml.com/v1/text_to_video",
      method: "POST",
      authFormat: "key"
    },
    {
      name: "Image to Video",
      url: "https://api.runwayml.com/v1/image_to_video",
      method: "POST",
      authFormat: "key"
    },
    {
      name: "Create Video",
      url: "https://api.runwayml.com/v1/create_video",
      method: "POST",
      authFormat: "key"
    },
    {
      name: "List Models",
      url: "https://api.runwayml.com/v1/models",
      method: "GET",
      authFormat: "bearer"
    }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.name}`);
      console.log(`  URL: ${endpoint.url}`);

      const headers = {
        "Content-Type": "application/json"
      };

      if (endpoint.authFormat === "bearer") {
        headers["Authorization"] = `Bearer ${runwayKey}`;
      } else {
        headers["Authorization"] = runwayKey;
      }

      const options = {
        method: endpoint.method,
        headers: headers
      };

      if (endpoint.method === "POST") {
        options.body = JSON.stringify({
          text: "A cinematic video about breaking news",
          prompt: "Breaking news broadcast",
          duration: 60,
          model: "gen3"
        });
      }

      const response = await fetch(endpoint.url, options);
      const contentType = response.headers.get("content-type");
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        const text = await response.text();
        data = text.substring(0, 100) + (text.length > 100 ? "..." : "");
      }

      console.log(`  Status: ${response.status}`);
      console.log(`  Content-Type: ${contentType}`);
      console.log(`  Response: ${JSON.stringify(data).substring(0, 150)}`);
      
      if (response.ok || response.status === 201) {
        console.log(`  ✅ WORKING!\n`);
      } else {
        console.log(`  ❌ FAILED\n`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}\n`);
    }
  }
}

debugRunwayML();
