import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserType, USER_TYPE_INTERESTS, UserProfile, ContentPreference } from '../types';
import { Check, ChevronRight, Globe, Languages, MapPin } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<UserType>('General Reader');
  const [interests, setInterests] = useState<string[]>([]);
  const [contentPreferences, setContentPreferences] = useState<ContentPreference[]>([]);
  const [customContentPreference, setCustomContentPreference] = useState('');
  const [language, setLanguage] = useState<UserProfile['language']>('English');
  const [mode, setMode] = useState<UserProfile['mode']>('Simple English');
  const [customInterest, setCustomInterest] = useState('');
  const [location, setLocation] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleContentPreference = (pref: ContentPreference) => {
    setContentPreferences(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const handleGetLocation = () => {
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Reverse geocoding using a free API (for demo purposes)
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.state || 'Unknown Location';
            setLocation(city);
          } catch (error) {
            console.error("Error getting location name:", error);
            setLocation(`${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`);
          } finally {
            setGettingLocation(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setGettingLocation(false);
          alert("Could not get location. You can enter it manually.");
        }
      );
    } else {
      setGettingLocation(false);
      alert("Geolocation is not supported by your browser");
    }
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else {
      onComplete({ 
        name, 
        type, 
        interests, 
        contentPreferences,
        customContentPreference,
        location,
        language, 
        mode,
        likedArticles: [],
        savedArticles: [],
        history: []
      });
    }
  };

  const totalSteps = 5;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-editorial-bg font-serif">
      <div className="w-full max-w-2xl bg-white border-4 border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between mb-12 border-b-4 border-black pb-8">
          <div className="w-full flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`h-2 flex-1 transition-all ${i + 1 <= step ? 'bg-black' : 'bg-zinc-200'}`} 
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center border-b-2 border-black pb-6">
                <h2 className="masthead text-5xl md:text-6xl">WHO ARE YOU?</h2>
                <p className="text-body-gray italic text-lg">Tell us your name and what best describes you.</p>
              </div>
              
              <input 
                type="text" 
                placeholder="Your Name"
                className="w-full bg-white border-2 border-black p-4 text-2xl font-serif text-editorial-ink focus:outline-none focus:ring-0 transition-all placeholder:text-zinc-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(USER_TYPE_INTERESTS) as UserType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setType(t);
                      setInterests([]); // Reset interests when type changes
                    }}
                    className={`p-6 border-2 transition-all text-left group ${
                      type === t ? 'bg-black border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' : 'bg-white border-black text-editorial-ink hover:bg-zinc-100'
                    }`}
                  >
                    <span className={`text-xl font-bold font-serif block ${type === t ? 'text-white' : 'text-editorial-ink'}`}>{t}</span>
                    <span className={`text-sm mt-2 block font-sans ${type === t ? 'text-zinc-300' : 'text-zinc-500'}`}>Personalized for {t.toLowerCase()}s</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center border-b-2 border-black pb-6">
                <h2 className="masthead text-5xl md:text-6xl">YOUR INTERESTS</h2>
                <p className="text-body-gray italic text-lg">Select topics related to {type} or add your own.</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {USER_TYPE_INTERESTS[type].map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-6 py-3 border-2 font-sans font-bold uppercase tracking-widest text-xs transition-all ${
                      interests.includes(interest) ? 'bg-black border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]' : 'bg-white border-black text-editorial-ink hover:bg-zinc-100'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Add custom interest..."
                  className="flex-1 bg-white border-2 border-black p-4 focus:outline-none focus:ring-0 transition-all font-serif text-editorial-ink placeholder:text-zinc-400"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && customInterest) {
                      toggleInterest(customInterest);
                      setCustomInterest('');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (customInterest) {
                      toggleInterest(customInterest);
                      setCustomInterest('');
                    }
                  }}
                  className="bg-black text-white px-8 font-sans font-bold uppercase tracking-widest text-sm hover:bg-zinc-800 transition-all border-2 border-black"
                >
                  Add
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center border-b-2 border-black pb-6">
                <h2 className="masthead text-5xl md:text-6xl">CONTENT PREFERENCE</h2>
                <p className="text-body-gray italic text-lg">How do you prefer to consume news?</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {(['Simple explanation', 'Detailed explanation', 'Video', 'Audio', 'Text', 'Custom'] as ContentPreference[]).map((pref) => (
                  <button
                    key={pref}
                    onClick={() => toggleContentPreference(pref)}
                    className={`px-6 py-3 border-2 font-sans font-bold uppercase tracking-widest text-xs transition-all ${
                      contentPreferences.includes(pref) ? 'bg-black border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]' : 'bg-white border-black text-editorial-ink hover:bg-zinc-100'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>

              {contentPreferences.includes('Custom') && (
                <div className="mt-4">
                  <input 
                    type="text" 
                    placeholder="E.g., Infographics, bullet points only..."
                    className="w-full bg-white border-2 border-black p-4 focus:outline-none focus:ring-0 transition-all font-serif text-editorial-ink placeholder:text-zinc-400"
                    value={customContentPreference}
                    onChange={(e) => setCustomContentPreference(e.target.value)}
                  />
                </div>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center border-b-2 border-black pb-6">
                <h2 className="masthead text-5xl md:text-6xl">LANGUAGE & MODE</h2>
                <p className="text-body-gray italic text-lg">How would you like to read your news?</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {['English', 'Tamil', 'Telugu', 'Hindi', 'Bengali'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang as any)}
                    className={`p-4 border-2 flex flex-col items-center gap-2 transition-all ${
                      language === lang ? 'bg-black border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' : 'bg-white border-black text-editorial-ink hover:bg-zinc-100'
                    }`}
                  >
                    <Globe className={`w-6 h-6 ${language === lang ? 'text-white' : 'text-editorial-ink'}`} />
                    <span className="text-lg font-serif font-bold">{lang}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3 mt-6">
                <h3 className="font-sans font-bold uppercase tracking-widest text-xs text-zinc-500">Experience Mode</h3>
                {[
                  { id: 'Literal', desc: 'Direct context-aware translation' },
                  { id: 'Romanized', desc: 'Mix of English and local language (e.g., Tanglish/Hinglish)' },
                  { id: 'Simple English', desc: 'Simplified for easy understanding' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as any)}
                    className={`w-full p-4 border-2 flex flex-col items-start gap-1 transition-all ${
                      mode === m.id ? 'bg-black border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' : 'bg-white border-black text-editorial-ink hover:bg-zinc-100'
                    }`}
                  >
                    <span className={`text-lg font-serif font-bold ${mode === m.id ? 'text-white' : 'text-editorial-ink'}`}>{m.id}</span>
                    <span className={`text-xs font-sans ${mode === m.id ? 'text-zinc-300' : 'text-zinc-500'}`}>{m.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center border-b-2 border-black pb-6">
                <h2 className="masthead text-5xl md:text-6xl">LOCATION</h2>
                <p className="text-body-gray italic text-lg">Enable location for the Vernacular Business Engine.</p>
              </div>
              
              <div className="flex flex-col items-center gap-6 py-8">
                <div className="w-24 h-24 rounded-full bg-zinc-100 border-4 border-black flex items-center justify-center">
                  <MapPin className="w-10 h-10 text-editorial-ink" />
                </div>
                
                <div className="w-full space-y-4">
                  <button 
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                    className="w-full bg-trust-blue text-white p-4 font-sans font-bold uppercase tracking-widest text-sm hover:bg-blue-700 transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-50"
                  >
                    {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
                  </button>
                  
                  <div className="text-center text-zinc-500 font-serif italic">or</div>
                  
                  <input 
                    type="text" 
                    placeholder="Enter city manually..."
                    className="w-full bg-white border-2 border-black p-4 focus:outline-none focus:ring-0 transition-all font-serif text-editorial-ink placeholder:text-zinc-400"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 pt-8 border-t-2 border-black flex justify-between items-center">
          <div className="text-editorial-ink font-sans font-bold text-sm uppercase tracking-widest">Step {step} of {totalSteps}</div>
          <button 
            onClick={handleNext}
            disabled={step === 1 && !name}
            className="bg-black text-white px-8 py-4 font-sans font-bold text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-zinc-800 transition-all disabled:opacity-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            {step === totalSteps ? 'Get Started' : 'Continue'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
