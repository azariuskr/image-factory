import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  HardDrive,
  Image,
  Video,
  Music,
  Folder,
  Tag,
  Calendar,
  Activity
} from 'lucide-react';
import { AnalyticsData, MediaType } from '../../types/api';
import { formatFileSize } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';

interface DashboardProps {
  analytics: AnalyticsData;
  isLoading?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ analytics, isLoading = false }) => {
  const getMediaTypeIcon = (type: MediaType) => {
    switch (type) {
      case MediaType.Image: return Image;
      case MediaType.Video: return Video;
      case MediaType.Audio: return Music;
      default: return Image;
    }
  };

  const getMediaTypeColor = (type: MediaType) => {
    switch (type) {
      case MediaType.Image: return 'text-blue-600 bg-blue-100';
      case MediaType.Video: return 'text-purple-600 bg-purple-100';
      case MediaType.Audio: return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {analytics.totalItems.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Size */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Size</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatFileSize(analytics.totalSize)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <HardDrive className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Storage Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Storage Used</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {analytics.storageUsage.percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-100">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <Progress value={analytics.storageUsage.percentage} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                {formatFileSize(analytics.storageUsage.used)} of {formatFileSize(analytics.storageUsage.available)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {analytics.uploadTrends.slice(-7).reduce((sum, day) => sum + day.count, 0)}
                  </p>
                  <p className="text-xs text-gray-500">uploads</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Media Type Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Media Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(analytics.itemsByType).map(([type, count]) => {
                const Icon = getMediaTypeIcon(type as MediaType);
                const colorClass = getMediaTypeColor(type as MediaType);
                const percentage = analytics.totalItems > 0 ? (count / analytics.totalItems) * 100 : 0;

                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium capitalize">{type}s</span>
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Folders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/40">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Folder className="h-5 w-5 text-purple-600" />
                <span>Popular Folders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.itemsByFolder)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([folder, count]) => {
                    const percentage = analytics.totalItems > 0 ? (count / analytics.totalItems) * 100 : 0;
                    return (
                      <div key={folder} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">{folder}</span>
                          <span className="text-gray-500">{count} items</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Popular Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/40">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-green-600" />
                <span>Popular Tags</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analytics.popularTags.slice(0, 10).map((tagData) => (
                  <span
                    key={tagData.tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tagData.tag}
                    <span className="ml-2 text-xs bg-blue-200 px-2 py-0.5 rounded-full">
                      {tagData.count}
                    </span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upload Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Upload Trends (Last 30 Days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end space-x-2">
              {analytics.uploadTrends.slice(-30).map((day, index) => {
                const maxCount = Math.max(...analytics.uploadTrends.map(d => d.count));
                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                
                return (
                  <div
                    key={index}
                    className="flex-1 bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-sm min-h-[4px] relative group"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {new Date(day.date).toLocaleDateString()}<br />
                      {day.count} uploads<br />
                      {formatFileSize(day.size)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;