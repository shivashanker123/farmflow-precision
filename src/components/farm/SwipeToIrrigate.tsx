import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Droplets, Check } from 'lucide-react';

interface SwipeToIrrigateProps {
  onActivate: () => void;
  isActive: boolean;
}

const SwipeToIrrigate: React.FC<SwipeToIrrigateProps> = ({ onActivate, isActive }) => {
  const [isLocked, setIsLocked] = useState(false);
  const x = useMotionValue(0);
  const sliderWidth = 280;
  const handleWidth = 56;
  const maxX = sliderWidth - handleWidth - 8;

  const background = useTransform(
    x,
    [0, maxX],
    ['hsl(var(--muted))', 'hsl(var(--secondary))']
  );

  const textOpacity = useTransform(x, [0, maxX * 0.5], [1, 0]);

  const handleDragEnd = () => {
    if (x.get() > maxX * 0.8) {
      animate(x, maxX, { type: 'spring', stiffness: 300, damping: 30 });
      setIsLocked(true);
      onActivate();
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
    }
  };

  const handleReset = () => {
    if (isLocked) {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
      setIsLocked(false);
      onActivate();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 hover-lift"
    >
      <div className="flex flex-col items-center gap-4">
        <h3 className="font-display font-bold text-lg text-foreground">Irrigation Control</h3>

        {/* Water Flow Animation */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-secondary/10 rounded-xl p-4 mb-2"
          >
            <svg viewBox="0 0 200 30" className="w-full h-8">
              <defs>
                <linearGradient id="waterFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(199, 98%, 42%)" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="hsl(199, 98%, 52%)" stopOpacity="1" />
                  <stop offset="100%" stopColor="hsl(199, 98%, 42%)" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              {/* Pipe */}
              <rect x="0" y="10" width="200" height="10" rx="5" fill="hsl(var(--muted))" />
              {/* Water Flow */}
              <motion.rect
                x="0"
                y="10"
                width="200"
                height="10"
                rx="5"
                fill="url(#waterFlow)"
                initial={{ x: -200 }}
                animate={{ x: 200 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </svg>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse-gentle" />
              <span className="text-secondary font-medium text-sm">Pump Active - Water Flowing</span>
            </div>
          </motion.div>
        )}

        {/* Slider */}
        <motion.div
          style={{ background }}
          className="relative w-72 h-16 rounded-full overflow-hidden cursor-pointer"
          onClick={isLocked ? handleReset : undefined}
        >
          {/* Shimmer Effect */}
          {!isLocked && (
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />
          )}

          {/* Text */}
          <motion.div
            style={{ opacity: textOpacity }}
            className="absolute inset-0 flex items-center justify-center text-muted-foreground font-medium"
          >
            {isLocked ? 'Tap to Stop' : 'Slide to Start Pump'}
          </motion.div>

          {/* Handle */}
          <motion.div
            drag={!isLocked ? 'x' : false}
            dragConstraints={{ left: 0, right: maxX }}
            dragElastic={0}
            style={{ x }}
            onDragEnd={handleDragEnd}
            className={`absolute top-1 left-1 w-14 h-14 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg ${
              isLocked ? 'bg-secondary' : 'bg-white'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {isLocked ? (
              <Check className="w-6 h-6 text-secondary-foreground" />
            ) : (
              <Droplets className="w-6 h-6 text-secondary" />
            )}
          </motion.div>
        </motion.div>

        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium"
          >
            🚿 Pump Active
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SwipeToIrrigate;
