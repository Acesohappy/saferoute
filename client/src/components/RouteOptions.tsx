import { Clock, Route, Hospital, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RouteOption } from "@shared/schema";

interface RouteOptionsProps {
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  onRouteSelect: (route: RouteOption) => void;
}

export default function RouteOptions({ routes, selectedRoute, onRouteSelect }: RouteOptionsProps) {
  const getSafetyColor = (score: number) => {
    if (score >= 85) return "text-safe-green";
    if (score >= 70) return "text-warning-orange";
    return "text-danger-red";
  };

  const getSafetyDot = (score: number) => {
    if (score >= 85) return "bg-safe-green";
    if (score >= 70) return "bg-warning-orange";
    return "bg-danger-red";
  };

  if (routes.length === 0) {
    return (
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-neutral-text">
            Recommended Routes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Route className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600">
              Enter your locations and click "Find Safe Routes" to see route options.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-neutral-text">
          Recommended Routes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {routes.map((route) => (
            <div
              key={route.id}
              onClick={() => onRouteSelect(route)}
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition-colors duration-200 hover:border-trust-blue",
                selectedRoute?.id === route.id 
                  ? "border-trust-blue bg-blue-50" 
                  : "border-gray-200"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-neutral-text">{route.name}</span>
                <div className="flex items-center">
                  <div className={cn("w-3 h-3 rounded-full mr-2", getSafetyDot(route.safetyScore))} />
                  <span className={cn("text-sm font-medium", getSafetyColor(route.safetyScore))}>
                    {route.safetyScore}% Safe
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <Clock className="inline mr-1 h-3 w-3" />
                {route.duration} min • 
                <Route className="inline mr-1 ml-2 h-3 w-3" />
                {route.distance.toFixed(1)} km
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Hospital className="inline mr-1 h-3 w-3" />
                {route.safeLocationsCount} safe locations • 
                <Shield className="inline mr-1 ml-2 h-3 w-3" />
                {route.crimeHotspotsCount} crime alerts
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
