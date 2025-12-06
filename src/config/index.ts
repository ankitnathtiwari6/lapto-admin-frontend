const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  environment: import.meta.env.MODE || 'development',
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
};

export default config;
