import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaLightbulb, FaRobot, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import useStore from '../store/useStore';

const AIQueryInterface = () => {
  const [query, setQuery] = useState('');
  const { aiResponse, setAiResponse, loading, setLoading } = useStore();

  const suggestedQueries = [
    "Can I reach Goa from Mumbai with 75% battery?",
    "Plan route to Bangalore with charging stops",
    "How is my driving efficiency compared to others?",
    "Why is my range lower this week?",
    "Find charging stations near Pune",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8000/api/query', {
        query: query,
        user_id: 'user_001', // TODO: Get from auth
        include_map: false
      });

      setAiResponse(response.data);
    } catch (error) {
      console.error('Query failed:', error);
      setAiResponse({
        success: false,
        response: 'Sorry, I encountered an error. Please try again.',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <FaRobot className="text-white text-4xl" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            AI-Powered EV Assistant
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Ask anything about your EV range, routes, efficiency, or charging. 
            Powered by local AI with insights from 100+ EV drivers.
          </p>
        </motion.div>

        {/* Query Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <form onSubmit={handleSubmit} className="relative">
            {/* Glassmorphism input container */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-30 group-hover:opacity-50 blur transition duration-500"></div>
              
              <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-2 shadow-2xl">
                <div className="flex items-center gap-4">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask me anything about your EV journey..."
                    className="flex-1 bg-transparent text-white placeholder-gray-400 px-6 py-4 outline-none resize-none min-h-[60px] max-h-[200px]"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  
                  <motion.button
                    type="submit"
                    disabled={loading || !query.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        <span>Ask</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Suggested Queries */}
        {!aiResponse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4 text-gray-400">
              <FaLightbulb className="text-yellow-400" />
              <span className="text-sm font-medium">Suggested questions:</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {suggestedQueries.map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-2xl px-4 py-2 text-sm text-gray-300 hover:text-white transition-all duration-300"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Response */}
        <AnimatePresence>
          {aiResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-20 blur-xl"></div>
              
              {/* Response container */}
              <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <FaRobot className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">AI Assistant</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-green-400">● Online</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">
                        Confidence: {Math.round((aiResponse.confidence || 0.85) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Response content */}
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {aiResponse.response}
                  </div>
                </div>

                {/* Metadata */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Query Type: {aiResponse.query_type || 'general'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Sources: {aiResponse.sources_used?.join(', ') || 'global_rag, personal_rag'}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAiResponse(null)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm transition-all duration-300"
                  >
                    Ask Another Question
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIQueryInterface;
