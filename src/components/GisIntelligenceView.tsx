import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Globe2, MapPin, Server } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { GeoLocationResult } from '../types';

// Leaflet's default marker icons reference image files by relative URL that
// don't resolve correctly under Vite's bundling. Rebuilding the default icon
// from the installed package's own assets avoids broken-marker-icon issues
// without pulling in a CDN dependency.
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface GisIntelligenceViewProps {
  geoLocations: GeoLocationResult[];
}

export const GisIntelligenceView: React.FC<GisIntelligenceViewProps> = ({ geoLocations }) => {
  const resolved = geoLocations.filter(
    (g): g is GeoLocationResult & { latitude: number; longitude: number } =>
      g.status === 'RESOLVED' && typeof g.latitude === 'number' && typeof g.longitude === 'number'
  );

  const center: [number, number] = resolved.length > 0 ? [resolved[0].latitude, resolved[0].longitude] : [20, 0];

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-10 pb-20 space-y-6">
      <div className="bg-[#0B0F16]/90 rounded-lg hud-border overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#202B3C] p-4 sm:p-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-[#00daf3]/10 text-[#00daf3] border border-[#00daf3]/30 text-[10px] font-mono-data font-bold">
                GIS INTELLIGENCE
              </span>
            </div>
            <h3 className="font-headline text-xl font-bold text-[#F4F7FB]">Email Infrastructure Geolocation</h3>
            <p className="text-xs text-[#8A94A6] font-mono-data mt-0.5">
              Real IP geolocation for relay hops extracted from the Received header chain
            </p>
          </div>
          <span className="text-xs font-mono-data text-[#8A94A6]">
            {resolved.length} of {geoLocations.length} IP(s) resolved
          </span>
        </div>

        {geoLocations.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#8A94A6] font-mono-data flex flex-col items-center gap-3">
            <Globe2 className="w-8 h-8 text-[#202B3C]" />
            No relay IP addresses were extracted from this message's headers.
          </div>
        ) : resolved.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#8A94A6] font-mono-data flex flex-col items-center gap-3">
            <Globe2 className="w-8 h-8 text-[#202B3C]" />
            No geolocation data available. Extracted IP(s) could not be resolved (private/internal
            addresses, or the geolocation lookup was unavailable).
          </div>
        ) : (
          <div className="h-[420px] w-full">
            <MapContainer center={center} zoom={2} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {resolved.map((g) => (
                <Marker key={g.ip} position={[g.latitude, g.longitude]} icon={defaultIcon}>
                  <Popup>
                    <div className="font-mono text-xs space-y-1">
                      <div className="font-bold">{g.ip}</div>
                      <div>{[g.city, g.region, g.country].filter(Boolean).join(', ')}</div>
                      <div>{g.isp}</div>
                      <div>{g.asn}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      {/* IP intelligence panel */}
      {geoLocations.length > 0 && (
        <div className="bg-[#0B0F16]/90 rounded-lg hud-border overflow-hidden">
          <div className="border-b border-[#202B3C] p-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-[#00daf3]" />
            <h4 className="font-headline text-sm font-bold text-[#F4F7FB]">Relay IP Details</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono-data">
              <thead>
                <tr className="text-[#8A94A6] text-left border-b border-[#202B3C]">
                  <th className="p-3 font-medium">IP</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Country</th>
                  <th className="p-3 font-medium">City</th>
                  <th className="p-3 font-medium">ISP</th>
                  <th className="p-3 font-medium">ASN</th>
                </tr>
              </thead>
              <tbody>
                {geoLocations.map((g) => (
                  <tr key={g.ip} className="border-b border-[#202B3C]/50 text-[#e2e2e9]">
                    <td className="p-3 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#00daf3]" /> {g.ip}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                          g.status === 'RESOLVED'
                            ? 'text-[#00E676] border-[#00E676]/30 bg-[#00E676]/10'
                            : 'text-[#8A94A6] border-[#8A94A6]/30 bg-[#8A94A6]/10'
                        }`}
                      >
                        {g.status === 'RESOLVED' ? 'RESOLVED' : g.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'ERROR'}
                      </span>
                    </td>
                    <td className="p-3">{g.country || '—'}</td>
                    <td className="p-3">{g.city || '—'}</td>
                    <td className="p-3">{g.isp || '—'}</td>
                    <td className="p-3">{g.asn || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
