import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Site {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
}

export function SiteMap() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSites();
  }, []);

  async function loadSites() {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('id, name, location, latitude, longitude');

      if (error) throw error;
      
      // Filter out sites without coordinates
      const sitesWithCoordinates = (data || []).filter(
        site => site.latitude && site.longitude
      );
      
      setSites(sitesWithCoordinates);
    } catch (error) {
      console.error('Error loading sites:', error);
    } finally {
      setLoading(false);
    }
  }

  // Default center position (can be adjusted)
  const defaultCenter: [number, number] = [27.7172, 85.3240]; // Kathmandu, Nepal as default

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Site Locations</h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <p className="text-gray-500">Loading map data...</p>
            </div>
          ) : sites.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-96 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-2">No sites with location data available</p>
              <p className="text-sm text-gray-400">Add latitude and longitude to sites to see them on the map</p>
            </div>
          ) : (
            <div className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200">
              <MapContainer 
                center={
                  sites.length > 0 && sites[0].latitude && sites[0].longitude
                    ? [sites[0].latitude, sites[0].longitude]
                    : defaultCenter
                } 
                zoom={10} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {sites.map(site => (
                  <Marker 
                    key={site.id} 
                    position={[site.latitude, site.longitude]}
                  >
                    <Popup>
                      <div>
                        <h3 className="font-medium text-gray-900">{site.name}</h3>
                        <p className="text-sm text-gray-500">{site.location}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}