import React from "react";
import { motion } from "motion/react";
import { Wind, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { getAqiLevel } from "../types";

interface AqiDisplayProps {
  aqi: number;
  locationName?: string;
}

export const AqiDisplay: React.FC<AqiDisplayProps> = ({ aqi }) => {
  const level = getAqiLevel(aqi);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-3xl shadow-xl text-white relative overflow-hidden"
      style={{ backgroundColor: level.color, color: aqi === 2 ? "#1a1a1a" : "white" }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6 opacity-80">
          <Wind size={20} />
          <span className="text-sm font-medium uppercase tracking-wider">Air Quality Intelligence</span>
        </div>
        
        <div className="flex items-baseline gap-4 mb-6">
          <div className="flex flex-col">
            <span className="text-8xl font-black tracking-tighter leading-none">{aqi}</span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">AQI Value</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold leading-tight">{level.level}</span>
            <span className="text-sm opacity-80">{level.text}</span>
          </div>
        </div>

        <div className="p-6 bg-white/30 backdrop-blur-lg rounded-3xl border-2 border-white/20 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/20 rounded-xl shrink-0">
              <Info size={24} />
            </div>
            <p className="text-lg font-medium leading-snug tracking-tight">{level.description}</p>
          </div>
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -right-12 -bottom-12 opacity-10 animate-float">
        <Wind size={240} />
      </div>
    </motion.div>
  );
};
