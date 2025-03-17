import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SiteForm } from '../components/SiteForm';
import toast from 'react-hot-toast';

export default function SiteDetails() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState<any>(null);
  const [networkDevices, setNetworkDevices] = useState<any[]>([]);
  const [fiberRoutes, setFiberRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchSiteDetails() {
      if (!siteId) return;
      const { data: siteData, error: siteError } = await supabase.from('sites').select('*').eq('id', siteId).single();
      if (siteError) {
        toast.error('Failed to load site details');
        navigate('/admin/sites');
        return;
      }
      setSite(siteData);

      const { data: devicesData, error: devicesError } = await supabase.from('network_devices').select('*').eq('site_id', siteId);
      if (devicesError) {
        toast.error('Failed to load network devices');
        return;
      }
      setNetworkDevices(devicesData);

      const { data: routesData, error: routesError } = await supabase.from('fiber_routes').select('*').eq('site_id', siteId);
      if (routesError) {
        toast.error('Failed to load fiber routes');
        return;
      }
      setFiberRoutes(routesData);

      setLoading(false);
    }
    fetchSiteDetails();
  }, [siteId, navigate]);

  const handleDelete = async () => {
    if (!siteId) return;
    const { error } = await supabase.from('sites').delete().eq('id', siteId);
    if (error) {
      toast.error('Failed to delete site');
      return;
    }
    toast.success('Site deleted successfully');
    navigate('/admin/sites');
  };

  if (loading) return <div className="text-center py-10">Loading site details...</div>;
  if (!site) return <div className="text-center py-10">Site not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate('/admin/sites')} className="text-blue-600 hover:underline mb-4">Back to Sites</button>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">{site.name}</h2>
        <p className="text-gray-600">Location: {site.location}</p>
        <p className="text-gray-600">Latitude: {site.latitude}</p>
        <p className="text-gray-600">Longitude: {site.longitude}</p>
        <div className="mt-4 flex space-x-4">
          <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Edit Site</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete Site</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h3 className="text-xl font-bold mb-4">Network Devices</h3>
        {networkDevices.length > 0 ? (
          <ul className="list-disc pl-5">
            {networkDevices.map((device) => (
              <li key={device.id} className="mb-2">
                <p className="text-gray-600">Name: {device.name}</p>
                <p className="text-gray-600">Type: {device.device_type}</p>
                <p className="text-gray-600">IP Address: {device.ip_address}</p>
                <p className="text-gray-600">Status: {device.status}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No network devices found.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h3 className="text-xl font-bold mb-4">Fiber Routes</h3>
        {fiberRoutes.length > 0 ? (
          <ul className="list-disc pl-5">
            {fiberRoutes.map((route) => (
              <li key={route.id} className="mb-2">
                <p className="text-gray-600">Description: {route.description}</p>
                <p className="text-gray-600">Created At: {new Date(route.created_at).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No fiber routes found.</p>
        )}
      </div>

      {isEditing && (
        <SiteForm siteId={siteId} onClose={() => setIsEditing(false)} onSuccess={() => window.location.reload()} />
      )}
    </div>
  );
}