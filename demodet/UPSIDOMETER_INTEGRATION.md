# Upsidometer Integration Documentation

## Overview
The Upsidometer (VecnaMeter) now dynamically calculates threat levels based on real-time sensor data from Temperature, Sound, and Air Quality sensors.

## Architecture

### Sensor Context
Created a React Context (`SensorContext.tsx`) to share sensor data across components:
- **Temperature** (from OpenWeather API)
- **Sound Level** (from microphone via Web Audio API)
- **AQI** (from OpenWeather Air Pollution API)

### Threat Level Calculation

The Upsidometer calculates a threat score (0-100) based on three sensor inputs:

#### Temperature Contribution (0-33 points)
- **Critical (33 points)**: < 0°C
- **High (25 points)**: > 35°C
- **Warning (20 points)**: < 15°C
- **Normal (5 points)**: 15-35°C

#### Sound Level Contribution (0-33 points)
- **Critical (33 points)**: > 110 dB
- **Warning (20 points)**: > 95 dB
- **Elevated (10 points)**: > 80 dB
- **Normal (0 points)**: ≤ 80 dB

#### AQI Contribution (0-34 points)
- **Critical (34 points)**: > 400
- **Warning (20 points)**: > 250
- **Elevated (10 points)**: > 150
- **Normal (5 points)**: ≤ 150

### Threat Status Levels

Based on the total threat score:
- **0-25**: MINIMAL (Green)
- **26-50**: MODERATE (Yellow)
- **51-75**: HIGH (Orange)
- **76-100**: CRITICAL (Red)

## Component Updates

### 1. SensorContext (`src/context/SensorContext.tsx`)
- Provides global state for sensor data
- Methods: `updateTemperature`, `updateSoundLevel`, `updateAQI`

### 2. TemperatureSensor
- Fetches real temperature from OpenWeather API
- Updates context with temperature data
- Refresh interval: 10 minutes

### 3. SoundTracker
- Uses Web Audio API for real-time microphone input
- Calculates decibel levels from audio frequency data
- Updates context with sound level data
- Update interval: 100ms (real-time)

### 4. AirQualitySensor
- Fetches AQI from OpenWeather Air Pollution API
- Converts PM2.5/PM10 to US AQI scale
- Updates context with AQI data
- Refresh interval: 10 minutes

### 5. VecnaMeter (Upsidometer)
- Consumes sensor data from context
- Calculates dynamic threat level
- Updates visual meter in real-time
- Smooth transitions (700ms)

### 6. Dashboard
- Wrapped with `SensorProvider` to enable context sharing
- All sensor components share data seamlessly

## Example Scenarios

### Scenario 1: Normal Conditions
- Temperature: 20°C → 5 points
- Sound: 65 dB → 0 points
- AQI: 120 → 5 points
- **Total: 10 points = MINIMAL**

### Scenario 2: Warning Conditions
- Temperature: 10°C → 20 points
- Sound: 100 dB → 20 points
- AQI: 280 → 20 points
- **Total: 60 points = HIGH**

### Scenario 3: Critical Conditions
- Temperature: -5°C → 33 points
- Sound: 115 dB → 33 points
- AQI: 450 → 34 points
- **Total: 100 points = CRITICAL**

## Visual Feedback

The Upsidometer provides:
1. **Gradient bar**: Green → Yellow → Orange → Red
2. **Status label**: MINIMAL, MODERATE, HIGH, CRITICAL
3. **Percentage display**: Real-time threat score
4. **Smooth animations**: 700ms transition duration
5. **Color-coded text**: Matches threat level

## Benefits

1. **Real-time monitoring**: Immediate feedback from actual sensor data
2. **Multi-factor analysis**: Combines environmental factors for accurate assessment
3. **Dynamic thresholds**: Weighted scoring system based on severity
4. **Visual clarity**: Color-coded system easy to understand at a glance
5. **Scalable**: Easy to add more sensors or adjust weights

## Future Enhancements

- Add camera-based threat detection (Demogorgon AI)
- Include radiation sensor
- Add motion detection
- Historical trend analysis
- Alert notifications when crossing thresholds
