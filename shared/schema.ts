import { pgTable, text, serial, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const crimeHotspots = pgTable("crime_hotspots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  severity: text("severity").notNull(), // 'low', 'medium', 'high'
  crimeType: text("crime_type").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  reportedIncidents: integer("reported_incidents").default(0),
});

export const safeLocations = pgTable("safe_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  type: text("type").notNull(), // 'hospital', 'police', 'fire_station', 'mall', 'school'
  address: text("address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  isActive: boolean("is_active").default(true),
});

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sourceLatitude: real("source_latitude").notNull(),
  sourceLongitude: real("source_longitude").notNull(),
  destLatitude: real("dest_latitude").notNull(),
  destLongitude: real("dest_longitude").notNull(),
  safetyScore: integer("safety_score").notNull(), // 0-100
  distance: real("distance").notNull(), // in kilometers
  duration: integer("duration").notNull(), // in minutes
  coordinates: text("coordinates").notNull(), // JSON string of route coordinates
});

export const insertCrimeHotspotSchema = createInsertSchema(crimeHotspots).omit({
  id: true,
});

export const insertSafeLocationSchema = createInsertSchema(safeLocations).omit({
  id: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
});

export type CrimeHotspot = typeof crimeHotspots.$inferSelect;
export type SafeLocation = typeof safeLocations.$inferSelect;
export type Route = typeof routes.$inferSelect;
export type InsertCrimeHotspot = z.infer<typeof insertCrimeHotspotSchema>;
export type InsertSafeLocation = z.infer<typeof insertSafeLocationSchema>;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

// Additional types for API responses
export type RouteOption = {
  id: number;
  name: string;
  safetyScore: number;
  distance: number;
  duration: number;
  coordinates: [number, number][];
  safeLocationsCount: number;
  crimeHotspotsCount: number;
};

export type LocationSearchResult = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
};
