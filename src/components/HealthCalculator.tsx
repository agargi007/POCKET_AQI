import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Brain, Shield, User, Heart, ChevronRight, Loader2 } from "lucide-react";
import Markdown from "react-markdown";
import { getHealthRecommendations } from "../geminiService";

interface HealthCalculatorProps {
  aqi: number;
}

export const HealthCalculator: React.FC<HealthCalculatorProps> = ({ aqi }) => {
  const [age, setAge] = useState<number>(25);
  const [conditions, setConditions] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const commonConditions = ["Asthma", "Heart Disease", "Lung Disease", "Elderly", "Child"];

  const toggleCondition = (condition: string) => {
    setConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const handleCalculate = async () => {
    setLoading(true);
    const result = await getHealthRecommendations(aqi, age, conditions);
    setRecommendations(result);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-3xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
          <Shield size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Personalized Health Risk</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Age</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="100"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-xl font-bold text-gray-900 w-12">{age}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Health Conditions</label>
          <div className="flex flex-wrap gap-2">
            {commonConditions.map((c) => (
              <button
                key={c}
                onClick={() => toggleCondition(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  conditions.includes(c)
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              Calculate Recommendations
              <ChevronRight size={20} />
            </>
          )}
        </button>

        <AnimatePresence>
          {recommendations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-100"
            >
              <div className="flex items-center gap-2 mb-4 text-blue-800 font-bold">
                <Brain size={20} />
                <span>Personalized Advice</span>
              </div>
              <div className="prose prose-sm prose-blue max-w-none text-blue-900">
                <Markdown>{recommendations}</Markdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
