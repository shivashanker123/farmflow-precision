import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TrafficLightIndicator from '@/components/farm/TrafficLightIndicator';
import SoilMoistureGauge from '@/components/farm/SoilMoistureGauge';
import SwipeToIrrigate from '@/components/farm/SwipeToIrrigate';
import { useFarm } from '@/contexts/FarmContext';
import { Calendar, Sun, Cloud, Thermometer, MapPin, Navigation, Edit3, Loader2, Check, X, CloudRain, CloudSnow, CloudLightning, CloudFog, Wind } from 'lucide-react';

// WorldWeatherOnline API configuration
const WEATHER_API_KEY = '6c18236020184628a3d121913261001';
const WEATHER_BASE_URL = 'https://api.worldweatheronline.com/premium/v1/weather.ashx';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  icon: string;
}

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

  // Location state
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Weather state
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    icon: '02d',
  });
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Fetch weather data when location changes
  useEffect(() => {
    const fetchWeather = async () => {
      if (!userLocation) {
        console.log('No user location set yet');
        return;
      }

      console.log('Fetching weather for location:', userLocation);
      setWeatherLoading(true);
      setWeatherError(null);

      // WorldWeatherOnline API URL
      const url = `${WEATHER_BASE_URL}?key=${WEATHER_API_KEY}&q=${userLocation.lat},${userLocation.lng}&format=json&num_of_days=1`;
      console.log('Weather API URL:', url);

      try {
        const response = await fetch(url);
        console.log('API Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Weather data received:', data);

        // Check if API returned an error
        if (data.data?.error) {
          throw new Error(data.data.error[0]?.msg || 'API Error');
        }

        // Parse WorldWeatherOnline response format
        const current = data.data.current_condition[0];
        const newWeatherData = {
          temperature: parseInt(current.temp_C),
          condition: current.weatherDesc[0].value,
          humidity: parseInt(current.humidity),
          icon: current.weatherCode, // WorldWeatherOnline uses weather codes
        };

        console.log('Setting weather data:', newWeatherData);
        setWeatherData(newWeatherData);
      } catch (error) {
        console.error('Weather fetch error:', error);
        setWeatherError('Failed to load weather');
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [userLocation]);

  // Auto-detect location on component mount
  useEffect(() => {
    console.log('Attempting auto-location detection...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Auto-location success:', position.coords);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Auto-location failed:', error.message);
        }
      );
    }
  }, []);

  // Get weather icon component based on condition
  const getWeatherIcon = () => {
    const iconCode = weatherData.icon;
    const isDay = iconCode.includes('d');

    if (iconCode.startsWith('01')) return <Sun className="w-5 h-5 text-warning" />;
    if (iconCode.startsWith('02') || iconCode.startsWith('03') || iconCode.startsWith('04'))
      return <Cloud className="w-5 h-5 text-muted-foreground" />;
    if (iconCode.startsWith('09') || iconCode.startsWith('10'))
      return <CloudRain className="w-5 h-5 text-secondary" />;
    if (iconCode.startsWith('11')) return <CloudLightning className="w-5 h-5 text-warning" />;
    if (iconCode.startsWith('13')) return <CloudSnow className="w-5 h-5 text-blue-300" />;
    if (iconCode.startsWith('50')) return <CloudFog className="w-5 h-5 text-muted-foreground" />;

    return isDay ? <Sun className="w-5 h-5 text-warning" /> : <Cloud className="w-5 h-5 text-muted-foreground" />;
  };

  // Handle GPS location
  const handleUseGPS = () => {
    setGpsLoading(true);
    setGpsError(null);
    setGpsSuccess(false);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGpsLoading(false);
        setGpsSuccess(true);
        setTimeout(() => {
          setLocationPopoverOpen(false);
          setGpsSuccess(false);
        }, 1500);
      },
      (error) => {
        setGpsError(error.message || 'Failed to get location');
        setGpsLoading(false);
      }
    );
  };

  // Handle manual location submission
  const handleManualSubmit = () => {
    console.log('handleManualSubmit called');
    console.log('manualLat:', manualLat, 'manualLng:', manualLng);

    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    console.log('Parsed values - lat:', lat, 'lng:', lng);

    if (isNaN(lat) || isNaN(lng)) {
      console.log('Invalid coordinates - setting error');
      setGpsError('Please enter valid coordinates');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.log('Coordinates out of range - setting error');
      setGpsError('Coordinates out of range');
      return;
    }

    console.log('Setting user location to:', { lat, lng });
    setUserLocation({ lat, lng });
    setGpsSuccess(true);
    setTimeout(() => {
      setLocationPopoverOpen(false);
      setShowManualInput(false);
      setGpsSuccess(false);
      setManualLat('');
      setManualLng('');
    }, 1500);
  };

  // Reset popover state when closed
  const handlePopoverChange = (open: boolean) => {
    setLocationPopoverOpen(open);
    if (!open) {
      setShowManualInput(false);
      setGpsError(null);
      setGpsSuccess(false);
    }
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

          {/* Weather Widget with Location Button */}
          <div className="flex items-center gap-3">
            <div className={`glass-card px-6 py-3 flex items-center gap-6 transition-opacity duration-300 ${weatherLoading ? 'opacity-70' : ''}`}>
              <div className="flex items-center gap-2">
                {weatherLoading ? (
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                ) : (
                  getWeatherIcon()
                )}
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

            {/* Location Button */}
            <Popover open={locationPopoverOpen} onOpenChange={handlePopoverChange}>
              <PopoverTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`glass-card p-3 hover-lift flex items-center justify-center transition-all duration-300 ${userLocation ? 'ring-2 ring-primary/50' : ''
                    }`}
                  title="Set Location"
                >
                  <MapPin className={`w-5 h-5 ${userLocation ? 'text-primary' : 'text-muted-foreground'}`} />
                </motion.button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0 glass-card border-white/30" align="end" sideOffset={8}>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h4 className="font-display font-semibold text-foreground">Set Location</h4>
                  </div>

                  {/* Current Location Display */}
                  {userLocation && !gpsSuccess && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-muted-foreground bg-accent/50 rounded-lg px-3 py-2"
                    >
                      <span className="font-medium">Current:</span> {userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°
                    </motion.div>
                  )}

                  {/* Success Message */}
                  <AnimatePresence>
                    {gpsSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-2 text-success bg-success/10 rounded-lg px-3 py-2"
                      >
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Location updated!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Message */}
                  <AnimatePresence>
                    {gpsError && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg px-3 py-2"
                      >
                        <X className="w-4 h-4" />
                        <span className="text-sm">{gpsError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!gpsSuccess && (
                    <>
                      {/* GPS Option */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleUseGPS}
                        disabled={gpsLoading}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all duration-300 text-left group disabled:opacity-50"
                      >
                        {gpsLoading ? (
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        ) : (
                          <Navigation className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                        )}
                        <div>
                          <span className="font-medium text-foreground block">Use GPS</span>
                          <span className="text-xs text-muted-foreground">Get current location</span>
                        </div>
                      </motion.button>

                      {/* Manual Input Option */}
                      {!showManualInput ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowManualInput(true)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-all duration-300 text-left group"
                        >
                          <Edit3 className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
                          <div>
                            <span className="font-medium text-foreground block">Enter Manually</span>
                            <span className="text-xs text-muted-foreground">Type coordinates</span>
                          </div>
                        </motion.button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Latitude</label>
                              <Input
                                type="number"
                                placeholder="-90 to 90"
                                value={manualLat}
                                onChange={(e) => setManualLat(e.target.value)}
                                className="h-9 text-sm glass-input"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Longitude</label>
                              <Input
                                type="number"
                                placeholder="-180 to 180"
                                value={manualLng}
                                onChange={(e) => setManualLng(e.target.value)}
                                className="h-9 text-sm glass-input"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowManualInput(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleManualSubmit}
                              className="flex-1 bg-primary hover:bg-primary/90"
                            >
                              Set Location
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
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
