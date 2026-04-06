import React from "react";
import { motion } from "motion/react";
import { format } from "date-fns";
import { AqiData, getAqiLevel } from "../types";

interface ForecastCarouselProps {
  forecast: AqiData[];
}

export const ForecastCarousel: React.FC<ForecastCarouselProps> = ({ forecast }) => {
  // Take the next 24 hours (OpenWeatherMap provides 1-hour intervals)
  const next24Hours = forecast.slice(0, 24);

  return (
    <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide snap-x">
      {next24Hours.map((item, idx) => {
        const level = getAqiLevel(item.aqi);
        return (
          <motion.div
            key={item.dt}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex-shrink-0 w-24 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm snap-start flex flex-col items-center"
          >
            <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">
              {format(new Date(item.dt * 1000), "HH:mm")}
            </span>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-2"
              style={{ backgroundColor: level.color, color: item.aqi === 2 ? "#1a1a1a" : "white" }}
            >
              {item.aqi}
            </div>
            <span className="text-[10px] font-medium text-center text-gray-600 line-clamp-1">
              {level.level}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};
