import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { createRoot } from "react-dom/client";

const greenHouseIcon = new L.DivIcon({
  html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:#16a34a;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  </div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

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
  "Piassa Arada": [9.0220, 38.7493],
  "Sidist Kilo": [9.0380, 38.7600],
  "Mexico": [9.0100, 38.7550],
};

interface Property {
  id: string;
  title: string;
  area: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  listing_type: string;
  price?: string | null;
  latitude?: number;
  longitude?: number;
}

interface PropertyMapProps {
  properties: Property[];
  className?: string;
}

export function PropertyMap({ properties, className = "" }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const center: [number, number] = [9.0192, 38.7525];
    const map = L.map(mapRef.current).setView(center, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const coords: [number, number][] = [];

    properties.forEach((property) => {
      const pos: [number, number] = property.latitude && property.longitude
        ? [property.latitude, property.longitude]
        : areaCoordinates[property.area] || center;

      coords.push(pos);

      const popupContent = `
        <div style="padding:4px;">
          <h3 style="font-weight:600;font-size:14px;margin-bottom:4px;">${property.title}</h3>
          <p style="font-size:12px;color:#6b7280;margin-bottom:4px;">${property.city}, ${property.area}</p>
          <p style="font-size:12px;margin-bottom:4px;">${property.bedrooms} bed • ${property.bathrooms} bath • <span style="text-transform:capitalize;">${property.listing_type}</span></p>
          ${property.price ? `<p style="font-size:12px;font-weight:700;color:#16a34a;margin-bottom:4px;">${Number(property.price).toLocaleString()} ETB</p>` : ""}
          <a href="/property/${property.id}" style="font-size:12px;color:#2563eb;text-decoration:none;">View Details →</a>
        </div>
      `;

      L.marker(pos, { icon: greenHouseIcon })
        .addTo(map)
        .bindPopup(popupContent);
    });

    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [properties]);

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
      <div ref={mapRef} style={{ height: "100%", width: "100%", minHeight: "400px" }} />
    </div>
  );
}
