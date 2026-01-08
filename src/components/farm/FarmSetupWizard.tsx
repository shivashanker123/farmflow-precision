import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wheat, Leaf, Droplets, ArrowRight, ArrowLeft, Check, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FarmSetupWizardProps {
  onComplete: (cropType: string, fieldSize: number, tankCapacity: number, farmerName: string) => void;
}

const CROP_OPTIONS = [
  { value: 'wheat', label: 'Wheat', icon: Wheat, waterNeed: '5 mm/day' },
  { value: 'corn', label: 'Corn', icon: Leaf, waterNeed: '7 mm/day' },
  { value: 'tomato', label: 'Tomato', icon: Leaf, waterNeed: '6 mm/day' },
];

const FarmSetupWizard: React.FC<FarmSetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [farmerName, setFarmerName] = useState('');
  const [cropType, setCropType] = useState('');
  const [fieldSize, setFieldSize] = useState('');
  const [tankCapacity, setTankCapacity] = useState('');

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    onComplete(
      cropType,
      parseFloat(fieldSize) || 10,
      parseFloat(tankCapacity) || 50000,
      farmerName || 'Farmer'
    );
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return farmerName.trim().length > 0;
      case 2: return cropType !== '';
      case 3: return fieldSize !== '' && parseFloat(fieldSize) > 0;
      case 4: return tankCapacity !== '' && parseFloat(tankCapacity) > 0;
      default: return false;
    }
  };

  const selectedCrop = CROP_OPTIONS.find(c => c.value === cropType);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 w-full max-w-lg"
      >
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-primary' : s < step ? 'w-2 bg-primary/60' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-foreground">Welcome to FarmFlow</h2>
                  <p className="text-muted-foreground mt-2">Let's set up your farm profile</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmerName">Your Name</Label>
                  <Input
                    id="farmerName"
                    placeholder="Enter your name"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="glass-input h-12"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-foreground">Select Your Crop</h2>
                  <p className="text-muted-foreground mt-2">We'll calculate water needs based on crop type</p>
                </div>
                <div className="space-y-2">
                  <Label>Crop Type</Label>
                  <Select value={cropType} onValueChange={setCropType}>
                    <SelectTrigger className="glass-input h-12">
                      <SelectValue placeholder="Select a crop" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-border">
                      {CROP_OPTIONS.map((crop) => (
                        <SelectItem key={crop.value} value={crop.value}>
                          <div className="flex items-center gap-3">
                            <crop.icon className="w-4 h-4 text-primary" />
                            <span>{crop.label}</span>
                            <span className="text-muted-foreground text-sm">({crop.waterNeed})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCrop && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-primary mt-2"
                    >
                      Water requirement: {selectedCrop.waterNeed}
                    </motion.p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 border-2 border-primary rounded" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-foreground">Field Size</h2>
                  <p className="text-muted-foreground mt-2">How large is your irrigation area?</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldSize">Field Size (Acres)</Label>
                  <Input
                    id="fieldSize"
                    type="number"
                    placeholder="e.g., 10"
                    value={fieldSize}
                    onChange={(e) => setFieldSize(e.target.value)}
                    className="glass-input h-12"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Droplets className="w-8 h-8 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-foreground">Water Source</h2>
                  <p className="text-muted-foreground mt-2">What's your total water tank capacity?</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tankCapacity">Tank Capacity (Liters)</Label>
                  <Input
                    id="tankCapacity"
                    type="number"
                    placeholder="e.g., 50000"
                    value={tankCapacity}
                    onChange={(e) => setTankCapacity(e.target.value)}
                    className="glass-input h-12"
                  />
                  {tankCapacity && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-muted-foreground mt-2"
                    >
                      {(parseFloat(tankCapacity) / 1000).toFixed(1)} m³ capacity
                    </motion.p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className="btn-active"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="btn-active bg-primary hover:bg-primary/90"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!isStepValid()}
              className="btn-active bg-primary hover:bg-primary/90"
            >
              <Check className="w-4 h-4 mr-2" />
              Start Farming
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FarmSetupWizard;
