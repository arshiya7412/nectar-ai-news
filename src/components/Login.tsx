import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Newspaper, Chrome, Phone, User, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-editorial-bg flex items-center justify-center p-6 relative overflow-hidden font-serif">
      {/* Dynamic Newspaper Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden flex flex-col justify-center">
        <motion.div 
          animate={{ x: [-1000, 0] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="flex gap-8 whitespace-nowrap"
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="w-96 h-[500px] border-4 border-black p-4 bg-white">
                <div className="h-4 w-3/4 bg-black mb-4" />
                <div className="h-40 w-full bg-black mb-4" />
                {[...Array(10)].map((_, j) => (
                  <div key={j} className="h-2 w-full bg-black mb-2" />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side: Branding & "For You" Preview */}
        <div className="space-y-12">
          <div className="border-b-4 border-black pb-8">
            <h1 className="masthead text-7xl md:text-8xl mb-4">NECTAR</h1>
            <p className="text-xl text-editorial-ink font-sans font-bold uppercase tracking-[0.2em] text-center">Vernacular Business News Engine</p>
          </div>

          <div className="space-y-6">
            <h2 className="text-sm font-sans font-bold text-editorial-ink uppercase tracking-widest border-b-2 border-black pb-2">Trending Now</h2>
            <div className="space-y-4">
              {[
                { title: "Sensex surges 800 points on global cues", category: "MARKETS" },
                { title: "New AI startup raises $50M in Series A", category: "TECH" },
                { title: "RBI maintains repo rate at 6.5%", category: "ECONOMY" }
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 border border-zinc-300 border-l-4 border-l-trust-blue shadow-sm">
                  <span className="text-[10px] font-sans font-bold text-trust-blue mb-2 block tracking-widest">{item.category}</span>
                  <h3 className="main-headline text-xl">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="bg-white p-10 md:p-12 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-10 text-center border-b-2 border-black pb-6">
            <h2 className="masthead text-4xl mb-2">Welcome Back</h2>
            <p className="text-body-gray italic">Sign in to access your personalized news engine.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-4 text-editorial-ink w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Username or Email"
                  className="w-full bg-white border-2 border-black py-4 pl-12 pr-4 focus:outline-none focus:ring-0 transition-all font-serif text-editorial-ink placeholder:text-zinc-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-editorial-ink w-5 h-5" />
                <input 
                  type="password" 
                  placeholder="Password"
                  className="w-full bg-white border-2 border-black py-4 pl-12 pr-4 focus:outline-none focus:ring-0 transition-all font-serif text-editorial-ink placeholder:text-zinc-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-4 text-editorial-ink w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Phone Number (Optional)"
                  className="w-full bg-white border-2 border-black py-4 pl-12 pr-4 focus:outline-none focus:ring-0 transition-all font-serif text-editorial-ink placeholder:text-zinc-400"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-black text-white font-sans font-bold py-4 uppercase tracking-widest hover:bg-zinc-800 transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
            >
              Sign In
            </button>

            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-dotted border-zinc-300"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-sans font-bold"><span className="bg-white px-4 text-editorial-ink">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={onLogin} className="flex items-center justify-center gap-3 bg-white border-2 border-black py-4 hover:bg-zinc-100 transition-all font-sans font-bold text-sm uppercase tracking-widest">
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                Google
              </button>
              <button type="button" onClick={onLogin} className="flex items-center justify-center gap-3 bg-white border-2 border-black py-4 hover:bg-zinc-100 transition-all font-sans font-bold text-sm uppercase tracking-widest">
                <img src="https://www.apple.com/favicon.ico" className="w-4 h-4" alt="Apple" />
                Apple
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-editorial-ink font-serif italic">
            Don't have an account? <button className="text-trust-blue font-bold hover:underline not-italic">Create one</button>
          </p>
        </div>
      </div>
    </div>
  );
}
