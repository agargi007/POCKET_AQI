import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AqiData } from "./types";

export function useAqi(lat: number | null, lon: number | null) {
  const [data, setData] = useState<AqiData | null>(null);
  const [forecast, setForecast] = useState<AqiData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (lat === null || lon === null) return;
    setLoading(true);
    setError(null);
    try {
      const [currentRes, forecastRes, weatherRes] = await Promise.all([
        axios.get(`/api/aqi/current?lat=${lat}&lon=${lon}`),
        axios.get(`/api/aqi/forecast?lat=${lat}&lon=${lon}`),
        axios.get(`/api/weather/current?lat=${lat}&lon=${lon}`),
      ]);

      if (!currentRes.data || !currentRes.data.list || !currentRes.data.list.length) {
        throw new Error("Invalid current AQI data received");
      }

      const current = currentRes.data.list[0];
      const weather = weatherRes.data;

      setData({
        aqi: current.main.aqi,
        components: current.components,
        dt: current.dt,
        weather: weather ? {
          temp: weather.main.temp,
          humidity: weather.main.humidity,
          windSpeed: weather.wind.speed,
          description: weather.weather[0].description,
          icon: weather.weather[0].icon,
        } : undefined,
      });

      if (forecastRes.data && forecastRes.data.list) {
        setForecast(forecastRes.data.list.map((item: any) => ({
          aqi: item.main.aqi,
          components: item.components,
          dt: item.dt,
        })));
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to fetch AQI data";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, forecast, loading, error, refresh: fetchData };
}

export function usePrediction(city: string | null) {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = useCallback(async () => {
    if (!city || city === "Detecting...") return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/predict", { city });
      setPrediction(response.data);
    } catch (err: any) {
      console.error("Prediction error:", err);
      setError("Failed to fetch AI prediction");
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchPrediction();
  }, [fetchPrediction]);

  return { prediction, loading, error, refresh: fetchPrediction };
}

export function useLocation() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (err) => {
        setError(err.message);
      }
    );
  }, []);

  return { location, error };
}
