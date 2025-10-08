import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaLightbulb, FaRobot, FaSpinner, FaBolt } from 'react-icons/fa';
import useStore from '../store/useStore';
import { queryAI } from '../utils/api';

const AIAssistant = () => {
  const [query, setQuery] = useState('');
  const { isLoading, aiResponse, setLoading, setAiResponse, setError, clearResponse } = useStore();

  const suggestedQueries = [
    "Can I reach Goa from Mumbai with 75% battery?",
    "Plan route to Bangalore with charging stops",
    "How is my driving efficiency compared to others?",
    "What's the best route from Delhi to Jaipur?",
    "Find charging stations near Pune",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setLoading(true);
    clearResponse();

    try {
      const response = await queryAI(query);
      setAiResponse(response);
      setQuery(''); // Clear input after successful query
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to connect to AI backend. Make sure the server is running on http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-32 pb-20 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-2xl opacity-50"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                <FaRobot className="text-white text-4xl" />
              </div>
            </div>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI-Powered EV Assistant
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Ask anything about your EV range, routes, efficiency, or charging. 
            <br />Powered by local AI with insights from <span className="text-blue-600 font-semibold">2,917 trips</span> and <span className="text-indigo-600 font-semibold">100+ drivers</span>.
          </p>
        </motion.div>

        {/* Query Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <form onSubmit={handleSubmit}>
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl opacity-30 group-hover:opacity-50 group-focus-within:opacity-60 blur transition duration-500"></div>
              
              {/* Input container */}
              <div className="relative backdrop-blur-xl bg-white/80 border-2 border-blue-200/50 rounded-3xl p-2 shadow-2xl">
                <div className="flex items-center gap-4">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask me anything about your EV journey..."
                    className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 px-6 py-4 outline-none resize-none min-h-[60px] max-h-[200px] font-medium"
                    rows={1}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  
                  <motion.button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-blue-500/50 transition-all duration-300 mr-2"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin text-xl" />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="text-lg" />
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
        {!aiResponse && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4 text-gray-600">
              <FaLightbulb className="text-yellow-500" />
              <span className="text-sm font-medium">Suggested questions:</span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {suggestedQueries.map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="backdrop-blur-xl bg-white/60 hover:bg-white/80 border-2 border-blue-100/50 hover:border-blue-300/60 rounded-2xl px-4 py-3 text-sm text-gray-700 hover:text-gray-900 transition-all duration-300 shadow-sm"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Response */}
        <AnimatePresence mode="wait">
          {aiResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl opacity-20 blur-xl"></div>
              
              {/* Response container */}
              <div className="relative backdrop-blur-xl bg-white/80 border-2 border-blue-200/50 rounded-3xl p-8 shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-100/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FaBolt className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-gray-800 font-bold text-lg">AI Assistant Response</h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-green-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Online
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">
                        Confidence: {Math.round((aiResponse.confidence || 0.85) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Response content */}
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                    {aiResponse.response || aiResponse.error || 'No response received'}
                  </div>
                </div>

                {/* Metadata */}
                {aiResponse.query_type && (
                  <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-lg border border-purple-500/30">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      Query Type: {aiResponse.query_type}
                    </span>
                    {aiResponse.sources_used && (
                      <span className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        Sources: {aiResponse.sources_used.join(', ')}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearResponse}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm font-medium transition-all duration-300"
                  >
                    Ask Another Question
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading && !aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 text-center"
          >
            <FaSpinner className="text-purple-400 text-5xl mx-auto mb-4 animate-spin" />
            <p className="text-gray-300 text-lg">Processing your query...</p>
            <p className="text-gray-500 text-sm mt-2">Searching through 2,917 trips...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
