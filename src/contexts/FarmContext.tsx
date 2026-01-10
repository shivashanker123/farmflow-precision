import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SoilType = 'sandy' | 'clay' | 'loam' | 'black';
export type IrrigationSource = 'tank' | 'borewell';

export interface FarmData {
  cropType: 'wheat' | 'corn' | 'tomato';
  fieldSize: number; // acres
  tankCapacity: number; // liters (for tank)
  dailyWaterNeed: number; // mm/day based on crop
  usedWater: number; // liters used
  soilMoisture: number; // percentage
  sensorOnline: boolean;
  pumpActive: boolean;
  farmerName: string;
  soilType: SoilType;
  irrigationSource: IrrigationSource;
  flowRate: number; // liters/hour (for borewell)
  pumpRunTime: number; // hours pumped today
}

const CROP_WATER_NEEDS: Record<string, number> = {
  wheat: 5,
  corn: 7,
  tomato: 6,
};

interface FarmSetupParams {
  cropType: string;
  fieldSize: number;
  farmerName: string;
  soilType: SoilType;
  irrigationSource: IrrigationSource;
  tankCapacity?: number;
  flowRate?: number;
}

interface FarmContextType {
  farmData: FarmData;
  isSetupComplete: boolean;
  completeFarmSetup: (params: FarmSetupParams) => void;
  updateSoilMoisture: (value: number) => void;
  togglePump: () => void;
  toggleSensorOnline: () => void;
  useWater: (liters: number) => void;
  addPumpRunTime: (hours: number) => void;
  getWaterBudgetStatus: () => 'high' | 'medium' | 'low';
  getRecommendation: () => 'full' | 'partial' | 'skip';
  getRemainingDays: () => number;
  getTotalPumped: () => number;
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
    soilType: 'loam',
    irrigationSource: 'tank',
    flowRate: 5000,
    pumpRunTime: 2.5,
  });

  const completeFarmSetup = (params: FarmSetupParams) => {
    const dailyNeed = CROP_WATER_NEEDS[params.cropType] || 5;
    setFarmData(prev => ({
      ...prev,
      cropType: params.cropType as FarmData['cropType'],
      fieldSize: params.fieldSize,
      tankCapacity: params.tankCapacity || 50000,
      dailyWaterNeed: dailyNeed,
      farmerName: params.farmerName,
      soilType: params.soilType,
      irrigationSource: params.irrigationSource,
      flowRate: params.flowRate || 5000,
      pumpRunTime: 0,
      usedWater: 0,
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

  const addPumpRunTime = (hours: number) => {
    setFarmData(prev => ({
      ...prev,
      pumpRunTime: prev.pumpRunTime + hours,
    }));
  };

  const getTotalPumped = (): number => {
    return farmData.pumpRunTime * farmData.flowRate;
  };

  const getWaterBudgetStatus = (): 'high' | 'medium' | 'low' => {
    if (farmData.irrigationSource === 'borewell') {
      // For borewell, base on pump runtime efficiency
      const dailyTarget = 8; // max hours pumping per day
      const usageRatio = farmData.pumpRunTime / dailyTarget;
      if (usageRatio < 0.3) return 'high';
      if (usageRatio < 0.7) return 'medium';
      return 'low';
    }
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
    if (farmData.irrigationSource === 'borewell') {
      // Borewell doesn't have remaining days in traditional sense
      // Return estimated days at current pump rate
      const dailyUsage = farmData.dailyWaterNeed * farmData.fieldSize * 100;
      const pumpedPerDay = farmData.flowRate * 4; // assume 4 hrs/day average
      return Math.floor(pumpedPerDay / dailyUsage * 30); // show relative efficiency
    }
    const remaining = farmData.tankCapacity - farmData.usedWater;
    const dailyUsage = farmData.dailyWaterNeed * farmData.fieldSize * 100;
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
        addPumpRunTime,
        getWaterBudgetStatus,
        getRecommendation,
        getRemainingDays,
        getTotalPumped,
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
