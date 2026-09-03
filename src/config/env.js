const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  appName: process.env.APP_NAME || "VentureRoot Backend",

  appUrl: process.env.APP_URL || "http://localhost:3000",

  apiPrefix: process.env.API_PREFIX || "/api/v1",
};

export default env;

