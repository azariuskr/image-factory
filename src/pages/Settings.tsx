import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Server, 
  Folder, 
  Image,
  Save,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    apiBaseUrl: 'https://localhost:7001/api',
    defaultFolder: 'general',
    defaultPageSize: 20,
    maxFileSize: 50, // MB
    thumbnailWidth: 300,
    thumbnailHeight: 300,
    autoRefresh: true,
    refreshInterval: 30 // seconds
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    // Here you would typically save to localStorage or send to your API
    localStorage.setItem('imageGallerySettings', JSON.stringify(settings));
  };

  const handleReset = () => {
    setSettings({
      apiBaseUrl: 'https://localhost:7001/api',
      defaultFolder: 'general',
      defaultPageSize: 20,
      maxFileSize: 50,
      thumbnailWidth: 300,
      thumbnailHeight: 300,
      autoRefresh: true,
      refreshInterval: 30
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure your image gallery preferences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/40">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5 text-blue-600" />
                <span>API Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Base URL
                </label>
                <input
                  type="url"
                  value={settings.apiBaseUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, apiBaseUrl: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  placeholder="https://api.example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The base URL for your .NET Image Service API
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Folder
                </label>
                <select
                  value={settings.defaultFolder}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultFolder: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                >
                  <option value="general">General</option>
                  <option value="portraits">Portraits</option>
                  <option value="landscapes">Landscapes</option>
                  <option value="products">Products</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Display Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/40">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Image className="h-5 w-5 text-purple-600" />
                <span>Display Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Page Size
                </label>
                <select
                  value={settings.defaultPageSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultPageSize: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                >
                  <option value={12}>12 images</option>
                  <option value={20}>20 images</option>
                  <option value={36}>36 images</option>
                  <option value={50}>50 images</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Width
                  </label>
                  <input
                    type="number"
                    value={settings.thumbnailWidth}
                    onChange={(e) => setSettings(prev => ({ ...prev, thumbnailWidth: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    min="100"
                    max="800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail Height
                  </label>
                  <input
                    type="number"
                    value={settings.thumbnailHeight}
                    onChange={(e) => setSettings(prev => ({ ...prev, thumbnailHeight: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    min="100"
                    max="800"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/40">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Folder className="h-5 w-5 text-green-600" />
                <span>Upload Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxFileSize: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  min="1"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum size per file in megabytes
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Auto-refresh Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/40">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-orange-600" />
                <span>Auto-refresh</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={settings.autoRefresh}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="autoRefresh" className="text-sm font-medium text-gray-700">
                  Enable auto-refresh
                </label>
              </div>

              {settings.autoRefresh && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refresh Interval (seconds)
                  </label>
                  <input
                    type="number"
                    value={settings.refreshInterval}
                    onChange={(e) => setSettings(prev => ({ ...prev, refreshInterval: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    min="5"
                    max="300"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end space-x-4"
      >
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default Settings;