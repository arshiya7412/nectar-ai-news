export type UserType = 
  | 'Student' 
  | 'Investor' 
  | 'Startup Founder' 
  | 'Trader' 
  | 'Job Seeker' 
  | 'General Reader';

export type ContentPreference = 
  | 'Simple explanation'
  | 'Detailed explanation'
  | 'Video'
  | 'Audio'
  | 'Text'
  | 'Custom';

export interface UserProfile {
  name: string;
  type: UserType;
  interests: string[];
  contentPreferences: ContentPreference[];
  customContentPreference?: string;
  location?: string;
  language: 'English' | 'Tamil' | 'Telugu' | 'Hindi' | 'Bengali';
  mode: 'Literal' | 'Romanized' | 'Simple English';
  likedArticles: string[];
  savedArticles: string[];
  history: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  source: string;
  url: string;
  image: string;
  publishedAt: string;
  topicTag?: string;
}

export const USER_TYPE_INTERESTS: Record<UserType, string[]> = {
  'Student': ['Internships', 'Higher Education', 'EdTech Startups', 'Entry-level Jobs', 'Scholarships', 'Campus News', 'Skill Development'],
  'Investor': ['Stock Market', 'IPO', 'Venture Capital', 'Real Estate', 'Crypto', 'Dividends', 'Mutual Funds', 'Market Analysis'],
  'Startup Founder': ['Funding', 'Scaling', 'Hiring', 'Product Management', 'Marketing', 'Pitching', 'Incubators', 'B2B SaaS'],
  'Trader': ['Day Trading', 'Options', 'Technical Analysis', 'Forex', 'Commodities', 'Market Volatility', 'Algorithmic Trading'],
  'Job Seeker': ['Resume Tips', 'Interview Prep', 'Remote Jobs', 'Salary Trends', 'Networking', 'Career Growth', 'Company Culture'],
  'General Reader': ['Economy', 'Tech Trends', 'Personal Finance', 'Global News', 'Local Business', 'Automobile', 'Retail']
};
