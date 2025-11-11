import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Loader2, History, Trash2, Clock, ChevronRight } from 'lucide-react';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001';

export default function MemeGenerator() {
  const [topic, setTopic] = useState('');
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const MEME_COUNT = 3;
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/history`);
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const generateMemes = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic!');
      return;
    }

    setLoading(true);
    setError('');
    setMemes([]);

    try {
      const response = await fetch(`${API_URL}/api/generate-memes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: topic.trim()
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate memes');
      }

      // Use images as-is from backend (already have captions)
      const processedMemes = data.memes.map(meme => ({
        ...meme,
        finalImage: meme.imageBase64
      }));

      setMemes(processedMemes);
      await loadHistory();

    } catch (err) {
      setError(err.message || 'Failed to generate memes. Make sure backend is running!');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadMeme = (meme, index) => {
    const a = document.createElement('a');
    a.href = meme.finalImage || meme.imageBase64;
    a.download = `meme-${meme.topic}-${index + 1}-${Date.now()}.png`;
    a.click();
  };

  const deleteFromHistory = async (id) => {
    try {
      await fetch(`${API_URL}/api/history/${id}`, { method: 'DELETE' });
      await loadHistory();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const loadHistoryMemes = (entry) => {
    const processedMemes = entry.memes.map(meme => ({
      ...meme,
      finalImage: meme.imageBase64
    }));
    setMemes(processedMemes);
    setTopic(entry.topic);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="relative">
                <Sparkles className="w-12 h-12 text-cyan-400 animate-pulse" />
                <div className="absolute inset-0 blur-xl bg-cyan-400/50"></div>
              </div>
              <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                AI Meme Studio
              </h1>
              <div className="relative">
                <Sparkles className="w-12 h-12 text-pink-400 animate-pulse" />
                <div className="absolute inset-0 blur-xl bg-pink-400/50"></div>
              </div>
            </div>
            <p className="text-gray-300 text-xl font-medium">
              Generate Viral Memes with AI • Unlimited Creativity
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-700/50">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && generateMemes()}
                  placeholder="Enter ANY topic... (Elections, Cricket, Startups, etc.)"
                  className="flex-1 px-6 py-4 text-lg bg-slate-900/50 text-white border-2 border-slate-600 rounded-xl focus:border-cyan-400 focus:outline-none placeholder-gray-400"
                  disabled={loading}
                />
                <button
                  onClick={generateMemes}
                  disabled={loading || !topic.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="text-gray-400 text-sm font-medium">Try:</span>
                  {['Elections', 'Cricket', 'Startups', 'Coding', 'Bollywood', 'Study Life'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setTopic(tag)}
                      disabled={loading}
                      className="px-3 py-1 bg-slate-700/50 text-cyan-300 rounded-full text-sm hover:bg-slate-700 transition-all border border-slate-600"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all border border-slate-600"
                >
                  <History className="w-4 h-4" />
                  <span className="text-sm font-medium">History ({history.length})</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm backdrop-blur-sm">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 max-h-96 overflow-y-auto border border-slate-700/50">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <Clock className="w-5 h-5 text-cyan-400" />
                Previous Generations
              </h3>
              {history.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No history yet. Generate your first memes!</p>
              ) : (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-all cursor-pointer border border-slate-700/50"
                      onClick={() => loadHistoryMemes(entry)}
                    >
                      <div className="flex-1">
                        <p className="font-bold text-white">{entry.topic}</p>
                        <p className="text-sm text-gray-400">
                          {entry.count} memes • {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFromHistory(entry.id);
                          }}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border border-slate-700/50">
              <Loader2 className="w-16 h-16 animate-spin text-cyan-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                AI is Creating Your Memes...
              </h3>
              <p className="text-gray-300">
                Generating 3 unique memes about "{topic}"
              </p>
              <p className="text-sm text-gray-400 mt-2">This may take 15-30 seconds</p>
            </div>
          </div>
        )}

        {/* Memes Display Grid */}
        {memes.length > 0 && !loading && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-700/50">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Your AI Memes are Ready! 🎉
                  </h2>
                  <p className="text-gray-300">Topic: <strong className="text-cyan-400">{topic}</strong> • Generated 3 unique memes</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memes.map((meme, index) => (
                  <div key={index} className="bg-slate-900/50 rounded-xl shadow-lg overflow-hidden border-2 border-slate-700/50 hover:border-cyan-400/50 transition-all group">
                    <div className="relative">
                      <img
                        src={meme.finalImage || meme.imageBase64}
                        alt={`Meme ${index + 1}`}
                        className="w-full h-auto"
                      />
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="p-4">
                      <button
                        onClick={() => downloadMeme(meme, index)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-cyan-500/10 rounded-lg text-sm text-gray-300 border border-cyan-500/20">
                <p>💡 <strong className="text-cyan-400">Tip:</strong> Generate again for completely different memes on the same topic!</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {memes.length === 0 && !loading && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-3xl p-16 text-center border-2 border-slate-700/50">
              <div className="relative mb-6">
                <Sparkles className="w-32 h-32 text-cyan-400/50 mx-auto" />
                <div className="absolute inset-0 blur-2xl bg-cyan-400/30"></div>
              </div>
              <h3 className="text-white text-3xl font-bold mb-3">
                Ready to Generate Viral Memes?
              </h3>
              <p className="text-gray-300 text-xl mb-6">
                Enter any topic - from trending news to daily life!
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-gray-400 text-sm">
                <div className="flex items-center gap-2"><span className="text-cyan-400">✓</span> Real AI Generated</div>
                <div className="flex items-center gap-2"><span className="text-cyan-400">✓</span> Multiple at Once</div>
                <div className="flex items-center gap-2"><span className="text-cyan-400">✓</span> Always Unique</div>
                <div className="flex items-center gap-2"><span className="text-cyan-400">✓</span> History Saved</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
