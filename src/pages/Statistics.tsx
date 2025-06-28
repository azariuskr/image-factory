import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';
import { useGetQueueStatisticsQuery } from '../store/api/apiSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

const Statistics: React.FC = () => {
  const { data: stats, isLoading, error } = useGetQueueStatisticsQuery();

  const statCards = [
    {
      title: 'Pending Jobs',
      value: stats?.pendingJobs || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Processing',
      value: stats?.processingJobs || 0,
      icon: Loader,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Completed',
      value: stats?.completedJobs || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Failed',
      value: stats?.failedJobs || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  const totalJobs = (stats?.pendingJobs || 0) + 
                   (stats?.processingJobs || 0) + 
                   (stats?.completedJobs || 0) + 
                   (stats?.failedJobs || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Queue Statistics</h1>
        <p className="text-gray-600 mt-1">
          Monitor image processing queue performance
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="bg-white/60 backdrop-blur-sm border-white/40 hover:bg-white/80 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {isLoading ? '...' : stat.value.toLocaleString()}
                      </p>
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
      </motion.div>

      {/* Processing Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Queue Distribution */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5 text-blue-600" />
              <span>Queue Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statCards.map((stat) => {
              const percentage = totalJobs > 0 ? (stat.value / totalJobs) * 100 : 0;
              return (
                <div key={stat.title} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{stat.title}</span>
                    <span className="text-gray-500">
                      {stat.value} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Average Processing Time
                </span>
                <span className="text-sm text-gray-500">
                  {stats?.averageProcessingTime ? 
                    `${(stats.averageProcessingTime / 1000).toFixed(1)}s` : 
                    'N/A'
                  }
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Success Rate
                </span>
                <span className="text-sm text-gray-500">
                  {totalJobs > 0 ? 
                    `${(((stats?.completedJobs || 0) / totalJobs) * 100).toFixed(1)}%` : 
                    'N/A'
                  }
                </span>
              </div>
              <Progress 
                value={totalJobs > 0 ? ((stats?.completedJobs || 0) / totalJobs) * 100 : 0} 
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Total Jobs Processed
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {totalJobs.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-medium text-red-800">
                    Failed to load statistics
                  </h3>
                  <p className="text-sm text-red-600 mt-1">
                    Please check your connection and try again.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Statistics;