// Global type definitions for environment variables

declare global {
  const __ENV_LOADING_STRATEGY__: {
    mode: string;
    envFileExists: boolean;
    baseEnvExists: boolean;
    envFile: string;
    usingSystemEnv: boolean;
  };
}

export {};
