import React, { useState, CSSProperties, useEffect } from "react";

import axios from "axios";

interface Location {
  latitude: number;
  longitude: number;
}

interface WeatherData {
  name: string;
  main: {
    temp: number;
  };
  weather: {
    description: string;
  }[];
}

const ModeSelector: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [confirmMode, setConfirmMode] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const modes = [
    { id: "relax", label: "ゆるゆる日", icon: "😊", color: "#E48B63" },
    { id: "normal", label: "ふつうの日", icon: "😐", color: "#E48B63" },
    { id: "hard", label: "がんばる日", icon: "😤", color: "#E48B63" },
  ];

  const handleModeClick = (modeId: string) => {
    setSelectedMode(modeId);
    setConfirmMode(null);
  };

  const handleConfirmClick = (confirm: boolean) => {
    if (confirm && selectedMode) {
      setConfirmMode(selectedMode);
    } else {
      setSelectedMode(null);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
      },
      (error) => {
        console.error("Geolocation error:", error);
      }
    );
  }, []);
  
  useEffect(() => {
    if (location) {
      const API_KEY = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?lon=${location.longitude}&lat=${location.latitude}&appid=${API_KEY}&lang=ja&units=metric`;
      //const url = `https://api.openweathermap.org/data/2.5/weather?q=Tokyo&appid=${API_KEY}&lang=ja&units=metric`;
      axios
        .get<WeatherData>(url)
        .then((response) => {
          setWeatherData(response.data);
        })
        .catch((error) => {
          console.error("Weather data fetching error:", error);
        });
    }
  }, [location]);

  return (
    <div className="app" style={styles.app}>
      

      <div>
        {weatherData ? (
          <div>
            <div className="weather-container" style={styles.weatherContainer}>
              <div className="weather" style={styles.weather}>
                <div className="weather-info" style={styles.weatherInfo}>
                  <div className="date" style={styles.date}>
                    Sun, 6/9
                  </div>
                  <div className="temperature" style={styles.temperature}>
                    {weatherData.main.temp} °C
                  </div>
                  <div className="location" style={styles.location}> 
                    {weatherData.name} {weatherData.weather[0].description} 
                  </div>
                  <div className="weather-icon">
                    <img src={`https://openweathermap.org/img/wn/${(weatherData.weather[0] as { description: string; icon: string; }).icon}.png`} alt={weatherData.weather[0].description} />
                  </div>
                </div>
                
              </div>
            </div>
            
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    

      <div className="mode-selection" style={styles.modeSelection}>
        <div className="title" style={styles.title}>
          モード選択...
        </div>
        <div className="modes" style={styles.modes}>
          {modes.map((mode) => (
            <div
              key={mode.id}
              className={`mode ${selectedMode === mode.id ? "selected" : ""}`}
              style={{
                ...styles.mode,
                ...(selectedMode === mode.id && {
                  ...styles.selectedMode,
                  backgroundColor: mode.color,
                }),
              }}
              onClick={() => handleModeClick(mode.id)}
            >
              <div className="icon" style={styles.icon}>
                {mode.icon}
              </div>
              <div className="label" style={styles.label}>
                {mode.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!selectedMode ? (
        <div className="greeting" style={styles.greeting}>
          <div className="greeting-text" style={styles.greetingText}>
            GOOD MORNING!
          </div>
          <div className="burger" style={styles.burger}>
            🍔
          </div>
        </div>
      ) : (
        <div className="confirmation" style={styles.confirmation}>
          <div className="confirmation-text" style={styles.confirmationText}>
            {modes.find((mode) => mode.id === selectedMode)?.label}
            モードでいいか？
          </div>
          <div
            className="confirmation-buttons"
            style={styles.confirmationButtons}
          >
            <button
              onClick={() => handleConfirmClick(true)}
              style={styles.button}
            >
              Yes
            </button>
            <button
              onClick={() => handleConfirmClick(false)}
              style={styles.button}
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  app: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    backgroundColor: "#F9ECCB",
    color: "#333",
    minHeight: "calc(100vh - 120px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  weatherContainer: {
    backgroundColor: "#F9ECCB",
    padding: "10px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    width: "100%",
    maxWidth: "500px",
  },
  weather: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  weatherInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  date: {
    fontSize: "14px",
  },
  temperature: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  location: {
    fontSize: "14px",
  },
  weatherIcon: {
    fontSize: "32px",
  },
  modeSelection: {
    marginTop: "20px",
    textAlign: "center",
    width: "100%",
    maxWidth: "500px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  modes: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "10px",
  },
  mode: {
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: "#ccc",
    cursor: "pointer",
    flex: "1",
    margin: "0 5px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  selectedMode: {
    border: "2px solid #333",
  },
  icon: {
    fontSize: "24px",
  },
  label: {
    marginTop: "5px",
    fontSize: "14px",
  },
  greeting: {
    marginTop: "20px",
    textAlign: "center",
  },
  greetingText: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  burger: {
    fontSize: "48px",
    marginTop: "10px",
  },
  confirmation: {
    marginTop: "20px",
    textAlign: "center",
  },
  confirmationText: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  confirmationButtons: {
    marginTop: "10px",
  },
  button: {
    margin: "0 5px",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "8px",
    cursor: "pointer",
    border: "none",
    backgroundColor: "#333",
    color: "#fff",
  },
};

export default ModeSelector;
