import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Link as LinkIcon, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

const areaCoordinates: Record<string, [number, number]> = {
  "Bole": [8.9953, 38.7857],
  "Piassa": [9.0220, 38.7493],
  "Kazanchis": [9.0174, 38.7625],
  "Megenagna": [9.0213, 38.8015],
  "CMC": [9.0412, 38.8147],
  "Gerji": [9.0039, 38.8125],
  "Sarbet": [9.0117, 38.7320],
  "Lideta": [9.0117, 38.7412],
  "Arada": [9.0258, 38.7501],
  "Kirkos": [9.0075, 38.7585],
  "Yeka": [9.0350, 38.7950],
  "Nifas Silk": [8.9671, 38.7360],
  "Akaki Kality": [8.8920, 38.7857],
  "Addis Ketema": [9.0258, 38.7350],
  "Gulele": [9.0500, 38.7300],
  "Kolfe Keranio": [9.0200, 38.7000],
  "Sidist Kilo": [9.0380, 38.7600],
  "Mexico": [9.0100, 38.7550],
};

const pinIcon = new L.DivIcon({
  html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:#16a34a;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  </div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

function parseGoogleMapsUrl(input: string): [number, number] | null {
  // Try patterns like @lat,lng or /lat,lng
  const atMatch = input.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return [lat, lng];
  }

  // Try ?q=lat,lng or place/lat,lng
  const qMatch = input.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return [lat, lng];
  }

  // Try /maps/place/.../data or ll=lat,lng
  const llMatch = input.match(/ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (llMatch) {
    const lat = parseFloat(llMatch[1]);
    const lng = parseFloat(llMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return [lat, lng];
  }

  // Try direct coordinate pair: "lat, lng"
  const directMatch = input.trim().match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (directMatch) {
    const lat = parseFloat(directMatch[1]);
    const lng = parseFloat(directMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return [lat, lng];
  }

  return null;
}

interface MapLocationPickerProps {
  area?: string;
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export function MapLocationPicker({ area, latitude, longitude, onLocationChange }: MapLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);
  onLocationChangeRef.current = onLocationChange;

  const [position, setPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );
  const [latInput, setLatInput] = useState(latitude?.toString() || "");
  const [lngInput, setLngInput] = useState(longitude?.toString() || "");
  const [googleMapsInput, setGoogleMapsInput] = useState("");

  const center: [number, number] = latitude && longitude
    ? [latitude, longitude]
    : area && areaCoordinates[area]
      ? areaCoordinates[area]
      : [9.0192, 38.7525];

  const updateMarker = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setLatInput(lat.toFixed(6));
    setLngInput(lng.toFixed(6));
    onLocationChangeRef.current(lat, lng);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(mapInstanceRef.current);
      }
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(center, 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (position) {
      markerRef.current = L.marker(position, { icon: pinIcon }).addTo(map);
    }

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setLatInput(lat.toFixed(6));
      setLngInput(lng.toFixed(6));
      onLocationChangeRef.current(lat, lng);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
      setLatInput(latitude.toFixed(6));
      setLngInput(longitude.toFixed(6));
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([latitude, longitude], 14);
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        } else {
          markerRef.current = L.marker([latitude, longitude], { icon: pinIcon }).addTo(mapInstanceRef.current);
        }
      }
    }
  }, [latitude, longitude]);

  const handleCoordsSubmit = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      updateMarker(lat, lng);
    }
  };

  const handleGoogleMapsSubmit = () => {
    const coords = parseGoogleMapsUrl(googleMapsInput);
    if (coords) {
      updateMarker(coords[0], coords[1]);
      setGoogleMapsInput("");
      toast.success("Location set!", {
        description: `Coordinates: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`,
      });
    } else if (googleMapsInput.trim()) {
      toast.error("Could not parse coordinates", {
        description: "Please paste a valid Google Maps link or coordinates like 9.0192, 38.7525",
      });
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      {/* Google Maps URL input */}
      <div className="flex gap-2 p-2 bg-muted/50 border-b border-border">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Paste Google Maps link or coordinates (e.g. 9.0192, 38.7525)"
            value={googleMapsInput}
            onChange={(e) => setGoogleMapsInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGoogleMapsSubmit()}
            className="w-full pl-8 pr-2 py-1.5 text-xs rounded-md border border-border bg-background"
          />
        </div>
        <button
          type="button"
          onClick={handleGoogleMapsSubmit}
          className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1"
        >
          <MapPin className="h-3 w-3" />
          Set
        </button>
      </div>
      {/* Manual coordinate inputs */}
      <div className="flex gap-2 p-2 bg-muted/50">
        <input
          type="text"
          placeholder="Latitude (e.g. 9.0192)"
          value={latInput}
          onChange={(e) => setLatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCoordsSubmit()}
          className="flex-1 px-2 py-1.5 text-xs rounded-md border border-border bg-background"
        />
        <input
          type="text"
          placeholder="Longitude (e.g. 38.7525)"
          value={lngInput}
          onChange={(e) => setLngInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCoordsSubmit()}
          className="flex-1 px-2 py-1.5 text-xs rounded-md border border-border bg-background"
        />
        <button
          type="button"
          onClick={handleCoordsSubmit}
          className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Go
        </button>
      </div>
      <div ref={mapRef} style={{ height: "250px", width: "100%" }} />
      <p className="text-xs text-muted-foreground p-2 bg-muted/50">
        📍 Click on the map, type coordinates, or paste a Google Maps link to set location
        {position && <span className="ml-2 text-primary">({position[0].toFixed(4)}, {position[1].toFixed(4)})</span>}
      </p>
    </div>
  );
}
