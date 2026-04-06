import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, MapPin, AlertTriangle, CheckCircle } from "lucide-react";

export const CommunityReport: React.FC = () => {
  const [report, setReport] = useState("");
  const [type, setType] = useState("Dust");
  const [submitted, setSubmitted] = useState(false);

  const pollutionTypes = ["Dust", "Smoke", "Traffic", "Construction", "Industrial", "Other"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!report.trim()) return;
    // In a real app, this would save to Firestore
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setReport("");
  };

  return (
    <div className="p-6 bg-white rounded-3xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
          <MessageSquare size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Community Report</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Pollution Type</label>
          <div className="flex flex-wrap gap-2">
            {pollutionTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  type === t
                    ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Description</label>
          <textarea
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="Describe the pollution source nearby..."
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
        >
          <Send size={18} />
          Submit Report
        </button>
      </form>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 text-sm font-medium border border-green-100"
          >
            <CheckCircle size={18} />
            Report submitted successfully! Thank you for contributing.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nearby Reports</h4>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Live Feed</span>
        </div>
        
        <div className="relative">
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar snap-y">
            {[
              { type: "Construction", time: "10m ago", desc: "Heavy dust from metro work at Sector 62. Visibility is low.", user: "Rahul S." },
              { type: "Traffic", time: "45m ago", desc: "High congestion at main junction. Exhaust fumes are noticeable.", user: "Priya K." },
              { type: "Smoke", time: "1h ago", desc: "Garbage burning reported in sector 5 near the park.", user: "Amit V." },
              { type: "Industrial", time: "3h ago", desc: "Chemical smell near industrial area. Residents advised to stay indoors.", user: "Sonal M." },
              { type: "Dust", time: "5h ago", desc: "Unpaved road causing significant dust in the morning.", user: "Karan P." },
            ].map((r, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 bg-gray-50 rounded-3xl flex items-start gap-4 border border-transparent hover:border-purple-100 hover:bg-white hover:shadow-xl hover:shadow-purple-500/5 transition-all cursor-default snap-start"
              >
                <div className="p-3 bg-white rounded-2xl shadow-sm text-purple-600 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-gray-900">{r.type}</span>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{r.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{r.desc}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-[8px] font-bold text-purple-600">
                      {r.user.charAt(0)}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{r.user}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <button className="w-full py-4 text-xs font-bold text-gray-400 hover:text-purple-600 transition-colors border-t border-gray-50 mt-4">
              Load older reports
            </button>
          </div>
          
          {/* Scroll Fade Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-3xl" />
        </div>
      </div>
    </div>
  );
};
