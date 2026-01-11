import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Wifi, Cloud } from 'lucide-react';

interface SensorCardProps {
  type: 'temperature' | 'humidity';
  value: number;
  unit: string;
  isLive: boolean;
}

const SensorCard: React.FC<SensorCardProps> = ({
  type,
  value,
  unit,
  isLive,
}) => {
  const config = {
    temperature: {
      icon: Thermometer,
      label: 'Temperature',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      gradient: 'from-warning/20 to-orange-500/10',
    },
    humidity: {
      icon: Droplets,
      label: 'Humidity',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      gradient: 'from-secondary/20 to-blue-500/10',
    },
  };

  const { icon: Icon, label, color, bgColor, gradient } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`glass-card p-4 hover-lift relative overflow-hidden`}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-xl ${bgColor}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          
          {/* Source indicator */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            isLive 
              ? 'bg-success/20 text-success' 
              : 'bg-muted/50 text-muted-foreground'
          }`}>
            {isLive ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>Sensor</span>
              </>
            ) : (
              <>
                <Cloud className="w-3 h-3" />
                <span>API</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-display font-bold text-foreground"
            >
              {value}
            </motion.span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SensorCard;
