import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import WaterTankVisualization from '@/components/farm/WaterTankVisualization';
import { useFarm } from '@/contexts/FarmContext';
import { TrendingUp, Droplets, Target, Calendar } from 'lucide-react';

const WaterBudget = () => {
  const { farmData, getWaterBudgetStatus, getRemainingDays } = useFarm();

  const budgetStatus = getWaterBudgetStatus();
  const remaining = farmData.tankCapacity - farmData.usedWater;
  const percentageUsed = (farmData.usedWater / farmData.tankCapacity) * 100;
  
  // Calculate savings (simulated - compared to traditional irrigation)
  const traditionalUsage = farmData.usedWater * 1.4; // 40% more water traditionally
  const waterSaved = traditionalUsage - farmData.usedWater;
  const efficiencyScore = Math.min(100, Math.round((1 - (farmData.usedWater / traditionalUsage)) * 100 + 50));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold text-foreground">Water Budget</h1>
          <p className="text-muted-foreground mt-1">
            Track and optimize your water resource usage
          </p>
        </motion.div>

        {/* Budget Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`glass-card p-6 hover-lift border-l-4 ${
            budgetStatus === 'high' ? 'border-l-success' :
            budgetStatus === 'medium' ? 'border-l-warning' : 'border-l-destructive'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Budget Status</p>
              <h2 className={`text-2xl font-display font-bold capitalize ${
                budgetStatus === 'high' ? 'text-success' :
                budgetStatus === 'medium' ? 'text-warning' : 'text-destructive'
              }`}>
                {budgetStatus === 'high' ? '✓ Healthy Budget' :
                 budgetStatus === 'medium' ? '⚡ Moderate - Plan Ahead' : '⚠️ Low - Conserve Water'}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Days Remaining</p>
              <p className="text-3xl font-display font-bold text-foreground">{getRemainingDays()}</p>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Water Tank */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <WaterTankVisualization
              totalCapacity={farmData.tankCapacity}
              usedWater={farmData.usedWater}
              dailyNeed={farmData.dailyWaterNeed}
              fieldSize={farmData.fieldSize}
            />
          </motion.div>

          {/* Analysis Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Water Saved */}
            <div className="glass-card p-6 hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Water Saved</p>
                  <p className="text-2xl font-display font-bold text-success">
                    {(waterSaved / 1000).toFixed(1)} m³
                  </p>
                </div>
              </div>
              <div className="bg-success/10 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  Compared to traditional irrigation schedules, you've saved approximately{' '}
                  <span className="font-bold text-success">{waterSaved.toLocaleString()} liters</span>{' '}
                  by skipping unnecessary irrigation cycles.
                </p>
              </div>
            </div>

            {/* Efficiency Score */}
            <div className="glass-card p-6 hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Efficiency Score</p>
                  <p className="text-2xl font-display font-bold text-primary">
                    {efficiencyScore}/100
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${efficiencyScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Score based on water budget adherence and optimal irrigation timing.
              </p>
            </div>

            {/* Usage Breakdown */}
            <div className="glass-card p-6 hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usage Breakdown</p>
                  <p className="text-lg font-display font-bold text-foreground">
                    This Season
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Used</span>
                  <span className="font-medium">{(farmData.usedWater / 1000).toFixed(1)} m³</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium text-secondary">{(remaining / 1000).toFixed(1)} m³</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Usage Rate</span>
                  <span className="font-medium">{percentageUsed.toFixed(1)}%</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Est. Refill Date</span>
                  <span className="font-medium text-foreground">
                    {new Date(Date.now() + getRemainingDays() * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WaterBudget;
