import Groq from "groq-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_MODEL = "llama-3-70b-chat";

interface BriefingResponse {
  headline: string;
  tldr: string;
  keyPoints: string[];
  whyItMatters: string;
  localImpact: string;
  winnersLosers: {
    winners: string[];
    losers: string[];
  };
  sentiment: "positive" | "negative" | "neutral";
}

interface FakeNewsResult {
  isFake: boolean;
  confidence: number;
  reasoning: string;
  sourceAnalysis: string;
}

interface VernacularResult {
  simpleEnglish: string;
  localLanguage: string;
  romanized: string;
  localImpact: string;
  commonPeopleImpact: string;
}

interface TranslationResult {
  language: string;
  translation: string;
}

// Summarize & brief article using Groq
export const generateBriefing = async (
  articleContent: string,
  language: string = "English",
  userPreference: "simple" | "detailed" = "simple"
): Promise<BriefingResponse> => {
  try {
    const prompt =
      userPreference === "simple"
        ? `You are a professional news analyst. Analyze this business news article and provide:
1. A concise headline
2. A one-liner TLDR (Too Long; Didn't Read)
3. 3-4 key bullet points
4. Why this matters (in 1 sentence)
5. Local impact for India (in 1-2 sentences)
6. Winners (companies/people benefiting) and Losers (negatively affected)
7. Overall sentiment: positive, negative, or neutral

Format your response as JSON with these exact keys:
{
  "headline": "...",
  "tldr": "...",
  "keyPoints": ["...", "...", "..."],
  "whyItMatters": "...",
  "localImpact": "...",
  "winnersLosers": {
    "winners": ["...", "..."],
    "losers": ["...", "..."]
  },
  "sentiment": "positive|negative|neutral"
}

Article:
${articleContent}`
        : `You are a professional journalist and analyst. Provide a detailed analysis of this business news article:

1. Detailed Headline
2. Executive Summary (2-3 paragraphs)
3. 5-6 detailed bullet points
4. Why this matters (comprehensive)
5. Local impact for India (detailed)
6. Winners and Losers with analysis
7. Market implications
8. Practical implications for everyday people
9. Sentiment analysis

Format as JSON:
{
  "headline": "...",
  "tldr": "...",
  "keyPoints": ["...", "...", "...", "..."],
  "whyItMatters": "...",
  "localImpact": "...",
  "winnersLosers": {
    "winners": ["...", "..."],
    "losers": ["...", "..."]
  },
  "sentiment": "positive|negative|neutral"
}

Article:
${articleContent}`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const briefing = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return briefing as BriefingResponse;
  } catch (error) {
    console.error("❌ Error generating briefing:", error);
    // Return fallback
    return {
      headline: "Market Update",
      tldr: "Business news event with market implications",
      keyPoints: ["Development noted", "Market implications", "Sector impact"],
      whyItMatters: "This affects business landscape",
      localImpact: "India's economy and markets impacted",
      winnersLosers: {
        winners: ["Technology", "Finance"],
        losers: ["Traditional sectors"],
      },
      sentiment: "neutral",
    };
  }
};

// Detect fake news using Groq
export const detectFakeNews = async (newsText: string): Promise<FakeNewsResult> => {
  try {
    const prompt = `You are a misinformation expert and fact-checker. Analyze this news claim and:

1. Determine if it's likely FAKE or REAL based on plausibility, consistency with known facts, and logical reasoning
2. Provide confidence level (0-100)
3. Explain your reasoning in detail
4. Analyze potential sources and verify against reliable news sources

Format as JSON:
{
  "isFake": true|false,
  "confidence": 85,
  "reasoning": "...",
  "sourceAnalysis": "..."
}

News Claim:
${newsText}`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.5,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return result as FakeNewsResult;
  } catch (error) {
    console.error("❌ Error detecting fake news:", error);
    // Fallback response
    return {
      isFake: false,
      confidence: 50,
      reasoning: "Unable to fully verify - limited data",
      sourceAnalysis: "Appears plausible pending verification",
    };
  }
};

// Translate to local language
export const translateToLanguage = async (
  text: string,
  language: "hindi" | "tamil" | "telugu" | "bengali" = "hindi"
): Promise<TranslationResult> => {
  try {
    const languageName = {
      hindi: "Hindi",
      tamil: "Tamil",
      telugu: "Telugu",
      bengali: "Bengali",
    }[language];

    const prompt = `Translate this business news to ${languageName}. Keep the meaning exact and business context clear.

Original:
${text}

Provide only the ${languageName} translation without explanation.`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.3,
      max_tokens: 500,
    });

    const translation = response.choices[0]?.message?.content || "";

    return {
      language: language,
      translation: translation.trim(),
    };
  } catch (error) {
    console.error("❌ Error translating:", error);
    return {
      language: language,
      translation: "Translation pending - please try again",
    };
  }
};

