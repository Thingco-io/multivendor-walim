const ENV_CONFIG = {
  development: {
    GRAPHQL_URL: "https://server.thingco.io/graphql",
      WS_GRAPHQL_URL: "wss://server.thingco.io/graphql",
    SERVER_URL: 'https://server.thingco.io/graphql',
    SERVER_REST_URL: 'https://server.thingco.io/',
    GOOGLE_MAPS_API_KEY: 'AIzaSyCcm7_Wd7uvmC9YnYLu2JHGWPt6z1MaL1E',
    CLARITY_ENABLED: false
  },
  staging: {
   GRAPHQL_URL: "https://server.thingco.io/graphql",
      WS_GRAPHQL_URL: "wss://server.thingco.io/graphql",
    SERVER_URL: 'https://server.thingco.io/graphql',
    SERVER_REST_URL: 'https://server.thingco.io/',
    GOOGLE_MAPS_API_KEY: 'AIzaSyCcm7_Wd7uvmC9YnYLu2JHGWPt6z1MaL1E',
    CLARITY_ENABLED: false
  },
  production: {
   GRAPHQL_URL: "https://server.thingco.io/graphql",
      WS_GRAPHQL_URL: "wss://server.thingco.io/graphql",
    SERVER_URL: 'https://server.thingco.io/graphql',
    SERVER_REST_URL: 'https://server.thingco.io/',
    GOOGLE_MAPS_API_KEY: 'AIzaSyCcm7_Wd7uvmC9YnYLu2JHGWPt6z1MaL1E',
    CLARITY_ENABLED: false
  }
}

const normalizeEnvironment = (env) => {
  if (env === 'production' || env === 'staging') return env
  return 'development'
}

const getEnvironmentConfig = (env) => {
  return ENV_CONFIG[normalizeEnvironment(env)]
}

module.exports = {
  ENV_CONFIG,
  getEnvironmentConfig,
  normalizeEnvironment
}
