const requiredForProduction = ['MONGODB_URI', 'JWT_SECRET', 'FRONTEND_URL'];
const allowedNodeEnvs = new Set(['development', 'test', 'production']);

function parseNumber(value, fallback) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function validateUrl(value, label) {
  if (!value) {
    throw new Error(`${label} is required`);
  }

  try {
    const url = new URL(value);
    if (!url.protocol || !url.hostname) {
      throw new Error(`${label} must be a valid URL`);
    }
    return value;
  } catch {
    throw new Error(`${label} must be a valid URL`);
  }
}

function validateEnv(env = process.env) {
  const config = {
    NODE_ENV: (env.NODE_ENV || 'development').toLowerCase(),
    PORT: parseNumber(env.PORT, 3000),
    JWT_SECRET: env.JWT_SECRET || '',
    MONGODB_URI: env.MONGODB_URI || '',
    FRONTEND_URL: env.FRONTEND_URL || 'http://localhost:5173',
    SESSION_SECRET: env.SESSION_SECRET || env.JWT_SECRET || ''
  };

  if (!allowedNodeEnvs.has(config.NODE_ENV)) {
    throw new Error(`NODE_ENV must be one of: ${Array.from(allowedNodeEnvs).join(', ')}`);
  }

  if (!config.JWT_SECRET || config.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }

  if (!config.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  if (config.NODE_ENV === 'production') {
    for (const key of requiredForProduction) {
      if (!env[key]) {
        throw new Error(`${key} is required in production mode`);
      }
    }

    if (!config.FRONTEND_URL.startsWith('https://')) {
      throw new Error('FRONTEND_URL must use HTTPS in production');
    }

    validateUrl(config.FRONTEND_URL, 'FRONTEND_URL');
  }

  return config;
}

function normalizeConfig(env = process.env) {
  const config = validateEnv(env);

  return {
    ...config,
    isProduction: config.NODE_ENV === 'production',
    isDevelopment: config.NODE_ENV === 'development',
    isTest: config.NODE_ENV === 'test',
    cookieSecure: config.NODE_ENV === 'production',
    corsOrigin: config.FRONTEND_URL,
    serverUrl: config.FRONTEND_URL
  };
}

module.exports = {
  validateEnv,
  normalizeConfig
};
