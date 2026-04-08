import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  MapPin, 
  Home,
  Briefcase,
  Bell, 
  Settings, 
  Menu, 
  X, 
  Wind, 
  Shield, 
  Activity, 
  History, 
  MessageSquare,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Info,
  Globe,
  Thermometer,
  Droplets
} from "lucide-react";
import { AqiDisplay } from "./components/AqiDisplay";
import { PollutantBreakdown } from "./components/PollutantBreakdown";
import { HealthCalculator } from "./components/HealthCalculator";
import { ForecastCarousel } from "./components/ForecastCarousel";
import { MapViewer } from "./components/MapViewer";
import { useAqi, useLocation, usePrediction } from "./hooks";
import { getAqiLevel } from "./types";
import { CommunityReport } from "./components/CommunityReport";
import { Profile } from "./components/Profile";
import { RefreshCw, User as UserIcon, Save, Trash2, LogIn, LogOut as LogOutIcon, TrendingUp, Check } from "lucide-react";
import { translations, Language } from "./translations";
import { Trend } from "./types";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  setDoc, 
  getDoc,
  orderBy,
  OperationType,
  handleFirestoreError,
  User as FirebaseUser
} from "./firebase";
import { serverTimestamp, Timestamp } from "firebase/firestore";

const INDIAN_CITIES = [
  { name: "Delhi NCR", lat: 28.6129, lon: 77.2090 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
];

export default function App() {
  const { location: userLocation, error: locationError } = useLocation();
  const [selectedCity, setSelectedCity] = useState<{ name: string; lat: number; lon: number } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "details" | "health" | "community" | "profile">("home");
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem("lang") as Language) || "en");
  const t = translations[lang];

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [savedTrends, setSavedTrends] = useState<Trend[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Local language detection based on coordinates (simplified mapping for India)
  useEffect(() => {
    if (userLocation && !localStorage.getItem("lang")) {
      const { lat, lon } = userLocation;
      let detectedLang: Language = "en";

      // Simple bounding box checks for Indian states
      if (lat > 15 && lat < 22 && lon > 72 && lon < 80) detectedLang = "mr"; // Maharashtra
      else if (lat > 11 && lat < 18 && lon > 74 && lon < 78) detectedLang = "kn"; // Karnataka
      else if (lat > 8 && lat < 14 && lon > 77 && lon < 80) detectedLang = "ta"; // Tamil Nadu
      else if (lat > 20) detectedLang = "hi"; // North India

      setLang(detectedLang);
      localStorage.setItem("lang", detectedLang);
    }
  }, [userLocation]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        // Sync user profile to Firestore if it doesn't exist
        const userRef = doc(db, "users", currentUser.uid);
        getDoc(userRef).then((docSnap) => {
          if (!docSnap.exists()) {
            setDoc(userRef, {
              uid: currentUser.uid,
              name: currentUser.displayName || "User",
              email: currentUser.email,
              createdAt: serverTimestamp(),
              lang: lang,
              selectedAvatar: parseInt(localStorage.getItem("selectedAvatar") || "0"),
              alertThreshold: parseInt(localStorage.getItem("alertThreshold") || "100")
            }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`));
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setSavedTrends([]);
      return;
    }

    const trendsRef = collection(db, "users", user.uid, "trends");
    const q = query(trendsRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trends = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trend[];
      setSavedTrends(trends);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/trends`));

    // Also listen to user profile for saved locations
    const userRef = doc(db, "users", user.uid);
    const unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));

    return () => {
      unsubscribe();
      unsubscribeProfile();
    };
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = (localStorage.getItem("lang") as Language) || "en";
      setLang(newLang);
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Login failed", err);
      setAuthError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab("home");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const saveCurrentTrend = async () => {
    if (!data || !user) return;
    setSaveStatus("saving");
    const path = `users/${user.uid}/trends`;
    try {
      await addDoc(collection(db, path), {
        uid: user.uid,
        date: new Date().toISOString(),
        aqi: data.aqi,
        location: currentName,
        createdAt: serverTimestamp()
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("error");
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const deleteTrend = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/trends/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const currentLat = selectedCity?.lat ?? userLocation?.lat ?? null;
  const currentLon = selectedCity?.lon ?? userLocation?.lon ?? null;
  const currentName = selectedCity?.name ?? (userLocation ? "Your Location" : "Detecting...");

  const { data, forecast, loading, error: aqiError, refresh } = useAqi(currentLat, currentLon);
  const { prediction, loading: predictionLoading } = usePrediction(currentName);

  useEffect(() => {
    if (userLocation && !selectedCity) {
      // Default to user location
    }
  }, [userLocation, selectedCity]);

  const renderContent = () => {
    if (!isAuthReady) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-500 font-medium">Initializing...</p>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center bg-white rounded-[3rem] shadow-2xl shadow-blue-500/5 border border-gray-50">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2.5rem] flex items-center justify-center text-white mb-10 shadow-2xl shadow-blue-500/40 relative"
          >
            <Wind size={56} />
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-white rounded-[2.5rem]"
            />
          </motion.div>
          
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Pocket AQI</h2>
          <p className="text-gray-500 mb-12 max-w-xs text-lg font-medium leading-relaxed">
            Your personal companion for real-time air quality and health intelligence.
          </p>

          <div className="w-full max-w-xs space-y-4">
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-2xl shadow-gray-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  Continue with Google
                </>
              )}
            </button>
            
            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100"
              >
                {authError}
              </motion.div>
            )}
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 opacity-40">
            <div className="flex flex-col items-center gap-2">
              <Shield size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Activity size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest">Real-time</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Globe size={20} />
              <span className="text-[8px] font-black uppercase tracking-widest">Global</span>
            </div>
          </div>

          <p className="mt-12 text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">
            By continuing, you agree to our <span className="text-blue-600">Privacy Policy</span>
          </p>
        </div>
      );
    }

    if (loading && !data) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-500 font-medium">Fetching real-time AQI data...</p>
        </div>
      );
    }

    if (aqiError || locationError) {
      return (
        <div className="p-6 bg-red-50 rounded-3xl border border-red-100 text-red-800 flex items-start gap-4">
          <AlertTriangle className="shrink-0" size={24} />
          <div>
            <h3 className="font-bold mb-1">Error</h3>
            <p className="text-sm opacity-80">{aqiError || locationError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!data) return null;

    if (activeTab === "profile") {
      return <Profile user={user} onLogout={handleLogout} />;
    }

    if (activeTab === "community") {
      return <CommunityReport user={user} userLocation={userLocation} lang={lang} />;
    }

    if (activeTab === "details") {
      const chartData = [...savedTrends].reverse().map(t => ({
        name: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        aqi: t.aqi,
        location: t.location
      }));

      return (
        <div className="space-y-8 pb-24">
          {/* Readings on top */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t.pollutants}</h3>
            <PollutantBreakdown components={data.components} />
          </section>

          {/* Heatmap/Chart and Trends below */}
          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{t.trendChart}</h3>
            </div>
            
            <div className="h-64 w-full">
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="aqi" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAqi)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Activity size={48} className="opacity-10" />
                  <p className="text-sm">Need at least 2 data points for chart</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t.trends}</h3>
            <div className="space-y-3">
              {savedTrends.length > 0 ? (
                savedTrends.map((trend) => (
                  <motion.div 
                    key={trend.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="font-bold text-gray-900">{trend.location}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                        {new Date(trend.date).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-black text-blue-600">{trend.aqi}</div>
                      <button 
                        onClick={() => deleteTrend(trend.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 bg-white rounded-3xl border border-gray-100 text-center text-gray-400">
                  <History size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm">{t.noTrends}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      );
    }

    return (
      <div className="space-y-8 pb-24">
        {/* Onboarding Welcome Card */}
        {user && (!userProfile?.age || userProfile?.conditions?.length === 0) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-200 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-xl font-black tracking-tight mb-1">Welcome, {user.displayName?.split(' ')[0]}!</h3>
              <p className="text-sm opacity-90 font-medium leading-relaxed mb-4">
                Let's personalize your experience. Add your age and health conditions to get tailored air quality advice.
              </p>
              <button 
                onClick={() => setActiveTab("profile")}
                className="px-6 py-2.5 bg-white text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors"
              >
                Complete Profile
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-20">
              <UserIcon size={120} />
            </div>
          </motion.div>
        )}

        {/* Prominent Location Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1"
        >
          <div className="flex items-center gap-2 text-blue-600">
            <MapPin size={18} />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">{t.currentLocation}</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            {currentName === "Your Location" ? t.currentLocation : currentName}
          </h2>
        </motion.div>

        {/* Main AQI Display */}
        <div className="relative">
          <AqiDisplay aqi={data.aqi} weather={data.weather} />
          <button 
            onClick={saveCurrentTrend}
            disabled={saveStatus === "saving"}
            className={`absolute top-4 right-4 p-3 backdrop-blur-md rounded-2xl border transition-all flex items-center gap-2 shadow-lg ${
              saveStatus === "saved" ? "bg-green-500/80 border-green-400 text-white" : 
              saveStatus === "error" ? "bg-red-500/80 border-red-400 text-white" :
              "bg-white/20 border-white/20 text-white hover:bg-white/40"
            }`}
          >
            {saveStatus === "saving" ? <Loader2 size={18} className="animate-spin" /> : 
             saveStatus === "saved" ? <Check size={18} /> : 
             saveStatus === "error" ? <AlertTriangle size={18} /> : 
             <Save size={18} />}
            <span className="text-xs font-bold uppercase tracking-widest">
              {saveStatus === "saving" ? "Saving..." : 
               saveStatus === "saved" ? "Saved!" : 
               saveStatus === "error" ? "Error" : 
               t.saveTrend}
            </span>
          </button>
        </div>

        {/* Map Visualization */}
        {currentLat && currentLon && (
          <MapViewer 
            lat={currentLat} 
            lon={currentLon} 
            aqi={data.aqi} 
            locationName={currentName} 
          />
        )}

        {/* 24-Hour Forecast */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">24-Hour Forecast</h3>
            <button 
              onClick={() => setActiveTab("details")}
              className="text-xs font-bold text-blue-600 uppercase tracking-wider hover:underline"
            >
              View All
            </button>
          </div>
          <ForecastCarousel forecast={forecast} />
        </section>

        {/* Weather Section (Moved here to fix overlap) */}
        {data.weather && (
          <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                  <Thermometer size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Current Weather</h3>
                  <p className="text-xs text-gray-500 font-medium capitalize">{data.weather.description}</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-gray-900">{Math.round(data.weather.temp)}°C</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Temp</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-gray-900">{data.weather.humidity}%</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Humidity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-gray-900">{data.weather.windSpeed}</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Wind m/s</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Pollutant Breakdown (Moved here) */}
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t.pollutants}</h3>
          <PollutantBreakdown components={data.components} />
        </section>

        {/* AI Prediction Section */}
        {prediction && (
          <section className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                  <Globe size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">AI Health Advisory</h3>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70">Powered by Pocket AQI AI</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-5 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/10">
                  <div className="text-sm font-medium leading-relaxed italic">
                    "{prediction.prediction || prediction.message || "No specific prediction available for this location."}"
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Status</div>
                    <div className="text-lg font-black">{prediction.status || "Analyzing"}</div>
                  </div>
                  <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Confidence</div>
                    <div className="text-lg font-black">High</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />
          </section>
        )}

        {/* Health Calculator */}
        <section>
          <HealthCalculator aqi={data.aqi} />
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 flex flex-col gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl w-fit">
              <Shield size={24} />
            </div>
            <div>
              <h4 className="font-bold text-orange-900">Mask Reminder</h4>
              <p className="text-xs text-orange-700 opacity-80">N95 recommended for current levels</p>
            </div>
          </div>
          <div className="p-6 bg-green-50 rounded-3xl border border-green-100 flex flex-col gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-2xl w-fit">
              <Wind size={24} />
            </div>
            <div>
              <h4 className="font-bold text-green-900">Air Purifier</h4>
              <p className="text-xs text-green-700 opacity-80">Keep windows closed today</p>
            </div>
          </div>
          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl w-fit">
              <Activity size={24} />
            </div>
            <div>
              <h4 className="font-bold text-blue-900">Hydration</h4>
              <p className="text-xs text-blue-700 opacity-80">Drink plenty of water to flush toxins</p>
            </div>
          </div>
          <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100 flex flex-col gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl w-fit">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-bold text-purple-900">Avoid Traffic</h4>
              <p className="text-xs text-purple-700 opacity-80">Stay away from high-traffic zones</p>
            </div>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Wind size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tight">Pocket AQI</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => refresh()}
            disabled={loading}
            className={`p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all ${loading ? "animate-spin text-blue-600" : ""}`}
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => setActiveTab("profile")}
            className={`p-2 rounded-xl transition-colors ${activeTab === "profile" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <UserIcon size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-6">
        {/* City Selector */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCity(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              !selectedCity ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-100"
            }`}
          >
            <MapPin size={16} />
            Current
          </button>
          
          {/* Saved Locations */}
          {userProfile?.savedLocations?.map((loc: any) => (
            <button
              key={loc.id}
              onClick={() => setSelectedCity({ name: loc.name, lat: loc.lat, lon: loc.lon })}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                selectedCity?.name === loc.name ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-gray-500 border border-gray-100"
              }`}
            >
              {loc.type === "home" ? <Home size={14} /> : loc.type === "work" ? <Briefcase size={14} /> : <MapPin size={14} />}
              {loc.name}
            </button>
          ))}

          {INDIAN_CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => setSelectedCity(city)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedCity?.name === city.name ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-100"
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>

        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-4 flex items-center justify-around z-50">
        <button 
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "home" ? "text-blue-600 scale-110" : "text-gray-400 hover:text-gray-600"}`}
        >
          <Wind size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{t.home}</span>
        </button>
        <button 
          onClick={() => setActiveTab("details")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "details" ? "text-blue-600 scale-110" : "text-gray-400 hover:text-gray-600"}`}
        >
          <History size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{t.trends}</span>
        </button>
        <button 
          onClick={() => setActiveTab("community")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "community" ? "text-blue-600 scale-110" : "text-gray-400 hover:text-gray-600"}`}
        >
          <MessageSquare size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{t.social}</span>
        </button>
        <button 
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "profile" ? "text-blue-600 scale-110" : "text-gray-400 hover:text-gray-600"}`}
        >
          <UserIcon size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{t.profile}</span>
        </button>
      </nav>
    </div>
);
}
