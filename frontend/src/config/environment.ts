/**
 * Environment configuration
 * This file centralizes access to environment variables
 */

// Get environment loading strategy info from build-time
const envLoadingStrategy = typeof __ENV_LOADING_STRATEGY__ !== 'undefined' 
  ? __ENV_LOADING_STRATEGY__ 
  : { mode: 'development', envFileExists: false, baseEnvExists: false, usingSystemEnv: true };

export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
  // Development flags
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  
  // Environment mode
  mode: import.meta.env.MODE,
  
  // Base URL for the application
  baseUrl: import.meta.env.BASE_URL || '/',
  
  // Environment loading strategy
  envLoadingStrategy,
} as const;

// Log configuration in development
if (config.isDevelopment) {
  console.log('🔧 Environment Configuration:', {
    mode: config.mode,
    apiUrl: config.apiUrl,
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction,
    envLoadingStrategy: config.envLoadingStrategy,
  });
}

export default config;
