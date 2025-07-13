import { useState } from "react";
import { MapPin, Route, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { RouteOption } from "@shared/schema";

interface RouteFormProps {
  onRoutesCalculated: (routes: RouteOption[]) => void;
  isCalculating: boolean;
  setIsCalculating: (calculating: boolean) => void;
}

export default function RouteForm({ onRoutesCalculated, isCalculating, setIsCalculating }: RouteFormProps) {
  const [sourceLocation, setSourceLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [preferences, setPreferences] = useState({
    wellLit: true,
    avoidIsolated: true,
    fastest: false,
  });
  const { toast } = useToast();

  // Search for location coordinates using the comprehensive location database
  const getCoordinatesFromLocation = async (location: string) => {
    try {
      const response = await apiRequest("GET", `/api/locations/search?query=${encodeURIComponent(location)}`);
      const locations = await response.json();
      
      if (locations.length > 0) {
        const firstResult = locations[0];
        return { lat: firstResult.latitude, lng: firstResult.longitude };
      }
      
      // If no results found, return default coordinates (Delhi)
      return { lat: 28.6139, lng: 77.2090 };
    } catch (error) {
      console.error("Error searching for location:", error);
      return { lat: 28.6139, lng: 77.2090 };
    }
  };

  const handleRouteCalculation = async () => {
    if (!sourceLocation || !destinationLocation) {
      toast({
        title: "Error",
        description: "Please enter both source and destination locations.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    
    try {
      // Get coordinates based on location names
      const sourceCoords = await getCoordinatesFromLocation(sourceLocation);
      const destCoords = await getCoordinatesFromLocation(destinationLocation);

      const response = await apiRequest("POST", "/api/routes/calculate", {
        sourceLat: sourceCoords.lat,
        sourceLng: sourceCoords.lng,
        destLat: destCoords.lat,
        destLng: destCoords.lng,
      });

      const routes = await response.json();
      onRoutesCalculated(routes);
      
      toast({
        title: "Routes Calculated",
        description: `Found ${routes.length} safe route options between ${sourceLocation} and ${destinationLocation}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate routes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-neutral-text">
          Plan Your Safe Route
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>All of India covered:</strong> Major cities, tourist destinations, landmarks, and more
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Try: "Mumbai to Goa", "Delhi to Agra", "Bangalore to Mysore", "Chennai to Pondicherry", "Shimla to Manali"
          </p>
        </div>
        
        {/* Source Location */}
        <div>
          <Label htmlFor="source" className="text-sm font-medium text-gray-700 mb-2">
            From
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-trust-blue" />
            <Input
              id="source"
              type="text"
              placeholder="Enter your starting location (e.g., Mumbai, Shimla, Taj Mahal)"
              value={sourceLocation}
              onChange={(e) => setSourceLocation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Destination Location */}
        <div>
          <Label htmlFor="destination" className="text-sm font-medium text-gray-700 mb-2">
            To
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-danger-red" />
            <Input
              id="destination"
              type="text"
              placeholder="Enter your destination (e.g., Goa, Red Fort, Manali)"
              value={destinationLocation}
              onChange={(e) => setDestinationLocation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Route Preferences */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2">
            Preferences
          </Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wellLit"
                checked={preferences.wellLit}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, wellLit: checked as boolean }))
                }
              />
              <Label htmlFor="wellLit" className="text-sm text-gray-700">
                Prioritize well-lit areas
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="avoidIsolated"
                checked={preferences.avoidIsolated}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, avoidIsolated: checked as boolean }))
                }
              />
              <Label htmlFor="avoidIsolated" className="text-sm text-gray-700">
                Avoid isolated areas
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fastest"
                checked={preferences.fastest}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, fastest: checked as boolean }))
                }
              />
              <Label htmlFor="fastest" className="text-sm text-gray-700">
                Fastest route
              </Label>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleRouteCalculation}
          disabled={isCalculating}
          className="w-full bg-trust-blue text-white hover:bg-blue-600"
        >
          {isCalculating ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Route className="mr-2 h-4 w-4" />
              Find Safe Routes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
