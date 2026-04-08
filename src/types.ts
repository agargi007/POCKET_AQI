export interface PollutantData {
  pm2_5: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
}

export interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

export interface AqiData {
  aqi: number;
  components: PollutantData;
  dt: number;
  weather?: WeatherData;
  location?: {
    name: string;
    lat: number;
    lon: number;
  };
}

export interface HealthProfile {
  age: number;
  conditions: string[];
  name?: string;
  avatar?: string;
}

export interface SavedLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: "home" | "work" | "other";
}

export interface Trend {
  id: string;
  date: string;
  aqi: number;
  location: string;
}

export const AQI_LEVELS = [
  { level: "Good", min: 0, max: 50, color: "#00e400", text: "Safe for all activities" },
  { level: "Moderate", min: 51, max: 100, color: "#ffff00", text: "Sensitive groups avoid prolonged outdoor exertion" },
  { level: "Unhealthy for Sensitive Groups", min: 101, max: 150, color: "#ff7e00", text: "Children, elderly avoid outdoor activities" },
  { level: "Unhealthy", min: 151, max: 200, color: "#ff0000", text: "Everyone avoid outdoor activities, wear masks" },
  { level: "Very Unhealthy", min: 201, max: 300, color: "#8f3f97", text: "Stay indoors, use air purifiers" },
  { level: "Hazardous", min: 301, max: 500, color: "#7e0023", text: "Emergency conditions, avoid all outdoor activities" },
];

export function getAqiLevel(aqi: number) {
  // OpenWeatherMap uses 1-5 scale
  // 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
  // We'll map it to the standard AQI scale for display
  const mapping = [
    { level: "Good", color: "#00e400", text: "Safe for all activities", description: "Air quality is considered satisfactory, and air pollution poses little or no risk." },
    { level: "Fair", color: "#ffff00", text: "Moderate risk for sensitive groups", description: "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution." },
    { level: "Moderate", color: "#ff7e00", text: "Unhealthy for sensitive groups", description: "Members of sensitive groups may experience health effects. The general public is not likely to be affected." },
    { level: "Poor", color: "#ff0000", text: "Unhealthy for everyone", description: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects." },
    { level: "Very Poor", color: "#8f3f97", text: "Health alert: everyone may experience more serious health effects", description: "Health warnings of emergency conditions. The entire population is more likely to be affected." },
  ];
  return mapping[aqi - 1] || mapping[0];
}
