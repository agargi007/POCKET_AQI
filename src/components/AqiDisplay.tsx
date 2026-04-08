import React from "react";
import { motion } from "motion/react";
import { Wind, AlertTriangle, CheckCircle, Info, Thermometer, Droplets } from "lucide-react";
import { getAqiLevel, WeatherData } from "../types";

interface AqiDisplayProps {
  aqi: number;
  weather?: WeatherData;
}

export const AqiDisplay: React.FC<AqiDisplayProps> = ({ aqi, weather }) => {
  const level = getAqiLevel(aqi);
  const isDark = aqi !== 2; // Moderate (2) is yellow, use dark text

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden"
      style={{ backgroundColor: level.color, color: isDark ? "white" : "#1a1a1a" }}
    >
      <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 opacity-80">
            <Wind size={20} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Live Air Quality</span>
          </div>
        </div>
        
        <div className="flex items-baseline gap-6 mb-8">
          <div className="flex flex-col">
            <span className="text-[7rem] font-black tracking-tighter leading-[0.8]">{aqi}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mt-2">AQI Value</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black leading-tight tracking-tight">{level.level}</span>
            <span className="text-sm font-bold opacity-80">{level.text}</span>
          </div>
        </div>

        <div className="p-6 bg-white/20 backdrop-blur-xl rounded-3xl border border-white/20 shadow-inner">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-white/20 rounded-2xl shrink-0">
              <Info size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold leading-tight tracking-tight">{level.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -right-16 -bottom-16 opacity-10 animate-float pointer-events-none">
        <Wind size={320} />
      </div>
    </motion.div>
  );
};
