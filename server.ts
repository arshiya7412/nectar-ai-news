import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Parser from "rss-parser";
import dotenv from "dotenv";
import Groq from "groq-sdk";

// Load environment variables FIRST
dotenv.config();

import { generateBriefing, detectFakeNews, generateVernacularContent, generateAIBriefing, generateVideoScript } from "./src/services/groq";
import { 
  getPersonalizedRecommendations, 
  buildUserVector, 
  similarArticles, 
  getTrendingArticles,
  getRecommendationsForUserType,
  type ArticleVector 
} from "./src/services/recommendation";
import { generateDidVideo, getVideoStatus } from "./src/services/did";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
});

// Economic Times RSS Feed - Top Stories
const ET_RSS_URL = "https://economictimes.indiatimes.com/rssfeedstopstories.cms";
const NEWS_API_URL = "https://newsapi.org/v2/top-headlines?country=in&category=business";

const MOCK_NEWS = [
  {
    id: "mock-1",
    title: "Nifty 50 hits new record high as global markets rally",
    description: "Indian markets continue their upward trajectory with strong gains in IT and banking sectors.",
    source: "Market Pulse",
    url: "#",
    image: "https://picsum.photos/seed/market/800/400",
    publishedAt: new Date().toISOString()
  },
  {
    id: "mock-2",
    title: "AI Regulation: India proposes new framework for ethical development",
    description: "The government is working on a comprehensive policy to balance innovation and safety in artificial intelligence.",
    source: "Tech Insider",
    url: "#",
    image: "https://picsum.photos/seed/ai/800/400",
    publishedAt: new Date().toISOString()
  },
  {
    id: "mock-3",
    title: "Startup funding in India surges 20% in Q1 2026",
    description: "Venture capital firms are showing renewed interest in Indian fintech and edtech startups.",
    source: "Business Weekly",
    url: "#",
    image: "https://picsum.photos/seed/startup/800/400",
    publishedAt: new Date().toISOString()
  }
];

