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
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(`/api/aqi/current?lat=${lat}&lon=${lon}`),
        axios.get(`/api/aqi/forecast?lat=${lat}&lon=${lon}`),
      ]);

      const current = currentRes.data.list[0];
      setData({
        aqi: current.main.aqi,
        components: current.components,
        dt: current.dt,
      });

      setForecast(forecastRes.data.list.map((item: any) => ({
        aqi: item.main.aqi,
        components: item.components,
        dt: item.dt,
      })));
    } catch (err) {
      setError("Failed to fetch AQI data");
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
