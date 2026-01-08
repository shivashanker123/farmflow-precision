import React from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';

interface WaterTankVisualizationProps {
  totalCapacity: number;
  usedWater: number;
  dailyNeed: number;
  fieldSize: number;
}

const WaterTankVisualization: React.FC<WaterTankVisualizationProps> = ({
  totalCapacity,
  usedWater,
  dailyNeed,
  fieldSize,
}) => {
  const remaining = totalCapacity - usedWater;
  const percentage = (remaining / totalCapacity) * 100;
  const dailyUsage = dailyNeed * fieldSize * 100;
  const daysRemaining = Math.floor(remaining / dailyUsage);

  const getWaterColor = () => {
    if (percentage > 50) return 'from-secondary to-secondary/70';
    if (percentage > 20) return 'from-warning to-warning/70';
    return 'from-destructive to-destructive/70';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 hover-lift"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
          <Droplets className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-foreground">Water Tank</h3>
          <p className="text-sm text-muted-foreground">Real-time water budget</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Tank Visualization */}
        <div className="relative">
          <svg width="80" height="200" viewBox="0 0 80 200">
            {/* Tank Outline */}
            <rect
              x="5"
              y="10"
              width="70"
              height="180"
              rx="10"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="3"
            />
            
            {/* Water Level */}
            <defs>
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(199, 98%, 52%)" />
                <stop offset="100%" stopColor="hsl(199, 98%, 42%)" />
              </linearGradient>
              <clipPath id="tankClip">
                <rect x="8" y="13" width="64" height="174" rx="8" />
              </clipPath>
            </defs>
            
            <g clipPath="url(#tankClip)">
              <motion.rect
                x="8"
                width="64"
                rx="8"
                fill="url(#waterGradient)"
                initial={{ y: 187, height: 0 }}
                animate={{ 
                  y: 13 + (174 * (1 - percentage / 100)), 
                  height: 174 * (percentage / 100) 
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              
              {/* Wave Effect */}
              <motion.ellipse
                cx="40"
                fill="hsl(199, 98%, 62%)"
                opacity="0.5"
                initial={{ cy: 187, rx: 32, ry: 4 }}
                animate={{ 
                  cy: 13 + (174 * (1 - percentage / 100)),
                  ry: [4, 6, 4],
                }}
                transition={{ 
                  cy: { duration: 1, ease: 'easeOut' },
                  ry: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }}
              />
            </g>

            {/* Level Markers */}
            {[25, 50, 75].map((level) => (
              <g key={level}>
                <line
                  x1="75"
                  y1={187 - (174 * level / 100)}
                  x2="80"
                  y2={187 - (174 * level / 100)}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="1"
                />
                <text
                  x="82"
                  y={187 - (174 * level / 100) + 4}
                  fontSize="8"
                  fill="hsl(var(--muted-foreground))"
                >
                  {level}%
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-4">
          <div className="glass-card p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground">Total Capacity</p>
            <p className="text-2xl font-display font-bold text-foreground">
              {(totalCapacity / 1000).toFixed(1)} <span className="text-base font-normal">m³</span>
            </p>
          </div>

          <div className="glass-card p-4 bg-secondary/10">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-2xl font-display font-bold text-secondary">
              {(remaining / 1000).toFixed(1)} <span className="text-base font-normal">m³</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(0)}% of capacity</p>
          </div>

          <div className="glass-card p-4 bg-primary/10">
            <p className="text-sm text-muted-foreground">Used to Date</p>
            <p className="text-2xl font-display font-bold text-primary">
              {(usedWater / 1000).toFixed(1)} <span className="text-base font-normal">m³</span>
            </p>
          </div>

          <div className={`glass-card p-4 ${daysRemaining < 7 ? 'bg-warning/10' : 'bg-success/10'}`}>
            <p className="text-sm text-muted-foreground">Estimated Days Left</p>
            <p className={`text-2xl font-display font-bold ${daysRemaining < 7 ? 'text-warning' : 'text-success'}`}>
              {daysRemaining} <span className="text-base font-normal">days</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Based on {dailyNeed}mm/day × {fieldSize} acres</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WaterTankVisualization;
