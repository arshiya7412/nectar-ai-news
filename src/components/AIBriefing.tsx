import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, PlayCircle, Headphones, Languages, Share2, Bookmark, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { NewsArticle, UserProfile } from '../types';

interface AIBriefingProps {
  article: NewsArticle;
  user: UserProfile;
  onBack: () => void;
}

export default function AIBriefing({ article, user, onBack }: AIBriefingProps) {
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBriefing = async () => {
      console.log('[AIBriefing] Fetching briefing for article:', article.title);
      console.log('[AIBriefing] User:', user);
      setLoading(true);
      try {
        const payload = {
          articleTitle: article.title,
          articleContent: article.content || article.description,
          userPreference: user.contentPreferences?.[0] || 'Simple explanation'
        };
        console.log('[AIBriefing] Sending request with payload:', payload);
        
        const response = await fetch('/api/briefing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        console.log('[AIBriefing] Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[AIBriefing] Error response:', errorText);
          throw new Error(`Failed to generate briefing: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('[AIBriefing] Data received:', data);
        setBriefing(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('[AIBriefing] Full error:', err);
        setError('Failed to generate AI briefing. ' + errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBriefing();
  }, [article, user]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: briefing?.title || article.title,
          text: briefing?.tldr || article.description,
          url: article.url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(article.url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg p-6 lg:p-12 pb-32 font-serif">
      <div className="max-w-5xl mx-auto">
        {/* Top Navigation */}
        <div className="mb-8 border-b-4 border-black pb-4 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-editorial-ink hover:text-trust-blue transition-all font-sans font-bold uppercase tracking-widest text-sm"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          <div className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
            <Languages className="w-4 h-4" />
            {user.language} • {user.mode}
          </div>
        </div>

        {loading ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-16 bg-zinc-300 w-3/4 mx-auto" />
            <div className="h-8 bg-zinc-200 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 h-64 bg-zinc-200" />
              <div className="h-64 bg-zinc-200" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 font-bold font-sans uppercase tracking-widest">
            {error}
          </div>
        ) : briefing ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Masthead / Title */}
            <div className="text-center space-y-6">
              <span className="bg-black text-white px-4 py-1 text-xs font-sans font-bold uppercase tracking-widest">
                AI Briefing
              </span>
              <h1 className="masthead text-5xl md:text-6xl leading-tight">
                {briefing.headline || briefing.title || "Market Briefing"}
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 border-y-2 border-black py-4">
              <ActionButton icon={<PlayCircle />} label="Watch AI Video" />
              <ActionButton icon={<Headphones />} label="Listen Audio" />
              <ActionButton icon={<Languages />} label="Translate" />
              <ActionButton icon={<Share2 />} label="Share" onClick={handleShare} />
              <ActionButton icon={<Bookmark />} label="Save" />
            </div>

            {/* TLDR */}
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-sm font-sans font-bold uppercase tracking-widest text-trust-blue mb-4">TL;DR</h2>
              <p className="text-2xl md:text-3xl font-bold leading-snug">
                {briefing.tldr}
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              {/* Left Column: Simple Explanation & Market Impact */}
              <div className="md:col-span-8 space-y-12">
                <section>
                  <h2 className="text-sm font-sans font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-6">
                    Key Points
                  </h2>
                  <ul className="space-y-4">
                    {(briefing.keyPoints || []).map((point: string, i: number) => (
                      <li key={i} className="flex gap-4 text-lg leading-relaxed">
                        <span className="text-trust-blue font-bold flex-shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bg-zinc-50 border-2 border-black p-8">
                  <h2 className="text-sm font-sans font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-trust-blue" />
                    Market Impact
                  </h2>
                  <p className="text-lg leading-relaxed">
                    {briefing.whyItMatters || "Market impact analysis pending..."}
                  </p>
                </section>
              </div>

              {/* Right Column: Winners, Losers, Timeline */}
              <div className="md:col-span-4 space-y-8">
                <section className="border-2 border-emerald-600 bg-emerald-50 p-6">
                  <h2 className="text-sm font-sans font-bold uppercase tracking-widest text-emerald-700 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Winners
                  </h2>
                  <ul className="space-y-3">
                    {(briefing.winnersLosers?.winners || briefing.winners || []).map((winner: string, i: number) => (
                      <li key={i} className="text-sm font-bold text-emerald-900 border-b border-emerald-200 pb-2 last:border-0">
                        {winner}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="border-2 border-red-600 bg-red-50 p-6">
                  <h2 className="text-sm font-sans font-bold uppercase tracking-widest text-red-700 mb-4 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" /> Losers
                  </h2>
                  <ul className="space-y-3">
                    {(briefing.winnersLosers?.losers || briefing.losers || []).map((loser: string, i: number) => (
                      <li key={i} className="text-sm font-bold text-red-900 border-b border-red-200 pb-2 last:border-0">
                        {loser}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-sm font-sans font-bold uppercase tracking-widest border-b-2 border-black pb-2 mb-6 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> What's Next
                  </h2>
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-700">
                      💡 {briefing.localImpact || "Local impact analysis pending..."}
                    </p>
                    <p className="text-sm text-zinc-700">
                      📊 Sentiment: <span className={`font-bold ${briefing.sentiment === 'positive' ? 'text-emerald-700' : briefing.sentiment === 'negative' ? 'text-red-700' : 'text-zinc-700'}`}>
                        {briefing.sentiment?.toUpperCase() || "NEUTRAL"}
                      </span>
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-500 font-bold font-sans uppercase tracking-widest">No briefing loaded</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-all font-sans font-bold uppercase tracking-widest text-xs group shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      {label}
    </button>
  );
}
