import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";

// Fix default marker icon issue with Leaflet + React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Addis Ababa area coordinates mapping
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
  latitude?: number;
  longitude?: number;
}

interface PropertyMapProps {
  properties: Property[];
  className?: string;
}

function MapBounds({ properties }: { properties: Property[] }) {
  const map = useMap();
  const boundsRef = useRef<boolean>(false);

  useEffect(() => {
    if (properties.length > 0 && !boundsRef.current) {
      const coords: [number, number][] = properties.map((p) => {
        if (p.latitude && p.longitude) {
          return [p.latitude, p.longitude];
        }
        return areaCoordinates[p.area] || [9.0192, 38.7525];
      });

      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [50, 50] });
        boundsRef.current = true;
      }
    }
  }, [properties, map]);

  return null;
}

export function PropertyMap({ properties, className = "" }: PropertyMapProps) {
  // Default center: Addis Ababa
  const center: [number, number] = [9.0192, 38.7525];

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%", minHeight: "400px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds properties={properties} />
        
        {properties.map((property) => {
          const coords: [number, number] = property.latitude && property.longitude
            ? [property.latitude, property.longitude]
            : areaCoordinates[property.area] || center;

          return (
            <Marker key={property.id} position={coords}>
              <Popup>
                <div className="p-1">
                  <h3 className="font-semibold text-sm mb-1">{property.title}</h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    {property.city}, {property.area}
                  </p>
                  <p className="text-xs mb-2">
                    {property.bedrooms} bed • {property.bathrooms} bath •{" "}
                    <span className="capitalize">{property.listing_type}</span>
                  </p>
                  <Link
                    to={`/property/${property.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
