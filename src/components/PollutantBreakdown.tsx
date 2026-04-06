import React from "react";
import { PollutantData } from "../types";

interface PollutantBreakdownProps {
  components: PollutantData;
}

export const PollutantBreakdown: React.FC<PollutantBreakdownProps> = ({ components }) => {
  const pollutants = [
    { name: "PM2.5", value: components.pm2_5, unit: "μg/m³", label: "Fine particles" },
    { name: "PM10", value: components.pm10, unit: "μg/m³", label: "Coarse particles" },
    { name: "NO2", value: components.no2, unit: "μg/m³", label: "Nitrogen dioxide" },
    { name: "SO2", value: components.so2, unit: "μg/m³", label: "Sulfur dioxide" },
    { name: "CO", value: components.co, unit: "μg/m³", label: "Carbon monoxide" },
    { name: "O3", value: components.o3, unit: "μg/m³", label: "Ozone" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {pollutants.map((p) => (
        <div key={p.name} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">{p.name}</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900">{p.value.toFixed(1)}</span>
            <span className="text-[10px] text-gray-500">{p.unit}</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-1">{p.label}</div>
        </div>
      ))}
    </div>
  );
};
