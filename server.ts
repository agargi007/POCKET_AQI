import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/aqi/current", async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "OPENWEATHER_API_KEY not configured" });
    }

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
      res.json(response.data);
    } catch (error: any) {
      console.error("Error fetching AQI:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ 
        error: error.response?.data?.message || "Failed to fetch AQI data" 
      });
    }
  });

  app.get("/api/aqi/forecast", async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "OPENWEATHER_API_KEY not configured" });
    }

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
      res.json(response.data);
    } catch (error: any) {
      console.error("Error fetching forecast:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ 
        error: error.response?.data?.message || "Failed to fetch forecast data" 
      });
    }
  });

  app.get("/api/weather/current", async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    if (!apiKey) {
      return res.status(500).json({ error: "OPENWEATHER_API_KEY not configured" });
    }

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      res.json(response.data);
    } catch (error: any) {
      console.error("Error fetching weather:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ 
        error: error.response?.data?.message || "Failed to fetch weather data" 
      });
    }
  });

  app.post("/api/predict", async (req, res) => {
    const { city } = req.body;
    const predictUrl = process.env.PREDICT_API_URL || "https://trichromatic-neglectingly-barrie.ngrok-free.dev";

    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    try {
      const response = await axios.post(`${predictUrl}/predict`, { city });
      res.json(response.data);
    } catch (error: any) {
      console.error("Error fetching prediction:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ 
        error: error.response?.data?.message || "Failed to fetch prediction data" 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
