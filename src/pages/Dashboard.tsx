import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TrafficLightIndicator from '@/components/farm/TrafficLightIndicator';
import SoilMoistureGauge from '@/components/farm/SoilMoistureGauge';
import SwipeToIrrigate from '@/components/farm/SwipeToIrrigate';
import { useFarm } from '@/contexts/FarmContext';
import { Calendar, Sun, Cloud, Thermometer } from 'lucide-react';

const Dashboard = () => {
  const {
    farmData,
    updateSoilMoisture,
    togglePump,
    toggleSensorOnline,
    getRecommendation,
  } = useFarm();

  const recommendation = getRecommendation();
  const cropDay = 45; // Simulated crop day

  // Simulated weather data
  const weatherData = {
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Command Center</h1>
            <p className="text-muted-foreground mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Weather Widget */}
          <div className="glass-card px-6 py-3 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-warning" />
              <span className="font-medium">{weatherData.temperature}°C</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{weatherData.condition}</span>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-secondary" />
              <span className="text-sm text-muted-foreground">{weatherData.humidity}% humidity</span>
            </div>
          </div>
        </motion.div>

        {/* Smart Recommendation Engine */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TrafficLightIndicator
            status={recommendation}
            cropType={farmData.cropType}
            cropDay={cropDay}
            soilMoisture={farmData.soilMoisture}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Trust Gauge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SoilMoistureGauge
              value={farmData.soilMoisture}
              cropType={farmData.cropType}
              sensorOnline={farmData.sensorOnline}
            />
          </motion.div>

          {/* Irrigation Control & Reliability Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Swipe to Irrigate */}
            <SwipeToIrrigate
              onActivate={togglePump}
              isActive={farmData.pumpActive}
            />

            {/* Reliability Toggle */}
            <div className="glass-card p-6 hover-lift">
              <h3 className="font-display font-bold text-lg text-foreground mb-4">Sensor Reliability</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${farmData.sensorOnline ? 'bg-success animate-pulse-gentle' : 'bg-muted'}`} />
                    <Label htmlFor="sensor-toggle">Sensor Status</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {farmData.sensorOnline ? 'Online' : 'Simulating Failure'}
                    </span>
                    <Switch
                      id="sensor-toggle"
                      checked={!farmData.sensorOnline}
                      onCheckedChange={toggleSensorOnline}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Toggle to simulate sensor failure mode
                </p>
              </div>
            </div>

            {/* Manual Moisture Control (Demo) */}
            <div className="glass-card p-6 hover-lift">
              <h3 className="font-display font-bold text-lg text-foreground mb-4">Demo Controls</h3>
              <div className="space-y-4">
                <Label>Adjust Soil Moisture: {farmData.soilMoisture}%</Label>
                <Slider
                  value={[farmData.soilMoisture]}
                  onValueChange={(value) => updateSoilMoisture(value[0])}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Drag to simulate soil moisture changes
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: 'Field Size', value: `${farmData.fieldSize} acres`, icon: Calendar },
            { label: 'Crop Type', value: farmData.cropType, icon: Sun },
            { label: 'Water Need', value: `${farmData.dailyWaterNeed} mm/day`, icon: Cloud },
            { label: 'Tank Level', value: `${((farmData.tankCapacity - farmData.usedWater) / farmData.tankCapacity * 100).toFixed(0)}%`, icon: Thermometer },
          ].map((stat, index) => (
            <div key={stat.label} className="glass-card p-4 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-xl font-display font-bold text-foreground capitalize">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
