import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Brain, Shield, User, Heart, ChevronRight, Loader2, AlertCircle, CheckCircle2, XCircle, Info } from "lucide-react";
import { getHealthRecommendations } from "../geminiService";

interface HealthAction {
  title: string;
  description: string;
  icon: "shield" | "wind" | "activity" | "map-pin";
}

interface ActivityAdvice {
  activity: string;
  advice: string;
  allowed: boolean;
}

interface HealthReport {
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  summary: string;
  actions: HealthAction[];
  activityAdvice: ActivityAdvice[];
  generalTips: string[];
}

interface HealthCalculatorProps {
  aqi: number;
}

export const HealthCalculator: React.FC<HealthCalculatorProps> = ({ aqi }) => {
  const [age, setAge] = useState<number>(25);
  const [conditions, setConditions] = useState<string[]>([]);
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(false);

  const commonConditions = ["Asthma", "Heart Disease", "Lung Disease", "Elderly", "Child"];

  const toggleCondition = (condition: string) => {
    setConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const result = await getHealthRecommendations(aqi, age, conditions);
      // Clean the result in case Gemini adds markdown code blocks
      const cleanJson = result.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      setReport(parsed);
    } catch (error) {
      console.error("Failed to parse health report:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low": return "text-green-600 bg-green-50 border-green-100";
      case "Moderate": return "text-yellow-600 bg-yellow-50 border-yellow-100";
      case "High": return "text-orange-600 bg-orange-50 border-orange-100";
      case "Critical": return "text-red-600 bg-red-50 border-red-100";
      default: return "text-blue-600 bg-blue-50 border-blue-100";
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "shield": return <Shield size={18} />;
      case "wind": return <Activity size={18} />;
      case "activity": return <Activity size={18} />;
      case "map-pin": return <Shield size={18} />;
      default: return <Info size={18} />;
    }
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
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 space-y-6"
            >
              {/* Risk Summary */}
              <div className={`p-6 rounded-3xl border ${getRiskColor(report.riskLevel)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-widest">Risk Level</span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-white/50">{report.riskLevel}</span>
                </div>
                <h4 className="text-xl font-black mb-2">{report.summary}</h4>
              </div>

              {/* Recommended Actions */}
              {report.actions.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                  {report.actions.map((action, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
                        {getIcon(action.icon)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{action.title}</div>
                        <div className="text-xs text-gray-500">{action.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Activity Advice */}
              {report.activityAdvice.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Activity Guide</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {report.activityAdvice.map((advice, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          {advice.allowed ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                          <span className="text-sm font-bold text-gray-700">{advice.activity}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 italic">{advice.advice}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General Tips */}
              {report.generalTips.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3 text-blue-800 font-bold text-xs uppercase tracking-widest">
                    <Brain size={16} />
                    <span>Quick Tips</span>
                  </div>
                  <ul className="space-y-2">
                    {report.generalTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-blue-900">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
