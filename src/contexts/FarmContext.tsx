import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FarmData {
  cropType: 'wheat' | 'corn' | 'tomato';
  fieldSize: number; // acres
  tankCapacity: number; // liters
  dailyWaterNeed: number; // mm/day based on crop
  usedWater: number; // liters used
  soilMoisture: number; // percentage
  sensorOnline: boolean;
  pumpActive: boolean;
  farmerName: string;
}

const CROP_WATER_NEEDS: Record<string, number> = {
  wheat: 5,
  corn: 7,
  tomato: 6,
};

interface FarmContextType {
  farmData: FarmData;
  isSetupComplete: boolean;
  completeFarmSetup: (cropType: string, fieldSize: number, tankCapacity: number, farmerName: string) => void;
  updateSoilMoisture: (value: number) => void;
  togglePump: () => void;
  toggleSensorOnline: () => void;
  useWater: (liters: number) => void;
  getWaterBudgetStatus: () => 'high' | 'medium' | 'low';
  getRecommendation: () => 'full' | 'partial' | 'skip';
  getRemainingDays: () => number;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [farmData, setFarmData] = useState<FarmData>({
    cropType: 'corn',
    fieldSize: 10,
    tankCapacity: 50000,
    dailyWaterNeed: 7,
    usedWater: 12500,
    soilMoisture: 65,
    sensorOnline: true,
    pumpActive: false,
    farmerName: 'John',
  });

  const completeFarmSetup = (cropType: string, fieldSize: number, tankCapacity: number, farmerName: string) => {
    const dailyNeed = CROP_WATER_NEEDS[cropType] || 5;
    setFarmData(prev => ({
      ...prev,
      cropType: cropType as FarmData['cropType'],
      fieldSize,
      tankCapacity,
      dailyWaterNeed: dailyNeed,
      farmerName,
    }));
    setIsSetupComplete(true);
  };

  const updateSoilMoisture = (value: number) => {
    setFarmData(prev => ({ ...prev, soilMoisture: value }));
  };

  const togglePump = () => {
    setFarmData(prev => ({ ...prev, pumpActive: !prev.pumpActive }));
  };

  const toggleSensorOnline = () => {
    setFarmData(prev => ({ ...prev, sensorOnline: !prev.sensorOnline }));
  };

  const useWater = (liters: number) => {
    setFarmData(prev => ({
      ...prev,
      usedWater: Math.min(prev.usedWater + liters, prev.tankCapacity),
    }));
  };

  const getWaterBudgetStatus = (): 'high' | 'medium' | 'low' => {
    const remaining = farmData.tankCapacity - farmData.usedWater;
    const percentage = (remaining / farmData.tankCapacity) * 100;
    if (percentage > 50) return 'high';
    if (percentage > 20) return 'medium';
    return 'low';
  };

  const getRecommendation = (): 'full' | 'partial' | 'skip' => {
    const isDry = farmData.soilMoisture < 40;
    const budget = getWaterBudgetStatus();
    
    if (!isDry) return 'skip';
    if (budget === 'high') return 'full';
    return 'partial';
  };

  const getRemainingDays = (): number => {
    const remaining = farmData.tankCapacity - farmData.usedWater;
    const dailyUsage = farmData.dailyWaterNeed * farmData.fieldSize * 100; // approx liters
    return Math.floor(remaining / dailyUsage);
  };

  return (
    <FarmContext.Provider
      value={{
        farmData,
        isSetupComplete,
        completeFarmSetup,
        updateSoilMoisture,
        togglePump,
        toggleSensorOnline,
        useWater,
        getWaterBudgetStatus,
        getRecommendation,
        getRemainingDays,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
