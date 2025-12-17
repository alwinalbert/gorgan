# OpenWeather API Setup Guide

This application uses the OpenWeather API to fetch real-time weather data, temperature, and air quality information.

## Setup Instructions

### 1. Get Your API Key

1. Go to [OpenWeather API](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to your API keys section
4. Copy your API key

### 2. Configure Environment Variables

1. Create a `.env` file in the `demodet` directory (same level as `package.json`)
2. Add your API key:

```env
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

**Important:**
- Replace `your_api_key_here` with your actual API key
- Never commit the `.env` file to version control (it's already in `.gitignore`)

### 3. API Features Used

The application uses the following OpenWeather API endpoints:

#### Current Weather API
- **Endpoint:** `/data/2.5/weather`
- **Purpose:** Get real-time temperature and location
- **Update Frequency:** Every 10 minutes

#### Air Pollution API
- **Endpoint:** `/data/2.5/air_pollution`
- **Purpose:** Get air quality index (AQI) data
- **Update Frequency:** Every 10 minutes

### 4. Data Mapping

The application converts OpenWeather data to match the UI requirements:

- **Temperature:** Direct mapping from API (Celsius)
- **Location:** City name from weather API
- **AQI:** Converted from OpenWeather's PM2.5 and PM10 values to US AQI scale (0-500)

### 5. Geolocation

The app requests user's location permission to:
- Automatically fetch weather data for the user's current location
- Update temperature and AQI based on local conditions

### 6. Fallback Behavior

If the API fails or the API key is missing:
- Temperature defaults to 18.5°C
- AQI defaults to 145
- Location shows "Unknown"
- Sound level uses simulated data (requires microphone API implementation)

### 7. Free Tier Limits

OpenWeather Free Plan includes:
- 1,000 API calls per day
- 60 calls per minute
- Current weather data
- Air pollution data

With updates every 10 minutes, the app makes approximately:
- ~144 calls per day for weather
- ~144 calls per day for air quality
- **Total: ~288 calls per day** (well within free tier)

### 8. Testing

After setup, you should see:
1. Real temperature data for your location
2. Your city name displayed
3. Real AQI values
4. Status badges (NORMAL/WARNING/CRITICAL) based on actual conditions

### 9. Future Enhancements

**Sound Level Detection:**
Currently simulated. To implement real sound detection:
- Use Web Audio API with `navigator.mediaDevices.getUserMedia()`
- Implement audio level analysis
- Update `getSoundLevel()` function in `weatherService.ts`

## Troubleshooting

### API Key Issues
- Verify your API key is correct
- Check that the key is active (new keys may take a few minutes)
- Ensure the `.env` file is in the correct directory

### No Data Showing
- Check browser console for errors
- Verify geolocation permission is granted
- Ensure you're connected to the internet

### CORS Errors
- OpenWeather API should work directly from the browser
- If issues persist, check your API key permissions
