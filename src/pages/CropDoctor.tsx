import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Leaf, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useFarm } from '@/contexts/FarmContext';
import ChatWidget from '@/components/farm/ChatWidget';

const CropDoctor = () => {
  const { farmData } = useFarm();

  const getHealthStatus = () => {
    if (farmData.soilMoisture < 30) return 'critical';
    if (farmData.soilMoisture < 50) return 'warning';
    return 'healthy';
  };

  const healthStatus = getHealthStatus();

  const recommendations = [
    {
      condition: farmData.soilMoisture < 30,
      title: 'Immediate Irrigation Needed',
      description: 'Soil moisture is critically low. Irrigate within the next 2 hours to prevent crop stress.',
      severity: 'critical',
    },
    {
      condition: farmData.soilMoisture >= 30 && farmData.soilMoisture < 50,
      title: 'Monitor Closely',
      description: 'Soil moisture is below optimal. Plan irrigation within the next 24 hours.',
      severity: 'warning',
    },
    {
      condition: farmData.soilMoisture >= 50 && farmData.soilMoisture < 80,
      title: 'Optimal Conditions',
      description: 'Your crop is receiving adequate moisture. Continue monitoring.',
      severity: 'success',
    },
    {
      condition: farmData.soilMoisture >= 80,
      title: 'Moisture High',
      description: 'Soil is well saturated. Skip next irrigation cycle to prevent overwatering.',
      severity: 'info',
    },
  ];

  const activeRecommendation = recommendations.find(r => r.condition);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* AI Crop Consultant Chat */}
        <ChatWidget />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold text-foreground">Crop Doctor</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered crop health analysis and recommendations
          </p>
        </motion.div>

        {/* Health Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`glass-card p-8 hover-lift border-l-4 ${
            healthStatus === 'critical' ? 'border-l-destructive' :
            healthStatus === 'warning' ? 'border-l-warning' : 'border-l-success'
          }`}
        >
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
              healthStatus === 'critical' ? 'bg-destructive/10' :
              healthStatus === 'warning' ? 'bg-warning/10' : 'bg-success/10'
            }`}>
              <Leaf className={`w-10 h-10 ${
                healthStatus === 'critical' ? 'text-destructive' :
                healthStatus === 'warning' ? 'text-warning' : 'text-success'
              }`} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground capitalize">
                {farmData.cropType} Health: {healthStatus}
              </h2>
              <p className="text-muted-foreground mt-1">
                Based on soil moisture ({farmData.soilMoisture}%) and water budget analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Active Recommendation */}
        {activeRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 hover-lift"
          >
            <div className="flex items-start gap-4">
              {activeRecommendation.severity === 'critical' && (
                <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
              )}
              {activeRecommendation.severity === 'warning' && (
                <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
              )}
              {activeRecommendation.severity === 'success' && (
                <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-1" />
              )}
              {activeRecommendation.severity === 'info' && (
                <Info className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              )}
              <div>
                <h3 className="text-lg font-display font-bold text-foreground">
                  {activeRecommendation.title}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {activeRecommendation.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tips Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-4"
        >
          {[
            { title: 'Optimal Moisture Range', value: '50-70%', description: `Ideal for ${farmData.cropType}` },
            { title: 'Daily Water Need', value: `${farmData.dailyWaterNeed} mm`, description: 'Based on crop type' },
            { title: 'Growth Stage', value: 'Day 45', description: 'Vegetative phase' },
            { title: 'Next Action', value: healthStatus === 'healthy' ? 'Monitor' : 'Irrigate', description: 'Recommended action' },
          ].map((tip) => (
            <div key={tip.title} className="glass-card p-4 hover-lift">
              <p className="text-sm text-muted-foreground">{tip.title}</p>
              <p className="text-xl font-display font-bold text-foreground mt-1">{tip.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default CropDoctor;
