import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';
import Dashboard from '../components/analytics/Dashboard';
import { AnalyticsData, MediaType } from '../types/api';

// Mock analytics data - replace with real API call
const mockAnalytics: AnalyticsData = {
  totalItems: 1247,
  totalSize: 15728640000, // ~15GB
  itemsByType: {
    [MediaType.Image]: 1180,
    [MediaType.Video]: 45,
    [MediaType.Audio]: 22
  },
  itemsByFolder: {
    'general': 456,
    'portraits': 234,
    'landscapes': 189,
    'products': 156,
    'events': 98,
    'nature': 114
  },
  uploadTrends: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 20) + 5,
    size: Math.floor(Math.random() * 100000000) + 10000000
  })),
  popularTags: [
    { tag: 'portrait', count: 234 },
    { tag: 'landscape', count: 189 },
    { tag: 'product', count: 156 },
    { tag: 'event', count: 98 },
    { tag: 'nature', count: 114 },
    { tag: 'architecture', count: 87 },
    { tag: 'street', count: 76 },
    { tag: 'macro', count: 65 },
    { tag: 'wedding', count: 54 },
    { tag: 'travel', count: 43 }
  ],
  storageUsage: {
    used: 15728640000,
    available: 107374182400, // 100GB
    percentage: 14.6
  }
};

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Insights and statistics about your media library
            </p>
          </div>
        </div>
      </motion.div>

      {/* Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Dashboard analytics={mockAnalytics} />
      </motion.div>
    </div>
  );
};

export default Analytics;