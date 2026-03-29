import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, History, TrendingUp, TrendingDown, Minus, ChevronLeft } from 'lucide-react';

export default function StoryTracker() {
  const [query, setQuery] = useState('');
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) {
      console.log('[StoryTracker] Empty query, ignoring');
      return;
    }
    
    console.log('[StoryTracker] handleSearch triggered with query:', query);
    setLoading(true);
    try {
      console.log('[StoryTracker] Sending request to /api/story-tracker');
      const response = await fetch('/api/story-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: query })
      });
      
      console.log('[StoryTracker] Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[StoryTracker] Error response:', errorText);
        throw new Error(`Failed to fetch story timeline: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[StoryTracker] Data received:', data);
      setTimeline(data.timeline || []);
      console.log('[StoryTracker] Timeline set:', data.timeline?.length || 0, 'items');
    } catch (error) {
      console.error('[StoryTracker] Full error:', error);
      alert('Error: ' + (error instanceof Error ? error.message : String(error)));
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg p-6 lg:p-12 pb-32 font-serif">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 border-b-4 border-black pb-8">
          <h1 className="masthead mb-4 text-4xl sm:text-5xl">STORY TRACKER</h1>
          <p className="text-zinc-600 font-serif italic text-lg mb-8 text-center">Enter a company or event name to see the full timeline and evolution of the news.</p>
          
          <div className="relative flex gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-4 text-zinc-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="e.g. Epstein Files, Apple Inc, Budget 2024..."
                className="w-full bg-white border-2 border-black py-3 pl-14 pr-6 text-lg text-editorial-ink focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm font-serif"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button 
              onClick={handleSearch}
              className="bg-black hover:bg-zinc-800 text-white font-bold px-8 uppercase tracking-widest text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] border-2 border-black font-sans"
            >
              Track
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-8 animate-pulse">
                <div className="w-1 bg-zinc-300" />
                <div className="flex-1 bg-white border border-zinc-300 h-32 p-6" />
              </div>
            ))}
          </div>
        ) : timeline.length > 0 ? (
          <div className="relative space-y-10">
            <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-black" />
            {timeline.map((event, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex gap-10"
              >
                <div className={`w-4 h-4 rounded-full mt-6 z-10 border-2 border-black ${
                  event.sentiment === 'positive' ? 'bg-emerald-500' : 
                  event.sentiment === 'negative' ? 'bg-red-500' : 'bg-zinc-400'
                }`} />
                
                <div className="flex-1 bg-white border border-zinc-300 p-8 hover:shadow-lg transition-all group">
                  <div className="flex items-center justify-between mb-4 border-b border-black pb-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-sans">{event.date}</span>
                    {event.sentiment === 'positive' ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : 
                     event.sentiment === 'negative' ? <TrendingDown className="w-5 h-5 text-red-600" /> : 
                     <Minus className="w-5 h-5 text-zinc-500" />}
                  </div>
                  <h3 className="main-headline text-2xl group-hover:text-trust-blue transition-colors">{event.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-20">
            <History className="w-32 h-32 mb-6 text-black" />
            <p className="text-3xl font-black uppercase tracking-widest font-serif">Search to visualize the timeline</p>
          </div>
        )}
      </div>
    </div>
  );
}
