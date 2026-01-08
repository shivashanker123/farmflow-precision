import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface TrafficLightIndicatorProps {
  status: 'full' | 'partial' | 'skip';
  cropType: string;
  cropDay: number;
  soilMoisture: number;
}

const TrafficLightIndicator: React.FC<TrafficLightIndicatorProps> = ({
  status,
  cropType,
  cropDay,
  soilMoisture,
}) => {
  const config = {
    full: {
      color: 'bg-success',
      glowColor: 'shadow-[0_0_40px_hsl(122_47%_35%/0.5)]',
      icon: CheckCircle,
      title: 'OPTIMAL',
      subtitle: 'Irrigate Normally',
      description: 'Soil is dry and water budget is healthy',
    },
    partial: {
      color: 'bg-warning',
      glowColor: 'shadow-[0_0_40px_hsl(38_100%_50%/0.5)]',
      icon: AlertTriangle,
      title: 'CAUTION',
      subtitle: 'Partial Irrigation Recommended',
      description: 'Soil is dry but water budget is limited',
    },
    skip: {
      color: 'bg-destructive',
      glowColor: 'shadow-[0_0_40px_hsl(0_65%_51%/0.5)]',
      icon: XCircle,
      title: 'STOP',
      subtitle: 'Do Not Irrigate',
      description: 'Soil moisture is adequate',
    },
  };

  const current = config[status];
  const Icon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 hover-lift"
    >
      <div className="flex items-center gap-6">
        {/* Traffic Light Visual */}
        <div className="flex flex-col items-center gap-2 p-4 bg-foreground/5 rounded-2xl">
          {['full', 'partial', 'skip'].map((s) => (
            <motion.div
              key={s}
              className={`w-6 h-6 rounded-full transition-all duration-500 ${
                s === status 
                  ? `${config[s as keyof typeof config].color} ${config[s as keyof typeof config].glowColor}` 
                  : 'bg-muted'
              }`}
              animate={s === status ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icon className={`w-8 h-8 ${
                status === 'full' ? 'text-success' : 
                status === 'partial' ? 'text-warning' : 'text-destructive'
              }`} />
            </motion.div>
            <div>
              <h3 className="font-display font-bold text-xl tracking-wide">
                {current.title}: <span className="font-normal">{current.subtitle}</span>
              </h3>
            </div>
          </div>
          <p className="text-muted-foreground">
            Based on your <span className="font-medium text-foreground capitalize">{cropType}</span> crop 
            (Day {cropDay}) and <span className="font-medium text-foreground">{soilMoisture}%</span> soil moisture.
          </p>
          <p className="text-sm text-muted-foreground mt-1">{current.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TrafficLightIndicator;
