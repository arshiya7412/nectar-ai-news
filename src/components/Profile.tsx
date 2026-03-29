import React, { useState } from 'react';
import { motion } from 'motion/react';
import { History, Heart, Bookmark, ChevronLeft, User, Settings, Shield, Bell, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile;
  onBack: () => void;
  onLogout: () => void;
}

export default function Profile({ user, onBack, onLogout }: ProfileProps) {
  const [activeSection, setActiveSection] = useState<'History' | 'Liked' | 'Saved'>('History');
  return (
    <div className="min-h-screen bg-editorial-bg p-6 lg:p-12 font-serif">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-black pb-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-editorial-ink hover:text-trust-blue transition-all font-sans font-bold uppercase tracking-widest text-sm"
          >
            <ChevronLeft className="w-5 h-5" /> Back to Feed
          </button>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-white border-2 border-black hover:bg-zinc-100 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
              <Settings className="w-5 h-5 text-editorial-ink" />
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-black hover:bg-red-50 hover:text-red-600 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] font-sans font-bold uppercase tracking-widest text-sm"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white border-4 border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center gap-10 relative">
          <div className="relative">
            <div className="w-32 h-32 bg-zinc-100 border-4 border-black flex items-center justify-center overflow-hidden">
              <User className="text-editorial-ink w-16 h-16" />
            </div>
            <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-black flex items-center justify-center border-2 border-white text-white">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="masthead text-5xl md:text-6xl mb-4">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
              <span className="bg-black text-white px-4 py-2 text-xs font-sans font-bold uppercase tracking-widest">
                {user.type}
              </span>
              <span className="text-editorial-ink font-sans font-bold text-sm uppercase tracking-widest flex items-center gap-2 border-l-2 border-black pl-4">
                <Bell className="w-4 h-4" /> Notifications On
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center px-6 py-4 bg-white border-2 border-black">
              <p className="text-3xl font-serif font-bold text-editorial-ink">124</p>
              <p className="text-[10px] font-sans font-bold text-zinc-500 uppercase tracking-widest mt-1">Read</p>
            </div>
            <div className="text-center px-6 py-4 bg-white border-2 border-black">
              <p className="text-3xl font-serif font-bold text-editorial-ink">42</p>
              <p className="text-[10px] font-sans font-bold text-zinc-500 uppercase tracking-widest mt-1">Saved</p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <SectionCard 
            icon={<History className="w-6 h-6 text-editorial-ink" />}
            title="History"
            count={user.history.length}
            isActive={activeSection === 'History'}
            onClick={() => setActiveSection('History')}
          />
          <SectionCard 
            icon={<Heart className="w-6 h-6 text-editorial-ink" />}
            title="Liked"
            count={user.likedArticles.length}
            isActive={activeSection === 'Liked'}
            onClick={() => setActiveSection('Liked')}
          />
          <SectionCard 
            icon={<Bookmark className="w-6 h-6 text-editorial-ink" />}
            title="Saved"
            count={user.savedArticles.length}
            isActive={activeSection === 'Saved'}
            onClick={() => setActiveSection('Saved')}
          />
        </div>

        {/* Recent Activity */}
        <div className="space-y-6 pt-8">
          <h2 className="masthead text-3xl border-b-4 border-black pb-4">
            {activeSection === 'History' && 'READING HISTORY'}
            {activeSection === 'Liked' && 'LIKED ARTICLES'}
            {activeSection === 'Saved' && 'SAVED FOR LATER'}
          </h2>
          <div className="space-y-4">
            {
              activeSection === 'History' ? (
                user.history.length > 0 ? (
                  user.history.map((article, i) => (
                    <div key={i} className="bg-white border-2 border-black p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:bg-zinc-50 transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="w-full sm:w-32 h-32 sm:h-24 bg-zinc-100 border-2 border-black overflow-hidden flex-shrink-0">
                        <img src={`https://picsum.photos/seed/${article.id}/200/200`} alt="News" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-sans font-bold text-trust-blue uppercase tracking-widest mb-2">{article.category}</p>
                        <h3 className="main-headline text-xl group-hover:text-trust-blue transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-zinc-500 text-xs font-sans font-bold uppercase tracking-widest mt-3">Read {article.readTime} ago</p>
                      </div>
                      <ChevronLeft className="hidden sm:block w-6 h-6 text-editorial-ink rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))
                ) : (
                  <div className="bg-white border-2 border-black p-12 text-center text-zinc-500">
                    <p className="font-sans font-bold uppercase tracking-widest">No articles in your history yet</p>
                  </div>
                )
              ) : activeSection === 'Liked' ? (
                user.likedArticles.length > 0 ? (
                  user.likedArticles.map((article, i) => (
                    <div key={i} className="bg-white border-2 border-black p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:bg-zinc-50 transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="w-full sm:w-32 h-32 sm:h-24 bg-zinc-100 border-2 border-black overflow-hidden flex-shrink-0">
                        <img src={`https://picsum.photos/seed/${article.id + 1000}/200/200`} alt="News" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-sans font-bold text-trust-blue uppercase tracking-widest mb-2">{article.category}</p>
                        <h3 className="main-headline text-xl group-hover:text-trust-blue transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-zinc-500 text-xs font-sans font-bold uppercase tracking-widest mt-3">Liked {article.likedAt}</p>
                      </div>
                      <ChevronLeft className="hidden sm:block w-6 h-6 text-editorial-ink rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))
                ) : (
                  <div className="bg-white border-2 border-black p-12 text-center text-zinc-500">
                    <p className="font-sans font-bold uppercase tracking-widest">No liked articles yet</p>
                  </div>
                )
              ) : (
                user.savedArticles.length > 0 ? (
                  user.savedArticles.map((article, i) => (
                    <div key={i} className="bg-white border-2 border-black p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:bg-zinc-50 transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="w-full sm:w-32 h-32 sm:h-24 bg-zinc-100 border-2 border-black overflow-hidden flex-shrink-0">
                        <img src={`https://picsum.photos/seed/${article.id + 2000}/200/200`} alt="News" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-sans font-bold text-trust-blue uppercase tracking-widest mb-2">{article.category}</p>
                        <h3 className="main-headline text-xl group-hover:text-trust-blue transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-zinc-500 text-xs font-sans font-bold uppercase tracking-widest mt-3">Saved {article.savedAt}</p>
                      </div>
                      <ChevronLeft className="hidden sm:block w-6 h-6 text-editorial-ink rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))
                ) : (
                  <div className="bg-white border-2 border-black p-12 text-center text-zinc-500">
                    <p className="font-sans font-bold uppercase tracking-widest">No saved articles yet</p>
                  </div>
                )
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ icon, title, count, isActive, onClick }: { icon: React.ReactNode, title: string, count: number, isActive?: boolean, onClick?: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`bg-white border-4 border-black p-8 flex flex-col items-center text-center group cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${isActive ? 'bg-black text-white border-white' : ''}`}
    >
      <div className={`w-16 h-16 bg-zinc-100 border-2 border-black flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors ${isActive ? 'bg-white border-white' : ''}`}>
        {icon}
      </div>
      <h3 className={`main-headline text-2xl mb-2 ${isActive ? 'text-white' : ''}`}>{title}</h3>
      <p className={`font-sans font-bold text-sm uppercase tracking-widest ${isActive ? 'text-white' : 'text-zinc-500'}`}>{count} Items</p>
    </motion.div>
  );
}
