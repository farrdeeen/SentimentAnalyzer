import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Analyzer({
  onAnalyze,
  loading,
}: {
  onAnalyze: (input: string) => void;
  loading: boolean;
}) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      alert("Please enter some text.");
      return;
    }
    onAnalyze(input);
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-xl p-8"
    >
      <h2 className="text-2xl font-bold mb-3 text-blue-700">Sentiment Analyzer</h2>
      <p className="mb-4 text-gray-600">
        Type or paste a sentence, review, or comment to see its sentiment:
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          placeholder="Enter text to analyze sentiment..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-40 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-lg font-semibold transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
          }`}
        >
          {loading ? 'Analyzing...' : 'Analyze Sentiment 🔍'}
        </motion.button>
      </form>
    </motion.div>
  );
}
