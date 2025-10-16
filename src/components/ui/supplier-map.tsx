"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "~/components/ui/badge";
import { type Supplier, SupplierTypeLabels } from "~/server/types/supplier";

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Create custom colored markers for different supplier types
const createCustomIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const supplierTypeIcons = {
  RAMP_PERON: createCustomIcon('blue'),
  KUD: createCustomIcon('green'),
  KELOMPOK_TANI: createCustomIcon('orange'),
};

interface SupplierMapProps {
  suppliers: Supplier[];
  height?: string;
}

interface SupplierLocation {
  id: string;
  name: string;
  company?: string;
  type: string;
  latitude: number;
  longitude: number;
  address?: string;
  estimasiSupply?: number;
  luasKebun?: number;
}

export function SupplierMap({ suppliers, height = "400px" }: SupplierMapProps) {
  const [mounted, setMounted] = useState(false);
  const [supplierLocations, setSupplierLocations] = useState<SupplierLocation[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Process suppliers to extract valid coordinates
    const locations: SupplierLocation[] = [];

    suppliers.forEach(supplier => {
      if (supplier.lintang && supplier.bujur) {
        const lat = parseFloat(supplier.lintang);
        const lng = parseFloat(supplier.bujur);

        if (!isNaN(lat) && !isNaN(lng)) {
          // Extract profil kebun data
          const profilKebun = supplier.profilKebun as any;
          let totalLuasKebun = 0;
          let totalEstimasiSupply = 0;

          if (Array.isArray(profilKebun)) {
            totalLuasKebun = profilKebun.reduce((sum: number, row: any) => sum + (row.luasKebun || 0), 0);
            totalEstimasiSupply = profilKebun.reduce((sum: number, row: any) => sum + (row.estimasiSupplyTBS || 0), 0);
          } else if (profilKebun) {
            totalLuasKebun = profilKebun.luasKebun || 0;
            totalEstimasiSupply = profilKebun.estimasiSupplyTBS || 0;
          }

          locations.push({
            id: supplier.id,
            name: supplier.namaPemilik,
            company: supplier.namaPerusahaan,
            type: supplier.typeSupplier,
            latitude: lat,
            longitude: lng,
            address: supplier.alamatRampPeron || supplier.alamatPemilik,
            estimasiSupply: totalEstimasiSupply,
            luasKebun: totalLuasKebun,
          });
        }
      }
    });

    setSupplierLocations(locations);
  }, [suppliers]);

  // Default center - Indonesia (Jakarta area)
  const defaultCenter: [number, number] = [-6.2088, 106.8456];

  // Calculate center based on supplier locations
  const getMapCenter = (): [number, number] => {
    if (supplierLocations.length === 0) return defaultCenter;

    const avgLat = supplierLocations.reduce((sum, loc) => sum + loc.latitude, 0) / supplierLocations.length;
    const avgLng = supplierLocations.reduce((sum, loc) => sum + loc.longitude, 0) / supplierLocations.length;

    return [avgLat, avgLng];
  };

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
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Menampilkan {supplierLocations.length} lokasi supplier dari {suppliers.length} total supplier
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Ramp Peron</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>KUD</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Kelompok Tani</span>
          </div>
        </div>
      </div>

      <div style={{ height }} className="rounded-md overflow-hidden border">
        <MapContainer
          center={getMapCenter()}
          zoom={supplierLocations.length > 0 ? 8 : 6}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {supplierLocations.map((location) => (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={supplierTypeIcons[location.type as keyof typeof supplierTypeIcons] || supplierTypeIcons.RAMP_PERON}
            >
              <Popup>
                <div className="space-y-2 min-w-[200px]">
                  <div>
                    <h3 className="font-semibold text-sm">{location.name}</h3>
                    {location.company && (
                      <p className="text-xs text-muted-foreground">{location.company}</p>
                    )}
                  </div>

                  <div>
                    <Badge variant="secondary" className="text-xs">
                      {SupplierTypeLabels[location.type as keyof typeof SupplierTypeLabels]}
                    </Badge>
                  </div>

                  {location.address && (
                    <div>
                      <p className="text-xs font-medium">Alamat:</p>
                      <p className="text-xs text-muted-foreground">{location.address}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(location.luasKebun ?? 0) > 0 && (
                      <div>
                        <p className="font-medium">Luas:</p>
                        <p className="text-muted-foreground">{location.luasKebun} Ha</p>
                      </div>
                    )}
                    {(location.estimasiSupply ?? 0) > 0 && (
                      <div>
                        <p className="font-medium">Supply:</p>
                        <p className="text-muted-foreground">{location.estimasiSupply} Ton</p>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground border-t pt-1">
                    Koordinat: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