// Generate vernacular business news (Simplified + Translation + Romanized + Local Impact)
export const generateVernacularContent = async (
  articleContent: string,
  language: "hindi" | "tamil" | "telugu" | "bengali" = "hindi"
): Promise<VernacularResult> => {
  try {
    const languageDetails = {
      hindi: { name: "Hindi", romanized: "Hinglish" },
      tamil: { name: "Tamil", romanized: "Tanglish" },
      telugu: { name: "Telugu", romanized: "Teglish" },
      bengali: { name: "Bengali", romanized: "Benglish" },
    }[language];

    const prompt = `You are a business news translator and explainer. For this article:

1. Simplify it in English (like for a 15-year-old)
2. Translate to ${languageDetails.name}
3. Write it in ${languageDetails.romanized} (mixing English with ${languageDetails.name} words)
4. Explain local impact for India (how it affects jobs, economy, daily life)
5. Explain how it impacts common people (petrol prices, taxes, jobs, education)

Format as JSON:
{
  "simpleEnglish": "...",
  "localLanguage": "...",
  "romanized": "...",
  "localImpact": "...",
  "commonPeopleImpact": "..."
}

Article:
${articleContent}`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return result as VernacularResult;
  } catch (error) {
    console.error("❌ Error generating vernacular content:", error);
    // Fallback response
    return {
      simpleEnglish: "A business event has occurred",
      localLanguage: "एक व्यावसायिक घटना हुई है",
      romanized: "Ek vyavsayik ghatna hui hai",
      localImpact: "This may affect India's economy",
      commonPeopleImpact: "Could impact jobs and investments",
    };
  }
};

// Generate briefing for multiple articles combined
export const generateAIBriefing = async (
  articles: Array<{ title: string; content: string }>,
  briefingType: "executive" | "detailed" = "executive"
): Promise<BriefingResponse> => {
  try {
    const combinedContent = articles
      .map((a, i) => `Article ${i + 1}: ${a.title}\n${a.content}`)
      .join("\n\n---\n\n");

    const prompt =
      briefingType === "executive"
        ? `You are a financial news analyst. Synthesize these ${articles.length} articles into ONE comprehensive briefing:

Provide:
1. Overall headline combining all stories
2. Executive summary (1 paragraph tying all stories)
3. Key takeaways (5 bullet points covering all articles)
4. Combined market impact
5. Local India impact
6. Winners and Losers across all stories
7. Overall sentiment

Format as JSON:
{
  "headline": "...",
  "tldr": "Combined briefing of ${articles.length} stories",
  "keyPoints": ["...", "...", "...", "...", "..."],
  "whyItMatters": "...",
  "localImpact": "...",
  "winnersLosers": {
    "winners": ["...", "..."],
    "losers": ["...", "..."]
  },
  "sentiment": "positive|negative|neutral"
}

Articles to synthesize:
${combinedContent}`
        : `You are a business journalist. Create a detailed briefing synthesizing these ${articles.length} articles:

${combinedContent}`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const briefing = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return briefing as BriefingResponse;
  } catch (error) {
    console.error("❌ Error generating AI briefing:", error);
    // Fallback
    return {
      headline: "Unable to Generate Briefing",
      tldr: "Error processing briefing",
      keyPoints: ["Error processing briefing"],
      whyItMatters: "Please try again",
      localImpact: "Unknown",
      winnersLosers: {
        winners: [],
        losers: [],
      },
      sentiment: "neutral",
    };
  }
};

// Generate cinematic video script using Groq
export const generateVideoScript = async (topic: string): Promise<string> => {
  try {
    console.log(`[GROQ-VIDEO] Generating script for: "${topic}"`);
    
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

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const script = response.choices[0]?.message?.content || "";
    console.log(`[GROQ-VIDEO] Generated successfully (${script.length} chars)`);
    return script || `DEFAULT CINEMATIC SCRIPT FOR: ${topic}`;
  } catch (error) {
    console.error("[GROQ-VIDEO] Error generating script:", error instanceof Error ? error.message : String(error));
    return `DEFAULT CINEMATIC SCRIPT FOR: ${topic}\n\n[SCENE 1] Opening: "Breaking News: ${topic}"\n[SCENE 2] Main Story: Detailed coverage of the topic\n[SCENE 3] Impact: Why this matters to viewers\n[SCENE 4] CTA: Learn more at NECTAR News`;
  }
};
