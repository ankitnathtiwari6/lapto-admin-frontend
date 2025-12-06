type Environment = "development" | "production";

const config: Record<
  Environment,
  {
    apiUrl: string;
    appUrl: string;
    enableLogging: boolean;
    features: {
      darkMode: boolean;
      analytics: boolean;
    };
  }
> = {
  development: {
    apiUrl: "http://localhost:5000/api",
    appUrl: "http://localhost:5173",
    enableLogging: true,
    features: {
      darkMode: true,
      analytics: false,
    },
  },
  production: {
    apiUrl: import.meta.env.VITE_API_URL || "https://api.mylapto.com/api",
    appUrl: import.meta.env.VITE_APP_URL || "https://mylapto.com",
    enableLogging: false,
    features: {
      darkMode: true,
      analytics: true,
    },
  },
};

const isDev = import.meta.env.MODE === "development";
const mode: Environment = isDev ? "development" : "production";

export const currentConfig = config[mode];

export default currentConfig;
