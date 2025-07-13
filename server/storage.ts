import { 
  crimeHotspots, 
  safeLocations, 
  routes,
  type CrimeHotspot, 
  type SafeLocation, 
  type Route,
  type InsertCrimeHotspot,
  type InsertSafeLocation,
  type InsertRoute,
  type RouteOption,
  type LocationSearchResult
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // Crime hotspots
  getCrimeHotspots(): Promise<CrimeHotspot[]>;
  getCrimeHotspotsByRegion(lat: number, lng: number, radius: number): Promise<CrimeHotspot[]>;
  createCrimeHotspot(hotspot: InsertCrimeHotspot): Promise<CrimeHotspot>;
  
  // Safe locations
  getSafeLocations(): Promise<SafeLocation[]>;
  getSafeLocationsByRegion(lat: number, lng: number, radius: number): Promise<SafeLocation[]>;
  createSafeLocation(location: InsertSafeLocation): Promise<SafeLocation>;
  
  // Routes
  getRoutes(): Promise<Route[]>;
  createRoute(route: InsertRoute): Promise<Route>;
  
  // Location search
  searchLocations(query: string): Promise<LocationSearchResult[]>;
  
  // Route calculation
  calculateSafeRoutes(sourceLat: number, sourceLng: number, destLat: number, destLng: number): Promise<RouteOption[]>;
}

export class MemStorage implements IStorage {
  private crimeHotspotsData: Map<number, CrimeHotspot>;
  private safeLocationsData: Map<number, SafeLocation>;
  private routesData: Map<number, Route>;
  private currentId: number;

  constructor() {
    this.crimeHotspotsData = new Map();
    this.safeLocationsData = new Map();
    this.routesData = new Map();
    this.currentId = 1;
    this.initializeData();
  }

  private initializeData() {
    // Initialize crime hotspots data for major Indian cities
    const crimeData: Omit<CrimeHotspot, 'id'>[] = [
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
      { name: "Noida - Sector 18", latitude: 28.5355, longitude: 77.3910, severity: "low", crimeType: "harassment", city: "Noida", state: "Uttar Pradesh", reportedIncidents: 16 },
    ];

    // Initialize safe locations data
    const safeLocationData: Omit<SafeLocation, 'id'>[] = [
      { name: "AIIMS Delhi", latitude: 28.5672, longitude: 77.2100, type: "hospital", address: "Ansari Nagar, New Delhi", city: "Delhi", state: "Delhi", isActive: true },
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
      { name: "Ahmedabad Police Station - Law Garden", latitude: 23.0215, longitude: 72.5709, type: "police", address: "Law Garden, Ahmedabad", city: "Ahmedabad", state: "Gujarat", isActive: true },
    ];

    // Add crime hotspots
    crimeData.forEach(data => {
      const id = this.currentId++;
      this.crimeHotspotsData.set(id, { 
        ...data, 
        id,
        reportedIncidents: data.reportedIncidents ?? 0
      });
    });

    // Add safe locations
    safeLocationData.forEach(data => {
      const id = this.currentId++;
      this.safeLocationsData.set(id, { 
        ...data, 
        id,
        address: data.address ?? null,
        isActive: data.isActive ?? true
      });
    });
  }

  async getCrimeHotspots(): Promise<CrimeHotspot[]> {
    return Array.from(this.crimeHotspotsData.values());
  }

  async getCrimeHotspotsByRegion(lat: number, lng: number, radius: number): Promise<CrimeHotspot[]> {
    const allHotspots = await this.getCrimeHotspots();
    return allHotspots.filter(hotspot => {
      const distance = this.calculateDistance(lat, lng, hotspot.latitude, hotspot.longitude);
      return distance <= radius;
    });
  }

  async createCrimeHotspot(hotspot: InsertCrimeHotspot): Promise<CrimeHotspot> {
    const id = this.currentId++;
    const newHotspot: CrimeHotspot = { 
      ...hotspot, 
      id,
      reportedIncidents: hotspot.reportedIncidents ?? 0
    };
    this.crimeHotspotsData.set(id, newHotspot);
    return newHotspot;
  }

  async getSafeLocations(): Promise<SafeLocation[]> {
    return Array.from(this.safeLocationsData.values());
  }

