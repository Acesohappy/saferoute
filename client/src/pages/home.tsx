import { useState } from "react";
import { Shield, AlertTriangle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import RouteForm from "@/components/RouteForm";
import RouteOptions from "@/components/RouteOptions";
import MapContainer from "@/components/MapContainer";
import SafetyTips from "@/components/SafetyTips";
import type { RouteOption } from "@shared/schema";

export default function Home() {
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const handleEmergency = () => {
    toast({
      title: "Emergency Alert",
      description: "Emergency services have been notified. Help is on the way.",
      variant: "destructive",
    });
  };

  const handleProfile = () => {
    toast({
      title: "Profile",
      description: "Profile settings coming soon.",
    });
  };

  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRoute(route);
  };

  const handleStartNavigation = () => {
    if (selectedRoute) {
      toast({
        title: "Navigation Started",
        description: `Following ${selectedRoute.name} with ${selectedRoute.safetyScore}% safety score.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="text-safe-green text-2xl mr-2" />
                <h1 className="text-xl font-semibold text-neutral-text">SafeRoute</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleEmergency}
                className="bg-danger-red text-white hover:bg-red-600"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Emergency
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfile}
                className="p-2"
              >
                <User className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <RouteForm 
              onRoutesCalculated={setRoutes}
              isCalculating={isCalculating}
              setIsCalculating={setIsCalculating}
            />
            <RouteOptions 
              routes={routes}
              selectedRoute={selectedRoute}
              onRouteSelect={handleRouteSelect}
            />
            <SafetyTips />
          </div>

          {/* Map Container */}
          <div className="lg:col-span-2">
            <MapContainer 
              selectedRoute={selectedRoute}
              onStartNavigation={handleStartNavigation}
              isCalculating={isCalculating}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <Shield className="text-safe-green text-lg mr-2" />
              <span className="text-sm text-gray-600">© 2024 SafeRoute. Keeping you safe on every journey.</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-sm text-gray-600 hover:text-trust-blue transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-trust-blue transition-colors duration-200">Terms of Service</a>
              <a href="#" className="text-sm text-gray-600 hover:text-trust-blue transition-colors duration-200">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
