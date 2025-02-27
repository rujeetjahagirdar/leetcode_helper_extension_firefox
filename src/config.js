// src/config.js
const config = {
  // Use an environment variable if available, otherwise fall back to a default value
  apiEndpoint: process.env.REACT_APP_API_ENDPOINT || "http://localhost:5000/solve"
};

export default config;
