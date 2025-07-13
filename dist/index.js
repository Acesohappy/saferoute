var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  crimeHotspots: () => crimeHotspots,
  insertCrimeHotspotSchema: () => insertCrimeHotspotSchema,
  insertRouteSchema: () => insertRouteSchema,
  insertSafeLocationSchema: () => insertSafeLocationSchema,
  routes: () => routes,
  safeLocations: () => safeLocations
});
import { pgTable, text, serial, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var crimeHotspots = pgTable("crime_hotspots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  severity: text("severity").notNull(),
  // 'low', 'medium', 'high'
  crimeType: text("crime_type").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  reportedIncidents: integer("reported_incidents").default(0)
});
var safeLocations = pgTable("safe_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  type: text("type").notNull(),
  // 'hospital', 'police', 'fire_station', 'mall', 'school'
  address: text("address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  isActive: boolean("is_active").default(true)
});
var routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sourceLatitude: real("source_latitude").notNull(),
  sourceLongitude: real("source_longitude").notNull(),
  destLatitude: real("dest_latitude").notNull(),
  destLongitude: real("dest_longitude").notNull(),
  safetyScore: integer("safety_score").notNull(),
  // 0-100
  distance: real("distance").notNull(),
  // in kilometers
  duration: integer("duration").notNull(),
  // in minutes
  coordinates: text("coordinates").notNull()
  // JSON string of route coordinates
});
var insertCrimeHotspotSchema = createInsertSchema(crimeHotspots).omit({
  id: true
});
var insertSafeLocationSchema = createInsertSchema(safeLocations).omit({
  id: true
});
var insertRouteSchema = createInsertSchema(routes).omit({
  id: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, using fallback storage");
}
var pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
var db = pool ? drizzle({ client: pool, schema: schema_exports }) : null;

// server/storage.ts
var isDatabaseAvailable = !!db;
var MemStorage = class {
  crimeHotspotsData;
  safeLocationsData;
  routesData;
  currentId;
  constructor() {
    this.crimeHotspotsData = /* @__PURE__ */ new Map();
    this.safeLocationsData = /* @__PURE__ */ new Map();
    this.routesData = /* @__PURE__ */ new Map();
    this.currentId = 1;
    this.initializeData();
  }
  initializeData() {
    const crimeData = [
      { name: "Delhi - Connaught Place", latitude: 28.6315, longitude: 77.2167, severity: "medium", crimeType: "theft", city: "Delhi", state: "Delhi", reportedIncidents: 45 },
      { name: "Mumbai - Dadar Station", latitude: 19.0176, longitude: 72.8562, severity: "high", crimeType: "robbery", city: "Mumbai", state: "Maharashtra", reportedIncidents: 62 },
      { name: "Bangalore - MG Road", latitude: 12.9716, longitude: 77.5946, severity: "low", crimeType: "harassment", city: "Bangalore", state: "Karnataka", reportedIncidents: 23 },
      { name: "Chennai - T. Nagar", latitude: 13.0827, longitude: 80.2707, severity: "medium", crimeType: "theft", city: "Chennai", state: "Tamil Nadu", reportedIncidents: 34 },
      { name: "Hyderabad - Banjara Hills", latitude: 17.4065, longitude: 78.4772, severity: "low", crimeType: "harassment", city: "Hyderabad", state: "Telangana", reportedIncidents: 18 },
      { name: "Pune - FC Road", latitude: 18.5204, longitude: 73.8567, severity: "medium", crimeType: "theft", city: "Pune", state: "Maharashtra", reportedIncidents: 29 },
      { name: "Kolkata - Park Street", latitude: 22.5726, longitude: 88.3639, severity: "high", crimeType: "robbery", city: "Kolkata", state: "West Bengal", reportedIncidents: 56 },
      { name: "Ahmedabad - Law Garden", latitude: 23.0225, longitude: 72.5714, severity: "low", crimeType: "harassment", city: "Ahmedabad", state: "Gujarat", reportedIncidents: 21 },
      { name: "Jaipur - Pink City", latitude: 26.9124, longitude: 75.7873, severity: "medium", crimeType: "theft", city: "Jaipur", state: "Rajasthan", reportedIncidents: 38 },
      { name: "Lucknow - Hazratganj", latitude: 26.8467, longitude: 80.9462, severity: "high", crimeType: "robbery", city: "Lucknow", state: "Uttar Pradesh", reportedIncidents: 48 },
      { name: "Gurgaon - Cyber City", latitude: 28.4595, longitude: 77.0266, severity: "medium", crimeType: "theft", city: "Gurgaon", state: "Haryana", reportedIncidents: 31 },
      { name: "Noida - Sector 18", latitude: 28.5355, longitude: 77.391, severity: "low", crimeType: "harassment", city: "Noida", state: "Uttar Pradesh", reportedIncidents: 16 }
    ];
    const safeLocationData = [
      { name: "AIIMS Delhi", latitude: 28.5672, longitude: 77.21, type: "hospital", address: "Ansari Nagar, New Delhi", city: "Delhi", state: "Delhi", isActive: true },
      { name: "Delhi Police Station - CP", latitude: 28.6289, longitude: 77.2065, type: "police", address: "Connaught Place, New Delhi", city: "Delhi", state: "Delhi", isActive: true },
      { name: "Lilavati Hospital Mumbai", latitude: 19.0596, longitude: 72.8295, type: "hospital", address: "Bandra West, Mumbai", city: "Mumbai", state: "Maharashtra", isActive: true },
      { name: "Mumbai Police Station - Dadar", latitude: 19.0144, longitude: 72.8479, type: "police", address: "Dadar West, Mumbai", city: "Mumbai", state: "Maharashtra", isActive: true },
      { name: "Manipal Hospital Bangalore", latitude: 12.9279, longitude: 77.6271, type: "hospital", address: "HAL Airport Road, Bangalore", city: "Bangalore", state: "Karnataka", isActive: true },
      { name: "Bangalore Police Station - MG Road", latitude: 12.9698, longitude: 77.5935, type: "police", address: "MG Road, Bangalore", city: "Bangalore", state: "Karnataka", isActive: true },
      { name: "Apollo Hospital Chennai", latitude: 13.0524, longitude: 80.2511, type: "hospital", address: "Greams Road, Chennai", city: "Chennai", state: "Tamil Nadu", isActive: true },
      { name: "Chennai Police Station - T. Nagar", latitude: 13.0826, longitude: 80.2341, type: "police", address: "T. Nagar, Chennai", city: "Chennai", state: "Tamil Nadu", isActive: true },
      { name: "Apollo Hospital Hyderabad", latitude: 17.4326, longitude: 78.4071, type: "hospital", address: "Jubilee Hills, Hyderabad", city: "Hyderabad", state: "Telangana", isActive: true },
      { name: "Hyderabad Police Station - Banjara Hills", latitude: 17.4081, longitude: 78.4691, type: "police", address: "Banjara Hills, Hyderabad", city: "Hyderabad", state: "Telangana", isActive: true },
      { name: "Ruby Hall Clinic Pune", latitude: 18.5018, longitude: 73.8636, type: "hospital", address: "Sassoon Road, Pune", city: "Pune", state: "Maharashtra", isActive: true },
      { name: "Pune Police Station - FC Road", latitude: 18.5196, longitude: 73.8553, type: "police", address: "FC Road, Pune", city: "Pune", state: "Maharashtra", isActive: true },
      { name: "AMRI Hospital Kolkata", latitude: 22.5448, longitude: 88.3426, type: "hospital", address: "Salt Lake, Kolkata", city: "Kolkata", state: "West Bengal", isActive: true },
      { name: "Kolkata Police Station - Park Street", latitude: 22.5726, longitude: 88.3639, type: "police", address: "Park Street, Kolkata", city: "Kolkata", state: "West Bengal", isActive: true },
      { name: "Sterling Hospital Ahmedabad", latitude: 23.0395, longitude: 72.5066, type: "hospital", address: "Gurukul Road, Ahmedabad", city: "Ahmedabad", state: "Gujarat", isActive: true },
      { name: "Ahmedabad Police Station - Law Garden", latitude: 23.0215, longitude: 72.5709, type: "police", address: "Law Garden, Ahmedabad", city: "Ahmedabad", state: "Gujarat", isActive: true }
    ];
    crimeData.forEach((data) => {
      const id = this.currentId++;
      this.crimeHotspotsData.set(id, {
        ...data,
        id,
        reportedIncidents: data.reportedIncidents ?? 0
      });
    });
    safeLocationData.forEach((data) => {
      const id = this.currentId++;
      this.safeLocationsData.set(id, {
        ...data,
        id,
        address: data.address ?? null,
        isActive: data.isActive ?? true
      });
    });
  }
  async getCrimeHotspots() {
    return Array.from(this.crimeHotspotsData.values());
  }
  async getCrimeHotspotsByRegion(lat, lng, radius) {
    const allHotspots = await this.getCrimeHotspots();
    return allHotspots.filter((hotspot) => {
      const distance = this.calculateDistance(lat, lng, hotspot.latitude, hotspot.longitude);
      return distance <= radius;
    });
  }
  async createCrimeHotspot(hotspot) {
    const id = this.currentId++;
    const newHotspot = {
      ...hotspot,
      id,
      reportedIncidents: hotspot.reportedIncidents ?? 0
    };
    this.crimeHotspotsData.set(id, newHotspot);
    return newHotspot;
  }
  async getSafeLocations() {
    return Array.from(this.safeLocationsData.values());
  }
  async getSafeLocationsByRegion(lat, lng, radius) {
    const allLocations = await this.getSafeLocations();
    return allLocations.filter((location) => {
      const distance = this.calculateDistance(lat, lng, location.latitude, location.longitude);
      return distance <= radius;
    });
  }
  async createSafeLocation(location) {
    const id = this.currentId++;
    const newLocation = {
      ...location,
      id,
      address: location.address ?? null,
      isActive: location.isActive ?? true
    };
    this.safeLocationsData.set(id, newLocation);
    return newLocation;
  }
  async getRoutes() {
    return Array.from(this.routesData.values());
  }
  async createRoute(route) {
    const id = this.currentId++;
    const newRoute = { ...route, id };
    this.routesData.set(id, newRoute);
    return newRoute;
  }
  async searchLocations(query) {
    const mockResults = [
      { id: "1", name: "Connaught Place", latitude: 28.6315, longitude: 77.2167, address: "Connaught Place, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "2", name: "India Gate", latitude: 28.6129, longitude: 77.2295, address: "India Gate, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "3", name: "Red Fort", latitude: 28.6562, longitude: 77.241, address: "Red Fort, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "4", name: "Gateway of India", latitude: 18.922, longitude: 72.8347, address: "Gateway of India, Mumbai", city: "Mumbai", state: "Maharashtra" },
      { id: "5", name: "Marine Drive", latitude: 18.9432, longitude: 72.8234, address: "Marine Drive, Mumbai", city: "Mumbai", state: "Maharashtra" },
      { id: "6", name: "Brigade Road", latitude: 12.9716, longitude: 77.6054, address: "Brigade Road, Bangalore", city: "Bangalore", state: "Karnataka" },
      { id: "7", name: "Cubbon Park", latitude: 12.9762, longitude: 77.5993, address: "Cubbon Park, Bangalore", city: "Bangalore", state: "Karnataka" },
      { id: "8", name: "Marina Beach", latitude: 13.0487, longitude: 80.2824, address: "Marina Beach, Chennai", city: "Chennai", state: "Tamil Nadu" }
    ];
    return mockResults.filter(
      (result) => result.name.toLowerCase().includes(query.toLowerCase()) || result.address.toLowerCase().includes(query.toLowerCase())
    );
  }
  async calculateSafeRoutes(sourceLat, sourceLng, destLat, destLng) {
    const radius = 10;
    const nearbyHotspots = await this.getCrimeHotspotsByRegion(sourceLat, sourceLng, radius);
    const nearbyHotspotsEnd = await this.getCrimeHotspotsByRegion(destLat, destLng, radius);
    const allHotspots = [...nearbyHotspots, ...nearbyHotspotsEnd];
    const nearbySafeLocations = await this.getSafeLocationsByRegion(sourceLat, sourceLng, radius);
    const nearbySafeLocationsEnd = await this.getSafeLocationsByRegion(destLat, destLng, radius);
    const allSafeLocations = [...nearbySafeLocations, ...nearbySafeLocationsEnd];
    const baseDistance = this.calculateDistance(sourceLat, sourceLng, destLat, destLng);
    const routes2 = [
      {
        id: 1,
        name: "Main Roads Route",
        safetyScore: this.calculateSafetyScore(allHotspots, allSafeLocations, "main"),
        distance: baseDistance,
        duration: Math.round(baseDistance * 3),
        // Rough estimate: 3 min per km
        coordinates: this.generateRouteCoordinates(sourceLat, sourceLng, destLat, destLng, "main"),
        safeLocationsCount: allSafeLocations.filter((loc) => loc.type === "hospital" || loc.type === "police").length,
        crimeHotspotsCount: allHotspots.filter((spot) => spot.severity === "high").length
      },
      {
        id: 2,
        name: "Shopping District Route",
        safetyScore: this.calculateSafetyScore(allHotspots, allSafeLocations, "shopping"),
        distance: baseDistance * 1.1,
        duration: Math.round(baseDistance * 1.1 * 2.8),
        coordinates: this.generateRouteCoordinates(sourceLat, sourceLng, destLat, destLng, "shopping"),
        safeLocationsCount: allSafeLocations.filter((loc) => loc.type === "hospital" || loc.type === "police").length - 1,
        crimeHotspotsCount: allHotspots.filter((spot) => spot.severity === "medium").length
      },
      {
        id: 3,
        name: "Residential Route",
        safetyScore: this.calculateSafetyScore(allHotspots, allSafeLocations, "residential"),
        distance: baseDistance * 1.25,
        duration: Math.round(baseDistance * 1.25 * 3.2),
        coordinates: this.generateRouteCoordinates(sourceLat, sourceLng, destLat, destLng, "residential"),
        safeLocationsCount: allSafeLocations.filter((loc) => loc.type === "hospital" || loc.type === "police").length - 2,
        crimeHotspotsCount: allHotspots.filter((spot) => spot.severity === "high" || spot.severity === "medium").length
      }
    ];
    return routes2.sort((a, b) => b.safetyScore - a.safetyScore);
  }
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  calculateSafetyScore(hotspots, safeLocations2, routeType) {
    let baseScore = 85;
    hotspots.forEach((spot) => {
      if (spot.severity === "high") baseScore -= 15;
      else if (spot.severity === "medium") baseScore -= 8;
      else baseScore -= 3;
    });
    safeLocations2.forEach((location) => {
      if (location.type === "hospital") baseScore += 3;
      else if (location.type === "police") baseScore += 5;
      else baseScore += 2;
    });
    if (routeType === "main") baseScore += 7;
    else if (routeType === "shopping") baseScore -= 7;
    else if (routeType === "residential") baseScore -= 20;
    return Math.max(0, Math.min(100, baseScore));
  }
  generateRouteCoordinates(sourceLat, sourceLng, destLat, destLng, routeType) {
    const coordinates = [];
    coordinates.push([sourceLng, sourceLat]);
    const latDiff = destLat - sourceLat;
    const lngDiff = destLng - sourceLng;
    if (routeType === "main") {
      coordinates.push([sourceLng + lngDiff * 0.25, sourceLat + latDiff * 0.25]);
      coordinates.push([sourceLng + lngDiff * 0.5, sourceLat + latDiff * 0.5]);
      coordinates.push([sourceLng + lngDiff * 0.75, sourceLat + latDiff * 0.75]);
    } else if (routeType === "shopping") {
      coordinates.push([sourceLng + lngDiff * 0.15, sourceLat + latDiff * 0.35]);
      coordinates.push([sourceLng + lngDiff * 0.4, sourceLat + latDiff * 0.45]);
      coordinates.push([sourceLng + lngDiff * 0.65, sourceLat + latDiff * 0.6]);
      coordinates.push([sourceLng + lngDiff * 0.85, sourceLat + latDiff * 0.85]);
    } else {
      coordinates.push([sourceLng + lngDiff * 0.3, sourceLat + latDiff * 0.1]);
      coordinates.push([sourceLng + lngDiff * 0.45, sourceLat + latDiff * 0.4]);
      coordinates.push([sourceLng + lngDiff * 0.6, sourceLat + latDiff * 0.55]);
      coordinates.push([sourceLng + lngDiff * 0.8, sourceLat + latDiff * 0.7]);
      coordinates.push([sourceLng + lngDiff * 0.95, sourceLat + latDiff * 0.9]);
    }
    coordinates.push([destLng, destLat]);
    return coordinates;
  }
};
var DatabaseStorage = class {
  async getCrimeHotspots() {
    if (!db) {
      console.warn("Database not available, using fallback data");
      return new MemStorage().getCrimeHotspots();
    }
    return await db.select().from(crimeHotspots);
  }
  async getCrimeHotspotsByRegion(lat, lng, radius) {
    if (!db) {
      return new MemStorage().getCrimeHotspotsByRegion(lat, lng, radius);
    }
    const allHotspots = await this.getCrimeHotspots();
    return allHotspots.filter((hotspot) => {
      const distance = this.calculateDistance(lat, lng, hotspot.latitude, hotspot.longitude);
      return distance <= radius;
    });
  }
  async createCrimeHotspot(hotspot) {
    if (!db) {
      return new MemStorage().createCrimeHotspot(hotspot);
    }
    const [created] = await db.insert(crimeHotspots).values({
      ...hotspot,
      reportedIncidents: hotspot.reportedIncidents ?? 0
    }).returning();
    return created;
  }
  async getSafeLocations() {
    if (!db) {
      return new MemStorage().getSafeLocations();
    }
    return await db.select().from(safeLocations);
  }
  async getSafeLocationsByRegion(lat, lng, radius) {
    if (!db) {
      return new MemStorage().getSafeLocationsByRegion(lat, lng, radius);
    }
    const allLocations = await this.getSafeLocations();
    return allLocations.filter((location) => {
      const distance = this.calculateDistance(lat, lng, location.latitude, location.longitude);
      return distance <= radius;
    });
  }
  async createSafeLocation(location) {
    if (!db) {
      return new MemStorage().createSafeLocation(location);
    }
    const [created] = await db.insert(safeLocations).values({
      ...location,
      address: location.address ?? null,
      isActive: location.isActive ?? true
    }).returning();
    return created;
  }
  async getRoutes() {
    if (!db) {
      return new MemStorage().getRoutes();
    }
    return await db.select().from(routes);
  }
  async createRoute(route) {
    if (!db) {
      return new MemStorage().createRoute(route);
    }
    const [created] = await db.insert(routes).values(route).returning();
    return created;
  }
  async searchLocations(query) {
    const locationDatabase = [
      // Major Cities
      { id: "1", name: "Delhi", latitude: 28.6139, longitude: 77.209, address: "Delhi, India", city: "Delhi", state: "Delhi" },
      { id: "2", name: "Mumbai", latitude: 19.076, longitude: 72.8777, address: "Mumbai, Maharashtra", city: "Mumbai", state: "Maharashtra" },
      { id: "3", name: "Bangalore", latitude: 12.9716, longitude: 77.5946, address: "Bangalore, Karnataka", city: "Bangalore", state: "Karnataka" },
      { id: "4", name: "Chennai", latitude: 13.0827, longitude: 80.2707, address: "Chennai, Tamil Nadu", city: "Chennai", state: "Tamil Nadu" },
      { id: "5", name: "Hyderabad", latitude: 17.385, longitude: 78.4867, address: "Hyderabad, Telangana", city: "Hyderabad", state: "Telangana" },
      { id: "6", name: "Kolkata", latitude: 22.5726, longitude: 88.3639, address: "Kolkata, West Bengal", city: "Kolkata", state: "West Bengal" },
      { id: "7", name: "Pune", latitude: 18.5204, longitude: 73.8567, address: "Pune, Maharashtra", city: "Pune", state: "Maharashtra" },
      { id: "8", name: "Ahmedabad", latitude: 23.0225, longitude: 72.5714, address: "Ahmedabad, Gujarat", city: "Ahmedabad", state: "Gujarat" },
      { id: "9", name: "Jaipur", latitude: 26.9124, longitude: 75.7873, address: "Jaipur, Rajasthan", city: "Jaipur", state: "Rajasthan" },
      { id: "10", name: "Lucknow", latitude: 26.8467, longitude: 80.9462, address: "Lucknow, Uttar Pradesh", city: "Lucknow", state: "Uttar Pradesh" },
      { id: "11", name: "Kanpur", latitude: 26.4499, longitude: 80.3319, address: "Kanpur, Uttar Pradesh", city: "Kanpur", state: "Uttar Pradesh" },
      { id: "12", name: "Nagpur", latitude: 21.1458, longitude: 79.0882, address: "Nagpur, Maharashtra", city: "Nagpur", state: "Maharashtra" },
      { id: "13", name: "Indore", latitude: 22.7196, longitude: 75.8577, address: "Indore, Madhya Pradesh", city: "Indore", state: "Madhya Pradesh" },
      { id: "14", name: "Bhopal", latitude: 23.2599, longitude: 77.4126, address: "Bhopal, Madhya Pradesh", city: "Bhopal", state: "Madhya Pradesh" },
      { id: "15", name: "Patna", latitude: 25.5941, longitude: 85.1376, address: "Patna, Bihar", city: "Patna", state: "Bihar" },
      { id: "16", name: "Chandigarh", latitude: 30.7333, longitude: 76.7794, address: "Chandigarh, India", city: "Chandigarh", state: "Chandigarh" },
      { id: "17", name: "Surat", latitude: 21.1702, longitude: 72.8311, address: "Surat, Gujarat", city: "Surat", state: "Gujarat" },
      { id: "18", name: "Coimbatore", latitude: 11.0168, longitude: 76.9558, address: "Coimbatore, Tamil Nadu", city: "Coimbatore", state: "Tamil Nadu" },
      { id: "19", name: "Kochi", latitude: 9.9312, longitude: 76.2673, address: "Kochi, Kerala", city: "Kochi", state: "Kerala" },
      { id: "20", name: "Thiruvananthapuram", latitude: 8.5241, longitude: 76.9366, address: "Thiruvananthapuram, Kerala", city: "Thiruvananthapuram", state: "Kerala" },
      { id: "21", name: "Gurgaon", latitude: 28.4595, longitude: 77.0266, address: "Gurgaon, Haryana", city: "Gurgaon", state: "Haryana" },
      { id: "22", name: "Noida", latitude: 28.5355, longitude: 77.391, address: "Noida, Uttar Pradesh", city: "Noida", state: "Uttar Pradesh" },
      { id: "23", name: "Faridabad", latitude: 28.4089, longitude: 77.3178, address: "Faridabad, Haryana", city: "Faridabad", state: "Haryana" },
      { id: "24", name: "Ghaziabad", latitude: 28.6692, longitude: 77.4538, address: "Ghaziabad, Uttar Pradesh", city: "Ghaziabad", state: "Uttar Pradesh" },
      { id: "25", name: "Vadodara", latitude: 22.3072, longitude: 73.1812, address: "Vadodara, Gujarat", city: "Vadodara", state: "Gujarat" },
      { id: "26", name: "Nashik", latitude: 19.9975, longitude: 73.7898, address: "Nashik, Maharashtra", city: "Nashik", state: "Maharashtra" },
      { id: "27", name: "Aurangabad", latitude: 19.8762, longitude: 75.3433, address: "Aurangabad, Maharashtra", city: "Aurangabad", state: "Maharashtra" },
      { id: "28", name: "Rajkot", latitude: 22.3039, longitude: 70.8022, address: "Rajkot, Gujarat", city: "Rajkot", state: "Gujarat" },
      { id: "29", name: "Agra", latitude: 27.1767, longitude: 78.0081, address: "Agra, Uttar Pradesh", city: "Agra", state: "Uttar Pradesh" },
      { id: "30", name: "Varanasi", latitude: 25.3176, longitude: 82.9739, address: "Varanasi, Uttar Pradesh", city: "Varanasi", state: "Uttar Pradesh" },
      { id: "31", name: "Allahabad", latitude: 25.4358, longitude: 81.8463, address: "Allahabad, Uttar Pradesh", city: "Allahabad", state: "Uttar Pradesh" },
      { id: "32", name: "Meerut", latitude: 28.9845, longitude: 77.7064, address: "Meerut, Uttar Pradesh", city: "Meerut", state: "Uttar Pradesh" },
      { id: "33", name: "Madurai", latitude: 9.9252, longitude: 78.1198, address: "Madurai, Tamil Nadu", city: "Madurai", state: "Tamil Nadu" },
      { id: "34", name: "Mysore", latitude: 12.2958, longitude: 76.6394, address: "Mysore, Karnataka", city: "Mysore", state: "Karnataka" },
      { id: "35", name: "Mangalore", latitude: 12.9141, longitude: 74.856, address: "Mangalore, Karnataka", city: "Mangalore", state: "Karnataka" },
      { id: "36", name: "Visakhapatnam", latitude: 17.6868, longitude: 83.2185, address: "Visakhapatnam, Andhra Pradesh", city: "Visakhapatnam", state: "Andhra Pradesh" },
      { id: "37", name: "Vijayawada", latitude: 16.5062, longitude: 80.648, address: "Vijayawada, Andhra Pradesh", city: "Vijayawada", state: "Andhra Pradesh" },
      { id: "38", name: "Ranchi", latitude: 23.3441, longitude: 85.3096, address: "Ranchi, Jharkhand", city: "Ranchi", state: "Jharkhand" },
      { id: "39", name: "Bhubaneswar", latitude: 20.2961, longitude: 85.8245, address: "Bhubaneswar, Odisha", city: "Bhubaneswar", state: "Odisha" },
      { id: "40", name: "Guwahati", latitude: 26.1445, longitude: 91.7362, address: "Guwahati, Assam", city: "Guwahati", state: "Assam" },
      { id: "41", name: "Goa", latitude: 15.2993, longitude: 74.124, address: "Goa, India", city: "Panaji", state: "Goa" },
      { id: "42", name: "Shimla", latitude: 31.1048, longitude: 77.1734, address: "Shimla, Himachal Pradesh", city: "Shimla", state: "Himachal Pradesh" },
      { id: "43", name: "Manali", latitude: 32.2432, longitude: 77.1892, address: "Manali, Himachal Pradesh", city: "Manali", state: "Himachal Pradesh" },
      { id: "44", name: "Dehradun", latitude: 30.3165, longitude: 78.0322, address: "Dehradun, Uttarakhand", city: "Dehradun", state: "Uttarakhand" },
      { id: "45", name: "Mussoorie", latitude: 30.4598, longitude: 78.0664, address: "Mussoorie, Uttarakhand", city: "Mussoorie", state: "Uttarakhand" },
      { id: "46", name: "Nainital", latitude: 29.3803, longitude: 79.4636, address: "Nainital, Uttarakhand", city: "Nainital", state: "Uttarakhand" },
      { id: "47", name: "Rishikesh", latitude: 30.0869, longitude: 78.2676, address: "Rishikesh, Uttarakhand", city: "Rishikesh", state: "Uttarakhand" },
      { id: "48", name: "Haridwar", latitude: 29.9457, longitude: 78.1642, address: "Haridwar, Uttarakhand", city: "Haridwar", state: "Uttarakhand" },
      { id: "49", name: "Darjeeling", latitude: 27.041, longitude: 88.2663, address: "Darjeeling, West Bengal", city: "Darjeeling", state: "West Bengal" },
      { id: "50", name: "Ooty", latitude: 11.4064, longitude: 76.6932, address: "Ooty, Tamil Nadu", city: "Ooty", state: "Tamil Nadu" },
      { id: "51", name: "Amritsar", latitude: 31.634, longitude: 74.8723, address: "Amritsar, Punjab", city: "Amritsar", state: "Punjab" },
      { id: "52", name: "Jalandhar", latitude: 31.326, longitude: 75.5762, address: "Jalandhar, Punjab", city: "Jalandhar", state: "Punjab" },
      { id: "53", name: "Ludhiana", latitude: 30.901, longitude: 75.8573, address: "Ludhiana, Punjab", city: "Ludhiana", state: "Punjab" },
      { id: "54", name: "Jodhpur", latitude: 26.2389, longitude: 73.0243, address: "Jodhpur, Rajasthan", city: "Jodhpur", state: "Rajasthan" },
      { id: "55", name: "Udaipur", latitude: 24.5854, longitude: 73.7125, address: "Udaipur, Rajasthan", city: "Udaipur", state: "Rajasthan" },
      { id: "56", name: "Kota", latitude: 25.2138, longitude: 75.8648, address: "Kota, Rajasthan", city: "Kota", state: "Rajasthan" },
      { id: "57", name: "Ajmer", latitude: 26.4499, longitude: 74.6399, address: "Ajmer, Rajasthan", city: "Ajmer", state: "Rajasthan" },
      { id: "58", name: "Mathura", latitude: 27.4924, longitude: 77.6737, address: "Mathura, Uttar Pradesh", city: "Mathura", state: "Uttar Pradesh" },
      { id: "59", name: "Vrindavan", latitude: 27.5706, longitude: 77.7006, address: "Vrindavan, Uttar Pradesh", city: "Vrindavan", state: "Uttar Pradesh" },
      { id: "60", name: "Pondicherry", latitude: 11.9416, longitude: 79.8083, address: "Pondicherry, India", city: "Pondicherry", state: "Puducherry" },
      // Famous Landmarks
      { id: "61", name: "Red Fort", latitude: 28.6562, longitude: 77.241, address: "Red Fort, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "62", name: "Gateway of India", latitude: 18.922, longitude: 72.8347, address: "Gateway of India, Mumbai", city: "Mumbai", state: "Maharashtra" },
      { id: "63", name: "Marine Drive", latitude: 18.9432, longitude: 72.8234, address: "Marine Drive, Mumbai", city: "Mumbai", state: "Maharashtra" },
      { id: "64", name: "Brigade Road", latitude: 12.9716, longitude: 77.6054, address: "Brigade Road, Bangalore", city: "Bangalore", state: "Karnataka" },
      { id: "65", name: "Cubbon Park", latitude: 12.9762, longitude: 77.5993, address: "Cubbon Park, Bangalore", city: "Bangalore", state: "Karnataka" },
      { id: "66", name: "Marina Beach", latitude: 13.0487, longitude: 80.2824, address: "Marina Beach, Chennai", city: "Chennai", state: "Tamil Nadu" },
      { id: "67", name: "Taj Mahal", latitude: 27.1751, longitude: 78.0421, address: "Taj Mahal, Agra", city: "Agra", state: "Uttar Pradesh" },
      { id: "68", name: "India Gate", latitude: 28.6129, longitude: 77.2295, address: "India Gate, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "69", name: "Hawa Mahal", latitude: 26.9239, longitude: 75.8267, address: "Hawa Mahal, Jaipur", city: "Jaipur", state: "Rajasthan" },
      { id: "70", name: "Charminar", latitude: 17.3616, longitude: 78.4747, address: "Charminar, Hyderabad", city: "Hyderabad", state: "Telangana" },
      { id: "71", name: "Connaught Place", latitude: 28.6315, longitude: 77.2167, address: "Connaught Place, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "72", name: "Golden Temple", latitude: 31.62, longitude: 74.8765, address: "Golden Temple, Amritsar", city: "Amritsar", state: "Punjab" },
      { id: "73", name: "Qutub Minar", latitude: 28.5245, longitude: 77.1855, address: "Qutub Minar, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "74", name: "Lotus Temple", latitude: 28.5535, longitude: 77.2588, address: "Lotus Temple, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "75", name: "Humayun's Tomb", latitude: 28.5933, longitude: 77.2507, address: "Humayun's Tomb, New Delhi", city: "Delhi", state: "Delhi" }
    ];
    const lowerQuery = query.toLowerCase();
    const filtered = locationDatabase.filter(
      (result) => result.name.toLowerCase().includes(lowerQuery) || result.address.toLowerCase().includes(lowerQuery) || result.city.toLowerCase().includes(lowerQuery) || result.state.toLowerCase().includes(lowerQuery)
    );
    const sorted = filtered.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase() === lowerQuery;
      const bNameMatch = b.name.toLowerCase() === lowerQuery;
      const aCityMatch = a.city.toLowerCase() === lowerQuery;
      const bCityMatch = b.city.toLowerCase() === lowerQuery;
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      if (aCityMatch && !bCityMatch) return -1;
      if (!aCityMatch && bCityMatch) return 1;
      return a.name.localeCompare(b.name);
    });
    return sorted.slice(0, 10);
  }
  async calculateSafeRoutes(sourceLat, sourceLng, destLat, destLng) {
    const radius = 10;
    const nearbyHotspots = await this.getCrimeHotspotsByRegion(sourceLat, sourceLng, radius);
    const nearbyHotspotsEnd = await this.getCrimeHotspotsByRegion(destLat, destLng, radius);
    const allHotspots = [...nearbyHotspots, ...nearbyHotspotsEnd];
    const nearbySafeLocations = await this.getSafeLocationsByRegion(sourceLat, sourceLng, radius);
    const nearbySafeLocationsEnd = await this.getSafeLocationsByRegion(destLat, destLng, radius);
    const allSafeLocations = [...nearbySafeLocations, ...nearbySafeLocationsEnd];
    const baseDistance = this.calculateDistance(sourceLat, sourceLng, destLat, destLng);
    const routes2 = [
      {
        id: 1,
        name: "Main Roads Route",
        safetyScore: this.calculateSafetyScore(allHotspots, allSafeLocations, "main"),
        distance: baseDistance,
        duration: Math.round(baseDistance * 3),
        // Rough estimate: 3 min per km
        coordinates: this.generateRouteCoordinates(sourceLat, sourceLng, destLat, destLng, "main"),
        safeLocationsCount: allSafeLocations.filter((loc) => loc.type === "hospital" || loc.type === "police").length,
        crimeHotspotsCount: allHotspots.filter((spot) => spot.severity === "high").length
      },
      {
        id: 2,
        name: "Shopping District Route",
        safetyScore: this.calculateSafetyScore(allHotspots, allSafeLocations, "shopping"),
        distance: baseDistance * 1.1,
        duration: Math.round(baseDistance * 1.1 * 2.8),
        coordinates: this.generateRouteCoordinates(sourceLat, sourceLng, destLat, destLng, "shopping"),
        safeLocationsCount: allSafeLocations.filter((loc) => loc.type === "hospital" || loc.type === "police").length - 1,
        crimeHotspotsCount: allHotspots.filter((spot) => spot.severity === "medium").length
      },
      {
        id: 3,
        name: "Residential Route",
        safetyScore: this.calculateSafetyScore(allHotspots, allSafeLocations, "residential"),
        distance: baseDistance * 1.25,
        duration: Math.round(baseDistance * 1.25 * 3.2),
        coordinates: this.generateRouteCoordinates(sourceLat, sourceLng, destLat, destLng, "residential"),
        safeLocationsCount: allSafeLocations.filter((loc) => loc.type === "hospital" || loc.type === "police").length - 2,
        crimeHotspotsCount: allHotspots.filter((spot) => spot.severity === "high" || spot.severity === "medium").length
      }
    ];
    return routes2.sort((a, b) => b.safetyScore - a.safetyScore);
  }
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  calculateSafetyScore(hotspots, safeLocations2, routeType) {
    let baseScore = 85;
    hotspots.forEach((spot) => {
      if (spot.severity === "high") baseScore -= 15;
      else if (spot.severity === "medium") baseScore -= 8;
      else baseScore -= 3;
    });
    safeLocations2.forEach((location) => {
      if (location.type === "hospital") baseScore += 3;
      else if (location.type === "police") baseScore += 5;
      else baseScore += 2;
    });
    if (routeType === "main") baseScore += 7;
    else if (routeType === "shopping") baseScore -= 7;
    else if (routeType === "residential") baseScore -= 20;
    return Math.max(0, Math.min(100, baseScore));
  }
  generateRouteCoordinates(sourceLat, sourceLng, destLat, destLng, routeType) {
    const coordinates = [];
    coordinates.push([sourceLng, sourceLat]);
    const latDiff = destLat - sourceLat;
    const lngDiff = destLng - sourceLng;
    if (routeType === "main") {
      coordinates.push([sourceLng + lngDiff * 0.25, sourceLat + latDiff * 0.25]);
      coordinates.push([sourceLng + lngDiff * 0.5, sourceLat + latDiff * 0.5]);
      coordinates.push([sourceLng + lngDiff * 0.75, sourceLat + latDiff * 0.75]);
    } else if (routeType === "shopping") {
      coordinates.push([sourceLng + lngDiff * 0.15, sourceLat + latDiff * 0.35]);
      coordinates.push([sourceLng + lngDiff * 0.4, sourceLat + latDiff * 0.45]);
      coordinates.push([sourceLng + lngDiff * 0.65, sourceLat + latDiff * 0.6]);
      coordinates.push([sourceLng + lngDiff * 0.85, sourceLat + latDiff * 0.85]);
    } else {
      coordinates.push([sourceLng + lngDiff * 0.3, sourceLat + latDiff * 0.1]);
      coordinates.push([sourceLng + lngDiff * 0.45, sourceLat + latDiff * 0.4]);
      coordinates.push([sourceLng + lngDiff * 0.6, sourceLat + latDiff * 0.55]);
      coordinates.push([sourceLng + lngDiff * 0.8, sourceLat + latDiff * 0.7]);
      coordinates.push([sourceLng + lngDiff * 0.95, sourceLat + latDiff * 0.9]);
    }
    coordinates.push([destLng, destLat]);
    return coordinates;
  }
};
async function initializeDatabase() {
  try {
    if (!db) {
      console.log("Database not available, skipping initialization");
      return;
    }
    const existingHotspots = await db.select().from(crimeHotspots).limit(1);
    if (existingHotspots.length > 0) {
      console.log("Database already initialized");
      return;
    }
    const crimeData = [
      { name: "Delhi - Connaught Place", latitude: 28.6315, longitude: 77.2167, severity: "medium", crimeType: "theft", city: "Delhi", state: "Delhi", reportedIncidents: 45 },
      { name: "Mumbai - Dadar Station", latitude: 19.0176, longitude: 72.8562, severity: "high", crimeType: "robbery", city: "Mumbai", state: "Maharashtra", reportedIncidents: 62 },
      { name: "Bangalore - MG Road", latitude: 12.9716, longitude: 77.5946, severity: "low", crimeType: "harassment", city: "Bangalore", state: "Karnataka", reportedIncidents: 23 },
      { name: "Chennai - T. Nagar", latitude: 13.0827, longitude: 80.2707, severity: "medium", crimeType: "theft", city: "Chennai", state: "Tamil Nadu", reportedIncidents: 34 },
      { name: "Hyderabad - Banjara Hills", latitude: 17.4065, longitude: 78.4772, severity: "low", crimeType: "harassment", city: "Hyderabad", state: "Telangana", reportedIncidents: 18 },
      { name: "Pune - FC Road", latitude: 18.5204, longitude: 73.8567, severity: "medium", crimeType: "theft", city: "Pune", state: "Maharashtra", reportedIncidents: 29 },
      { name: "Kolkata - Park Street", latitude: 22.5726, longitude: 88.3639, severity: "high", crimeType: "robbery", city: "Kolkata", state: "West Bengal", reportedIncidents: 56 },
      { name: "Ahmedabad - Law Garden", latitude: 23.0225, longitude: 72.5714, severity: "low", crimeType: "harassment", city: "Ahmedabad", state: "Gujarat", reportedIncidents: 21 },
      { name: "Jaipur - Pink City", latitude: 26.9124, longitude: 75.7873, severity: "medium", crimeType: "theft", city: "Jaipur", state: "Rajasthan", reportedIncidents: 38 },
      { name: "Lucknow - Hazratganj", latitude: 26.8467, longitude: 80.9462, severity: "high", crimeType: "robbery", city: "Lucknow", state: "Uttar Pradesh", reportedIncidents: 48 },
      { name: "Gurgaon - Cyber City", latitude: 28.4595, longitude: 77.0266, severity: "medium", crimeType: "theft", city: "Gurgaon", state: "Haryana", reportedIncidents: 31 },
      { name: "Noida - Sector 18", latitude: 28.5355, longitude: 77.391, severity: "low", crimeType: "harassment", city: "Noida", state: "Uttar Pradesh", reportedIncidents: 16 }
    ];
    const safeLocationData = [
      { name: "AIIMS Delhi", latitude: 28.5672, longitude: 77.21, type: "hospital", address: "Ansari Nagar, New Delhi", city: "Delhi", state: "Delhi", isActive: true },
      { name: "Delhi Police Station - CP", latitude: 28.6289, longitude: 77.2065, type: "police", address: "Connaught Place, New Delhi", city: "Delhi", state: "Delhi", isActive: true },
      { name: "Lilavati Hospital Mumbai", latitude: 19.0596, longitude: 72.8295, type: "hospital", address: "Bandra West, Mumbai", city: "Mumbai", state: "Maharashtra", isActive: true },
      { name: "Mumbai Police Station - Dadar", latitude: 19.0144, longitude: 72.8479, type: "police", address: "Dadar West, Mumbai", city: "Mumbai", state: "Maharashtra", isActive: true },
      { name: "Manipal Hospital Bangalore", latitude: 12.9279, longitude: 77.6271, type: "hospital", address: "HAL Airport Road, Bangalore", city: "Bangalore", state: "Karnataka", isActive: true },
      { name: "Bangalore Police Station - MG Road", latitude: 12.9698, longitude: 77.5935, type: "police", address: "MG Road, Bangalore", city: "Bangalore", state: "Karnataka", isActive: true },
      { name: "Apollo Hospital Chennai", latitude: 13.0524, longitude: 80.2511, type: "hospital", address: "Greams Road, Chennai", city: "Chennai", state: "Tamil Nadu", isActive: true },
      { name: "Chennai Police Station - T. Nagar", latitude: 13.0826, longitude: 80.2341, type: "police", address: "T. Nagar, Chennai", city: "Chennai", state: "Tamil Nadu", isActive: true },
      { name: "Apollo Hospital Hyderabad", latitude: 17.4326, longitude: 78.4071, type: "hospital", address: "Jubilee Hills, Hyderabad", city: "Hyderabad", state: "Telangana", isActive: true },
      { name: "Hyderabad Police Station - Banjara Hills", latitude: 17.4081, longitude: 78.4691, type: "police", address: "Banjara Hills, Hyderabad", city: "Hyderabad", state: "Telangana", isActive: true },
      { name: "Ruby Hall Clinic Pune", latitude: 18.5018, longitude: 73.8636, type: "hospital", address: "Sassoon Road, Pune", city: "Pune", state: "Maharashtra", isActive: true },
      { name: "Pune Police Station - FC Road", latitude: 18.5196, longitude: 73.8553, type: "police", address: "FC Road, Pune", city: "Pune", state: "Maharashtra", isActive: true },
      { name: "AMRI Hospital Kolkata", latitude: 22.5448, longitude: 88.3426, type: "hospital", address: "Salt Lake, Kolkata", city: "Kolkata", state: "West Bengal", isActive: true },
      { name: "Kolkata Police Station - Park Street", latitude: 22.5726, longitude: 88.3639, type: "police", address: "Park Street, Kolkata", city: "Kolkata", state: "West Bengal", isActive: true },
      { name: "Sterling Hospital Ahmedabad", latitude: 23.0395, longitude: 72.5066, type: "hospital", address: "Gurukul Road, Ahmedabad", city: "Ahmedabad", state: "Gujarat", isActive: true },
      { name: "Ahmedabad Police Station - Law Garden", latitude: 23.0215, longitude: 72.5709, type: "police", address: "Law Garden, Ahmedabad", city: "Ahmedabad", state: "Gujarat", isActive: true }
    ];
    await db.insert(crimeHotspots).values(crimeData);
    await db.insert(safeLocations).values(safeLocationData);
    console.log("Database initialized with sample data");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}
var storage = isDatabaseAvailable ? new DatabaseStorage() : new MemStorage();
if (isDatabaseAvailable) {
  initializeDatabase();
}

// server/routes.ts
import { z } from "zod";
var routeCalculationSchema = z.object({
  sourceLat: z.number(),
  sourceLng: z.number(),
  destLat: z.number(),
  destLng: z.number()
});
var locationSearchSchema = z.object({
  query: z.string().min(1)
});
async function registerRoutes(app2) {
  app2.get("/api/crime-hotspots", async (req, res) => {
    try {
      const hotspots = await storage.getCrimeHotspots();
      res.json(hotspots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch crime hotspots" });
    }
  });
  app2.get("/api/crime-hotspots/region", async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      if (!lat || !lng || !radius) {
        return res.status(400).json({ message: "Missing required parameters: lat, lng, radius" });
      }
      const hotspots = await storage.getCrimeHotspotsByRegion(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius)
      );
      res.json(hotspots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch crime hotspots by region" });
    }
  });
  app2.get("/api/safe-locations", async (req, res) => {
    try {
      const locations = await storage.getSafeLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch safe locations" });
    }
  });
  app2.get("/api/safe-locations/region", async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      if (!lat || !lng || !radius) {
        return res.status(400).json({ message: "Missing required parameters: lat, lng, radius" });
      }
      const locations = await storage.getSafeLocationsByRegion(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius)
      );
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch safe locations by region" });
    }
  });
  app2.get("/api/locations/search", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Missing or invalid search query" });
      }
      const results = await storage.searchLocations(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search locations" });
    }
  });
  app2.post("/api/routes/calculate", async (req, res) => {
    try {
      const { sourceLat, sourceLng, destLat, destLng } = routeCalculationSchema.parse(req.body);
      const routes2 = await storage.calculateSafeRoutes(sourceLat, sourceLng, destLat, destLng);
      res.json(routes2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid route calculation parameters" });
      }
      res.status(500).json({ message: "Failed to calculate safe routes" });
    }
  });
  app2.get("/api/routes", async (req, res) => {
    try {
      const routes2 = await storage.getRoutes();
      res.json(routes2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(process.cwd(), "dist", "public");
  if (!fs.existsSync(distPath)) {
    console.warn(`Build directory not found: ${distPath}, serving from fallback`);
    const altPath = path2.resolve(process.cwd(), "client", "dist");
    if (fs.existsSync(altPath)) {
      app2.use(express.static(altPath));
      app2.use("*", (_req, res) => {
        res.sendFile(path2.resolve(altPath, "index.html"));
      });
      return;
    }
    app2.use("*", (_req, res) => {
      res.status(503).send(`
        <html>
          <body>
            <h1>SafeRoute</h1>
            <p>Application is starting up. Please wait...</p>
            <script>setTimeout(() => location.reload(), 3000);</script>
          </body>
        </html>
      `);
    });
    return;
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 5e3;
  server.listen({
    port,
    host: process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
