import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  MapPin, 
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
  Info
} from "lucide-react";
import { AqiDisplay } from "./components/AqiDisplay";
import { PollutantBreakdown } from "./components/PollutantBreakdown";
import { HealthCalculator } from "./components/HealthCalculator";
import { ForecastCarousel } from "./components/ForecastCarousel";
import { MapViewer } from "./components/MapViewer";
import { useAqi, useLocation } from "./hooks";
import { getAqiLevel } from "./types";
import { CommunityReport } from "./components/CommunityReport";
import { Profile } from "./components/Profile";
import { RefreshCw, User as UserIcon, Save, Trash2, LogIn, LogOut as LogOutIcon } from "lucide-react";
import { translations, Language } from "./translations";
import { Trend } from "./types";
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
  const [savedTrends, setSavedTrends] = useState<Trend[]>([]);

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
              darkMode: localStorage.getItem("darkMode") === "true",
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

    return () => unsubscribe();
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
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed", err);
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
    const path = `users/${user.uid}/trends`;
    try {
      await addDoc(collection(db, path), {
        uid: user.uid,
        date: new Date().toISOString(),
        aqi: data.aqi,
        location: currentName,
        createdAt: serverTimestamp()
      });
    } catch (err) {
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
        <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-[2rem] flex items-center justify-center text-blue-600 mb-8 shadow-xl shadow-blue-500/20">
            <Wind size={48} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Welcome to Pocket AQI</h2>
          <p className="text-gray-500 mb-12 max-w-xs">
            Sign in to track air quality trends, save locations, and get personalized health advice.
          </p>
          <button 
            onClick={handleLogin}
            className="w-full max-w-xs py-4 bg-gray-900 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20"
          >
            <LogIn size={20} />
            Continue with Google
          </button>
          <p className="mt-8 text-[10px] text-gray-400 uppercase tracking-widest">
            By continuing, you agree to our Privacy Policy
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
      return <CommunityReport />;
    }

    if (activeTab === "details") {
      return (
        <div className="space-y-8 pb-24">
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
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">{trend.date}</div>
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
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pollutant Breakdown</h3>
            <PollutantBreakdown components={data.components} />
          </section>
        </div>
      );
    }

    return (
      <div className="space-y-8 pb-24">
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
          <AqiDisplay aqi={data.aqi} />
          <button 
            onClick={saveCurrentTrend}
            className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-white hover:bg-white/40 transition-all flex items-center gap-2 shadow-lg"
          >
            <Save size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">{t.saveTrend}</span>
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
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">View All</span>
          </div>
          <ForecastCarousel forecast={forecast} />
        </section>

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
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-bottom border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
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
