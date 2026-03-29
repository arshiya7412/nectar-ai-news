/**
 * NECTAR Recommendation Engine
 * 
 * Algorithm:
 * 1. Build user vector from: interests, liked topics, search history
 * 2. Build article vector from: topic, tags, sentiment
 * 3. Calculate similarity score (cosine similarity)
 * 4. Rank articles by score
 * 5. Apply filters (not interested, already liked)
 * 6. Return personalized feed
 */

export interface UserVector {
  interests: string[];
  likedTopics: string[];
  notInterestedTopics: string[];
  userType: string;
  preferredFormat: string;
  readingTime: number; // Average time spent
}

export interface ArticleVector {
  id: string;
  title: string;
  topic: string;
  tags: string[];
  summary: string;
  description: string;
  content: string;
  publishedAt: string;
  image?: string;
  source?: string;
  url?: string;
}

/**
 * Simple cosine similarity between two vectors
 * Converts strings to lowercase and compares keywords
 */
function cosineSimilarity(userTerms: string[], articleTerms: string[]): number {
  const userSet = new Set(userTerms.map((t) => t.toLowerCase()));
  const articleSet = new Set(articleTerms.map((t) => t.toLowerCase()));

  // Find intersection
  let intersection = 0;
  userSet.forEach((term) => {
    if (articleSet.has(term)) {
      intersection++;
    }
  });

  if (userSet.size === 0 || articleSet.size === 0) return 0;

  // Jaccard similarity (simplified)
  const union = userSet.size + articleSet.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Calculate personalized score for an article based on user profile
 */
export function calculateRecommendationScore(
  userVector: UserVector,
  article: ArticleVector
): number {
  let score = 0;

  // 1. Interest match (40% weight)
  const interestTerms = [...userVector.interests, ...userVector.likedTopics];
  const articleTerms = [article.topic, ...article.tags];
  const interestScore = cosineSimilarity(interestTerms, articleTerms);
  score += interestScore * 0.4;

  // 2. Not interested penalty (20% weight)
  const notInterestedScore = cosineSimilarity(
    userVector.notInterestedTopics,
    articleTerms
  );
  score -= notInterestedScore * 0.2;

  // 3. Topic exact match bonus (20% weight)
  if (
    userVector.interests.some((i) =>
      article.topic.toLowerCase().includes(i.toLowerCase())
    ) ||
    userVector.interests.some((i) =>
      article.tags.some((t) => t.toLowerCase().includes(i.toLowerCase()))
    )
  ) {
    score += 0.2;
  }

  // 4. Recency bonus (10% weight) - newer articles score higher
  const articleAge = Date.now() - new Date(article.publishedAt).getTime();
  const daysSincePublish = articleAge / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 1 - daysSincePublish / 30); // Decay over 30 days
  score += recencyScore * 0.1;

  // 5. Format preference match (10% weight)
  // This can be extended based on user's preferred content format
  // For now, we'll give preference to articles likely to have videos/text
  const hasMultipleFormats = article.tags.length > 2;
  if (hasMultipleFormats) {
    score += 0.1;
  }

  return Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
}

/**
 * Get personalized recommendations for a user
 * Filters, sorts, and returns top articles
 */
export function getPersonalizedRecommendations(
  userVector: UserVector,
  articles: ArticleVector[],
  limit: number = 10,
  likedArticleIds: string[] = [],
  savedArticleIds: string[] = []
): ArticleVector[] {
  // Filter out already liked/saved articles
  const filteredArticles = articles.filter(
    (article) =>
      !likedArticleIds.includes(article.id) &&
      !savedArticleIds.includes(article.id)
  );

  // Score and sort articles
  const scoredArticles = filteredArticles.map((article) => ({
    article,
    score: calculateRecommendationScore(userVector, article),
  }));

  // Sort by score descending
  scoredArticles.sort((a, b) => b.score - a.score);

  // Return top N articles
  return scoredArticles.slice(0, limit).map((item) => item.article);
}

/**
 * Build user vector from user profile and interaction history
 */
export function buildUserVector(
  userType: string,
  interests: string[],
  likedTopics: string[],
  notInterestedTopics: string[],
  preferredFormat: string,
  readingTimeAverage: number = 5 // minutes
): UserVector {
  // Add user type to interests for better matching
  const enhancedInterests = [
    ...interests,
    userType.toLowerCase(),
  ];

  return {
    interests: enhancedInterests,
    likedTopics: likedTopics || [],
    notInterestedTopics: notInterestedTopics || [],
    userType: userType.toLowerCase(),
    preferredFormat: preferredFormat,
    readingTime: readingTimeAverage,
  };
}

/**
 * Recommend articles based on user topic search
 * Used in Story Tracker functionality
 */
export function similarArticles(
  baseArticle: ArticleVector,
  allArticles: ArticleVector[],
  limit: number = 5
): ArticleVector[] {
  const baseTerms = [baseArticle.topic, ...baseArticle.tags];

  const scoredArticles = allArticles
    .filter((a) => a.id !== baseArticle.id)
    .map((article) => ({
      article,
      score: cosineSimilarity(
        baseTerms,
        [article.topic, ...article.tags]
      ),
    }))
    .sort((a, b) => b.score - a.score);

  return scoredArticles.slice(0, limit).map((item) => item.article);
}

/**
 * Trending articles (by engagement)
 * In real app: based on likes, shares, views
 * For now: recent + popular topics
 */
export function getTrendingArticles(
  articles: ArticleVector[],
  limit: number = 5
): ArticleVector[] {
  return articles
    .sort((a, b) => {
      // Prefer newer articles
      return (
        new Date(b.publishedAt).getTime() -
        new Date(a.publishedAt).getTime()
      );
    })
    .slice(0, limit);
}

/**
 * Get user-specific article recommendations based on their preferences
 */
export function getRecommendationsForUserType(
  userType: string,
  articles: ArticleVector[],
  limit: number = 10
): ArticleVector[] {
  const userTypeTopicMap: { [key: string]: string[] } = {
    student: [
      "internships",
      "startups",
      "tech",
      "jobs",
      "education",
      "economy",
    ],
    investor: [
      "stock market",
      "ipo",
      "mutual funds",
      "company results",
      "economy",
      "global market",
    ],
    founder: [
      "funding",
      "startups",
      "competitors",
      "tech trends",
      "market trends",
      "policy",
    ],
    "job-seeker": ["jobs", "career", "education", "tech", "startups"],
    trader: ["stock market", "ipo", "trading", "economy", "global market"],
    professional: [
      "business",
      "economy",
      "tech",
      "startup",
      "market trends",
    ],
    general: ["trending", "economy", "business", "tech", "startups"],
  };

  const preferredTopics = userTypeTopicMap[userType.toLowerCase()] || [
    "business",
    "economy",
  ];

  const scoredArticles = articles.map((article) => ({
    article,
    score: cosineSimilarity(
      preferredTopics,
      [article.topic, ...article.tags]
    ),
  }));

  return scoredArticles
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.article);
}
