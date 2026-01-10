import React from 'react';
import { motion } from 'framer-motion';
import CropIcon from './CropIcon';

interface SoilMoistureGaugeProps {
  value: number; // 0-100
  cropType: 'wheat' | 'corn' | 'tomato';
  sensorOnline: boolean;
}

const SoilMoistureGauge: React.FC<SoilMoistureGaugeProps> = ({
  value,
  cropType,
  sensorOnline,
}) => {
  // Calculate needle rotation angle
  // 0% = -90deg (pointing left), 50% = 0deg (pointing up), 100% = 90deg (pointing right)
  const needleAngle = ((value / 100) * 180) - 90;

  const getStatusColor = () => {
    if (value < 30) return 'text-destructive';
    if (value < 50) return 'text-warning';
    return 'text-success';
  };

  const getStatusText = () => {
    if (value < 30) return 'Critical - Needs Water';
    if (value < 50) return 'Low - Monitor Closely';
    if (value < 70) return 'Optimal';
    return 'Saturated';
  };

  // Calculate the arc dashoffset based on value (0-100)
  // The arc length is approximately 251 (π * 80)
  const arcLength = 251;
  const filledLength = (value / 100) * arcLength;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card p-8 hover-lift relative ${!sensorOnline ? 'grayscale opacity-70' : ''}`}
    >
      {!sensorOnline && (
        <div className="absolute top-4 left-4 right-4 bg-warning/20 border border-warning/40 rounded-lg p-3 z-10">
          <p className="text-warning text-sm font-medium flex items-center gap-2">
            ⚠️ Using Historical Data Backup
          </p>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="font-display font-bold text-lg text-foreground">Trust Gauge</h3>
        <p className="text-sm text-muted-foreground">Soil Moisture Level</p>
      </div>

      {/* Gauge SVG */}
      <div className="relative w-64 h-40 mx-auto">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Gradient Colored Arc */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(0, 65%, 51%)" />
              <stop offset="40%" stopColor="hsl(38, 100%, 50%)" />
              <stop offset="100%" stopColor="hsl(122, 47%, 35%)" />
            </linearGradient>
          </defs>
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={arcLength - filledLength}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />

          {/* Needle - rotating line with fixed center pivot */}
          <g transform={`rotate(${needleAngle}, 100, 100)`} style={{ transition: 'transform 0.8s ease-out' }}>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke="hsl(var(--foreground))"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          {/* Fixed center pivot circle - drawn after needle so it appears on top */}
          <circle cx="100" cy="100" r="8" fill="hsl(var(--foreground))" />

          {/* Labels */}
          <text x="15" y="115" fontSize="10" fill="hsl(var(--muted-foreground))">0%</text>
          <text x="90" y="20" fontSize="10" fill="hsl(var(--muted-foreground))">50%</text>
          <text x="170" y="115" fontSize="10" fill="hsl(var(--muted-foreground))">100%</text>
        </svg>

        {/* Center Value Display */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <motion.span
            key={value}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-4xl font-display font-bold ${getStatusColor()}`}
          >
            {value}%
          </motion.span>
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center mt-4">
        <p className={`font-medium ${getStatusColor()}`}>{getStatusText()}</p>
      </div>

      {/* Digital Twin Crop */}
      <div className="flex justify-center mt-6">
        <CropIcon type={cropType} isHealthy={value > 40} size="lg" />
      </div>
    </motion.div>
  );
};

export default SoilMoistureGauge;
