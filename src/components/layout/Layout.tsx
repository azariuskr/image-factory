import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Images, 
  Upload, 
  BarChart3, 
  Settings,
  Camera
} from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Gallery', icon: Images },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MediaHub Pro
              </span>
            </Link>
            
            <nav className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative px-4 py-2 rounded-lg transition-all duration-200 hover:bg-white/60"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <div className={`flex items-center space-x-2 ${
                      isActive ? 'text-white' : 'text-gray-700'
                    }`}>
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium hidden sm:inline">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;