import { useState } from "react";
import Analyzer from "./components/Analyzer";
import Results from "./components/Results";
import { motion } from "framer-motion";
import Iridescence from "./components/Iridescence";

const API_URL = "https://nle09wp9zb.execute-api.ap-south-1.amazonaws.com/sentiment";

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeInput = async (input: string) => {
    if (!input.trim()) {
      alert("Please enter some text.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze. Please try again.");
      }

      const data = await response.json();
      console.log("API Response:", data);

      setResult({
        sentiment: data.sentiment,
        score: data.score
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Fixed sentiment checking with case-insensitive comparison
  let iridescenceProps = {
    color: [1, 1, 1] as [number, number, number], // Default white
    mouseReact: false,
    amplitude: 0.1,
    speed: 1.0
  };

  if (result?.sentiment) {
    const sentimentLower = result.sentiment.toLowerCase(); // Convert to lowercase
    console.log("Normalized sentiment:", sentimentLower);
    
    if (sentimentLower === 'positive') {
      console.log("Setting GREEN background for positive sentiment");
      iridescenceProps = {
        color: [0, 1, 0] as [number, number, number], // Green
        mouseReact: true,
        amplitude: 0.1,
        speed: 1.0
      };
    } else if (sentimentLower === 'negative') {
      console.log("Setting RED background for negative sentiment");
      iridescenceProps = {
        color: [1, 0, 0] as [number, number, number], // Red
        mouseReact: true,
        amplitude: 0.1,
        speed: 1.0
      };
    } else if (sentimentLower === 'neutral') {
      console.log("Setting WHITE background for neutral sentiment");
      // Already set to white above
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen text-gray-900 overflow-hidden"
    >
      <Iridescence
        color={iridescenceProps.color}
        mouseReact={iridescenceProps.mouseReact}
        amplitude={iridescenceProps.amplitude}
        speed={iridescenceProps.speed}
      />
      
      <main className="max-w-3xl mx-auto px-4 py-10 relative z-10">
        <Analyzer onAnalyze={analyzeInput} loading={loading} />
        <Results result={result} error={error} />
      </main>
    </motion.div>
  );
}

export default App;
