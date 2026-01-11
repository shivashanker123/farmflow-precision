import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, Cloud, AlertCircle } from 'lucide-react';

interface DataSourceBadgeProps {
  isLive: boolean;
  lastUpdated: Date | null;
  isLoading?: boolean;
}

const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  isLive,
  lastUpdated,
  isLoading = false,
}) => {
  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-300
        ${isLive 
          ? 'bg-success/20 text-success border border-success/30' 
          : 'bg-secondary/20 text-secondary border border-secondary/30'
        }
        ${isLoading ? 'animate-pulse' : ''}
      `}
    >
      {isLive ? (
        <>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 rounded-full bg-success"
          />
          <Wifi className="w-4 h-4" />
          <span>Live Field Data</span>
        </>
      ) : (
        <>
          <Cloud className="w-4 h-4" />
          <span>Weather API Data</span>
        </>
      )}
      
      {lastUpdated && (
        <span className="text-xs opacity-70 ml-1">
          {formatTime(lastUpdated)}
        </span>
      )}
    </motion.div>
  );
};

export default DataSourceBadge;
