import React, { useState, useEffect } from 'react';
import { Plus, Activity, Clock, Mail, Globe, Trash2 } from 'lucide-react';
import Cron from 'react-cron-generator';
import cronstrue from 'cronstrue';
import { toast, Toaster } from 'react-hot-toast';

interface Monitor {
  id: string;
  name: string;
  url: string;
  cron: string;
  email: string;
}

// For demonstration, we'll use JSONPlaceholder as a mock API endpoint
const MONITOR_API_URL = 'https://jsonplaceholder.typicode.com/posts';

function App() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    cron: '*/5 * * * *',
    email: ''
  });

  // Fetch monitors on component mount
  useEffect(() => {
    const fetchMonitors = async () => {
      try {
        const response = await fetch(MONITOR_API_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch monitors');
        }
        
        const data = await response.json();
        // Transform the data to match our Monitor interface
        // In a real app, the API would return data in the correct format
        const transformedData = data.slice(0, 5).map((item: any) => ({
          id: item.id.toString(),
          name: item.title.slice(0, 30),
          url: 'https://example.com',
          cron: '*/5 * * * *',
          email: 'user@example.com'
        }));
        
        setMonitors(transformedData);
        console.log('Monitors fetched:', transformedData);
      } catch (error) {
        console.error('Error fetching monitors:', error);
        toast.error('Failed to fetch monitors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonitors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMonitor = {
      id: crypto.randomUUID(),
      ...formData
    };

    // Log the monitor data to console
    console.log('Monitor Data:', {
      timestamp: new Date().toISOString(),
      action: 'CREATE',
      data: newMonitor
    });

    try {
      // Send POST request to remote URL
      const response = await fetch(MONITOR_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          action: 'CREATE',
          data: newMonitor
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send monitor data');
      }

      const result = await response.json();
      console.log('API Response:', result);

      setMonitors([newMonitor, ...monitors]);
      toast.success('Monitor created successfully');
      setShowForm(false);
      setFormData({ name: '', url: '', cron: '*/5 * * * *', email: '' });
    } catch (error) {
      console.error('Error sending monitor data:', error);
      toast.error('Failed to create monitor');
    }
  };

  const deleteMonitor = async (id: string) => {
    // Log the deletion to console
    console.log('Monitor Deletion:', {
      timestamp: new Date().toISOString(),
      action: 'DELETE',
      monitorId: id
    });

    try {
      // Send DELETE request to remote URL
      const response = await fetch(`${MONITOR_API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          action: 'DELETE',
          monitorId: id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete monitor');
      }

      setMonitors(monitors.filter(m => m.id !== id));
      toast.success('Monitor deleted successfully');
    } catch (error) {
      console.error('Error deleting monitor:', error);
      toast.error('Failed to delete monitor');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Uptime Monitor</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5" />
              <span>Add Monitor</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {showForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Add New Monitor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Application Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                <Cron
                  value={formData.cron}
                  onChange={(cron) => setFormData({ ...formData, cron })}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save Monitor
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {monitors.map((monitor) => (
              <div key={monitor.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900">{monitor.name}</h3>
                  <button
                    onClick={() => deleteMonitor(monitor.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Globe className="h-5 w-5" />
                    <a href={monitor.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      {monitor.url}
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <span>{cronstrue.toString(monitor.cron)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-5 w-5" />
                    <span>{monitor.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;