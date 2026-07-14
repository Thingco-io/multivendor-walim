// /*****************************
//  * environment.js
//  * path: '/environment.js' (root of your project)
//  ******************************/

import { useContext } from 'react'
import ConfigurationContext from './src/context/Configuration'
import * as Updates from 'expo-updates'
const { getEnvironmentConfig } = require('./environment.config')

const useEnvVars = (env = Updates.channel) => {
  const configuration = useContext(ConfigurationContext)
  const sharedConfig = getEnvironmentConfig(env)

  return {
    ...sharedConfig,
    IOS_CLIENT_ID_GOOGLE: configuration?.iOSClientID,
    ANDROID_CLIENT_ID_GOOGLE: configuration?.androidClientID,
    AMPLITUDE_API_KEY: configuration?.appAmplitudeApiKey,
    GOOGLE_MAPS_KEY: configuration?.googleApiKey || sharedConfig.GOOGLE_MAPS_API_KEY,
    EXPO_CLIENT_ID: configuration?.expoClientID,
    SENTRY_DSN: configuration?.customerAppSentryUrl ?? 'https://5f1f7a25ce06c00a087cb35914c7611a@o4511706525794304.ingest.de.sentry.io/4511733050507344',
    TERMS_AND_CONDITIONS: configuration?.termsAndConditions,
    PRIVACY_POLICY: configuration?.privacyPolicy,
    TEST_OTP: configuration?.testOtp,
    GOOGLE_PACES_API_BASE_URL: configuration?.googlePlacesApiBaseUrl
  }
}

export default useEnvVars