  async getSafeLocationsByRegion(lat: number, lng: number, radius: number): Promise<SafeLocation[]> {
    const allLocations = await this.getSafeLocations();
    return allLocations.filter(location => {
      const distance = this.calculateDistance(lat, lng, location.latitude, location.longitude);
      return distance <= radius;
    });
  }

  async createSafeLocation(location: InsertSafeLocation): Promise<SafeLocation> {
    const id = this.currentId++;
    const newLocation: SafeLocation = { 
      ...location, 
      id,
      address: location.address ?? null,
      isActive: location.isActive ?? true
    };
    this.safeLocationsData.set(id, newLocation);
    return newLocation;
  }

  async getRoutes(): Promise<Route[]> {
    return Array.from(this.routesData.values());
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const id = this.currentId++;
    const newRoute: Route = { ...route, id };
    this.routesData.set(id, newRoute);
    return newRoute;
  }

  async searchLocations(query: string): Promise<LocationSearchResult[]> {
    // Mock location search - in production, this would use a geocoding service
    const mockResults: LocationSearchResult[] = [
      { id: "1", name: "Connaught Place", latitude: 28.6315, longitude: 77.2167, address: "Connaught Place, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "2", name: "India Gate", latitude: 28.6129, longitude: 77.2295, address: "India Gate, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "3", name: "Red Fort", latitude: 28.6562, longitude: 77.2410, address: "Red Fort, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "4", name: "Gateway of India", latitude: 18.9220, longitude: 72.8347, address: "Gateway of India, Mumbai", city: "Mumbai", state: "Maharashtra" },
      { id: "5", name: "Marine Drive", latitude: 18.9432, longitude: 72.8234, address: "Marine Drive, Mumbai", city: "Mumbai", state: "Maharashtra" },
      { id: "6", name: "Brigade Road", latitude: 12.9716, longitude: 77.6054, address: "Brigade Road, Bangalore", city: "Bangalore", state: "Karnataka" },
      { id: "7", name: "Cubbon Park", latitude: 12.9762, longitude: 77.5993, address: "Cubbon Park, Bangalore", city: "Bangalore", state: "Karnataka" },
      { id: "8", name: "Marina Beach", latitude: 13.0487, longitude: 80.2824, address: "Marina Beach, Chennai", city: "Chennai", state: "Tamil Nadu" },
    ];

    return mockResults.filter(result => 
      result.name.toLowerCase().includes(query.toLowerCase()) ||
      result.address.toLowerCase().includes(query.toLowerCase())
    );
  }

  async calculateSafeRoutes(sourceLat: number, sourceLng: number, destLat: number, destLng: number): Promise<RouteOption[]> {
    const radius = 10; // 10km radius for checking nearby locations
    const nearbyHotspots = await this.getCrimeHotspotsByRegion(sourceLat, sourceLng, radius);
    const nearbyHotspotsEnd = await this.getCrimeHotspotsByRegion(destLat, destLng, radius);
    const allHotspots = [...nearbyHotspots, ...nearbyHotspotsEnd];
    
    const nearbySafeLocations = await this.getSafeLocationsByRegion(sourceLat, sourceLng, radius);
    const nearbySafeLocationsEnd = await this.getSafeLocationsByRegion(destLat, destLng, radius);
    const allSafeLocations = [...nearbySafeLocations, ...nearbySafeLocationsEnd];

    // Calculate base distance
    const baseDistance = this.calculateDistance(sourceLat, sourceLng, destLat, destLng);
    
    // Generate multiple route options
    const routes: RouteOption[] = [
      {
        id: 1,
        name: "Main Roads Route",
        safetyScore: this.calculateSafetyScore(allHotspots, allSafeLocations, "main"),
        distance: baseDistance,
        duration: Math.round(baseDistance * 3), // Rough estimate: 3 min per km
        coordinates: this.generateRouteCoordinates(sourceLat, sourceLng, destLat, destLng, "main"),
        safeLocationsCount: allSafeLocations.filter(loc => loc.type === "hospital" || loc.type === "police").length,
        crimeHotspotsCount: allHotspots.filter(spot => spot.severity === "high").length,
      },
      {
        id: 2,
        name: "Shopping District Route",
        safetyScore: this.calculateSafetyScore(allHotspots, allSafeLocations, "shopping"),
        distance: baseDistance * 1.1,
        duration: Math.round(baseDistance * 1.1 * 2.8),
        coordinates: this.generateRouteCoordinates(sourceLat, sourceLng, destLat, destLng, "shopping"),
        safeLocationsCount: allSafeLocations.filter(loc => loc.type === "hospital" || loc.type === "police").length - 1,
        crimeHotspotsCount: allHotspots.filter(spot => spot.severity === "medium").length,
      },
      {
        id: 3,
        name: "Residential Route",
        safetyScore: this.calculateSafetyScore(allHotspots, allSafeLocations, "residential"),
        distance: baseDistance * 1.25,
        duration: Math.round(baseDistance * 1.25 * 3.2),
        coordinates: this.generateRouteCoordinates(sourceLat, sourceLng, destLat, destLng, "residential"),
        safeLocationsCount: allSafeLocations.filter(loc => loc.type === "hospital" || loc.type === "police").length - 2,
        crimeHotspotsCount: allHotspots.filter(spot => spot.severity === "high" || spot.severity === "medium").length,
      },
    ];

    return routes.sort((a, b) => b.safetyScore - a.safetyScore);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  private calculateSafetyScore(hotspots: CrimeHotspot[], safeLocations: SafeLocation[], routeType: string): number {
    let baseScore = 85;
    
    // Deduct points for crime hotspots
    hotspots.forEach(spot => {
      if (spot.severity === "high") baseScore -= 15;
      else if (spot.severity === "medium") baseScore -= 8;
      else baseScore -= 3;
    });

    // Add points for safe locations
    safeLocations.forEach(location => {
      if (location.type === "hospital") baseScore += 3;
      else if (location.type === "police") baseScore += 5;
      else baseScore += 2;
    });

    // Route type modifiers
    if (routeType === "main") baseScore += 7;
    else if (routeType === "shopping") baseScore -= 7;
    else if (routeType === "residential") baseScore -= 20;

    return Math.max(0, Math.min(100, baseScore));
  }

  private generateRouteCoordinates(sourceLat: number, sourceLng: number, destLat: number, destLng: number, routeType: string): [number, number][] {
    const coordinates: [number, number][] = [];
    
    coordinates.push([sourceLng, sourceLat]);
    
    // Add more intermediate points for better route visualization
    const latDiff = destLat - sourceLat;
    const lngDiff = destLng - sourceLng;
    
    // Generate more realistic waypoints based on route type
    if (routeType === "main") {
      // Main route - more direct path
      coordinates.push([sourceLng + lngDiff * 0.25, sourceLat + latDiff * 0.25]);
      coordinates.push([sourceLng + lngDiff * 0.5, sourceLat + latDiff * 0.5]);
      coordinates.push([sourceLng + lngDiff * 0.75, sourceLat + latDiff * 0.75]);
    } else if (routeType === "shopping") {
      // Shopping route - slight detour through commercial areas
      coordinates.push([sourceLng + lngDiff * 0.15, sourceLat + latDiff * 0.35]);
      coordinates.push([sourceLng + lngDiff * 0.4, sourceLat + latDiff * 0.45]);
      coordinates.push([sourceLng + lngDiff * 0.65, sourceLat + latDiff * 0.6]);
      coordinates.push([sourceLng + lngDiff * 0.85, sourceLat + latDiff * 0.85]);
    } else {
      // Residential route - longer detour through safer residential areas
      coordinates.push([sourceLng + lngDiff * 0.3, sourceLat + latDiff * 0.1]);
      coordinates.push([sourceLng + lngDiff * 0.45, sourceLat + latDiff * 0.4]);
      coordinates.push([sourceLng + lngDiff * 0.6, sourceLat + latDiff * 0.55]);
      coordinates.push([sourceLng + lngDiff * 0.8, sourceLat + latDiff * 0.7]);
      coordinates.push([sourceLng + lngDiff * 0.95, sourceLat + latDiff * 0.9]);
    }
    
    coordinates.push([destLng, destLat]);
    
    return coordinates;
  }
}

export class DatabaseStorage implements IStorage {
  async getCrimeHotspots(): Promise<CrimeHotspot[]> {
    return await db.select().from(crimeHotspots);
  }

  async getCrimeHotspotsByRegion(lat: number, lng: number, radius: number): Promise<CrimeHotspot[]> {
    const allHotspots = await this.getCrimeHotspots();
    return allHotspots.filter(hotspot => {
      const distance = this.calculateDistance(lat, lng, hotspot.latitude, hotspot.longitude);
      return distance <= radius;
    });
  }

  async createCrimeHotspot(hotspot: InsertCrimeHotspot): Promise<CrimeHotspot> {
    const [created] = await db.insert(crimeHotspots).values({
      ...hotspot,
      reportedIncidents: hotspot.reportedIncidents ?? 0
    }).returning();
    return created;
  }

  async getSafeLocations(): Promise<SafeLocation[]> {
    return await db.select().from(safeLocations);
  }

  async getSafeLocationsByRegion(lat: number, lng: number, radius: number): Promise<SafeLocation[]> {
    const allLocations = await this.getSafeLocations();
    return allLocations.filter(location => {
      const distance = this.calculateDistance(lat, lng, location.latitude, location.longitude);
      return distance <= radius;
    });
  }

  async createSafeLocation(location: InsertSafeLocation): Promise<SafeLocation> {
    const [created] = await db.insert(safeLocations).values({
      ...location,
      address: location.address ?? null,
      isActive: location.isActive ?? true
    }).returning();
    return created;
  }

  async getRoutes(): Promise<Route[]> {
    return await db.select().from(routes);
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const [created] = await db.insert(routes).values(route).returning();
    return created;
  }

  async searchLocations(query: string): Promise<LocationSearchResult[]> {
    // Comprehensive location database covering all of India
    const locationDatabase: LocationSearchResult[] = [
      // Major Cities
      { id: "1", name: "Delhi", latitude: 28.6139, longitude: 77.2090, address: "Delhi, India", city: "Delhi", state: "Delhi" },
      { id: "2", name: "Mumbai", latitude: 19.0760, longitude: 72.8777, address: "Mumbai, Maharashtra", city: "Mumbai", state: "Maharashtra" },
      { id: "3", name: "Bangalore", latitude: 12.9716, longitude: 77.5946, address: "Bangalore, Karnataka", city: "Bangalore", state: "Karnataka" },
      { id: "4", name: "Chennai", latitude: 13.0827, longitude: 80.2707, address: "Chennai, Tamil Nadu", city: "Chennai", state: "Tamil Nadu" },
      { id: "5", name: "Hyderabad", latitude: 17.3850, longitude: 78.4867, address: "Hyderabad, Telangana", city: "Hyderabad", state: "Telangana" },
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
      { id: "22", name: "Noida", latitude: 28.5355, longitude: 77.3910, address: "Noida, Uttar Pradesh", city: "Noida", state: "Uttar Pradesh" },
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
      { id: "35", name: "Mangalore", latitude: 12.9141, longitude: 74.8560, address: "Mangalore, Karnataka", city: "Mangalore", state: "Karnataka" },
      { id: "36", name: "Visakhapatnam", latitude: 17.6868, longitude: 83.2185, address: "Visakhapatnam, Andhra Pradesh", city: "Visakhapatnam", state: "Andhra Pradesh" },
      { id: "37", name: "Vijayawada", latitude: 16.5062, longitude: 80.6480, address: "Vijayawada, Andhra Pradesh", city: "Vijayawada", state: "Andhra Pradesh" },
      { id: "38", name: "Ranchi", latitude: 23.3441, longitude: 85.3096, address: "Ranchi, Jharkhand", city: "Ranchi", state: "Jharkhand" },
      { id: "39", name: "Bhubaneswar", latitude: 20.2961, longitude: 85.8245, address: "Bhubaneswar, Odisha", city: "Bhubaneswar", state: "Odisha" },
      { id: "40", name: "Guwahati", latitude: 26.1445, longitude: 91.7362, address: "Guwahati, Assam", city: "Guwahati", state: "Assam" },
      { id: "41", name: "Goa", latitude: 15.2993, longitude: 74.1240, address: "Goa, India", city: "Panaji", state: "Goa" },
      { id: "42", name: "Shimla", latitude: 31.1048, longitude: 77.1734, address: "Shimla, Himachal Pradesh", city: "Shimla", state: "Himachal Pradesh" },
      { id: "43", name: "Manali", latitude: 32.2432, longitude: 77.1892, address: "Manali, Himachal Pradesh", city: "Manali", state: "Himachal Pradesh" },
      { id: "44", name: "Dehradun", latitude: 30.3165, longitude: 78.0322, address: "Dehradun, Uttarakhand", city: "Dehradun", state: "Uttarakhand" },
      { id: "45", name: "Mussoorie", latitude: 30.4598, longitude: 78.0664, address: "Mussoorie, Uttarakhand", city: "Mussoorie", state: "Uttarakhand" },
      { id: "46", name: "Nainital", latitude: 29.3803, longitude: 79.4636, address: "Nainital, Uttarakhand", city: "Nainital", state: "Uttarakhand" },
      { id: "47", name: "Rishikesh", latitude: 30.0869, longitude: 78.2676, address: "Rishikesh, Uttarakhand", city: "Rishikesh", state: "Uttarakhand" },
      { id: "48", name: "Haridwar", latitude: 29.9457, longitude: 78.1642, address: "Haridwar, Uttarakhand", city: "Haridwar", state: "Uttarakhand" },
      { id: "49", name: "Darjeeling", latitude: 27.0410, longitude: 88.2663, address: "Darjeeling, West Bengal", city: "Darjeeling", state: "West Bengal" },
      { id: "50", name: "Ooty", latitude: 11.4064, longitude: 76.6932, address: "Ooty, Tamil Nadu", city: "Ooty", state: "Tamil Nadu" },
      { id: "51", name: "Amritsar", latitude: 31.6340, longitude: 74.8723, address: "Amritsar, Punjab", city: "Amritsar", state: "Punjab" },
      { id: "52", name: "Jalandhar", latitude: 31.3260, longitude: 75.5762, address: "Jalandhar, Punjab", city: "Jalandhar", state: "Punjab" },
      { id: "53", name: "Ludhiana", latitude: 30.9010, longitude: 75.8573, address: "Ludhiana, Punjab", city: "Ludhiana", state: "Punjab" },
      { id: "54", name: "Jodhpur", latitude: 26.2389, longitude: 73.0243, address: "Jodhpur, Rajasthan", city: "Jodhpur", state: "Rajasthan" },
      { id: "55", name: "Udaipur", latitude: 24.5854, longitude: 73.7125, address: "Udaipur, Rajasthan", city: "Udaipur", state: "Rajasthan" },
      { id: "56", name: "Kota", latitude: 25.2138, longitude: 75.8648, address: "Kota, Rajasthan", city: "Kota", state: "Rajasthan" },
      { id: "57", name: "Ajmer", latitude: 26.4499, longitude: 74.6399, address: "Ajmer, Rajasthan", city: "Ajmer", state: "Rajasthan" },
      { id: "58", name: "Mathura", latitude: 27.4924, longitude: 77.6737, address: "Mathura, Uttar Pradesh", city: "Mathura", state: "Uttar Pradesh" },
      { id: "59", name: "Vrindavan", latitude: 27.5706, longitude: 77.7006, address: "Vrindavan, Uttar Pradesh", city: "Vrindavan", state: "Uttar Pradesh" },
      { id: "60", name: "Pondicherry", latitude: 11.9416, longitude: 79.8083, address: "Pondicherry, India", city: "Pondicherry", state: "Puducherry" },
      // Famous Landmarks
      { id: "61", name: "Red Fort", latitude: 28.6562, longitude: 77.2410, address: "Red Fort, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "62", name: "Gateway of India", latitude: 18.9220, longitude: 72.8347, address: "Gateway of India, Mumbai", city: "Mumbai", state: "Maharashtra" },
      { id: "63", name: "Marine Drive", latitude: 18.9432, longitude: 72.8234, address: "Marine Drive, Mumbai", city: "Mumbai", state: "Maharashtra" },
      { id: "64", name: "Brigade Road", latitude: 12.9716, longitude: 77.6054, address: "Brigade Road, Bangalore", city: "Bangalore", state: "Karnataka" },
      { id: "65", name: "Cubbon Park", latitude: 12.9762, longitude: 77.5993, address: "Cubbon Park, Bangalore", city: "Bangalore", state: "Karnataka" },
      { id: "66", name: "Marina Beach", latitude: 13.0487, longitude: 80.2824, address: "Marina Beach, Chennai", city: "Chennai", state: "Tamil Nadu" },
      { id: "67", name: "Taj Mahal", latitude: 27.1751, longitude: 78.0421, address: "Taj Mahal, Agra", city: "Agra", state: "Uttar Pradesh" },
      { id: "68", name: "India Gate", latitude: 28.6129, longitude: 77.2295, address: "India Gate, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "69", name: "Hawa Mahal", latitude: 26.9239, longitude: 75.8267, address: "Hawa Mahal, Jaipur", city: "Jaipur", state: "Rajasthan" },
      { id: "70", name: "Charminar", latitude: 17.3616, longitude: 78.4747, address: "Charminar, Hyderabad", city: "Hyderabad", state: "Telangana" },
      { id: "71", name: "Connaught Place", latitude: 28.6315, longitude: 77.2167, address: "Connaught Place, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "72", name: "Golden Temple", latitude: 31.6200, longitude: 74.8765, address: "Golden Temple, Amritsar", city: "Amritsar", state: "Punjab" },
      { id: "73", name: "Qutub Minar", latitude: 28.5245, longitude: 77.1855, address: "Qutub Minar, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "74", name: "Lotus Temple", latitude: 28.5535, longitude: 77.2588, address: "Lotus Temple, New Delhi", city: "Delhi", state: "Delhi" },
      { id: "75", name: "Humayun's Tomb", latitude: 28.5933, longitude: 77.2507, address: "Humayun's Tomb, New Delhi", city: "Delhi", state: "Delhi" }
    ];

    const lowerQuery = query.toLowerCase();
    const filtered = locationDatabase.filter(result => 
      result.name.toLowerCase().includes(lowerQuery) ||
      result.address.toLowerCase().includes(lowerQuery) ||
      result.city.toLowerCase().includes(lowerQuery) ||
      result.state.toLowerCase().includes(lowerQuery)
    );

    // Sort by relevance (exact name matches first, then partial matches)
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

    return sorted.slice(0, 10); // Limit to 10 results for performance
  }

  async calculateSafeRoutes(sourceLat: number, sourceLng: number, destLat: number, destLng: number): Promise<RouteOption[]> {
    const radius = 10; // 10km radius for checking nearby locations
    const nearbyHotspots = await this.getCrimeHotspotsByRegion(sourceLat, sourceLng, radius);
    const nearbyHotspotsEnd = await this.getCrimeHotspotsByRegion(destLat, destLng, radius);
    const allHotspots = [...nearbyHotspots, ...nearbyHotspotsEnd];
    
    const nearbySafeLocations = await this.getSafeLocationsByRegion(sourceLat, sourceLng, radius);
    const nearbySafeLocationsEnd = await this.getSafeLocationsByRegion(destLat, destLng, radius);
    const allSafeLocations = [...nearbySafeLocations, ...nearbySafeLocationsEnd];

    // Calculate base distance
    const baseDistance = this.calculateDistance(sourceLat, sourceLng, destLat, destLng);
    
    // Generate multiple route options
    const routes: RouteOption[] = [
      {
        id: 1,
        name: "Main Roads Route",
        safetyScore: this.calculateSafetyScore(allHotspots, allSafeLocations, "main"),
        distance: baseDistance,
        duration: Math.round(baseDistance * 3), // Rough estimate: 3 min per km
        coordinates: this.generateRouteCoordinates(sourceLat, sourceLng, destLat, destLng, "main"),
        safeLocationsCount: allSafeLocations.filter(loc => loc.type === "hospital" || loc.type === "police").length,
        crimeHotspotsCount: allHotspots.filter(spot => spot.severity === "high").length,
      },
      {
        id: 2,
        name: "Shopping District Route",
        safetyScore: this.calculateSafetyScore(allHotspots, allSafeLocations, "shopping"),
        distance: baseDistance * 1.1,
        duration: Math.round(baseDistance * 1.1 * 2.8),
        coordinates: this.generateRouteCoordinates(sourceLat, sourceLng, destLat, destLng, "shopping"),
        safeLocationsCount: allSafeLocations.filter(loc => loc.type === "hospital" || loc.type === "police").length - 1,
        crimeHotspotsCount: allHotspots.filter(spot => spot.severity === "medium").length,
      },
      {
        id: 3,
        name: "Residential Route",
        safetyScore: this.calculateSafetyScore(allHotspots, allSafeLocations, "residential"),
        distance: baseDistance * 1.25,
        duration: Math.round(baseDistance * 1.25 * 3.2),
        coordinates: this.generateRouteCoordinates(sourceLat, sourceLng, destLat, destLng, "residential"),
        safeLocationsCount: allSafeLocations.filter(loc => loc.type === "hospital" || loc.type === "police").length - 2,
        crimeHotspotsCount: allHotspots.filter(spot => spot.severity === "high" || spot.severity === "medium").length,
      },
    ];

    return routes.sort((a, b) => b.safetyScore - a.safetyScore);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  private calculateSafetyScore(hotspots: CrimeHotspot[], safeLocations: SafeLocation[], routeType: string): number {
    let baseScore = 85;
    
    // Deduct points for crime hotspots
    hotspots.forEach(spot => {
      if (spot.severity === "high") baseScore -= 15;
      else if (spot.severity === "medium") baseScore -= 8;
      else baseScore -= 3;
    });

    // Add points for safe locations
    safeLocations.forEach(location => {
      if (location.type === "hospital") baseScore += 3;
      else if (location.type === "police") baseScore += 5;
      else baseScore += 2;
    });

    // Route type modifiers
    if (routeType === "main") baseScore += 7;
    else if (routeType === "shopping") baseScore -= 7;
    else if (routeType === "residential") baseScore -= 20;

    return Math.max(0, Math.min(100, baseScore));
  }

  private generateRouteCoordinates(sourceLat: number, sourceLng: number, destLat: number, destLng: number, routeType: string): [number, number][] {
    const coordinates: [number, number][] = [];
    
    coordinates.push([sourceLng, sourceLat]);
    
    // Add more intermediate points for better route visualization
    const latDiff = destLat - sourceLat;
    const lngDiff = destLng - sourceLng;
    
    // Generate more realistic waypoints based on route type
    if (routeType === "main") {
      // Main route - more direct path
      coordinates.push([sourceLng + lngDiff * 0.25, sourceLat + latDiff * 0.25]);
      coordinates.push([sourceLng + lngDiff * 0.5, sourceLat + latDiff * 0.5]);
      coordinates.push([sourceLng + lngDiff * 0.75, sourceLat + latDiff * 0.75]);
    } else if (routeType === "shopping") {
      // Shopping route - slight detour through commercial areas
      coordinates.push([sourceLng + lngDiff * 0.15, sourceLat + latDiff * 0.35]);
      coordinates.push([sourceLng + lngDiff * 0.4, sourceLat + latDiff * 0.45]);
      coordinates.push([sourceLng + lngDiff * 0.65, sourceLat + latDiff * 0.6]);
      coordinates.push([sourceLng + lngDiff * 0.85, sourceLat + latDiff * 0.85]);
    } else {
      // Residential route - longer detour through safer residential areas
      coordinates.push([sourceLng + lngDiff * 0.3, sourceLat + latDiff * 0.1]);
      coordinates.push([sourceLng + lngDiff * 0.45, sourceLat + latDiff * 0.4]);
      coordinates.push([sourceLng + lngDiff * 0.6, sourceLat + latDiff * 0.55]);
      coordinates.push([sourceLng + lngDiff * 0.8, sourceLat + latDiff * 0.7]);
      coordinates.push([sourceLng + lngDiff * 0.95, sourceLat + latDiff * 0.9]);
    }
    
    coordinates.push([destLng, destLat]);
    
    return coordinates;
  }
}

// Initialize database and populate with sample data
async function initializeDatabase() {
  try {
    // Check if data already exists
    const existingHotspots = await db.select().from(crimeHotspots).limit(1);
    if (existingHotspots.length > 0) {
      console.log("Database already initialized");
      return;
    }

    // Sample crime hotspots data for major Indian cities
    const crimeData: InsertCrimeHotspot[] = [
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
      { name: "Noida - Sector 18", latitude: 28.5355, longitude: 77.3910, severity: "low", crimeType: "harassment", city: "Noida", state: "Uttar Pradesh", reportedIncidents: 16 },
    ];

    // Sample safe locations data
    const safeLocationData: InsertSafeLocation[] = [
      { name: "AIIMS Delhi", latitude: 28.5672, longitude: 77.2100, type: "hospital", address: "Ansari Nagar, New Delhi", city: "Delhi", state: "Delhi", isActive: true },
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
      { name: "Ahmedabad Police Station - Law Garden", latitude: 23.0215, longitude: 72.5709, type: "police", address: "Law Garden, Ahmedabad", city: "Ahmedabad", state: "Gujarat", isActive: true },
    ];

    // Insert data into database
    await db.insert(crimeHotspots).values(crimeData);
    await db.insert(safeLocations).values(safeLocationData);
    
    console.log("Database initialized with sample data");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Use database storage
export const storage = new DatabaseStorage();

// Initialize database on startup
initializeDatabase();
