import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const routeCalculationSchema = z.object({
  sourceLat: z.number(),
  sourceLng: z.number(),
  destLat: z.number(),
  destLng: z.number(),
});

const locationSearchSchema = z.object({
  query: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all crime hotspots
  app.get("/api/crime-hotspots", async (req, res) => {
    try {
      const hotspots = await storage.getCrimeHotspots();
      res.json(hotspots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch crime hotspots" });
    }
  });

  // Get crime hotspots by region
  app.get("/api/crime-hotspots/region", async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      if (!lat || !lng || !radius) {
        return res.status(400).json({ message: "Missing required parameters: lat, lng, radius" });
      }
      
      const hotspots = await storage.getCrimeHotspotsByRegion(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseFloat(radius as string)
      );
      res.json(hotspots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch crime hotspots by region" });
    }
  });

  // Get all safe locations
  app.get("/api/safe-locations", async (req, res) => {
    try {
      const locations = await storage.getSafeLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch safe locations" });
    }
  });

  // Get safe locations by region
  app.get("/api/safe-locations/region", async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      if (!lat || !lng || !radius) {
        return res.status(400).json({ message: "Missing required parameters: lat, lng, radius" });
      }
      
      const locations = await storage.getSafeLocationsByRegion(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseFloat(radius as string)
      );
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch safe locations by region" });
    }
  });

  // Search locations
  app.get("/api/locations/search", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Missing or invalid search query" });
      }
      const results = await storage.searchLocations(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search locations" });
    }
  });

  // Calculate safe routes
  app.post("/api/routes/calculate", async (req, res) => {
    try {
      const { sourceLat, sourceLng, destLat, destLng } = routeCalculationSchema.parse(req.body);
      const routes = await storage.calculateSafeRoutes(sourceLat, sourceLng, destLat, destLng);
      res.json(routes);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid route calculation parameters" });
      }
      res.status(500).json({ message: "Failed to calculate safe routes" });
    }
  });

  // Get all routes
  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await storage.getRoutes();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
