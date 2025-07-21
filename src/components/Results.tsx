import React from 'react';
import { motion } from 'framer-motion';

type ScoreType = {
  Positive?: number;
  Negative?: number;
  Neutral?: number;
  Mixed?: number;
};

type ResultsProps = {
  result: {
    sentiment?: string;
    score?: ScoreType;
    debug?: any;
  } | null;
  error?: string | null;
};

const colorMap: Record<string, string> = {
  Positive: "bg-green-500",
  Negative: "bg-red-500",
  Neutral: "bg-gray-500",
  Mixed: "bg-yellow-500",
};

export default function Results({ result, error }: ResultsProps) {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mt-10 bg-white rounded-2xl shadow-xl p-8 text-red-600 font-semibold"
      >
        {error}
      </motion.div>
    );
  }

  if (!result) return null;

  // Find top confidence label
  let maxLabel: keyof ScoreType = 'Neutral';
  let maxVal = 0;
  if (result.score) {
    for (const [k, v] of Object.entries(result.score)) {
      if (typeof v === "number" && v > maxVal) {
        maxLabel = k as keyof ScoreType;
        maxVal = v;
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="mt-10 bg-white rounded-2xl shadow-xl p-8"
    >
      <h3 className="text-2xl font-bold mb-4 text-purple-700 flex items-center gap-2">
        🔎 Sentiment Analysis Result
      </h3>
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`px-4 py-2 rounded-full text-white font-semibold text-lg ${colorMap[maxLabel]}`}
        >
          {result.sentiment || "Unknown"}
        </span>
        <span className="text-gray-600 font-medium">
          Confidence: {(maxVal * 100).toFixed(1)}%
        </span>
      </div>

      {result.score &&
        Object.entries(result.score).map(([k, v]) => (
          <div key={k} className="mb-2">
            <span className="inline-block w-20 font-semibold">{k}:</span>
            <span className="inline-block w-14 text-right">{((v || 0) * 100).toFixed(1)}%</span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className={`${colorMap[k] || "bg-gray-300"} h-2 rounded-full`}
                style={{ width: `${((v || 0) * 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
    </motion.div>
  );
}
