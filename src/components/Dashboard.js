import React, { Suspense, useState, useRef } from "react";
import axios from "axios";
import "../components/Dashboard.css";
import Globe from "./Globe";
import logo from "../assets/not-found.png";
import { Canvas } from "@react-three/fiber";
import Loading from "./Loading";
import * as THREE from 'three';
import { useFrame } from "@react-three/fiber";
import { Stars } from '@react-three/drei';
import Camera from "./Camera";

const Scene = (props) => {
  const lightRef = useRef();
  const date = new Date();
  let dayOfYear = Math.floor(
      (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
  );
  if (dayOfYear > 172) {
      dayOfYear -= (172 + 356) / 2;
      dayOfYear *= -1;
  } else {
      dayOfYear -= 172 / 2;
  }
  let lightAxisAngle = dayOfYear / 5.6275;

  useFrame(() => {
      const time = new Date();
      const seconds =
          3600 * time.getUTCHours() +
          60 * time.getUTCMinutes() +
          time.getUTCSeconds();
      const degree = ((seconds - 43200) / 86400) * 360;
      if (lightRef.current) {
          lightRef.current.position.x =
              -10 * Math.sin(THREE.MathUtils.degToRad(degree));
          lightRef.current.position.z =
              10 * Math.cos(THREE.MathUtils.degToRad(degree));
      }
  });
  return (
      <group>
          <Stars />
          <ambientLight intensity={0.4} />
          <directionalLight
              ref={lightRef}
              position={[10, lightAxisAngle, 0]}
              intensity={1}
          />
          <Camera {...props} />
          <Globe position={[0, 0, 0]} />
      </group>
  );
};

function DashBoard() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);

  const API_KEY = "d832bf1f121bb3fe2fd2dc1a6e3b4523"; 

  const fetchWeatherData = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`, 
      );
      console.log(response);
      setWeatherData(response.data);
      setLat(response.data.coord.lat);
      setLong(response.data.coord.lon);
      setError(null);
    } catch (error) {
      setError("City not found or an error occurred.");
      setWeatherData(null);
    }
  };

  return (
    <>
      <h1 className="weather-header">Weather DashBoard</h1>
      <div className="Search"> 
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchWeatherData}>Get Weather</button>
      </div>

      {error && (
        <div>
          <div className="error">{error}</div>
        </div>
      )}

      <Suspense fallback={<Loading/>}>
          <Canvas style={{ position: 'absolute',top: "0vh",zIndex:'10' }}>
              <Scene lat={lat} lon={long} />
          </Canvas>
      </Suspense>

      {weatherData && (
        <>
          <div className="weather-info">
            <div className="city-name">
              {weatherData.name}, {weatherData.sys.country}
            </div>
            <div className="weather-grid">
              <div className="weather-box temperature-box">
                <h2>Temperature</h2>
                <p>{weatherData.main.temp}°C</p>
              </div>
              <div className="weather-box humidity-box">
                <h2>Humidity</h2>
                <p>{weatherData.main.humidity}%</p>
              </div>
              <div className="weather-box wind-box">
                <h2>Wind Speed</h2>
                <p>{weatherData.wind.speed} m/s</p>
              </div>
              <div className="weather-box condition-box">
                <h2>Weather Condition</h2>
                <p>{weatherData.weather[0].main}</p>
              </div>
            </div>
          </div>
          <img src="textures/location.png" alt="locate-me" className="location"/>
        </>
      )}
    </>
  );
}

export default DashBoard;
