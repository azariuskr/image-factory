import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Trash2, Edit, Image, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { formatDate } from '../../lib/utils';

interface ActivityItem {
  id: string;
  type: 'upload' | 'download' | 'delete' | 'edit';
  description: string;
  timestamp: string;
  imageId?: string;
  imageName?: string;
}

interface RecentActivityProps {
  activities?: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  activities = [
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
    },
    {
      id: '5',
      type: 'upload',
      description: 'Batch upload completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      imageName: '12 images'
    }
  ]
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return Upload;
      case 'download': return Download;
      case 'delete': return Trash2;
      case 'edit': return Edit;
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
    <Card className="bg-white/60 backdrop-blur-sm border-white/40">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
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
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all activity →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;