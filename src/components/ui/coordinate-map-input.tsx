"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface CoordinateMapInputProps {
  latitude?: string;
  longitude?: string;
  onCoordinateChange: (lat: string, lng: string) => void;
  height?: string;
}

function MapClickHandler({
  onCoordinateChange
}: {
  onCoordinateChange: (lat: string, lng: string) => void
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onCoordinateChange(lat.toFixed(6), lng.toFixed(6));
    },
  });
  return null;
}

export function CoordinateMapInput({
  latitude,
  longitude,
  onCoordinateChange,
  height = "300px"
}: CoordinateMapInputProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setPosition([lat, lng]);
      }
    }
  }, [latitude, longitude]);

  const handleCoordinateChange = (lat: string, lng: string) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    setPosition([latNum, lngNum]);
    onCoordinateChange(lat, lng);
  };

  // Default center - Indonesia (Jakarta area)
  const defaultCenter: [number, number] = [-6.2088, 106.8456];
  const mapCenter = position || defaultCenter;

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="bg-muted rounded-md flex items-center justify-center"
      >
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">
        Klik pada peta untuk memilih lokasi
      </div>
      <div style={{ height }} className="rounded-md overflow-hidden border">
        <MapContainer
          center={mapCenter}
          zoom={position ? 15 : 8}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onCoordinateChange={handleCoordinateChange} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>
      {position && (
        <div className="text-sm text-muted-foreground">
          Koordinat terpilih: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </div>
      )}
    </div>
  );
}
