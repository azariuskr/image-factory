import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Image, 
  HardDrive, 
  Upload, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader,
  Calendar,
  Tag,
  Folder,
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { formatFileSize, formatDate } from '../lib/utils';

// Mock data - replace with real API calls when available
const mockAnalyticsData = {
  // Overview Stats
  totalImages: 1247,
  totalSize: 15728640000, // ~15GB
  recentUploads: 23,
  processingQueue: 5,
  
  // Queue Statistics
  queueStats: {
    pendingJobs: 8,
    processingJobs: 2,
    completedJobs: 1156,
    failedJobs: 12,
    averageProcessingTime: 2500, // milliseconds
    successRate: 98.9
  },
  
  // Storage Usage
  storageUsage: {
    used: 15728640000,
    available: 107374182400, // 100GB
    percentage: 14.6
  },
  
  // Media Distribution
  mediaDistribution: {
    images: 1180,
    videos: 45,
    audio: 22
  },
  
  // Folder Distribution
  folderStats: {
    'general': 456,
    'portraits': 234,
    'landscapes': 189,
    'products': 156,
    'events': 98,
    'nature': 114
  },
  
  // Upload Trends (last 30 days)
  uploadTrends: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 20) + 5,
    size: Math.floor(Math.random() * 100000000) + 10000000
  })),
  
  // Popular Tags
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
  
  // Recent Activity
  recentActivity: [
    {
      id: '1',
      type: 'upload',
      description: 'Uploaded 5 images to portraits folder',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      imageName: 'portrait_session_01.jpg'
    },
    {
      id: '2',
      type: 'delete',
      description: 'Deleted image from landscapes folder',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      imageName: 'mountain_view.jpg'
    },
    {
      id: '3',
      type: 'download',
      description: 'Downloaded high-res version',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      imageName: 'product_shot_final.jpg'
    },
    {
      id: '4',
      type: 'edit',
      description: 'Updated tags and metadata',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      imageName: 'wedding_ceremony.jpg'
    }
  ]
};

const Analytics: React.FC = () => {
  const data = mockAnalyticsData;
  
  // Calculate totals for queue
  const totalJobs = data.queueStats.pendingJobs + 
                   data.queueStats.processingJobs + 
                   data.queueStats.completedJobs + 
                   data.queueStats.failedJobs;

  // Overview stats configuration
  const overviewStats = [
    {
      title: 'Total Images',
      value: data.totalImages.toLocaleString(),
      icon: Image,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Storage Used',
      value: formatFileSize(data.totalSize),
      icon: HardDrive,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: `${data.storageUsage.percentage.toFixed(1)}%`,
      changeType: 'neutral'
    },
    {
      title: 'Recent Uploads',
      value: data.recentUploads.toString(),
      icon: Upload,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8 today',
      changeType: 'positive'
    },
    {
      title: 'Processing Queue',
      value: data.processingQueue.toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '-3 from yesterday',
      changeType: 'positive'
    }
  ];

  // Queue stats configuration
  const queueStats = [
    {
      title: 'Pending Jobs',
      value: data.queueStats.pendingJobs,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Processing',
      value: data.queueStats.processingJobs,
      icon: Loader,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Completed',
      value: data.queueStats.completedJobs,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Failed',
      value: data.queueStats.failedJobs,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return Upload;
      case 'download': return Download;
      case 'delete': return Trash2;
      case 'edit': return Eye;
      default: return Image;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'upload': return 'text-green-600 bg-green-100';
      case 'download': return 'text-blue-600 bg-blue-100';
      case 'delete': return 'text-red-600 bg-red-100';
      case 'edit': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
              Comprehensive insights and statistics about your media library
            </p>
          </div>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="bg-white/60 backdrop-blur-sm border-white/40 hover:bg-white/80 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mb-2">
                          {stat.value}
                        </p>
                        <div className="flex items-center space-x-1">
                          <span className={`text-xs ${
                            stat.changeType === 'positive' ? 'text-green-600' : 
                            stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Storage Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5 text-purple-600" />
              <span>Storage Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Used Storage</span>
                <span className="text-sm text-gray-600">
                  {formatFileSize(data.storageUsage.used)} of {formatFileSize(data.storageUsage.available)}
                </span>
              </div>
              
              <Progress value={data.storageUsage.percentage} className="h-3" />
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-600">{data.storageUsage.percentage.toFixed(1)}%</p>
                  <p className="text-xs text-blue-600">Used</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{(100 - data.storageUsage.percentage).toFixed(1)}%</p>
                  <p className="text-xs text-green-600">Available</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-lg font-bold text-purple-600">{data.totalImages}</p>
                  <p className="text-xs text-purple-600">Total Files</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Queue Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Processing Queue Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {queueStats.map((stat, index) => {
                const Icon = stat.icon;
                const percentage = totalJobs > 0 ? (stat.value / totalJobs) * 100 : 0;
                
                return (
                  <div key={stat.title} className="text-center">
                    <div className={`inline-flex p-3 rounded-full ${stat.bgColor} mb-2`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                  </div>
                );
              })}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Queue Distribution</h4>
                <div className="space-y-2">
                  {queueStats.map((stat) => {
                    const percentage = totalJobs > 0 ? (stat.value / totalJobs) * 100 : 0;
                    return (
                      <div key={stat.title} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">{stat.title}</span>
                          <span className="text-gray-500">{stat.value} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Performance Metrics</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Processing Time</span>
                    <span className="font-medium">{(data.queueStats.averageProcessingTime / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-medium text-green-600">{data.queueStats.successRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Jobs Processed</span>
                    <span className="font-medium">{totalJobs.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Media Distribution and Folder Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Media Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/40">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Image className="h-5 w-5 text-blue-600" />
                <span>Media Types</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.mediaDistribution).map(([type, count]) => {
                  const percentage = data.totalImages > 0 ? (count / data.totalImages) * 100 : 0;
                  const colors = {
                    images: 'text-blue-600 bg-blue-100',
                    videos: 'text-purple-600 bg-purple-100',
                    audio: 'text-green-600 bg-green-100'
                  };
                  
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-lg ${colors[type as keyof typeof colors]}`}>
                            <Image className="h-4 w-4" />
                          </div>
                          <span className="font-medium capitalize">{type}</span>
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

        {/* Popular Folders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
                {Object.entries(data.folderStats)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([folder, count]) => {
                    const percentage = data.totalImages > 0 ? (count / data.totalImages) * 100 : 0;
                    return (
                      <div key={folder} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700 capitalize">{folder}</span>
                          <span className="text-gray-500">{count} items</span>
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
      </div>

      {/* Upload Trends and Popular Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/60 backdrop-blur-sm border-white/40">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Upload Trends (Last 30 Days)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end space-x-1">
                {data.uploadTrends.slice(-30).map((day, index) => {
                  const maxCount = Math.max(...data.uploadTrends.map(d => d.count));
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
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Total uploads this month: {data.uploadTrends.slice(-30).reduce((sum, day) => sum + day.count, 0)}
                </p>
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
                {data.popularTags.slice(0, 12).map((tagData) => (
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
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Total unique tags: {data.popularTags.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type);
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      {activity.imageName && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {activity.imageName}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View all activity →
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Analytics;