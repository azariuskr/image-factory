import React from 'react';
import { motion } from 'framer-motion';
import { Image, HardDrive, Upload, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { formatFileSize } from '../../lib/utils';

interface QuickStatsProps {
  totalImages?: number;
  totalSize?: number;
  recentUploads?: number;
  processingQueue?: number;
}

const QuickStats: React.FC<QuickStatsProps> = ({
  totalImages = 1247,
  totalSize = 15728640000,
  recentUploads = 23,
  processingQueue = 5
}) => {
  const stats = [
    {
      title: 'Total Images',
      value: totalImages.toLocaleString(),
      icon: Image,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Storage Used',
      value: formatFileSize(totalSize),
      icon: HardDrive,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+2.3GB',
      changeType: 'neutral'
    },
    {
      title: 'Recent Uploads',
      value: recentUploads.toString(),
      icon: Upload,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8 today',
      changeType: 'positive'
    },
    {
      title: 'Processing Queue',
      value: processingQueue.toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '-3 from yesterday',
      changeType: 'positive'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
  );
};

export default QuickStats;