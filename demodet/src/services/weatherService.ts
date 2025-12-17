interface WeatherData {
  temperature: number;
  location: string;
  aqi: number;
}

interface OpenWeatherResponse {
  main: {
    temp: number;
  };
  name: string;
}

interface AirPollutionResponse {
  list: Array<{
    main: {
      aqi: number;
    };
    components: {
      pm2_5: number;
      pm10: number;
      no2: number;
      o3: number;
    };
  }>;
}

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function getCurrentWeatherData(lat?: number, lon?: number): Promise<WeatherData> {
  try {
    // Check if API key is loaded
    if (!API_KEY) {
      console.error('OpenWeather API key is not set. Please add VITE_OPENWEATHER_API_KEY to your .env file and restart the dev server.');
      throw new Error('API key not configured');
    }

    // If no coordinates provided, get user's location
    if (!lat || !lon) {
      const position = await getUserLocation();
      lat = position.coords.latitude;
      lon = position.coords.longitude;
    }

    console.log('Fetching weather data for:', lat, lon);
    console.log('API Key present:', !!API_KEY);

    // Fetch weather data
    const weatherResponse = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );

    if (!weatherResponse.ok) {
      const errorData = await weatherResponse.text();
      console.error('Weather API error:', weatherResponse.status, errorData);
      throw new Error(`Failed to fetch weather data: ${weatherResponse.status}`);
    }

    const weatherData: OpenWeatherResponse = await weatherResponse.json();

    // Fetch air pollution data
    const airResponse = await fetch(
      `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );

    if (!airResponse.ok) {
      const errorData = await airResponse.text();
      console.error('Air Quality API error:', airResponse.status, errorData);
      throw new Error(`Failed to fetch air quality data: ${airResponse.status}`);
    }

    const airData: AirPollutionResponse = await airResponse.json();

    // Convert OpenWeather AQI (1-5) to US AQI (0-500)
    const aqiValue = convertToUSAQI(airData.list[0]);

    console.log({
      temperature: Math.round(weatherData.main.temp * 10) / 10,
      location: weatherData.name,
      aqi: aqiValue
    })

    return {
      temperature: Math.round(weatherData.main.temp * 10) / 10,
      location: weatherData.name,
      aqi: aqiValue
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return fallback data if API fails
    return {
      temperature: 18.5,
      location: 'Unknown',
      aqi: 145
    };
  }
}

function getUserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

// Convert OpenWeather AQI (1-5 scale) to US AQI (0-500 scale)
function convertToUSAQI(pollution: AirPollutionResponse['list'][0]): number {
  const { pm2_5, pm10, no2, o3 } = pollution.components;

  // Use PM2.5 as primary indicator and convert to US AQI scale
  // OpenWeather gives concentrations in μg/m³
  // Simple conversion formula for demonstration
  const pm25AQI = calculatePM25AQI(pm2_5);
  const pm10AQI = calculatePM10AQI(pm10);

  // Return the highest AQI value
  return Math.round(Math.max(pm25AQI, pm10AQI));
}

function calculatePM25AQI(pm25: number): number {
  // US EPA breakpoints for PM2.5
  if (pm25 <= 12.0) return linearInterpolation(pm25, 0, 12.0, 0, 50);
  if (pm25 <= 35.4) return linearInterpolation(pm25, 12.1, 35.4, 51, 100);
  if (pm25 <= 55.4) return linearInterpolation(pm25, 35.5, 55.4, 101, 150);
  if (pm25 <= 150.4) return linearInterpolation(pm25, 55.5, 150.4, 151, 200);
  if (pm25 <= 250.4) return linearInterpolation(pm25, 150.5, 250.4, 201, 300);
  if (pm25 <= 350.4) return linearInterpolation(pm25, 250.5, 350.4, 301, 400);
  return linearInterpolation(pm25, 350.5, 500.4, 401, 500);
}

function calculatePM10AQI(pm10: number): number {
  // US EPA breakpoints for PM10
  if (pm10 <= 54) return linearInterpolation(pm10, 0, 54, 0, 50);
  if (pm10 <= 154) return linearInterpolation(pm10, 55, 154, 51, 100);
  if (pm10 <= 254) return linearInterpolation(pm10, 155, 254, 101, 150);
  if (pm10 <= 354) return linearInterpolation(pm10, 255, 354, 151, 200);
  if (pm10 <= 424) return linearInterpolation(pm10, 355, 424, 201, 300);
  if (pm10 <= 504) return linearInterpolation(pm10, 425, 504, 301, 400);
  return linearInterpolation(pm10, 505, 604, 401, 500);
}

function linearInterpolation(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Real-time sound level detection using Web Audio API
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let microphone: MediaStreamAudioSourceNode | null = null;
let stream: MediaStream | null = null;

export async function initializeMicrophone(): Promise<void> {
  try {
    // Request microphone permission
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    // Create audio context
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 2048;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;

    microphone.connect(analyser);

    console.log('Microphone initialized successfully');
  } catch (error) {
    console.error('Error initializing microphone:', error);
    throw error;
  }
}

export function stopMicrophone(): void {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  if (analyser) {
    analyser.disconnect();
  }
  if (microphone) {
    microphone.disconnect();
  }
  if (audioContext) {
    audioContext.close();
  }

  audioContext = null;
  analyser = null;
  microphone = null;
  stream = null;
}

export function getSoundLevel(): number {
  if (!analyser) {
    return 0;
  }

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  // Calculate RMS (Root Mean Square) value
  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i] * dataArray[i];
  }
  const rms = Math.sqrt(sum / bufferLength);

  // Convert to decibels (approximate)
  // Reference: 0 dB = threshold of hearing, 120 dB = threshold of pain
  // This is a simplified conversion for display purposes
  const db = 20 * Math.log10(rms / 255) + 90;

  // Clamp between realistic values (30-130 dB)
  return Math.max(30, Math.min(130, Math.round(db)));
}

export function isMicrophoneActive(): boolean {
  return audioContext !== null && analyser !== null;
}
