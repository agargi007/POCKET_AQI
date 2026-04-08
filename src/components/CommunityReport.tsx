import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, MapPin, AlertTriangle, CheckCircle, User as UserIcon, Globe, Loader2 } from "lucide-react";
import { 
  db, 
  auth, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  handleFirestoreError, 
  OperationType,
  limit
} from "../firebase";
import { User as FirebaseUser } from "firebase/auth";
import { translations, Language } from "../translations";

interface CommunityReportProps {
  user: FirebaseUser;
  userLocation: { lat: number; lon: number } | null;
  lang: Language;
}

export const CommunityReport: React.FC<CommunityReportProps> = ({ user, userLocation, lang }) => {
  const t = translations[lang];
  const [report, setReport] = useState("");
  const [type, setType] = useState("Dust");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "mine" | "nearby">("all");

  const pollutionTypes = ["Dust", "Smoke", "Traffic", "Construction", "Industrial"];

  const SAMPLE_REPORTS = [
    { id: "s1", uid: "system", userName: "Local Watch", type: "Traffic", desc: "Heavy congestion near the city center causing visible smog.", lat: 28.6129, lon: 77.2090, createdAt: { toDate: () => new Date(Date.now() - 3600000) } },
    { id: "s2", uid: "system", userName: "Eco Guard", type: "Industrial", desc: "Factory emissions detected in the industrial zone. Avoid outdoor activities nearby.", lat: 19.0760, lon: 72.8777, createdAt: { toDate: () => new Date(Date.now() - 7200000) } },
    { id: "s3", uid: "system", userName: "Citizen X", type: "Smoke", desc: "Garbage burning reported in the residential area. Strong smell of smoke.", lat: 12.9716, lon: 77.5946, createdAt: { toDate: () => new Date(Date.now() - 10800000) } },
    { id: "s4", uid: "system", userName: "Air Monitor", type: "Dust", desc: "Construction site nearby is not using water sprays. High dust levels.", lat: 22.5726, lon: 88.3639, createdAt: { toDate: () => new Date(Date.now() - 14400000) } },
    { id: "s5", uid: "system", userName: "Green Team", type: "Construction", desc: "New metro construction site causing significant dust in the air.", lat: 13.0827, lon: 80.2707, createdAt: { toDate: () => new Date(Date.now() - 18000000) } },
  ];

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(fetchedReports);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, "reports"));

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report.trim() || !userLocation) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, "reports"), {
        uid: user.uid,
        userName: user.displayName || "Anonymous",
        type,
        desc: report,
        lat: userLocation.lat,
        lon: userLocation.lon,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      setReport("");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "reports");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReports = [...reports, ...SAMPLE_REPORTS].filter(r => {
    if (filter === "mine") return r.uid === user.uid;
    if (filter === "nearby") {
      if (!userLocation) return r.uid === "system"; // Show samples if no location
      const dist = Math.sqrt(Math.pow(r.lat - userLocation.lat, 2) + Math.pow(r.lon - userLocation.lon, 2));
      return dist < 0.5 && r.uid !== user.uid; // Within ~50km and not mine
    }
    if (filter === "all") return true;
    return true;
  }).sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="p-6 bg-white rounded-3xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
          <MessageSquare size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{t.communityReports}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-400 uppercase mb-2">{t.reportType}</label>
          <div className="flex flex-wrap gap-2">
            {pollutionTypes.map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() => setType(pt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  type === pt
                    ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {pt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 uppercase mb-2">{t.description}</label>
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
          disabled={submitting || !userLocation}
          className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          {submitting ? t.submitting : t.submitReport}
        </button>
        {!userLocation && <p className="text-[10px] text-red-500 font-bold text-center">Enable location to submit reports</p>}
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
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}
            >
              {t.allReports}
            </button>
            <button 
              onClick={() => setFilter("nearby")}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${filter === "nearby" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}
            >
              Nearby
            </button>
            <button 
              onClick={() => setFilter("mine")}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${filter === "mine" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}
            >
              {t.myReports}
            </button>
          </div>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Live Feed</span>
        </div>
        
        <div className="relative">
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar snap-y">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-xs">Loading reports...</span>
              </div>
            ) : filteredReports.length > 0 ? (
              filteredReports.map((r, i) => (
                <motion.div 
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 bg-gray-50 rounded-3xl flex items-start gap-4 border border-transparent hover:border-purple-100 hover:bg-white hover:shadow-xl hover:shadow-purple-500/5 transition-all cursor-default snap-start"
                >
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-purple-600 shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black text-gray-900">{r.type}</span>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {r.createdAt ? new Date(r.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{r.desc}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-[8px] font-bold text-purple-600">
                        {r.userName.charAt(0)}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">
                        {r.userName} {r.uid === user.uid && "(You)"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                <Globe size={48} className="opacity-10" />
                <p className="text-sm">No reports found</p>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-3xl" />
        </div>
      </div>
    </div>
  );
};
