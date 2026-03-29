import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Heart, MessageCircle, Share2, Bookmark, 
  ChevronUp, ChevronDown, Sparkles, Video as VideoIcon, 
  Upload, X, ChevronLeft, Download, Eye 
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface VideoReel {
  id: string;
  title: string;
  script: string;
  duration: string;
  description: string;
  generatedAt: string;
  status: string;
  provider?: string;
  didStatus?: string;
  didMessage?: string;
  runwayStatus?: string;
  runwayMessage?: string;
  estimatedTime?: string;
  videoUrl?: string;
  isFake?: boolean;
  scenes: Array<{
    number: number;
    name: string;
    duration: string;
    description: string;
  }>;
}

export default function VideoFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedReel, setGeneratedReel] = useState<VideoReel | null>(null);
  const [showScriptModal, setShowScriptModal] = useState(false);

  const videos = [
    { id: 1, title: 'Market Trends 2024', author: 'By Finance Desk', likes: '12.4K', comments: '842', color: 'bg-zinc-800' },
    { id: 2, title: 'Tech Revolution', author: 'By Technology Editor', likes: '8.2K', comments: '421', color: 'bg-zinc-700' },
    { id: 3, title: 'Global Economy', author: 'By World News', likes: '15.1K', comments: '1.2K', color: 'bg-zinc-900' },
  ];

  const handleNext = () => setCurrentIndex(prev => (prev + 1) % videos.length);
  const handlePrev = () => setCurrentIndex(prev => (prev - 1 + videos.length) % videos.length);

  return (
    <div className="min-h-screen bg-editorial-bg flex flex-col items-center p-6 lg:p-12 pb-32 font-serif">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="masthead text-4xl md:text-5xl mb-2">VIDEO DISPATCH</h1>
        <p className="text-caption-gray italic">Visual reports and AI-generated reels</p>
      </div>

      <div className="relative w-full max-w-md h-[70vh] bg-white border-4 border-black overflow-hidden shadow-sm">
        {/* Video Player Area */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className={`absolute inset-0 ${videos[currentIndex].color} flex items-center justify-center`}
          >
            <div className="text-center text-white p-10">
              <VideoIcon className="w-24 h-24 mx-auto mb-6 opacity-50" />
              <h2 className="text-4xl font-bold tracking-tight uppercase mb-2 font-serif">{videos[currentIndex].title}</h2>
              <p className="text-xl font-serif italic opacity-80">{videos[currentIndex].author}</p>
            </div>
            
            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 pt-20 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-white text-black flex items-center justify-center border border-black">
                  <VideoIcon className="w-4 h-4" />
                </div>
                <span className="font-sans font-bold uppercase tracking-widest text-xs">AI Generated Reel</span>
              </div>
              <h3 className="text-2xl font-bold font-serif mb-2 leading-tight">
                {videos[currentIndex].title}
              </h3>
              <p className="text-sm opacity-90 font-serif line-clamp-2">
                Analyzing the latest trends and market shifts using advanced NECTAR AI models.
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Interaction Sidebar */}
        <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-10">
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-sans font-bold text-white uppercase tracking-widest drop-shadow-md">{videos[currentIndex].likes}</span>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-sans font-bold text-white uppercase tracking-widest drop-shadow-md">{videos[currentIndex].comments}</span>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-sans font-bold text-white uppercase tracking-widest drop-shadow-md">Share</span>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-sans font-bold text-white uppercase tracking-widest drop-shadow-md">Save</span>
          </button>
        </div>

        {/* Navigation Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 flex flex-col gap-4 z-10">
          <button onClick={handlePrev} className="p-2 bg-white border-2 border-black text-black hover:bg-black hover:text-white transition-all">
            <ChevronUp className="w-6 h-6" />
          </button>
          <button onClick={handleNext} className="p-2 bg-white border-2 border-black text-black hover:bg-black hover:text-white transition-all">
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        {/* AI Generator Button */}
        <button 
          onClick={() => setShowGenerator(true)}
          className="absolute top-6 right-6 bg-white border-2 border-black text-black px-4 py-2 font-sans font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] z-20"
        >
          <Sparkles className="w-4 h-4" /> Generate
        </button>
      </div>

      {/* AI Generator Modal */}
      <AnimatePresence>
        {showGenerator && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 font-serif"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl bg-editorial-bg border-4 border-black p-8 md:p-12 relative shadow-2xl"
            >
              <button 
                onClick={() => setShowGenerator(false)}
                className="absolute top-6 right-6 p-2 border-2 border-transparent hover:border-black transition-all"
              >
                <X className="w-6 h-6 text-editorial-ink" />
              </button>

              <div className="flex items-center gap-4 mb-8 border-b-2 border-black pb-6">
                <div className="w-12 h-12 bg-black flex items-center justify-center text-white">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="main-headline text-3xl">AI Video Generator</h2>
                  <p className="text-body-gray italic">Transform text or images into cinematic news reels.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-sans font-bold text-editorial-ink uppercase tracking-widest">Video Prompt</label>
                  <textarea 
                    placeholder="Describe the video you want to generate (e.g. A futuristic financial district with floating charts)..."
                    className="w-full bg-white border-2 border-black p-4 text-lg text-editorial-ink focus:outline-none focus:ring-0 transition-all min-h-[120px] resize-none font-serif"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <label className="p-6 bg-white border-2 border-black border-dashed flex flex-col items-center gap-3 text-editorial-ink hover:bg-zinc-100 transition-all group cursor-pointer">
                    <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        alert(`Selected file: ${e.target.files[0].name}`);
                      }
                    }} />
                    <Upload className="w-8 h-8 group-hover:-translate-y-1 transition-transform" />
                    <span className="font-sans font-bold uppercase tracking-widest text-xs">Upload Reference</span>
                  </label>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={async () => {
                      if (prompt.trim()) {
                        console.log('🎬 [VideoFeed] Generate Cinematic Reel button clicked');
                        console.log(`📝 [VideoFeed] Prompt entered: "${prompt}"`);
                        
                        try {
                          console.log('🔄 [VideoFeed] Sending request to /api/generate-video...');
                          const response = await fetch('http://localhost:3000/api/generate-video', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              prompt: prompt,
                              timestamp: new Date().toISOString()
                            })
                          });

                          console.log(`📊 [VideoFeed] Response status: ${response.status}`);

                          if (!response.ok) {
                            throw new Error(`HTTP ${response.status}`);
                          }

                          const reel = await response.json();
                          console.log('✅ [VideoFeed] Reel generated successfully:', reel);
                          
                          // Store the generated reel and show in modal
                          setGeneratedReel(reel);
                          setShowScriptModal(true);
                          setShowGenerator(false);
                          setPrompt('');
                        } catch (error) {
                          console.error('❌ [VideoFeed] Failed to generate reel:', error);
                          alert(`❌ Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck console for details.`);
                        }
                      } else {
                        console.warn('⚠️ [VideoFeed] Generate button clicked but prompt is empty');
                        alert('Please enter a prompt or upload a reference image');
                      }
                    }}
                    className="w-full bg-black text-white font-sans font-bold py-4 text-lg uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]">
                    <Sparkles className="w-5 h-5" /> Generate Cinematic Reel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Script Modal - REAL GENERATED SCRIPT */}
      <AnimatePresence>
        {showScriptModal && generatedReel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 font-serif"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-4xl bg-editorial-bg border-4 border-black p-8 md:p-12 relative shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowScriptModal(false)}
                className="absolute top-6 right-6 p-2 border-2 border-transparent hover:border-black transition-all"
              >
                <X className="w-6 h-6 text-editorial-ink" />
              </button>

              <div className="mb-8">
                {/* Video Player */}
                <div className="mb-8 border-4 border-black overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
                  <VideoPlayer
                    videoUrl={generatedReel.videoUrl || ''}
                    script={generatedReel.script}
                    title={generatedReel.title}
                    isFake={generatedReel.isFake || !generatedReel.videoUrl}
                  />
                </div>

                <div className="flex items-center gap-4 mb-6 border-b-2 border-black pb-6">
                  <div className="w-12 h-12 bg-black flex items-center justify-center text-white">
                    <VideoIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="main-headline text-3xl">{generatedReel.title}</h2>
                    <p className="text-body-gray italic">{generatedReel.duration} cinematic reel</p>
                  </div>
                </div>

                {/* Video Generation Status Badge */}
                {(generatedReel.didStatus || generatedReel.runwayStatus) && (
                  <div className={`mb-6 p-4 border-2 border-black ${(generatedReel.didStatus || generatedReel.runwayStatus) === 'processing' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                    <div className="font-bold uppercase tracking-widest text-sm mb-2">
                      {(generatedReel.didStatus || generatedReel.runwayStatus) === 'processing' ? '🎥 Video Generation in Progress' : '✅ Video Ready'}
                    </div>
                    <p className="text-sm text-gray-700">{generatedReel.didMessage || generatedReel.runwayMessage}</p>
                    {generatedReel.estimatedTime && (generatedReel.didStatus || generatedReel.runwayStatus) === 'processing' && (
                      <p className="text-xs text-gray-600 mt-2">⏱️ Estimated time: {generatedReel.estimatedTime}</p>
                    )}
                  </div>
                )}

                {/* Scene Overview */}
                <div className="mb-8">
                  <h3 className="font-bold text-lg mb-4 uppercase tracking-widest">Scene Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {generatedReel.scenes.map((scene) => (
                      <div key={scene.number} className="border-2 border-black p-4 bg-white">
                        <div className="text-sm font-sans font-bold uppercase tracking-widest text-editorial-ink mb-2">
                          Scene {scene.number}
                        </div>
                        <div className="text-lg font-serif font-bold mb-2">{scene.name}</div>
                        <div className="text-xs text-gray-600 mb-2">{scene.duration}</div>
                        <p className="text-xs">{scene.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Script */}
                <div className="border-2 border-black bg-white p-6">
                  <h3 className="font-bold text-lg mb-4 uppercase tracking-widest">Full Video Script</h3>
                  <pre className="font-serif text-sm leading-relaxed whitespace-pre-wrap text-editorial-ink overflow-x-auto">
                    {generatedReel.script}
                  </pre>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <button 
                    onClick={() => {
                      const scriptText = `${generatedReel.title}\n\nStatus: ${generatedReel.didStatus || generatedReel.runwayStatus}\n\n${generatedReel.script}`;
                      const blob = new Blob([scriptText], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `video-script-${Date.now()}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      alert('✅ Script downloaded!');
                    }}
                    className="flex-1 bg-black text-white font-sans font-bold py-3 uppercase tracking-widest hover:bg-zinc-800 transition-all border-2 border-black flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" /> Download Script
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedReel.script);
                      alert('✅ Script copied to clipboard!');
                    }}
                    className="flex-1 bg-white text-black font-sans font-bold py-3 uppercase tracking-widest hover:bg-gray-100 transition-all border-2 border-black"
                  >
                    Copy Script
                  </button>
                </div>

                {/* Video Provider Info */}
                <div className="mt-8 p-4 bg-indigo-50 border-2 border-indigo-300 rounded">
                  <p className="text-sm text-indigo-900">
                    <strong>🎬 {generatedReel.provider === 'D-ID' ? 'D-ID Avatar Video' : 'Video Generation'} Integration:</strong> Your video is being processed by {generatedReel.provider || 'D-ID'} AI. 
                    {(generatedReel.didStatus || generatedReel.runwayStatus) === 'processing' && ' Check back in 2-5 minutes for your video.'}
                    {(generatedReel.didStatus || generatedReel.runwayStatus) === 'script_generated' && ' Script generated and queued for video rendering.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
