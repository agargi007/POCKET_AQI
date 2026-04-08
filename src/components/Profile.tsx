import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  MapPin, 
  Home, 
  Briefcase, 
  Plus, 
  Bell, 
  Shield, 
  ChevronRight,
  LogOut,
  Camera,
  Heart,
  Settings,
  Globe,
  Check,
  Save,
  Edit2
} from "lucide-react";
import { SavedLocation, HealthProfile } from "../types";
import { translations, Language } from "../translations";
import { User as FirebaseUser, db, handleFirestoreError, OperationType, doc, setDoc, getDoc, serverTimestamp } from "../firebase";

interface ProfileProps {
  user: FirebaseUser;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem("lang") as Language) || "en");
  const t = translations[lang];

  const [alertThreshold, setAlertThreshold] = useState(() => parseInt(localStorage.getItem("alertThreshold") || "100"));
  const [selectedAvatar, setSelectedAvatar] = useState(() => parseInt(localStorage.getItem("selectedAvatar") || "0"));
  const [isEditing, setIsEditing] = useState(false);
  
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [profile, setProfile] = useState<HealthProfile>(() => {
    const saved = localStorage.getItem("profile");
    return saved ? JSON.parse(saved) : { name: user.displayName || "User", age: 25, conditions: ["Asthma"] };
  });

  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(() => {
    const saved = localStorage.getItem("savedLocations");
    return saved ? JSON.parse(saved) : [
      { id: "1", name: "Home", lat: 28.6129, lon: 77.2090, type: "home" },
      { id: "2", name: "Office", lat: 28.5355, lon: 77.3910, type: "work" },
    ];
  });

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<SavedLocation | null>(null);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationLat, setNewLocationLat] = useState("");
  const [newLocationLon, setNewLocationLon] = useState("");
  const [newLocationType, setNewLocationType] = useState<"home" | "work" | "other">("other");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [docExists, setDocExists] = useState(false);

  useEffect(() => {
    const userRef = doc(db, "users", user.uid);
    getDoc(userRef).then((docSnap) => {
      if (docSnap.exists()) {
        setDocExists(true);
        const data = docSnap.data();
        if (data.name) setProfile(prev => ({ ...prev, name: data.name }));
        if (data.age) setProfile(prev => ({ ...prev, age: data.age }));
        if (data.conditions) setProfile(prev => ({ ...prev, conditions: data.conditions }));
        if (data.lang) setLang(data.lang);
        if (data.selectedAvatar !== undefined) setSelectedAvatar(data.selectedAvatar);
        if (data.alertThreshold !== undefined) setAlertThreshold(data.alertThreshold);
        if (data.savedLocations) setSavedLocations(data.savedLocations);
      }
      setHasLoaded(true);
    }).catch(err => {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      setHasLoaded(true);
    });
  }, [user.uid]);

  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = (localStorage.getItem("lang") as Language) || "en";
      setLang(newLang);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    localStorage.setItem("lang", lang);
    localStorage.setItem("alertThreshold", alertThreshold.toString());
    localStorage.setItem("selectedAvatar", selectedAvatar.toString());
    localStorage.setItem("profile", JSON.stringify(profile));
    localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
    
    // Trigger storage event for other components in the same window
    window.dispatchEvent(new Event("storage"));

    // Sync to Firestore
    const userRef = doc(db, "users", user.uid);
    const dataToSave: any = {
      uid: user.uid,
      email: user.email,
      name: profile.name,
      age: profile.age,
      conditions: profile.conditions,
      lang,
      selectedAvatar,
      alertThreshold,
      savedLocations,
    };

    if (!docExists) {
      dataToSave.createdAt = serverTimestamp();
    }

    setDoc(userRef, dataToSave, { merge: true })
      .then(() => {
        if (!docExists) setDocExists(true);
      })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
  }, [lang, alertThreshold, selectedAvatar, profile, savedLocations, user.uid, user.email, hasLoaded, docExists]);

  const handleAddLocation = () => {
    setEditingLocation(null);
    setNewLocationName("");
    setNewLocationLat("");
    setNewLocationLon("");
    setNewLocationType("other");
    setShowLocationModal(true);
  };

  const handleEditLocation = (loc: SavedLocation) => {
    setEditingLocation(loc);
    setNewLocationName(loc.name);
    setNewLocationLat(loc.lat.toString());
    setNewLocationLon(loc.lon.toString());
    setNewLocationType(loc.type);
    setShowLocationModal(true);
  };

  const handleSaveLocation = () => {
    if (!newLocationName || !newLocationLat || !newLocationLon) return;

    const lat = parseFloat(newLocationLat);
    const lon = parseFloat(newLocationLon);

    if (isNaN(lat) || isNaN(lon)) return;

    if (editingLocation) {
      setSavedLocations(prev => prev.map(l => l.id === editingLocation.id ? {
        ...l,
        name: newLocationName,
        lat,
        lon,
        type: newLocationType
      } : l));
    } else {
      const newLoc: SavedLocation = {
        id: Math.random().toString(36).substr(2, 9),
        name: newLocationName,
        lat,
        lon,
        type: newLocationType
      };
      setSavedLocations(prev => [...prev, newLoc]);
    }
    setShowLocationModal(false);
  };

  const handleDeleteLocation = (id: string) => {
    setSavedLocations(prev => prev.filter(l => l.id !== id));
    setShowLocationModal(false);
  };

  const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia",
  ];

  const toggleLang = () => setLang(prev => prev === "en" ? "hi" : "en");

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8 pb-32"
    >
      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacyModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-[2.5rem] p-8 z-[110] shadow-2xl border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                  <Shield size={24} />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Privacy & Security</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                <p>
                  At <strong>Pocket AQI</strong>, your privacy is our top priority. We are committed to protecting your personal information and being transparent about how we use it.
                </p>
                <section>
                  <h4 className="font-bold text-gray-900 mb-1">Data Collection</h4>
                  <p>We only collect data necessary to provide you with accurate air quality information, such as your location and health preferences.</p>
                </section>
                <section>
                  <h4 className="font-bold text-gray-900 mb-1">Security Policy</h4>
                  <p>Your data is encrypted both in transit and at rest. We use industry-standard security protocols to prevent unauthorized access.</p>
                </section>
                <section>
                  <h4 className="font-bold text-gray-900 mb-1">Third-Party Sharing</h4>
                  <p>We never sell your personal data to third parties. Location data is only used to fetch AQI metrics from our API providers.</p>
                </section>
                <section>
                  <h4 className="font-bold text-gray-900 mb-1">User Control</h4>
                  <p>You have full control over your data. You can delete your account and all associated data at any time from the account settings.</p>
                </section>
              </div>
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="w-full mt-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors"
              >
                Got it, thanks!
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Location Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLocationModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <MapPin size={24} />
                </div>
                <h3 className="text-xl font-black text-gray-900">
                  {editingLocation ? "Edit Location" : "Add Location"}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Name</label>
                  <input 
                    type="text"
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    placeholder="e.g. Home, Office"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Latitude</label>
                    <input 
                      type="number"
                      step="any"
                      value={newLocationLat}
                      onChange={(e) => setNewLocationLat(e.target.value)}
                      placeholder="28.6129"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Longitude</label>
                    <input 
                      type="number"
                      step="any"
                      value={newLocationLon}
                      onChange={(e) => setNewLocationLon(e.target.value)}
                      placeholder="77.2090"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Type</label>
                  <div className="flex gap-2">
                    {(["home", "work", "other"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setNewLocationType(t)}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold capitalize transition-all ${
                          newLocationType === t ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                {editingLocation && (
                  <button 
                    onClick={() => handleDeleteLocation(editingLocation.id)}
                    className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all"
                  >
                    Delete
                  </button>
                )}
                <button 
                  onClick={handleSaveLocation}
                  className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20"
                >
                  Save Location
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Header */}
      <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
        <div className="relative mb-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-28 h-28 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl overflow-hidden"
          >
            <img 
              src={avatars[selectedAvatar]} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <button className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-full border-2 border-white shadow-lg hover:bg-blue-700 transition-colors">
            <Camera size={14} />
          </button>
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input 
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="text-2xl font-black text-gray-900 text-center border-b-2 border-blue-600 focus:outline-none bg-transparent"
              autoFocus
            />
            <button 
              onClick={() => setIsEditing(false)}
              className="p-1 bg-blue-600 text-white rounded-lg shadow-sm"
            >
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-gray-900">{profile.name}</h2>
            <button 
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Edit2 size={16} />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black uppercase rounded-md">Pro Member</span>
          <span className="text-xs text-gray-400">Joined April 2024</span>
        </div>
      </div>

      {/* Avatar Selection */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Choose Avatar</h3>
        <div className="flex justify-between gap-2">
          {avatars.map((url, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedAvatar(idx)}
              className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all ${
                selectedAvatar === idx ? "border-blue-600 scale-110 shadow-lg" : "border-transparent opacity-60"
              }`}
            >
              <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
              {selectedAvatar === idx && (
                <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                  <Check size={16} className="text-blue-600" />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Health Profile */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.health} Profile</h3>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 text-xs font-bold flex items-center gap-1"
          >
            {isEditing ? <><Save size={14} /> {t.save}</> : <><Edit2 size={14} /> {t.edit}</>}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t.age}</div>
            {isEditing ? (
              <input 
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                className="w-full text-lg font-black text-gray-900 bg-transparent border-b border-blue-600 focus:outline-none"
              />
            ) : (
              <div className="text-lg font-black text-gray-900">{profile.age} Years</div>
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t.conditions}</div>
            {isEditing ? (
              <input 
                type="text"
                value={profile.conditions?.join(", ") || ""}
                onChange={(e) => setProfile({...profile, conditions: e.target.value.split(",").map(s => s.trim())})}
                className="w-full text-lg font-black text-gray-900 bg-transparent border-b border-blue-600 focus:outline-none"
              />
            ) : (
              <div className="text-lg font-black text-gray-900">
                {profile.conditions && profile.conditions.length > 0 ? profile.conditions[0] : "None"}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Personalization Settings */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-colors">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{t.appearance}</h3>
        <div className="space-y-6">
          {/* Alert Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                  <Bell size={20} />
                </div>
                <div>
                  <span className="block font-bold text-gray-900">Alert Threshold</span>
                  <span className="text-[10px] text-gray-400">Notify when AQI exceeds</span>
                </div>
              </div>
              <span className="text-lg font-black text-red-600">{alertThreshold}</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="300" 
              step="10"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* Language */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-xl">
                <Globe size={20} />
              </div>
              <div>
                <span className="block font-bold text-gray-900">{t.language}</span>
                <span className="text-[10px] text-gray-400">System language</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { code: "en", label: "English" },
                { code: "hi", label: "हिंदी" },
                { code: "mr", label: "मराठी" },
                { code: "kn", label: "ಕನ್ನಡ" },
                { code: "ta", label: "தமிழ்" }
              ].map((l) => (
                <button 
                  key={l.code}
                  onClick={() => setLang(l.code as Language)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    lang === l.code 
                      ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm" 
                      : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Saved Locations */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.savedLocations}</h3>
          <button 
            onClick={handleAddLocation}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="space-y-3">
          {savedLocations.map((loc) => (
            <motion.div 
              key={loc.id} 
              whileTap={{ scale: 0.98 }}
              onClick={() => handleEditLocation(loc)}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-blue-50 transition-all cursor-pointer border border-transparent hover:border-blue-100"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
                  {loc.type === "home" ? <Home size={20} /> : loc.type === "work" ? <Briefcase size={20} /> : <MapPin size={20} />}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{loc.name}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {loc.lat.toFixed(2)}, {loc.lon.toFixed(2)}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Account Settings */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-colors">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{t.account}</h3>
        <div className="space-y-2">
          <button 
            onClick={() => setShowPrivacyModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3 text-gray-700 font-bold">
              <Shield size={20} />
              <span>Privacy & Security</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-2xl transition-colors text-red-600"
          >
            <div className="flex items-center gap-3 font-bold">
              <LogOut size={20} />
              <span>{t.signOut}</span>
            </div>
          </button>
        </div>
      </section>

      <div className="text-center pb-8">
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Pocket AQI v2.2.0</p>
      </div>
    </motion.div>
  );
};
