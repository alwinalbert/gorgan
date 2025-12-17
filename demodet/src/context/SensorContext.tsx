import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface SensorData {
  temperature: number;
  soundLevel: number;
  aqi: number;
}

interface SensorContextType {
  sensorData: SensorData;
  updateTemperature: (temp: number) => void;
  updateSoundLevel: (level: number) => void;
  updateAQI: (aqi: number) => void;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export function SensorProvider({ children }: { children: ReactNode }) {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 18.5,
    soundLevel: 0,
    aqi: 145
  });

  const updateTemperature = useCallback((temp: number) => {
    setSensorData(prev => ({ ...prev, temperature: temp }));
  }, []);

  const updateSoundLevel = useCallback((level: number) => {
    setSensorData(prev => ({ ...prev, soundLevel: level }));
  }, []);

  const updateAQI = useCallback((aqi: number) => {
    setSensorData(prev => ({ ...prev, aqi }));
  }, []);

  return (
    <SensorContext.Provider
      value={{
        sensorData,
        updateTemperature,
        updateSoundLevel,
        updateAQI
      }}
    >
      {children}
    </SensorContext.Provider>
  );
}

export function useSensorContext() {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error('useSensorContext must be used within a SensorProvider');
  }
  return context;
}
