import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  const [position, setPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );

  const center: [number, number] = latitude && longitude
    ? [latitude, longitude]
    : area && areaCoordinates[area]
      ? areaCoordinates[area]
      : [9.0192, 38.7525];

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
      onLocationChange(lat, lng);
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

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <div ref={mapRef} style={{ height: "250px", width: "100%" }} />
      <p className="text-xs text-muted-foreground p-2 bg-muted/50">
        📍 Click on the map to set exact location
        {position && <span className="ml-2 text-primary">({position[0].toFixed(4)}, {position[1].toFixed(4)})</span>}
      </p>
    </div>
  );
}
