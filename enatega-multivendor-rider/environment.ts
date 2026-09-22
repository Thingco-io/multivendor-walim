import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import * as Updates from "expo-updates";
import { useContext } from "react";
import { ConfigurationContext } from "./lib/context/global/configuration.context";
const getEnvVars = (env = Updates.channel) => {
  const configuration = useContext(ConfigurationContext);
  if (__DEV__) {
    loadDevMessages();
    loadErrorMessages();
  }
  if (!__DEV__) {
    return {
      GRAPHQL_URL: "https://server.thingco.io/graphql",
      WS_GRAPHQL_URL: "wss://server.thingco.io/graphql",
      SENTRY_DSN:
        configuration?.riderAppSentryUrl ??
        "https://6489fc549ffef8174011164edea79bf2@o4511706525794304.ingest.de.sentry.io/4511733049458768",
      GOOGLE_MAPS_KEY: configuration?.googleApiKey,
      ENVIRONMENT: "production",
    };
  }

  return {
     GRAPHQL_URL: "https://server.thingco.io/graphql",
      WS_GRAPHQL_URL: "wss://server.thingco.io/graphql",
    SENTRY_DSN:
      configuration?.riderAppSentryUrl ??
       "https://6489fc549ffef8174011164edea79bf2@o4511706525794304.ingest.de.sentry.io/4511733049458768",
    GOOGLE_MAPS_KEY: configuration?.googleApiKey,
    ENVIRONMENT: "development",
  };
};

export default getEnvVars;
