# HazardGuard Nepal – AI-Powered Disaster Awareness Platform

HazardGuard Nepal is a comprehensive disaster awareness and preparedness website designed for Nepal. It provides real‑time alerts for weather, air quality, floods, and earthquakes, along with an interactive risk map, emergency contacts, and a smart AI chatbot powered by OpenAI's ChatGPT.


## Features

- **Real‑time Data**
  - Weather: current temperature, humidity, wind speed, and conditions (OpenWeatherMap).
  - Air Quality: AQI, PM2.5, and health advisories (IQAir).
  - Earthquakes: recent seismic events in Nepal (USGS).
  - Flood alerts: mock data for all 77 districts (ready to integrate with official API).
- **Interactive Risk Map** (Leaflet)
  - Visualize earthquake, flood, and landslide risk zones.
  - Click markers to view district‑specific weather.
  - Toggle layers to focus on specific hazards.
- **District‑specific Alert Cards**
  - Dynamic risk levels (high/medium/low) based on geographical data.
  - Click any card to see detailed preparedness actions.
- **Emergency Contacts**
  - One‑click call buttons for police (100), fire (101), ambulance (102), and disaster helpline (1133).
- **AI Chatbot** (OpenAI GPT‑3.5)
  - Ask about weather, air quality, flood status, earthquake risks, or high‑risk landslide areas.
  - General questions are answered by ChatGPT; fallback rule‑based system ensures smart replies even if OpenAI fails.
  - Supports all 77 districts – e.g., "air quality in Bhaktapur" returns real or estimated AQI.

## Tech Stack

- **Frontend**: HTML5, CSS3 (custom design with CSS variables, responsive), JavaScript (ES6)
- **Maps**: Leaflet.js with OpenStreetMap tiles and geocoder
- **APIs**:
  - OpenWeatherMap (weather)
  - IQAir (air quality)
  - USGS Earthquake Hazards Program (earthquakes)
  - OpenAI (ChatGPT)
- **CORS Proxy**: `corsproxy.io` (required to use OpenAI directly from browser; for production, move to a backend)
- **Icons**: Font Awesome 5

## File Structure
