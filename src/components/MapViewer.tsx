import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { getAqiLevel } from "../types";

// Fix for default marker icons in Leaflet with React
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewerProps {
  lat: number;
  lon: number;
  aqi: number;
  locationName: string;
}

// Component to update map center when lat/lon changes
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export const MapViewer: React.FC<MapViewerProps> = ({ lat, lon, aqi, locationName }) => {
  const level = getAqiLevel(aqi);
  const position: [number, number] = [lat, lon];

  return (
    <div className="h-64 w-full rounded-3xl overflow-hidden shadow-lg border border-gray-100 relative z-0">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={position} />
        <Marker position={position}>
          <Popup>
            <div className="text-center">
              <div className="font-bold">{locationName}</div>
              <div className="text-xs">AQI: {aqi} ({level.level})</div>
            </div>
          </Popup>
        </Marker>
        <Circle
          center={position}
          radius={2000}
          pathOptions={{
            fillColor: level.color,
            color: level.color,
            fillOpacity: 0.2,
            weight: 1,
          }}
        />
      </MapContainer>
      
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: level.color }} />
        <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">{level.level} Zone</span>
      </div>
    </div>
  );
};
