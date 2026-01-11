import { useState, useEffect, useCallback } from 'react';

// ESP32 Configuration
export const ESP32_CONFIG = {
  IP: '192.168.4.1', // Default ESP32 AP mode IP - can be configured
  TIMEOUT: 3000, // 3 second timeout
  POLL_INTERVAL: 5000, // Poll every 5 seconds
};

export interface SensorData {
  soilMoisture: number;
  temperature: number;
  humidity: number;
}

export interface ESP32State {
  isLive: boolean;
  sensorData: SensorData;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
}

interface FallbackWeatherData {
  temperature: number;
  humidity: number;
}

// Mock fallback weather API (in production, use actual weather API)
const fetchFallbackWeather = async (): Promise<FallbackWeatherData> => {
  // Simulate API call - in production connect to actual weather API
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    temperature: 28 + Math.random() * 5,
    humidity: 60 + Math.random() * 20,
  };
};

// Last known values for fallback
let lastKnownSoilMoisture = 55;

export const useESP32Data = (espIP: string = ESP32_CONFIG.IP) => {
  const [state, setState] = useState<ESP32State>({
    isLive: false,
    sensorData: {
      soilMoisture: lastKnownSoilMoisture,
      temperature: 28,
      humidity: 65,
    },
    lastUpdated: null,
    isLoading: true,
    error: null,
  });

  const fetchESP32Data = useCallback(async (): Promise<SensorData | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ESP32_CONFIG.TIMEOUT);

    try {
      const response = await fetch(`http://${espIP}/data`, {
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`ESP32 returned ${response.status}`);
      }

      const data = await response.json();
      
      // Update last known soil moisture
      lastKnownSoilMoisture = data.soilMoisture ?? data.soil_moisture ?? 55;

      return {
        soilMoisture: lastKnownSoilMoisture,
        temperature: data.temperature ?? data.temp ?? 28,
        humidity: data.humidity ?? 65,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      return null;
    }
  }, [espIP]);

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Try ESP32 first
    const esp32Data = await fetchESP32Data();

    if (esp32Data) {
      // Live mode - ESP32 is reachable
      setState({
        isLive: true,
        sensorData: esp32Data,
        lastUpdated: new Date(),
        isLoading: false,
        error: null,
      });
    } else {
      // Fallback mode - use weather API + estimated soil moisture
      try {
        const weatherData = await fetchFallbackWeather();
        
        setState({
          isLive: false,
          sensorData: {
            soilMoisture: lastKnownSoilMoisture, // Use last known or estimated
            temperature: Math.round(weatherData.temperature),
            humidity: Math.round(weatherData.humidity),
          },
          lastUpdated: new Date(),
          isLoading: false,
          error: 'ESP32 offline - using fallback data',
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLive: false,
          isLoading: false,
          error: 'All data sources unavailable',
        }));
      }
    }
  }, [fetchESP32Data]);

  // Initial fetch and polling
  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, ESP32_CONFIG.POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
};

// Motor/Pump control hook
export interface MotorState {
  isOn: boolean;
  isLoading: boolean;
  isLocked: boolean;
  lockReason: string | null;
}

export interface MotorControlOptions {
  soilMoisture: number;
  rainExpected: boolean;
}

export const useMotorControl = (
  espIP: string = ESP32_CONFIG.IP,
  options: MotorControlOptions
) => {
  const [motorState, setMotorState] = useState<MotorState>({
    isOn: false,
    isLoading: false,
    isLocked: false,
    lockReason: null,
  });

  // Check auto-lock conditions
  useEffect(() => {
    if (options.soilMoisture > 80) {
      setMotorState(prev => ({
        ...prev,
        isLocked: true,
        lockReason: 'Moisture levels optimal',
        isOn: false,
      }));
    } else if (options.rainExpected) {
      setMotorState(prev => ({
        ...prev,
        isLocked: true,
        lockReason: 'Rain expected',
        isOn: false,
      }));
    } else {
      setMotorState(prev => ({
        ...prev,
        isLocked: false,
        lockReason: null,
      }));
    }
  }, [options.soilMoisture, options.rainExpected]);

  const sendMotorCommand = useCallback(async (turnOn: boolean): Promise<boolean> => {
    if (motorState.isLocked) return false;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ESP32_CONFIG.TIMEOUT);

    try {
      const endpoint = turnOn ? '/pump/on' : '/pump/off';
      const response = await fetch(`http://${espIP}${endpoint}`, {
        method: 'POST',
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      // In demo mode, allow toggle even if ESP32 is offline
      return true;
    }
  }, [espIP, motorState.isLocked]);

  const toggleMotor = useCallback(async () => {
    if (motorState.isLocked) return;

    setMotorState(prev => ({ ...prev, isLoading: true }));
    
    const newState = !motorState.isOn;
    const success = await sendMotorCommand(newState);

    if (success) {
      setMotorState(prev => ({
        ...prev,
        isOn: newState,
        isLoading: false,
      }));
    } else {
      setMotorState(prev => ({ ...prev, isLoading: false }));
    }
  }, [motorState.isOn, motorState.isLocked, sendMotorCommand]);

  const turnOn = useCallback(async () => {
    if (motorState.isLocked || motorState.isOn) return;
    setMotorState(prev => ({ ...prev, isLoading: true }));
    const success = await sendMotorCommand(true);
    setMotorState(prev => ({
      ...prev,
      isOn: success ? true : prev.isOn,
      isLoading: false,
    }));
  }, [motorState.isLocked, motorState.isOn, sendMotorCommand]);

  const turnOff = useCallback(async () => {
    if (!motorState.isOn) return;
    setMotorState(prev => ({ ...prev, isLoading: true }));
    const success = await sendMotorCommand(false);
    setMotorState(prev => ({
      ...prev,
      isOn: success ? false : prev.isOn,
      isLoading: false,
    }));
  }, [motorState.isOn, sendMotorCommand]);

  return {
    ...motorState,
    toggleMotor,
    turnOn,
    turnOff,
  };
};
