import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, NewsArticle } from '../types';
import { newsFetcher } from '../services/newsFetcher';
import { 
  Search, 
  TrendingUp, 
  Video, 
  History, 
  ShieldCheck, 
  Bell, 
  Settings,
  Heart,
  Share2,
  Bookmark,
  MoreVertical,
  Zap,
  Languages,
  RefreshCw,
  AlertCircle,
  PlayCircle,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Flag
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomeProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateUser: (user: UserProfile) => void;
  onNavigateToBriefing: (article: NewsArticle) => void;
  onNavigateToVideo: () => void;
}

export default function Home({ user, onLogout, onUpdateUser, onNavigateToBriefing, onNavigateToVideo }: HomeProps) {
  const [activeTab, setActiveTab] = useState<'For You' | 'Trending'>('For You');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingNews, setFetchingNews] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const tickerNews = news.length > 0 
    ? [...news, ...news].slice(0, 20).map(a => `${a.source}: ${a.title}`)
    : [
        "Fetching latest market updates...",
        "Connecting to Economic Times...",
        "Analyzing business trends with AI...",
        "Nifty 50 and Sensex real-time tracking active"
      ];

  useEffect(() => {
    // Start real-time fetching
    newsFetcher.startAutoRefresh();

    const unsubscribe = newsFetcher.subscribe((latestNews) => {
      setNews(latestNews);
      setFetchingNews(false);
      setError(null);
    });

    const unsubscribeError = newsFetcher.onError((err) => {
      setError(err);
      setFetchingNews(false);
    });

    return () => {
      unsubscribe();
      unsubscribeError();
      newsFetcher.stopAutoRefresh();
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'For You' && user.interests && user.interests.length > 0) {
      // Call recommendations API for personalized feed
      const fetchRecommendations = async () => {
        try {
          const response = await fetch('/api/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userInterests: user.interests,
              userType: user.type || 'general'
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            setFilteredNews(data.recommendations || news.slice(0, 10));
          } else {
            setFilteredNews(news.slice(0, 10));
          }
        } catch (err) {
          console.error('Error fetching recommendations:', err);
          setFilteredNews(news.slice(0, 10));
        }
      };
      
      if (news.length > 0) {
        fetchRecommendations();
      }
    } else {
      // Trending - just a different set
      setFilteredNews(news.slice(5, 15));
    }
  }, [news, activeTab, user.interests, user.type]);

  const handleLike = (articleId: string) => {
    const isLiked = user.likedArticles.includes(articleId);
    const updatedLiked = isLiked 
      ? user.likedArticles.filter(id => id !== articleId)
      : [...user.likedArticles, articleId];
    
    onUpdateUser({ ...user, likedArticles: updatedLiked });
  };

  const handleSave = (articleId: string) => {
    const isSaved = user.savedArticles.includes(articleId);
    const updatedSaved = isSaved 
      ? user.savedArticles.filter(id => id !== articleId)
      : [...user.savedArticles, articleId];
    
    onUpdateUser({ ...user, savedArticles: updatedSaved });
  };

  const handleInterested = (topic: string) => {
    console.log('[Home] Interested in topic:', topic);
    if (!user.interests.includes(topic)) {
      onUpdateUser({ ...user, interests: [...user.interests, topic] });
    }
    setActiveMenu(null);
  };

  const handleNotInterested = (topic: string) => {
    console.log('[Home] Not interested in topic:', topic);
    // You could add a "notInterestedTopics" field to UserProfile
    console.log('User marked as not interested in:', topic);
    setActiveMenu(null);
  };

  const handleGenerateVideo = (article: NewsArticle) => {
    console.log('[Home] Generate video for article:', article.title);
    // For now, just show notification - implement later
    alert('Generating video for: ' + article.title + '\n\nThis feature will create AI video content from this article.');
    onNavigateToVideo();
    setActiveMenu(null);
  };

  const handleReport = (article: NewsArticle) => {
    console.log('[Home] Report article:', article.title);
    alert('Article reported: ' + article.title + '\n\nThank you for helping us maintain quality content.');
    setActiveMenu(null);
  };

  const handleShare = async (article: NewsArticle) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(article.url);
      alert('Link copied to clipboard!');
    }
  };

  const handleArticleClick = (article: NewsArticle) => {
    if (!user.history.includes(article.id)) {
      onUpdateUser({ ...user, history: [...user.history, article.id] });
    }
    onNavigateToBriefing(article);
  };

  const handleBriefing = async (article: NewsArticle) => {
    setLoading(true);
    setSelectedArticle(article);
    setBriefing(null); // Clear previous
    try {
      const summary = await processVernacularNews(article.description || article.title, user.language);
      setBriefing(summary);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === articleId ? null : articleId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const getBackgroundStyle = () => {
    return "bg-editorial-bg";
  };

  const mainArticle = filteredNews.length > 0 ? filteredNews[0] : null;
  const secondaryArticles = filteredNews.slice(1, 4);
  const storyTrackerArticles = news.slice(4, 8);
  const videoReels = news.slice(8, 12);

  return (
    <div className={`min-h-screen ${getBackgroundStyle()} transition-all duration-1000 text-editorial-ink pb-24 font-serif`}>
      {/* Newspaper Header */}
      <header className="bg-editorial-bg pt-12 pb-4 px-6 border-b-4 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-4 text-sm font-serif font-bold border-b border-black pb-2">
            <span className="hidden sm:block">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="uppercase tracking-widest text-trust-blue">Real-time AI Insights</span>
            <span className="hidden sm:block">Vol. I, No. 1</span>
          </div>
          <h1 className="masthead">NECTAR AI</h1>
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-2 text-zinc-500 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search news..."
                  className="bg-transparent border border-black py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-black w-64 font-serif"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-editorial-ink text-white flex items-center justify-center font-bold text-xs border border-black">
                {user.name[0]}
              </div>
              <button 
                onClick={onLogout}
                className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {fetchingNews ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="w-10 h-10 text-trust-blue animate-spin" />
            <p className="text-zinc-500 font-bold animate-pulse font-serif italic">Fetching latest news...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-600 mb-2 font-serif">Error Fetching News</h3>
            <p className="text-zinc-600 text-sm mb-6 font-serif">{error}</p>
            <button 
              onClick={() => {
                setFetchingNews(true);
                newsFetcher.fetchNews();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 font-bold transition-all uppercase tracking-widest text-xs"
            >
              Retry Now
            </button>
          </div>
        ) : (
          <>
            {/* Market Mood Section */}
            <section className="border-b-2 border-black pb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Market Mood
                </h2>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 border border-green-200">POSITIVE</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['NIFTY 50', 'SENSEX', 'BANK NIFTY', 'IT SECTOR'].map((index, i) => (
                  <div key={index} className="border border-zinc-300 p-3 bg-white flex flex-col">
                    <span className="text-xs font-bold text-zinc-500">{index}</span>
                    <span className="text-lg font-bold">{Math.floor(Math.random() * 5000) + 15000}</span>
                    <span className={`text-xs font-bold ${i % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {i % 2 === 0 ? '+' : '-'}{(Math.random() * 2).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Briefing of the Day (Main Headline Card) */}
            {mainArticle && (
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b-2 border-black pb-12">
                <div className="lg:col-span-8">
                  <span className="text-xs font-bold text-trust-blue uppercase tracking-widest border-b border-trust-blue pb-1 mb-4 inline-block">
                    AI Briefing of the Day
                  </span>
                  <h2 
                    className="text-4xl md:text-5xl font-black leading-tight mb-6 cursor-pointer hover:text-trust-blue transition-colors"
                    onClick={() => handleArticleClick(mainArticle)}
                  >
                    {mainArticle.title}
                  </h2>
                  <p className="body-text drop-cap mb-6 text-lg">
                    {mainArticle.description}
                  </p>
                  <div className="flex items-center justify-between border-t border-zinc-300 pt-4">
                    <div className="flex items-center gap-4 text-xs text-zinc-500 font-serif italic">
                      <span>{mainArticle.source}</span>
                      <span>•</span>
                      <span>{new Date(mainArticle.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <ArticleActions 
                      article={mainArticle} 
                      user={user} 
                      handleLike={handleLike} 
                      handleShare={handleShare} 
                      handleSave={handleSave} 
                      toggleMenu={toggleMenu}
                      activeMenu={activeMenu}
                      handleInterested={handleInterested}
                      handleNotInterested={handleNotInterested}
                      handleGenerateVideo={handleGenerateVideo}
                      handleReport={handleReport}
                    />
                  </div>
                </div>
                <div className="lg:col-span-4">
                  <div className="relative h-64 lg:h-full overflow-hidden border border-zinc-300 p-1 bg-white cursor-pointer" onClick={() => handleArticleClick(mainArticle)}>
                    <img 
                      src={mainArticle.image} 
                      alt={mainArticle.title} 
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Personalized News & Trending */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b-2 border-black pb-12">
              <div className="lg:col-span-8 space-y-8">
                <div className="flex items-center justify-between border-b border-black pb-2">
                  <h2 className="text-2xl font-bold tracking-tight font-serif">Personalized News</h2>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-serif italic">
                    <Languages className="w-4 h-4" />
                    <span>{user.language} • {user.mode}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {secondaryArticles.map(article => (
                    <article key={article.id} className="border border-zinc-300 p-4 bg-white flex flex-col h-full">
                      <div className="relative h-40 mb-4 overflow-hidden border border-zinc-200 p-1 cursor-pointer" onClick={() => handleArticleClick(article)}>
                        <img 
                          src={article.image} 
                          alt={article.title} 
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                        {article.source}
                      </span>
                      <h3 
                        className="text-lg font-bold mb-2 cursor-pointer hover:text-trust-blue transition-colors flex-grow"
                        onClick={() => handleArticleClick(article)}
                      >
                        {article.title}
                      </h3>
                      <p className="text-sm text-zinc-600 mb-4 line-clamp-3 font-serif">
                        {article.description}
                      </p>
                      <div className="mt-auto border-t border-zinc-200 pt-3">
                        <ArticleActions 
                          article={article} 
                          user={user} 
                          handleLike={handleLike} 
                          handleShare={handleShare} 
                          handleSave={handleSave} 
                          toggleMenu={toggleMenu}
                          activeMenu={activeMenu}
                          handleInterested={handleInterested}
                          handleNotInterested={handleNotInterested}
                          handleGenerateVideo={handleGenerateVideo}
                          handleReport={handleReport}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <h2 className="text-xl font-bold tracking-tight font-serif border-b border-black pb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-trust-blue" />
                  Trending News
                </h2>
                <div className="space-y-4">
                  {filteredNews.slice(4, 9).map((article, index) => (
                    <article key={article.id} className="flex gap-4 items-start group cursor-pointer" onClick={() => handleArticleClick(article)}>
                      <span className="text-2xl font-black text-zinc-300 group-hover:text-trust-blue transition-colors">
                        0{index + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm group-hover:text-trust-blue transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 block">
                          {article.source}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* Story Tracker (Horizontal Cards) */}
            <section className="border-b-2 border-black pb-12">
              <h2 className="text-2xl font-bold tracking-tight font-serif border-b border-black pb-2 mb-6 flex items-center gap-2">
                <History className="w-5 h-5 text-trust-blue" />
                Story Tracker
              </h2>
              <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
                {storyTrackerArticles.map(article => (
                  <article key={article.id} className="min-w-[300px] w-[300px] border border-zinc-300 p-4 bg-white snap-start flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Developing Story</span>
                    </div>
                    <h3 
                      className="text-md font-bold mb-3 cursor-pointer hover:text-trust-blue transition-colors line-clamp-3 flex-grow"
                      onClick={() => handleArticleClick(article)}
                    >
                      {article.title}
                    </h3>
                    <div className="mt-auto border-t border-zinc-200 pt-3">
                      <ArticleActions 
                        article={article} 
                        user={user} 
                        handleLike={handleLike} 
                        handleShare={handleShare} 
                        handleSave={handleSave} 
                        toggleMenu={toggleMenu}
                        activeMenu={activeMenu}
                        handleInterested={handleInterested}
                        handleNotInterested={handleNotInterested}
                        handleGenerateVideo={handleGenerateVideo}
                        handleReport={handleReport}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Video Reels Section */}
            <section className="pb-12">
              <div className="flex items-center justify-between border-b border-black pb-2 mb-6">
                <h2 className="text-2xl font-bold tracking-tight font-serif flex items-center gap-2">
                  <Video className="w-5 h-5 text-trust-blue" />
                  Video Reels
                </h2>
                <button onClick={onNavigateToVideo} className="px-4 py-2 bg-black text-white font-sans font-bold uppercase tracking-widest text-xs border-2 border-black shadow-[2px_2px_0_0_rgba(30,58,138,1)] hover:bg-trust-blue transition-colors flex items-center gap-2">
                  <PlayCircle className="w-4 h-4" /> Generate AI Video
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {videoReels.map(article => (
                  <div key={article.id} className="relative aspect-[9/16] bg-black border border-zinc-300 overflow-hidden group cursor-pointer">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex flex-col justify-between p-4">
                      <div className="self-end">
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">Live</span>
                      </div>
                      <PlayCircle className="w-12 h-12 text-white/80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform" />
                      <div>
                        <h4 className="text-white font-bold text-sm line-clamp-3 drop-shadow-md">
                          {article.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Breaking News Ticker */}
      <div className="fixed bottom-0 left-0 right-0 z-[110] bg-white text-editorial-ink h-10 flex items-center overflow-hidden border-t-2 border-black">
        <div className="bg-red-600 text-white px-6 h-full flex items-center font-black text-sm uppercase tracking-widest z-10 font-sans shadow-[4px_0_10px_rgba(0,0,0,0.2)]">
          BREAKING
        </div>
        <div className="flex-1 whitespace-nowrap overflow-hidden relative h-full flex items-center">
          <div className="ticker-scroll flex items-center gap-12 pl-12">
            {tickerNews.map((news, i) => (
              <span key={i} className="text-xs font-bold uppercase tracking-widest flex items-center gap-4 font-serif">
                <span className="w-1.5 h-1.5 bg-trust-blue rounded-none" />
                {news}
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {tickerNews.map((news, i) => (
              <span key={`dup-${i}`} className="text-xs font-bold uppercase tracking-widest flex items-center gap-4 font-serif">
                <span className="w-1.5 h-1.5 bg-trust-blue rounded-none" />
                {news}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for article actions
interface ArticleActionsProps {
  article: NewsArticle;
  user: UserProfile;
  handleLike: (id: string) => void;
  handleShare: (article: NewsArticle) => void;
  handleSave: (id: string) => void;
  toggleMenu: (id: string, e: React.MouseEvent) => void;
  activeMenu: string | null;
  handleInterested?: (topic: string) => void;
  handleNotInterested?: (topic: string) => void;
  handleGenerateVideo?: (article: NewsArticle) => void;
  handleReport?: (article: NewsArticle) => void;
}

function ArticleActions({ 
  article, 
  user, 
  handleLike, 
  handleShare, 
  handleSave, 
  toggleMenu, 
  activeMenu,
  handleInterested = () => console.log('Interested clicked'),
  handleNotInterested = () => console.log('Not Interested clicked'),
  handleGenerateVideo = () => console.log('Generate Video clicked'),
  handleReport = () => console.log('Report clicked')
}: ArticleActionsProps) {
  return (
    <div className="flex items-center justify-between relative">
      <div className="flex items-center gap-4">
        <button 
          onClick={(e) => { e.stopPropagation(); handleLike(article.id); }}
          className={`flex items-center gap-1.5 transition-colors ${user.likedArticles.includes(article.id) ? 'text-red-700' : 'text-zinc-500 hover:text-red-700'}`}
        >
          <Heart className={`w-4 h-4 ${user.likedArticles.includes(article.id) ? 'fill-current' : ''}`} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleShare(article); }}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-trust-blue transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleSave(article.id); }}
          className={`flex items-center gap-1.5 transition-colors ${user.savedArticles.includes(article.id) ? 'text-editorial-ink' : 'text-zinc-500 hover:text-editorial-ink'}`}
        >
          <Bookmark className={`w-4 h-4 ${user.savedArticles.includes(article.id) ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="relative">
        <button 
          className="p-1 text-zinc-500 hover:text-editorial-ink" 
          onClick={(e) => toggleMenu(article.id, e)}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        <AnimatePresence>
          {activeMenu === article.id && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); handleInterested(article.topic || 'general'); }}
                className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-zinc-100 flex items-center gap-2"
              >
                <ThumbsUp className="w-3 h-3" /> Interested
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNotInterested(article.topic || 'general'); }}
                className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-zinc-100 flex items-center gap-2"
              >
                <ThumbsDown className="w-3 h-3" /> Not Interested
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleGenerateVideo(article); }}
                className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-zinc-100 flex items-center gap-2 text-trust-blue"
              >
                <Video className="w-3 h-3" /> Generate AI Video
              </button>
              <div className="border-t border-zinc-200 my-1" />
              <button 
                onClick={(e) => { e.stopPropagation(); handleReport(article); }}
                className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-zinc-100 flex items-center gap-2 text-red-600"
              >
                <Flag className="w-3 h-3" /> Report
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

