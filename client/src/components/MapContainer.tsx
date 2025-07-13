import { useEffect, useRef, useState } from "react";
import { Plus, Minus, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { RouteOption, CrimeHotspot, SafeLocation } from "@shared/schema";

interface MapContainerProps {
  selectedRoute: RouteOption | null;
  onStartNavigation: () => void;
  isCalculating: boolean;
}

export default function MapContainer({ selectedRoute, onStartNavigation, isCalculating }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

  const { data: crimeHotspots } = useQuery({
    queryKey: ["/api/crime-hotspots"],
    enabled: true,
  });

  const { data: safeLocations } = useQuery({
    queryKey: ["/api/safe-locations"],
    enabled: true,
  });

  useEffect(() => {
    if (!mapRef.current) return;

    let map: any = null;
    let loadingTimeout: NodeJS.Timeout;

    function initializeMap() {
      try {
        const mapboxgl = (window as any).mapboxgl;
        if (!mapboxgl) {
          console.error('Mapbox GL JS not loaded');
          return;
        }
        
        // Set access token
        mapboxgl.accessToken = "pk.eyJ1IjoiYXYxMWciLCJhIjoiY21kMTZ0Mm1iMWZiaTJrczN4dXQ0NDB6bSJ9.aOEOQLQxHb5skIaGJ0D1JQ";
        
        // Initialize map
        map = new mapboxgl.Map({
          container: mapRef.current,
          style: "mapbox://styles/mapbox/streets-v11",
          center: [78.9629, 20.5937], // Center of India
          zoom: 5,
        });

        mapInstanceRef.current = map;

        // Add controls
        map.addControl(new mapboxgl.NavigationControl());

        // Add markers when map loads
        map.on("load", () => {
          console.log("Map loaded successfully");
          addMarkers(map);
          
          // If we have a selected route, add it now
          if (selectedRoute) {
            console.log("Adding initial route to map");
            addRouteToMap(map, selectedRoute);
          }
        });

        map.on("error", (e: any) => {
          console.error("Map error:", e);
        });

      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }

    // Check if Mapbox is already loaded
    if ((window as any).mapboxgl) {
      initializeMap();
    } else {
      // Load Mapbox GL JS
      const script = document.createElement("script");
      script.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";
      script.onload = () => {
        clearTimeout(loadingTimeout);
        initializeMap();
      };
      script.onerror = () => {
        console.error("Failed to load Mapbox GL JS");
      };
      document.head.appendChild(script);

      const link = document.createElement("link");
      link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);

      // Timeout fallback
      loadingTimeout = setTimeout(() => {
        console.error("Mapbox loading timeout");
      }, 10000);
    }

    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && crimeHotspots && safeLocations) {
      addMarkers(mapInstanceRef.current);
    }
  }, [crimeHotspots, safeLocations]);

  useEffect(() => {
    if (mapInstanceRef.current && selectedRoute) {
      console.log('Selected route changed, adding to map:', selectedRoute);
      
      // Force route addition with retry mechanism
      const attemptAddRoute = () => {
        const map = mapInstanceRef.current;
        if (map && map.isStyleLoaded()) {
          addRouteToMap(map, selectedRoute);
        } else {
          console.log('Map not ready, retrying in 200ms');
          setTimeout(attemptAddRoute, 200);
        }
      };
      
      attemptAddRoute();
    }
  }, [selectedRoute]);

  const addMarkers = (map: any) => {
    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add crime hotspot markers
    if (crimeHotspots) {
      crimeHotspots.forEach((hotspot: CrimeHotspot) => {
        const color = hotspot.severity === 'high' ? '#F44336' : 
                     hotspot.severity === 'medium' ? '#FF9800' : '#4CAF50';
        
        const marker = new (window as any).mapboxgl.Marker({
          color: color,
          scale: 0.8
        })
        .setLngLat([hotspot.longitude, hotspot.latitude])
        .setPopup(new (window as any).mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h4 class="font-semibold text-sm">${hotspot.name}</h4>
              <p class="text-xs text-gray-600">Type: ${hotspot.crimeType}</p>
              <p class="text-xs text-gray-600">Severity: ${hotspot.severity}</p>
              <p class="text-xs text-gray-600">Incidents: ${hotspot.reportedIncidents}</p>
            </div>
          `))
        .addTo(map);
      });
    }

    // Add safe location markers
    if (safeLocations) {
      safeLocations.forEach((location: SafeLocation) => {
        const iconColor = location.type === 'hospital' ? '#2196F3' : '#4CAF50';
        const iconSymbol = location.type === 'hospital' ? '🏥' : '🚔';
        
        const el = document.createElement('div');
        el.className = 'marker';
        el.innerHTML = `<span style="font-size: 16px;">${iconSymbol}</span>`;
        el.style.background = 'white';
        el.style.borderRadius = '50%';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        el.style.border = `2px solid ${iconColor}`;

        const marker = new (window as any).mapboxgl.Marker(el)
          .setLngLat([location.longitude, location.latitude])
          .setPopup(new (window as any).mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h4 class="font-semibold text-sm">${location.name}</h4>
                <p class="text-xs text-gray-600">Type: ${location.type}</p>
                <p class="text-xs text-gray-600">${location.address}</p>
              </div>
            `))
          .addTo(map);
      });
    }
  };

  const addRouteToMap = (map: any, route: RouteOption) => {
    if (!map || !route) {
      console.error('Map or route is null');
      return;
    }

    console.log('Adding route to map:', route);
    console.log('Route coordinates:', route.coordinates);

    // Wait for map to load before adding route
    if (!map.isStyleLoaded()) {
      console.log('Map not loaded yet, waiting...');
      map.once('styledata', () => {
        console.log('Map style loaded, adding route now');
        addRouteToMap(map, route);
      });
      return;
    }

    try {
      // Remove existing route layers and sources
      if (map.getLayer('route')) {
        map.removeLayer('route');
      }
      if (map.getSource('route')) {
        map.removeSource('route');
      }

      // Clear existing route markers
      const existingRouteMarkers = document.querySelectorAll('.route-marker');
      existingRouteMarkers.forEach(marker => marker.remove());

      // Validate coordinates
      if (!route.coordinates || route.coordinates.length < 2) {
        console.error('Invalid route coordinates');
        return;
      }

      // Add new route source
      map.addSource('route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': route.coordinates
          }
        }
      });

      // Add route layer
      map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': route.safetyScore >= 85 ? '#4CAF50' : route.safetyScore >= 70 ? '#FF9800' : '#F44336',
          'line-width': 6,
          'line-opacity': 0.8
        }
      });

      console.log('Route layer added successfully');

      // Add route markers for start and end points
      const startCoord = route.coordinates[0];
      const endCoord = route.coordinates[route.coordinates.length - 1];

      // Start marker (green)
      const startEl = document.createElement('div');
      startEl.className = 'route-marker';
      startEl.innerHTML = '🚀';
      startEl.style.fontSize = '20px';
      startEl.style.cursor = 'pointer';

      const startMarker = new (window as any).mapboxgl.Marker(startEl)
        .setLngLat(startCoord)
        .setPopup(new (window as any).mapboxgl.Popup({ offset: 25 })
          .setHTML(`<div class="p-2"><h4 class="font-semibold text-sm">Start Point</h4></div>`))
        .addTo(map);

      // End marker (red)
      const endEl = document.createElement('div');
      endEl.className = 'route-marker';
      endEl.innerHTML = '🎯';
      endEl.style.fontSize = '20px';
      endEl.style.cursor = 'pointer';

      const endMarker = new (window as any).mapboxgl.Marker(endEl)
        .setLngLat(endCoord)
        .setPopup(new (window as any).mapboxgl.Popup({ offset: 25 })
          .setHTML(`<div class="p-2"><h4 class="font-semibold text-sm">Destination</h4></div>`))
        .addTo(map);

      // Fit map to route bounds with padding
      const bounds = new (window as any).mapboxgl.LngLatBounds();
      route.coordinates.forEach(coord => bounds.extend(coord));
      map.fitBounds(bounds, { 
        padding: 100,
        maxZoom: 14
      });

      console.log('Route visualization complete');

    } catch (error) {
      console.error('Error adding route to map:', error);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
          setCurrentLocation(coords);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
              center: coords,
              zoom: 15
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200 overflow-hidden">
      <CardHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-neutral-text">
            Route Map
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 bg-safe-green rounded-full mr-2"></div>
              <span>Safe Areas</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 bg-danger-red rounded-full mr-2"></div>
              <span>Crime Hotspots</span>
            </div>
            <Badge variant="outline" className="text-trust-blue">
              🏥 Hospitals
            </Badge>
            <Badge variant="outline" className="text-safe-green">
              🚔 Police
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative">
          <div ref={mapRef} className="h-96 lg:h-[600px]" />
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="bg-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="bg-white shadow-sm"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCurrentLocation}
              className="bg-white shadow-sm"
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>

          {/* Loading State */}
          {isCalculating && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-trust-blue mb-2 mx-auto" />
                <p className="text-sm text-gray-600">Calculating safe routes...</p>
              </div>
            </div>
          )}
        </div>

        {/* Route Information */}
        {selectedRoute && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Navigation className="text-trust-blue mr-2 h-4 w-4" />
                  <span className="text-sm font-medium text-neutral-text">
                    Selected Route: {selectedRoute.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    selectedRoute.safetyScore >= 85 ? 'bg-safe-green' :
                    selectedRoute.safetyScore >= 70 ? 'bg-warning-orange' : 'bg-danger-red'
                  }`} />
                  <span className={`text-sm font-medium ${
                    selectedRoute.safetyScore >= 85 ? 'text-safe-green' :
                    selectedRoute.safetyScore >= 70 ? 'text-warning-orange' : 'text-danger-red'
                  }`}>
                    {selectedRoute.safetyScore}% Safe
                  </span>
                </div>
              </div>
              <Button
                onClick={onStartNavigation}
                className="bg-trust-blue text-white hover:bg-blue-600"
              >
                <Navigation className="mr-2 h-4 w-4" />
                Start Navigation
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
