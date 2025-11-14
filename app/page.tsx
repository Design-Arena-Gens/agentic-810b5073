'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Sparkles, Download, Loader2, Film, Wand2 } from 'lucide-react';

interface VideoGeneration {
  id: string;
  prompt: string;
  status: 'generating' | 'completed' | 'failed';
  videoUrl?: string;
  progress?: number;
  error?: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [generations, setGenerations] = useState<VideoGeneration[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateVideo = async () => {
    if (!prompt.trim() || !apiKey.trim()) {
      alert('Please enter both a prompt and API key');
      return;
    }

    const newGeneration: VideoGeneration = {
      id: Date.now().toString(),
      prompt,
      status: 'generating',
      progress: 0,
    };

    setGenerations((prev) => [newGeneration, ...prev]);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate video');
      }

      setGenerations((prev) =>
        prev.map((gen) =>
          gen.id === newGeneration.id
            ? { ...gen, status: 'completed', videoUrl: data.videoUrl, progress: 100 }
            : gen
        )
      );
    } catch (error: any) {
      setGenerations((prev) =>
        prev.map((gen) =>
          gen.id === newGeneration.id
            ? { ...gen, status: 'failed', error: error.message }
            : gen
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Film className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold text-white">
              Veo 3.1 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">AI Video</span>
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Generate 8K Ultra Realistic Cinematic Videos with Google Veo 3.1</p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="mb-6">
              <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Video Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your cinematic video... e.g., 'A majestic eagle soaring over snow-capped mountains at golden hour, cinematic 8K, ultra realistic'"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <div className="mb-6">
              <label className="block text-white text-sm font-semibold mb-2">
                Google API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google AI API key"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-2">
                Get your API key from{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateVideo}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Video
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Generations Grid */}
        <AnimatePresence>
          {generations.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-6xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Video className="w-6 h-6" />
                Your Generations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generations.map((gen) => (
                  <motion.div
                    key={gen.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl"
                  >
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{gen.prompt}</p>

                    {gen.status === 'generating' && (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                        <div className="flex-1">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: '0%' }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 30, ease: 'linear' }}
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {gen.status === 'completed' && gen.videoUrl && (
                      <div>
                        <video
                          src={gen.videoUrl}
                          controls
                          className="w-full rounded-lg mb-4"
                        />
                        <a
                          href={gen.videoUrl}
                          download
                          className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download Video
                        </a>
                      </div>
                    )}

                    {gen.status === 'failed' && (
                      <div className="text-red-400 text-sm">
                        <p className="font-semibold">Error:</p>
                        <p>{gen.error}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
