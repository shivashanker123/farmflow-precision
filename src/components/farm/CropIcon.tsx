import React from 'react';
import { motion } from 'framer-motion';
import { Wheat, Leaf } from 'lucide-react';

interface CropIconProps {
  type: 'wheat' | 'corn' | 'tomato';
  isHealthy?: boolean;
  size?: 'sm' | 'md' | 'lg';
  floating?: boolean;
}

const CropIcon: React.FC<CropIconProps> = ({ 
  type, 
  isHealthy = true, 
  size = 'md',
  floating = false 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const iconSize = {
    sm: 24,
    md: 48,
    lg: 72,
  };

  const getIcon = () => {
    switch (type) {
      case 'wheat':
        return <Wheat size={iconSize[size]} />;
      case 'corn':
      case 'tomato':
      default:
        return <Leaf size={iconSize[size]} />;
    }
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} text-primary relative`}
      animate={floating ? {
        y: [0, -10, -5, -15, 0],
        rotate: [0, 2, 0, -2, 0],
      } : undefined}
      transition={floating ? {
        duration: 6,
        ease: "easeInOut",
        repeat: Infinity,
      } : undefined}
    >
      <motion.div
        className={isHealthy ? 'animate-sway' : 'animate-droop'}
        style={{ 
          filter: isHealthy ? 'none' : 'saturate(0.5)',
          opacity: isHealthy ? 1 : 0.7,
        }}
      >
        {getIcon()}
      </motion.div>
      {floating && (
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10" />
      )}
    </motion.div>
  );
};

export default CropIcon;
