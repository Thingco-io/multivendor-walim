/*****************************
 * environment.js
 * path: '/environment.js' (root of your project)
 ******************************/

import * as Updates from "expo-updates";
import { useContext } from "react";
import { ConfigurationContext } from "./lib/context/global/configuration.context";

const getEnvVars = (env = Updates.channel) => {
  const configuration = useContext(ConfigurationContext);

  if (env === "production" || env === "staging") {
    return {
      GRAPHQL_URL: "https://server.thingco.io/graphql",
      WS_GRAPHQL_URL: "wss://server.thingco.io/graphql",
    };
  }
  return {
   
      GRAPHQL_URL: "https://server.thingco.io/graphql",
      WS_GRAPHQL_URL: "wss://server.thingco.io/graphql",


  };
};

export default getEnvVars;
