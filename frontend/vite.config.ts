import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from project root
  const projectRoot = path.resolve(__dirname, '..')
  
  // Check if environment files exist
  const envFile = mode === 'production' ? '.env.production' : '.env.development'
  const envFilePath = path.join(projectRoot, envFile)
  const baseEnvPath = path.join(projectRoot, '.env')
  
  const envFileExists = fs.existsSync(envFilePath)
  const baseEnvExists = fs.existsSync(baseEnvPath)
  
  // Load environment variables with fallback strategy
  let env: Record<string, string> = {}
  
  if (envFileExists) {
    console.log(`✅ Loading environment from: ${envFile} (mode: ${mode})`)
    env = loadEnv(mode, projectRoot, '')
  } else if (baseEnvExists) {
    console.log(`⚠️  Environment file ${envFile} not found, loading from .env (mode: ${mode})`)
    env = loadEnv(mode, projectRoot, '')
  } else {
    console.log(`⚠️  No environment files found, using system environment variables (mode: ${mode})`)
    // Use system environment variables as fallback
    env = {
      FRONTEND_PORT: process.env.FRONTEND_PORT || '5173',
      VITE_API_URL: process.env.VITE_API_URL || (mode === 'production' ? 'http://api:3000' : 'http://localhost:3000'),
    }
  }
  
  // Merge with any existing system environment variables (system env takes precedence)
  const mergedEnv = {
    ...env,
    ...Object.fromEntries(
      Object.entries(process.env).filter(([key]) => key.startsWith('VITE_'))
    )
  }
  
  return {
    plugins: [react()],
    envDir: projectRoot,
    server: {
      port: parseInt(mergedEnv.FRONTEND_PORT || '5173'),
      host: true,
      strictPort: true,
    },
    preview: {
      port: 8080,
      host: '0.0.0.0',
      strictPort: true,
    },
    // Define any additional environment variables that should be exposed to the client
    define: {
      // Make sure NODE_ENV is available in the client
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Expose environment loading strategy info
      '__ENV_LOADING_STRATEGY__': JSON.stringify({
        mode,
        envFileExists,
        baseEnvExists,
        envFile,
        usingSystemEnv: !envFileExists && !baseEnvExists
      })
    },
  }
})
