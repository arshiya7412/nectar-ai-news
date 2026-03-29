import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Upload, Search, CheckCircle, XCircle, AlertTriangle, ChevronLeft } from 'lucide-react';

export default function FakeNewsDetector() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadScreenshot = () => {
    console.log('[FakeNewsDetector] Upload screenshot clicked');
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    console.log('[FakeNewsDetector] File selected:', file.name);
    alert('Screenshot upload feature coming soon. For now, you can paste text directly.');
    // TODO: Implement OCR to extract text from screenshot
  };

  const handleCheck = async () => {
    if (!text) {
      console.log('[FakeNewsDetector] Empty text, ignoring');
      return;
    }
    
    console.log('[FakeNewsDetector] handleCheck triggered with text length:', text.length);
    setLoading(true);
    try {
      console.log('[FakeNewsDetector] Sending request to /api/fake-news-check');
      const response = await fetch('/api/fake-news-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      console.log('[FakeNewsDetector] Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[FakeNewsDetector] Error response:', errorText);
        throw new Error(`Failed to check news: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[FakeNewsDetector] Data received:', data);
      setResult(data);
    } catch (error) {
      console.error('[FakeNewsDetector] Full error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('Error: ' + errorMessage);
      setResult({ isFake: null, error: 'Error checking news. ' + errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-editorial-bg p-6 lg:p-12 pb-32 font-serif">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 border-b-4 border-black pb-8">
          <h1 className="masthead mb-4 text-4xl sm:text-5xl">FAKE NEWS DETECTOR</h1>
          <p className="text-zinc-600 font-serif italic text-lg mb-8 text-center">Real-time verification against Economic Times and global business sources.</p>
          
          <div className="space-y-6">
            <div className="bg-white border-2 border-black p-8 shadow-sm">
              <textarea 
                placeholder="Paste news text or claim here for real-time AI verification..."
                className="w-full bg-transparent border-none text-xl text-editorial-ink focus:outline-none min-h-[200px] resize-none font-serif"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              
              <div className="flex items-center justify-between pt-6 border-t border-black">
                <input 
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <button 
                  onClick={handleUploadScreenshot}
                  className="flex items-center gap-2 text-zinc-500 hover:text-trust-blue transition-all font-bold uppercase tracking-widest text-sm font-sans"
                >
                  <Upload className="w-5 h-5" /> Upload Screenshot
                </button>
                <button 
                  onClick={handleCheck}
                  disabled={!text || loading}
                  className="bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-bold px-10 py-4 uppercase tracking-widest text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] flex items-center gap-2 border-2 border-black font-sans"
                >
                  {loading ? 'Analyzing...' : 'Analyze News'}
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-black p-10 space-y-8 shadow-sm"
          >
            <div className="flex items-center justify-between border-b-2 border-black pb-6">
              <div className="flex items-center gap-4">
                {result.isFake ? (
                  <XCircle className="w-12 h-12 text-red-600" />
                ) : (
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                )}
                <div>
                  <h3 className="main-headline text-3xl uppercase tracking-tighter">
                    {result.isFake ? 'Likely Fake' : 'Likely Authentic'}
                  </h3>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs font-sans mt-2">Confidence Score: {result.confidence}%</p>
                </div>
              </div>
              <div className={`px-6 py-3 border-2 font-black uppercase tracking-widest text-sm font-sans ${
                result.isFake ? 'border-red-600 text-red-600 bg-red-50' : 'border-emerald-600 text-emerald-600 bg-emerald-50'
              }`}>
                {result.isFake ? 'High Risk' : 'Low Risk'}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-trust-blue uppercase tracking-widest font-sans">AI Reasoning</h4>
              <p className="body-text drop-cap italic text-xl leading-relaxed">
                "{result.reasoning}"
              </p>
            </div>

            <div className="p-6 bg-zinc-50 border border-black">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 font-sans">Source Verification</h4>
              <div className="flex items-center gap-3 text-editorial-ink font-bold font-serif">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                {result.sourceAnalysis}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
