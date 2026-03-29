import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, AlertCircle } from 'lucide-react';
import './VideoPlayer.css';

interface VideoPlayerProps {
  videoUrl: string;
  script: string;
  title: string;
  isFake?: boolean;
}

interface Scene {
  text: string;
  img: string;
}

export default function VideoPlayer({ videoUrl, script, title, isFake = false }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [useHTMLVideo, setUseHTMLVideo] = useState(!isFake);

  // 🎨 Convert script into cinematic scenes with background images
  const generateScenes = (): Scene[] => {
    const lines = script.split('\n').filter(line => line.trim().length > 0);
    
    if (isFake && lines.length > 0) {
      // Create dramatic scenes with random background images
      const sceneTexts = [
        '🚨 BREAKING NEWS',
        title.toUpperCase(),
        ...lines.slice(0, 3),
        '📊 Market Impact',
        '🧠 Expert Analysis',
        '📈 Future Outlook',
        '📰 Stay Tuned'
      ];

      return sceneTexts.map((text, idx) => ({
        text,
        img: `https://picsum.photos/1280/720?random=${idx}`
      }));
    }
    
    return [];
  };

  const scenes = isFake ? generateScenes() : [];

  useEffect(() => {
    if (!useHTMLVideo || !isPlaying || scenes.length === 0) return;

    // Auto-advance through scenes every 3 seconds (matching friend's design)
    const interval = setInterval(() => {
      setCurrentSceneIndex(prev => {
        if (prev >= scenes.length - 1) {
          return 0; // Loop back
        }
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, scenes.length, useHTMLVideo]);

  // 🎬 Real HTML5 Video Player
  if (!isFake && videoUrl) {
    return (
      <div className="bg-black relative h-full w-full flex flex-col">
        <video
          src={videoUrl}
          controls
          autoPlay
          className="w-full h-full object-cover"
          controlsList="nodownload"
        />
        {videoUrl.includes('BigBuckBunny') && (
          <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 text-xs font-bold uppercase border-2 border-black">
            Demo Video
          </div>
        )}
      </div>
    );
  }

  // 🎨 Animated Fake Video (Cinematic Scenes with Background Images)
  if (isFake && scenes.length > 0) {
    const currentScene = scenes[currentSceneIndex];
    
    return (
      <div className="video-container">
        {/* Scene with Background Image and Zoom-Fade Animation */}
        <motion.div
          key={currentSceneIndex}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1, opacity: 0 }}
          transition={{ duration: 3 }}
          className="scene"
          style={{
            backgroundImage: `url(${currentScene.img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="scene-overlay"></div>
          
          {/* Scene Text */}
          <div className="scene-text">
            {currentScene.text}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((currentSceneIndex + 1) / scenes.length) * 100}%`,
              }}
              transition={{ duration: 2.8 }}
              className="progress-fill"
            />
          </div>
          <div className="scene-counter">
            Scene {currentSceneIndex + 1} / {scenes.length}
          </div>
        </div>

        {/* Controls */}
        <div className="video-controls">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="control-btn"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setCurrentSceneIndex(0)}
            className="control-btn restart-btn"
          >
            Restart
          </button>
        </div>

        {/* Demo Badge */}
        <div className="demo-badge">
          🎬 AI Generated Preview
        </div>
      </div>
    );
  }

  // Fallback if nothing loads
  return (
    <div className="bg-black h-full w-full flex items-center justify-center flex-col gap-4">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <p className="text-white text-sm">Unable to load video</p>
    </div>
  );
}
