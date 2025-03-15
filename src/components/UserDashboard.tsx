import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Map, Image as ImageIcon, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Site {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  power_details: string | null;
  transmission_details: string;
  landlord_details: Record<string, any>;
  nea_details: Record<string, any>;
  image_url: string | null;
  router_config: Record<string, any>;
  fiber_data: Record<string, any>[];
  fiber_routes: string;
}

export function UserDashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const navigate = useNavigate();
  const signOut = useAuthStore(state => state.signOut);

  useEffect(() => {
    loadSites();

    const subscription = supabase
      .channel('sites')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sites' }, () => {
        loadSites();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function loadSites() {
    try {
      const { data, error } = await supabase.from('sites').select('*');
      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error('Error loading sites:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      navigate('/user/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  function handleEdit(site: Site) {
    setEditingSite(site);
  }

  function handleSave() {
    if (!editingSite) return;
    supabase
      .from('sites')
      .update(editingSite)
      .eq('id', editingSite.id)
      .then(() => {
        setEditingSite(null);
        loadSites();
      });
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Site Information</h1>
          <div className="flex space-x-4">
            <Link to="/site-map" className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Map className="w-5 h-5 mr-2" /> View Map
            </Link>
            <Link to="/site-images" className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <ImageIcon className="w-5 h-5 mr-2" /> View Images
            </Link>
            <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <LogOut className="w-5 h-5 mr-2" /> Logout
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sites</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latitude</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Longitude</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transmission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiber Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sites.map((site) => (
                <tr key={site.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{site.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.latitude}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.longitude}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.transmission_details}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.fiber_routes}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => handleEdit(site)} className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingSite && (
          <div className="p-4 bg-white shadow-lg rounded-lg mt-4">
            <h3 className="text-lg font-semibold">Edit Site</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editingSite?.name || ''}
                  onChange={(e) => setEditingSite({ ...editingSite, name: e.target.value })}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={editingSite?.location || ''}
                  onChange={(e) => setEditingSite({ ...editingSite, location: e.target.value })}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                <input
                  type="number"
                  value={editingSite?.latitude || ''}
                  onChange={(e) => setEditingSite({ ...editingSite, latitude: parseFloat(e.target.value) })}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                <input
                  type="number"
                  value={editingSite?.longitude || ''}
                  onChange={(e) => setEditingSite({ ...editingSite, longitude: parseFloat(e.target.value) })}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Transmission Details</label>
                <input
                  type="text"
                  value={editingSite?.transmission_details || ''}
                  onChange={(e) => setEditingSite({ ...editingSite, transmission_details: e.target.value })}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fiber Routes</label>
                <input
                  type="text"
                  value={editingSite?.fiber_routes || ''}
                  onChange={(e) => setEditingSite({ ...editingSite, fiber_routes: e.target.value })}
                  className="border rounded p-2 w-full"
                />
              </div>

              <button onClick={handleSave} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