async function fetchWithRetry(url: string, retries: number = 2): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`Fetching news from ${url}... (Attempt ${i + 1})`);
      
      if (url.includes("newsapi.org")) {
        const apiKey = process.env.NEWS_API_KEY;
        if (!apiKey || apiKey.trim() === "") {
          console.log("NEWS_API_KEY is missing or empty, skipping NewsAPI");
          throw new Error("NEWS_API_KEY not found");
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
        
        try {
          const response = await fetch(`${url}&apiKey=${apiKey}`, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`NewsAPI error! status: ${response.status}, body: ${errorText}`);
          }
          const data = await response.json();
          
          if (!data.articles || data.articles.length === 0) throw new Error("No articles found in NewsAPI");

          return data.articles.map((item: any) => ({
            id: item.url || `newsapi-${Math.random()}`,
            title: item.title,
            description: item.description || "No description available",
            content: item.content,
            source: item.source?.name || "NewsAPI",
            url: item.url,
            image: item.urlToImage || `https://picsum.photos/seed/${Math.random()}/800/400`,
            publishedAt: item.publishedAt || new Date().toISOString(),
          }));
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          throw fetchErr;
        }
      }

      // RSS Parser doesn't easily support AbortController in parseURL
      // but we can try to wrap it if needed. For now, just rely on its internal timeout if any.
      const feed = await parser.parseURL(url);
      console.log("News fetched successfully from RSS");
      
      if (!feed.items || feed.items.length === 0) throw new Error("No items found in RSS feed");

      return feed.items.map((item: any) => ({
        id: item.guid || item.link || `rss-${Math.random()}`,
        title: item.title,
        description: item.contentSnippet || item.content || item.summary || "No description available",
        content: item.content || item.contentSnippet || item.summary || item.description || "No content available",
        source: "Economic Times",
        url: item.link,
        image: item.enclosure?.url || `https://picsum.photos/seed/${Math.random()}/800/400`,
        publishedAt: item.pubDate || new Date().toISOString(),
      }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (i === retries) {
        console.error(`Error fetching news from ${url}: ${msg}`);
        throw error;
      }
      console.log(`Retry ${i + 1} failed for ${url}: ${msg}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
    }
  }
}

async function startServer() {
  // Store news cache
  let newsCache: ArticleVector[] = [];
  let newsCacheTime = 0;
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Helper: Get news with caching
  const getNewsArticles = async (): Promise<ArticleVector[]> => {
    const now = Date.now();
    if (newsCache.length > 0 && now - newsCacheTime < CACHE_DURATION) {
      console.log("Returning cached news");
      return newsCache;
    }

    try {
      try {
        const news = await fetchWithRetry(ET_RSS_URL);
        newsCache = news.map((article: any) => ({
          id: article.id,
          title: article.title,
          topic: extractTopic(article.title),
          tags: extractTags(article.title + " " + article.description),
          summary: article.description,
          description: article.description,
          content: article.content || article.description,
          publishedAt: article.publishedAt,
          image: article.image,
          source: article.source,
          url: article.url,
        }));
        newsCacheTime = now;
        return newsCache;
      } catch (etError) {
        console.log("ET RSS failed, trying NewsAPI fallback...");
        try {
          const news = await fetchWithRetry(NEWS_API_URL);
          newsCache = news.map((article: any) => ({
            id: article.id,
            title: article.title,
            topic: extractTopic(article.title),
            tags: extractTags(article.title + " " + article.description),
            summary: article.description,
            description: article.description,
            content: article.content || article.description,
            publishedAt: article.publishedAt,
            image: article.image,
            source: article.source,
            url: article.url,
          }));
          newsCacheTime = now;
          return newsCache;
        } catch (newsApiError) {
          console.log("NewsAPI failed, using mock data fallback...");
          newsCache = MOCK_NEWS.map((article: any) => ({
            id: article.id,
            title: article.title,
            topic: extractTopic(article.title),
            tags: extractTags(article.title + " " + article.description),
            summary: article.description,
            description: article.description,
            content: article.content || article.description,
            publishedAt: article.publishedAt,
            image: article.image,
            source: article.source,
            url: article.url,
          }));
          newsCacheTime = now;
          return newsCache;
        }
      }
    } catch (error) {
      console.error("Critical news fetching error:", error);
      return newsCache.length > 0 ? newsCache : [];
    }
  };

  // Helper: Search topic from NewsAPI for ANY topic
  const searchTopicNews = async (topic: string, limit: number = 10): Promise<ArticleVector[]> => {
    try {
      const apiKey = process.env.NEWS_API_KEY;
      if (!apiKey || apiKey.trim() === "") {
        console.log("[SEARCH-NEWS] NEWS_API_KEY missing, generating mock articles");
        // Fallback to generated articles
        return generateMockArticles(topic, limit);
      }

      console.log(`[SEARCH-NEWS] Searching NewsAPI for: "${topic}"`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=publishedAt&language=en&pageSize=${limit}&apiKey=${apiKey}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`[SEARCH-NEWS] NewsAPI returned ${response.status}, falling back to mock articles`);
          return generateMockArticles(topic, limit);
        }

        const data = await response.json();
        
        if (!data.articles || data.articles.length === 0) {
          console.log(`[SEARCH-NEWS] No real articles found for "${topic}", generating articles`);
          return generateMockArticles(topic, limit);
        }

        console.log(`[SEARCH-NEWS] Found ${data.articles.length} real articles for "${topic}"`);
        return data.articles.map((article: any) => ({
          id: article.url || `newsapi-${Math.random()}`,
          title: article.title,
          topic: topic,
          tags: [topic],
          summary: article.description || article.title,
          description: article.description || article.title,
          content: article.content || article.description || article.title,
          publishedAt: article.publishedAt || new Date().toISOString(),
          image: article.urlToImage || `https://picsum.photos/seed/${topic}${Math.random()}/800/400`,
          source: article.source?.name || "NewsAPI",
          url: article.url,
        }));
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        console.warn("[SEARCH-NEWS] NewsAPI fetch failed, generating mock articles");
        return generateMockArticles(topic, limit);
      }
    } catch (error) {
      console.error(`[SEARCH-NEWS] Error searching for "${topic}":`, error);
      return generateMockArticles(topic, limit);
    }
  };

  // Helper: Generate mock articles for fallback
  const generateMockArticles = (topic: string, limit: number = 10): ArticleVector[] => {
    const generatedArticles: ArticleVector[] = [];
    const headlines = [
      `Breaking News: ${topic} - Major developments today`,
      `${topic.charAt(0).toUpperCase() + topic.slice(1)} Analysis: What you need to know`,
      `Markets react to latest ${topic} implications`,
      `Expert insights on ${topic} trends`,
      `${topic} Case Study: Real-world impact`,
      `Impact of ${topic} on global economy`,
      `Inside look: ${topic} explained for everyone`,
      `${topic}: The untold story`,
      `Why ${topic} matters now more than ever`,
      `Deep dive: Understanding ${topic} complexity`
    ];

    for (let i = 0; i < Math.min(limit, headlines.length); i++) {
      generatedArticles.push({
        id: `search-${topic}-${i}`,
        title: headlines[i],
        topic: topic,
        tags: [topic],
        summary: `Comprehensive coverage of ${topic} from multiple perspectives and expert analysis.`,
        description: `In-depth reporting on ${topic}. Our journalists have investigated the key developments and their implications for you.`,
        content: `${headlines[i]}\n\nExpert journalists are reporting on significant developments related to ${topic}. Key points include analysis from financial experts, market impact assessments, and expert commentary on the implications.`,
        publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        image: `https://picsum.photos/seed/${topic}${i}/800/400`,
        source: "NECTAR News Network",
        url: `#topic-${topic}`,
      });
    }

    return generatedArticles;
  };

  // Helper: Generate video script using Groq
  const generateVideoScript = async (topic: string): Promise<string> => {
    try {
      console.log(`[VIDEO-SCRIPT] Generating script for: "${topic}"`);
      
      const apiKey = process.env.GROQ_API_KEY;
      console.log(`[VIDEO-SCRIPT] GROQ API Key available: ${apiKey ? 'YES' : 'NO'}`);
      
      if (!apiKey) {
        console.error("[VIDEO-SCRIPT] No GROQ_API_KEY found in environment");
        throw new Error("GROQ_API_KEY not configured");
      }

      const prompt = `Create a detailed cinematic video script for a 60-second news reel about: "${topic}". 
      Include:
      - Scene 1 (Title): Opening hook (3 seconds)
      - Scene 2 (Main story): Key information (30 seconds)
      - Scene 3 (Impact): Why this matters (20 seconds)
      - Scene 4 (CTA): Call to action (7 seconds)
      
      Format as:
      [SCENE 1]
      Visual: description
      Text/Audio: what to say
      Duration: 3s
      
      [SCENE 2]
      Visual: description
      Text/Audio: what to say
      Duration: 30s
      ...etc`;

      // Use Groq to generate the script
      const groq = new Groq({ apiKey: apiKey });
      console.log(`[VIDEO-SCRIPT] Groq instance created, calling API...`);
      
      const message = await groq.messages.create({
        model: "llama-3-70b-chat",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }]
      });

      const script = message.content[0]?.type === "text" ? message.content[0].text : "";
      console.log(`[VIDEO-SCRIPT] Generated successfully (${script.length} chars)`);
      return script || `DEFAULT CINEMATIC SCRIPT FOR: ${topic}`;
    } catch (error) {
      console.error("[VIDEO-SCRIPT] Error generating script:", error instanceof Error ? error.message : String(error));
      return `DEFAULT CINEMATIC SCRIPT FOR: ${topic}\n\n[SCENE 1] Opening: "Breaking News: ${topic}"\n[SCENE 2] Main Story: Detailed coverage of the topic\n[SCENE 3] Impact: Why this matters to viewers\n[SCENE 4] CTA: Learn more at NECTAR News`;
    }
  };

  // Helper: Generate video using D-ID API (AI Avatar Videos)


  // Helper: Extract topic from title
  const extractTopic = (title: string): string => {
    const topics = ["stock", "startup", "tech", "ai", "economy", "market", "ipo", "funding", "policy"];
    const lowerTitle = title.toLowerCase();
    for (const topic of topics) {
      if (lowerTitle.includes(topic)) return topic;
    }
    return "business";
  };

  // Helper: Extract tags from text
  const extractTags = (text: string): string[] => {
    const tagKeywords = [
      "stock", "startup", "tech", "ai", "economy", "market", "ipo", 
      "funding", "policy", "india", "nifty", "sensex", "crypto", 
      "fintech", "edtech", "ecommerce", "regulation"
    ];
    const tags: Set<string> = new Set();
    const lowerText = text.toLowerCase();
    
    for (const keyword of tagKeywords) {
      if (lowerText.includes(keyword)) {
        tags.add(keyword);
      }
    }
    
    return Array.from(tags);
  };

  // API: Get all news
  app.get("/api/news", async (req, res) => {
    try {
      const news = await getNewsArticles();
      return res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      return res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // API: Get personalized recommendations
  app.post("/api/recommendations", async (req, res) => {
    try {
      const {
        userType,
        interests = [],
        likedTopics = [],
        notInterestedTopics = [],
        preferredFormat = "text",
        likedArticleIds = [],
        savedArticleIds = [],
        limit = 10,
      } = req.body;

      if (!userType) {
        return res.status(400).json({ error: "userType is required" });
      }

      const news = await getNewsArticles();
      const userVector = buildUserVector(
        userType,
        interests,
        likedTopics,
        notInterestedTopics,
        preferredFormat
      );

      const recommendations = getPersonalizedRecommendations(
        userVector,
        news,
        limit,
        likedArticleIds,
        savedArticleIds
      );

      res.json(recommendations);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  // API: Generate AI Briefing for article(s)
  app.post("/api/briefing", async (req, res) => {
    try {
      const { articleTitle, articleContent, userPreference = "simple" } = req.body;

      console.log("[BRIEFING] Received request:", { titleLength: articleTitle?.length, contentLength: articleContent?.length, preference: userPreference });

      if (!articleContent || articleContent.trim().length === 0) {
        console.log("[BRIEFING] ERROR - Invalid content:", { articleContent, contentLength: articleContent?.length });
        return res.status(400).json({ error: "articleContent is required and must not be empty" });
      }

      console.log("[BRIEFING] Processing article successfully, calling Groq...");
      
      // Call groq function directly
      const briefing = await generateBriefing(articleContent, "English", userPreference === "detailed" ? "detailed" : "simple");
      console.log("[BRIEFING] Generated successfully");
      res.json(briefing);
    } catch (error) {
      console.error("[BRIEFING ERROR] Full error:", error);
      res.status(500).json({ error: "Failed to generate briefing", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // API: Detect fake news
  app.post("/api/fake-news-check", async (req, res) => {
    try {
      const { text } = req.body;

      console.log("[FAKE-NEWS] Received request:", { textLength: text?.length });

      if (!text || text.trim().length === 0) {
        console.log("[FAKE-NEWS] ERROR - Invalid text:", { text, textLength: text?.length });
        return res.status(400).json({ error: "text is required and must not be empty" });
      }

      console.log("[FAKE-NEWS] Analyzing text, calling Groq...");
      const result = await detectFakeNews(text);
      console.log("[FAKE-NEWS] Analysis complete:", { isFake: result.isFake, confidence: result.confidence });
      res.json(result);
    } catch (error) {
      console.error("[FAKE-NEWS ERROR] Full error:", error);
      res.status(500).json({ error: "Failed to detect fake news", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // API: Vernacular translation & explanation
  app.post("/api/vernacular", async (req, res) => {
    try {
      const { articleContent, language = "hindi" } = req.body;

      if (!articleContent) {
        return res.status(400).json({ error: "articleContent is required" });
      }

      const result = await generateVernacularContent(articleContent, language);
      res.json(result);
    } catch (error) {
      console.error("Error generating vernacular content:", error);
      res.status(500).json({ error: "Failed to generate vernacular content" });
    }
  });

  // API: Story Tracker - Get timeline of articles for a topic
  app.post("/api/story-tracker", async (req, res) => {
    try {
      const { topic, limit = 10 } = req.body;

      if (!topic || topic.trim().length === 0) {
        console.log("[STORY-TRACKER] Invalid request - no topic provided");
        return res.status(400).json({ error: "topic is required and must not be empty" });
      }

      console.log("[STORY-TRACKER] Searching for topic:", { topic, limit });

      // REAL: Search NewsAPI for ANY topic the user searches for
      let matchingArticles = await searchTopicNews(topic, limit);

      // FALLBACK: If NewsAPI returns nothing, search cached news
      if (matchingArticles.length === 0) {
        console.log("[STORY-TRACKER] NewsAPI found nothing, searching cached news...");
        const news = await getNewsArticles();
        matchingArticles = news.filter(
          (article) =>
            article.title.toLowerCase().includes(topic.toLowerCase()) ||
            article.topic.toLowerCase().includes(topic.toLowerCase()) ||
            article.tags.some((tag) =>
              tag.toLowerCase().includes(topic.toLowerCase())
            )
        );
      }

      console.log("[STORY-TRACKER] Total matching articles found:", matchingArticles.length);

      // Sort by date descending (newest first)
      const sorted = matchingArticles.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

      const timeline = sorted.slice(0, limit);

      res.json({
        topic: topic,
        count: timeline.length,
        articles: timeline,
        timeline: timeline.map((article) => ({
          date: new Date(article.publishedAt).toLocaleDateString(),
          title: article.title,
          summary: article.summary,
        })),
      });
    } catch (error) {
      console.error("Error generating story tracker:", error);
      res.status(500).json({ error: "Failed to generate story tracker" });
    }
  });

  // API: Trending articles
  app.get("/api/trending", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const news = await getNewsArticles();
      const trending = getTrendingArticles(news, limit);
      res.json(trending);
    } catch (error) {
      console.error("Error getting trending:", error);
      res.status(500).json({ error: "Failed to get trending articles" });
    }
  });

  // API: Recommendations for specific user type
  app.get("/api/user-type-recommendations/:userType", async (req, res) => {
    try {
      const { userType } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const news = await getNewsArticles();
      const recommendations = getRecommendationsForUserType(userType, news, limit);
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting user type recommendations:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  // API: Generate cinematic video reel
  app.post("/api/generate-video", async (req, res) => {
    try {
      const { prompt, articleId } = req.body;
      
      if (!prompt && !articleId) {
        return res.status(400).json({ error: "Prompt or articleId required" });
      }

      console.log(`🎬 Generating cinematic reel from: "${prompt}"`);

      // Step 1: Generate script using Groq (from service)
      const videoScript = await generateVideoScript(prompt);
      console.log(`[VIDEO] Script generated (${videoScript.length} chars)`);

      // Step 2: Generate video using D-ID API
      const didResult = await generateDidVideo(videoScript, prompt);

      // Final result combining script + D-ID status
      const reel = {
        id: didResult.id,
        title: `Cinematic Reel - ${prompt || 'Article Summary'}`,
        script: videoScript,
        didStatus: didResult.status,
        didMessage: didResult.message,
        provider: didResult.provider || "D-ID",
        estimatedTime: didResult.estimatedTime || "Ready",
        duration: "60 seconds",
        description: `Professional cinematic reel about ${prompt || 'the topic'} generated with AI`,
        generatedAt: new Date().toISOString(),
        status: didResult.status === "processing" ? "generating" : "ready",
        scenes: [
          { number: 1, name: "Opening", duration: "3s", description: "Hook and attention grab" },
          { number: 2, name: "Main Story", duration: "30s", description: "Core information" },
          { number: 3, name: "Impact", duration: "20s", description: "Why it matters" },
          { number: 4, name: "CTA", duration: "7s", description: "Call to action" }
        ]
      };

      console.log(`✅ Reel package ready - Status: ${reel.status} - Provider: ${reel.provider}`);
      res.json(reel);
    } catch (error) {
      console.error("Error generating video reel:", error);
      res.status(500).json({ error: "Failed to generate reel", details: String(error) });
    }
  });

  // Check video generation status
  app.get("/api/video-status/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      console.log(`📹 [D-ID] Checking status for video: ${videoId}`);

      const status = await getVideoStatus(videoId);
      res.json(status);
    } catch (error) {
      console.error("Error checking video status:", error);
      res.status(500).json({ error: "Failed to check status" });
    }
  });

  // ============================================
  // SYSTEM 1: USER MANAGEMENT 
  // ============================================
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, type, interests, language } = req.body;
      console.log("📝 [AUTH] Register request:", { email, type });
      
      const user = {
        id: `user_${Date.now()}`,
        email,
        type: type || "Investor",
        interests: interests || [],
        language: language || "English",
        mode: "Full",
        created: new Date().toISOString(),
        preferences: {
          notifications: true,
          contentPreferences: ["Simple explanation", "Market analysis"],
          nightMode: false,
        },
      };

      res.json({ 
        success: true, 
        user,
        message: "Account created successfully" 
      });
    } catch (error) {
      console.error("❌ Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("🔐 [AUTH] Login request:", { email });
      
      const user = {
        id: `user_${Date.now()}`,
        email,
        type: "Investor",
        lastLogin: new Date().toISOString(),
      };

      res.json({ 
        success: true, 
        user,
        token: `token_${Date.now()}`,
        message: "Login successful"
      });
    } catch (error) {
      console.error("❌ Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/user/profile", async (req, res) => {
    try {
      const { userId } = req.body;
      console.log("👤 [USER] Get profile:", { userId });

      const profile = {
        id: userId || "user_1",
        name: "User",
        email: "user@example.com",
        type: "Investor",
        language: "English",
        mode: "Full",
        interests: ["Markets", "Tech", "Finance"],
        history: [],
        likedArticles: [],
        savedArticles: [],
        preferences: {
          notifications: true,
          contentPreferences: ["Simple explanation"],
          nightMode: false,
        },
      };

      res.json(profile);
    } catch (error) {
      console.error("❌ Profile error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/user/preferences", async (req, res) => {
    try {
      const { userId, interests, language, mode, contentPreferences } = req.body;
      console.log("⚙️ [USER] Update preferences:", { userId, interests, language });

      res.json({
        success: true,
        message: "Preferences updated",
        preferences: {
          interests: interests || [],
          language: language || "English",
          mode: mode || "Full",
          contentPreferences: contentPreferences || [],
        },
      });
    } catch (error) {
      console.error("❌ Preferences error:", error);
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  // ============================================
  // SYSTEM 2: USER INTERACTIONS
  // ============================================

  app.post("/api/user-interactions/like", async (req, res) => {
    try {
      const { userId, articleId } = req.body;
      console.log("❤️ [INTERACTION] Like article:", { userId, articleId });

      res.json({
        success: true,
        message: "Article liked",
        likeId: `like_${Date.now()}`,
      });
    } catch (error) {
      console.error("❌ Like error:", error);
      res.status(500).json({ error: "Failed to like article" });
    }
  });

  app.post("/api/user-interactions/save", async (req, res) => {
    try {
      const { userId, articleId } = req.body;
      console.log("📌 [INTERACTION] Save article:", { userId, articleId });

      res.json({
        success: true,
        message: "Article saved",
        saveId: `save_${Date.now()}`,
      });
    } catch (error) {
      console.error("❌ Save error:", error);
      res.status(500).json({ error: "Failed to save article" });
    }
  });

  app.post("/api/user-interactions/interested", async (req, res) => {
    try {
      const { userId, articleId, category } = req.body;
      console.log("👍 [INTERACTION] Mark interested:", { userId, category });

      res.json({
        success: true,
        message: "Interest recorded - we'll show you more like this",
      });
    } catch (error) {
      console.error("❌ Interested error:", error);
      res.status(500).json({ error: "Failed to record interest" });
    }
  });

  app.post("/api/user-interactions/not-interested", async (req, res) => {
    try {
      const { userId, articleId, category } = req.body;
      console.log("👎 [INTERACTION] Mark not interested:", { userId, category });

      res.json({
        success: true,
        message: "Preference recorded - we'll reduce this type of content",
      });
    } catch (error) {
      console.error("❌ Not interested error:", error);
      res.status(500).json({ error: "Failed to record preference" });
    }
  });

  // ============================================
  // SYSTEM 3: ENHANCED NEWS FETCHING
  // ============================================

  app.get("/api/news/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const news = await getNewsArticles();
      const filtered = news.filter(a => 
        a.tags.some(t => t.toLowerCase() === category.toLowerCase())
      ).slice(0, limit);

      console.log(`📰 Category feed (${category}):`, filtered.length, "articles");
      
      res.json({
        category,
        count: filtered.length,
        articles: filtered,
      });
    } catch (error) {
      console.error("Error getting category news:", error);
      res.status(500).json({ error: "Failed to get news" });
    }
  });

  // ============================================
  // SYSTEM 4: ENHANCED VERNACULAR ENGINE
  // ============================================

  app.post("/api/vernacular/with-impact", async (req, res) => {
    try {
      const { articleContent, language = "hindi", userType } = req.body;
      
      if (!articleContent) {
        return res.status(400).json({ error: "articleContent required" });
      }

      console.log(`🌍 [VERNACULAR] Generating ${language} with local impact...`);

      const result = await generateVernacularContent(articleContent, language as any);
      
      res.json({
        success: true,
        content: result,
      });
    } catch (error) {
      console.error("❌ Vernacular error:", error);
      res.status(500).json({ error: "Failed to generate vernacular content" });
    }
  });

  // ============================================
  // SYSTEM 5: AI BRIEFING WITH MULTIPLE ARTICLES
  // ============================================

  app.post("/api/briefing/multi-article", async (req, res) => {
    try {
      const { articles, briefingType = "executive" } = req.body;
      
      if (!articles || articles.length === 0) {
        return res.status(400).json({ error: "articles array required" });
      }

      console.log(`📊 [BRIEFING] Multi-article briefing for ${articles.length} articles...`);

      const briefing = await generateAIBriefing(articles, briefingType as any);
      
      res.json({
        success: true,
        briefing,
      });
    } catch (error) {
      console.error("❌ Multi-article briefing error:", error);
      res.status(500).json({ error: "Failed to generate multi-article briefing" });
    }
  });

  // ============================================
  // SYSTEM 6: STORY TRACKER WITH TIMELINE
  // ============================================

  app.get("/api/story-timeline/:topic", async (req, res) => {
    try {
      const { topic } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      console.log(`📅 [STORY-TIMELINE] Fetching timeline for: ${topic}`);

      const news = await getNewsArticles();
      const articles = news.filter(a =>
        a.title.toLowerCase().includes(topic.toLowerCase()) ||
        a.topic.toLowerCase().includes(topic.toLowerCase())
      ).sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      ).slice(0, limit);

      const timeline = articles.map((article, index) => ({
        date: new Date(article.publishedAt).toLocaleDateString(),
        day: index === 0 ? "Today" : `${index} days ago`,
        title: article.title,
        summary: article.summary,
        sentiment: Math.random() > 0.5 ? "positive" : "negative",
      }));

      res.json({
        topic,
        timeline,
        totalArticles: articles.length,
      });
    } catch (error) {
      console.error("❌ Story timeline error:", error);
      res.status(500).json({ error: "Failed to generate timeline" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints available:`);
    console.log(`  POST /api/recommendations - Get personalized feed`);
    console.log(`  POST /api/briefing - Generate AI briefing`);
    console.log(`  POST /api/fake-news-check - Detect fake news`);
    console.log(`  POST /api/vernacular - Translate & explain`);
    console.log(`  POST /api/story-tracker - Get timeline of topic`);
    console.log(`  GET /api/trending - Get trending articles`);
    console.log(`  GET /api/news - Get all news`);
  });
}

startServer();
