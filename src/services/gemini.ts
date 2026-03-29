import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const summarizeArticle = async (text: string, language: string = "English") => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Summarize this news article in ${language}. 
    Provide:
    1. A simple headline.
    2. 3-5 key bullet points.
    3. A "Why it matters" section.
    4. A "Local Impact" section for India.
    
    Article: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          whyItMatters: { type: Type.STRING },
          localImpact: { type: Type.STRING },
        },
        required: ["headline", "bulletPoints", "whyItMatters", "localImpact"],
      },
    },
  });
  return JSON.parse(response.text);
};

export const detectFakeNews = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Perform a real-time fake news detection check. 
    Compare this information with the latest trends and reports from the Economic Times and other reliable business news sources.
    Act as a research assistant to verify the authenticity of this claim.
    
    News/Claim: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isFake: { type: Type.BOOLEAN },
          confidence: { type: Type.NUMBER },
          reasoning: { type: Type.STRING },
          sourceAnalysis: { type: Type.STRING },
        },
        required: ["isFake", "confidence", "reasoning", "sourceAnalysis"],
      },
    },
  });
  return JSON.parse(response.text);
};

export const generateStoryTimeline = async (companyName: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a timeline of major news events for ${companyName} over the last 2 years.
    For each event, provide a date, title, and sentiment (positive/negative/neutral).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            title: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: ["positive", "negative", "neutral"] },
          },
          required: ["date", "title", "sentiment"],
        },
      },
    },
  });
  return JSON.parse(response.text);
};

export const processVernacularNews = async (text: string, language: string = "Tamil") => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this news article and provide a vernacular business news engine output.
    
    1. Analyze: What happened? Why important? Who is affected?
    2. Generate:
       - A very simple English explanation (easy for a school student).
       - A meaning-based (not literal) explanation in ${language}.
    3. Local Impact: How it affects India and common people.
    
    Article: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          aiDescription: { type: Type.STRING },
          simpleEnglish: { type: Type.STRING },
          localLanguage: { type: Type.STRING },
          localImpact: { type: Type.STRING },
        },
        required: ["title", "aiDescription", "simpleEnglish", "localLanguage", "localImpact"],
      },
    },
  });
  return JSON.parse(response.text);
};

export const generateAIBriefing = async (article: any, user: any) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Act as an expert financial and news analyst. You are creating a comprehensive "AI Briefing" that synthesizes multiple sources about the following news story:
    Title: ${article.title}
    Description: ${article.description}
    Content: ${article.content}

    Tailor the briefing specifically for this user:
    - User Type: ${user.type}
    - Interests: ${user.interests.join(', ')}
    - Language: ${user.language}
    - Experience Mode: ${user.mode} (e.g., if Romanized, mix English and the local language using English script. If Literal, translate directly. If Simple English, keep it very basic.)
    - Content Preferences: ${user.contentPreferences.join(', ')} ${user.customContentPreference ? `(${user.customContentPreference})` : ''}

    Return ONLY a JSON object with this exact structure:
    {
      "title": "A catchy, newspaper-style headline for the briefing",
      "tldr": "A 2-3 sentence summary (Too Long; Didn't Read)",
      "simpleExplanation": "A clear, easy-to-understand explanation of the event and its context, tailored to the user's preferences",
      "winners": ["Winner 1 with brief reason", "Winner 2..."],
      "losers": ["Loser 1 with brief reason", "Loser 2..."],
      "marketImpact": "Analysis of how this affects the market, economy, or specific sectors",
      "timeline": [
        { "date": "Recent date/time", "event": "Key event 1" },
        { "date": "Earlier date/time", "event": "Key event 2" }
      ]
    }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          tldr: { type: Type.STRING },
          simpleExplanation: { type: Type.STRING },
          winners: { type: Type.ARRAY, items: { type: Type.STRING } },
          losers: { type: Type.ARRAY, items: { type: Type.STRING } },
          marketImpact: { type: Type.STRING },
          timeline: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                event: { type: Type.STRING }
              },
              required: ["date", "event"]
            } 
          }
        },
        required: ["title", "tldr", "simpleExplanation", "winners", "losers", "marketImpact", "timeline"]
      }
    }
  });
  
  return JSON.parse(response.text);
};
