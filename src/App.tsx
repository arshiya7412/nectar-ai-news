import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Newspaper, 
  Home as HomeIcon, 
  Video, 
  History, 
  ShieldAlert, 
  User,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components to prevent initial bundle bloat and potential circular dependencies
const Login = React.lazy(() => import('./components/Login'));
const Onboarding = React.lazy(() => import('./components/Onboarding'));
const Home = React.lazy(() => import('./components/Home'));
const StoryTracker = React.lazy(() => import('./components/StoryTracker'));
const FakeNewsDetector = React.lazy(() => import('./components/FakeNewsDetector'));
const VideoFeed = React.lazy(() => import('./components/VideoFeed'));
const Profile = React.lazy(() => import('./components/Profile'));
const AIBriefing = React.lazy(() => import('./components/AIBriefing'));

import { UserProfile, NewsArticle } from './types';

type Page = 'login' | 'onboarding' | 'home' | 'story-tracker' | 'fake-news' | 'video-feed' | 'profile' | 'ai-briefing';

function Sidebar({ activePage, onNavigate, isOpen, setIsOpen }: { activePage: Page, onNavigate: (page: Page) => void, isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
  if (activePage === 'login' || activePage === 'onboarding') return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-[90] p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-[95] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-editorial-bg border-r-4 border-black z-[100] shadow-[8px_0px_0px_0px_rgba(0,0,0,0.2)] flex flex-col"
            >
              <div className="p-6 border-b-4 border-black flex items-center justify-between">
                <h2 className="font-serif font-black text-2xl tracking-widest">NECTAR</h2>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
                <SidebarItem icon={<HomeIcon />} active={activePage === 'home'} onClick={() => { onNavigate('home'); setIsOpen(false); }} label="Home" />
                <SidebarItem icon={<Video />} active={activePage === 'video-feed'} onClick={() => { onNavigate('video-feed'); setIsOpen(false); }} label="AI Video Generator" />
                <SidebarItem icon={<History />} active={activePage === 'story-tracker'} onClick={() => { onNavigate('story-tracker'); setIsOpen(false); }} label="Story Tracker" />
                <SidebarItem icon={<ShieldAlert />} active={activePage === 'fake-news'} onClick={() => { onNavigate('fake-news'); setIsOpen(false); }} label="Fake News Detector" />
                <div className="my-4 border-t-2 border-black/10" />
                <SidebarItem icon={<User />} active={activePage === 'profile'} onClick={() => { onNavigate('profile'); setIsOpen(false); }} label="Profile" />
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarItem({ icon, active, onClick, label }: { icon: React.ReactNode, active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full p-4 transition-all border-2 ${active ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(30,58,138,1)]' : 'bg-white text-editorial-ink border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
    >
      <div className="w-6 h-6">
        {icon}
      </div>
      <span className="font-sans font-bold uppercase tracking-widest text-xs">
        {label}
      </span>
    </button>
  );
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-editorial-bg flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-trust-blue border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Loading NECTAR...</p>
    </div>
  </div>
);

export default function App() {
  const [page, setPage] = useState<Page>('login');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nectar_user');
    if (saved) {
      try {
        const parsedUser = JSON.parse(saved);
        setUser(parsedUser);
        setPage('home');
      } catch (e) {
        console.error('Failed to parse saved user', e);
        localStorage.removeItem('nectar_user');
      }
    }
    setIsReady(true);
  }, []);

  const handleLogin = () => {
    setPage('onboarding');
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('nectar_user', JSON.stringify(updatedUser));
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    const fullProfile = {
      ...profile,
      likedArticles: [],
      savedArticles: [],
      history: []
    };
    setUser(fullProfile);
    localStorage.setItem('nectar_user', JSON.stringify(fullProfile));
    setPage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('nectar_user');
    setUser(null);
    setPage('login');
  };

  const handleNavigateToBriefing = (article: NewsArticle) => {
    setSelectedArticle(article);
    setPage('ai-briefing');
  };

  const handleNavigateToVideo = () => {
    setPage('video-feed');
  };

  if (!isReady) return <LoadingScreen />;

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="relative min-h-screen bg-editorial-bg selection:bg-trust-blue/20 overflow-x-hidden">
          {/* Main Content Area - Scrollable */}
          <main className="h-screen overflow-y-auto no-scrollbar relative pb-12">
            <Suspense fallback={<LoadingScreen />}>
              <AnimatePresence mode="wait">
                {page === 'login' && (
                  <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-full">
                    <Login onLogin={handleLogin} />
                  </motion.div>
                )}
                {page === 'onboarding' && (
                  <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-full">
                    <Onboarding onComplete={handleOnboardingComplete} />
                  </motion.div>
                )}
                {page === 'home' && user && (
                  <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-full">
                    <Home user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} onNavigateToBriefing={handleNavigateToBriefing} onNavigateToVideo={handleNavigateToVideo} />
                  </motion.div>
                )}
                {page === 'story-tracker' && (
                  <motion.div key="story-tracker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-full">
                    <StoryTracker />
                  </motion.div>
                )}
                {page === 'fake-news' && (
                  <motion.div key="fake-news" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-full">
                    <FakeNewsDetector />
                  </motion.div>
                )}
                {page === 'video-feed' && (
                  <motion.div key="video-feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-full">
                    <VideoFeed />
                  </motion.div>
                )}
                {page === 'profile' && user && (
                  <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-full">
                    <Profile user={user} onBack={() => setPage('home')} onLogout={handleLogout} />
                  </motion.div>
                )}
                {page === 'ai-briefing' && user && selectedArticle && (
                  <motion.div key="ai-briefing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-full">
                    <AIBriefing article={selectedArticle} user={user} onBack={() => setPage('home')} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Suspense>
          </main>

          {/* Persistent Sidebar */}
          <Sidebar activePage={page} onNavigate={setPage} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
