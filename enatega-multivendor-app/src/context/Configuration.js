import React from 'react'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'

import { getConfiguration } from '../apollo/queries'

const GETCONFIGURATION = gql`
  ${getConfiguration}
`

const ConfigurationContext = React.createContext({})

export const ConfigurationProvider = props => {
  const { loading, data, error } = useQuery(GETCONFIGURATION)

  const WEB_CLIENT_ID = '182812840340-vvp8ccmldq7ukkkclrppft60q2gh2drd.apps.googleusercontent.com';
  const ANDROID_CLIENT_ID = '182812840340-1an9np5u0i1svfo4otdm5c8j6j9i070i.apps.googleusercontent.com';
  const IOS_CLIENT_ID = '182812840340-kgcb4880ufn2bg5vgr3gk04qbctske6q.apps.googleusercontent.com';

  const configuration =
    loading || error || !data?.configuration
      ? {
          currency: '',
          currencySymbol: '',
          deliveryRate: 10,
          costType: 'perKM',
          expoClientID: WEB_CLIENT_ID,
          androidClientID:ANDROID_CLIENT_ID,
          iOSClientID:IOS_CLIENT_ID
        }
      : data?.configuration
  
  return (
    <ConfigurationContext.Provider value={configuration}>
      {props?.children}
    </ConfigurationContext.Provider>
  )
}
export const ConfigurationConsumer = ConfigurationContext.Consumer
export default ConfigurationContext
