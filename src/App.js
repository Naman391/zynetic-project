import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('Noida');
  const [searchHistory, setSearchHistory] = useState([]);
  const [theme, setTheme] = useState('light');
  const API_KEY = 'YOUR_API_KEY';
  const [forecastData, setForecastData] = useState(null);

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.REACT_APP_API_KEY}&units=metric`
      );
      if (!response.ok) throw new Error('City not found');
      const data = await response.json();
      setWeatherData(data);

      setSearchHistory((prev) => {
        const newHistory = [cityName, ...prev.filter((item) => item !== cityName)].slice(0, 5);
        return newHistory;
      });

      await fetchForecast(cityName);
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (cityName) => {
    try {
      const coordResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.REACT_APP_API_KEY || API_KEY}`
      );
      if (!coordResponse.ok) throw new Error('City not found');
      const coordData = await coordResponse.json();
      const { lat, lon } = coordData.coord;

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.REACT_APP_API_KEY || API_KEY}&units=metric`
      );
      if (!forecastResponse.ok) throw new Error('Forecast not found');
      const forecastJson = await forecastResponse.json();

      const dailyForecast = forecastJson.list.reduce((acc, item) => {
        const date = new Date(item.dt_txt).toLocaleDateString();
        if (!acc[date]) acc[date] = item;
        return acc;
      }, {});

      setForecastData(Object.values(dailyForecast).slice(0, 5));
    } catch (err) {
      console.error('Error fetching forecast:', err);
      setForecastData(null);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city.trim());
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`App ${theme}`}>
      <header className="App-header">
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
        <h1>Weather Dashboard</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
          />
          <button type="submit">Search</button>
        </form>

        {loading && <p>Loading weather data...</p>}
        {error && <p className="error">{error}</p>}

        {weatherData && (
          <div className="weather-card">
            <h2>
              {weatherData.name}, {weatherData.sys.country}
            </h2>
            <div className="weather-main">
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt={weatherData.weather[0].description}
              />
              <div>
                <p className="temp">{Math.round(weatherData.main.temp)}°C</p>
                <p>{weatherData.weather[0].main}</p>
              </div>
            </div>
            <div className="weather-details">
              <p>Humidity: {weatherData.main.humidity}%</p>
              <p>Wind: {weatherData.wind.speed} km/h</p>
              <p>Feels like: {Math.round(weatherData.main.feels_like)}°C</p>
            </div>
          </div>
        )}

        {forecastData && (
          <div className="forecast-section">
            <h3>5-Day Forecast</h3>
            <div className="forecast-grid">
              {forecastData.map((item, index) => (
                <div key={index} className="forecast-card">
                  <p>
                    {new Date(item.dt_txt).toLocaleString([], {
                      weekday: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <img
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                    alt={item.weather[0].description}
                  />
                  <p>{Math.round(item.main.temp)}°C</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchHistory.length > 0 && (
          <div className="search-history">
            <h3>Recent Searches:</h3>
            <ul>
              {searchHistory.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setCity(item);
                    fetchWeather(item);
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;