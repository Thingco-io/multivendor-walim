import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  CreditCard,
  PaymentConfig,
  PaymentResponse,
  PaymentStatus
} from 'react-native-moyasar-sdk'
import { myOrders } from '../../apollo/queries'
import gql from 'graphql-tag'
import useEnvVars from '../../../environment'
import { useApolloClient } from '@apollo/client'
import UserContext from '../../context/User'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import analytics from '../../utils/analytics'
import { useTranslation } from 'react-i18next'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'

const MYORDERS = gql`
  ${myOrders}
`

function MoyasarCheckout(props) {
  const Analytics = analytics()

  const { SERVER_URL } = useEnvVars()
  // SERVER_URL is the GraphQL endpoint (".../graphql"); the moyasar REST
  // routes live on the same API host, one level up.
  const apiBase = SERVER_URL.replace(/\/graphql\/?$/, '')
  const { t } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const [loading, setLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false)
  const [confirmationTimedOut, setConfirmationTimedOut] = useState(false)
  const { clearCart } = useContext(UserContext)
  const client = useApolloClient()
  const { _id } = props?.route.params

  useLayoutEffect(() => {
    props?.navigation.setOptions({
      headerRight: null,
      title: t('moyasarCheckout')
    })
  }, [props?.navigation])

  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_MOYASAR)
    }
    Track()
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadOrderDetails() {
      try {
        const token = await AsyncStorage.getItem('token')
        const response = await fetch(`${apiBase}/moyasar/order-details?id=${_id}`, {
          headers: token ? { authorization: `Bearer ${token}` } : {}
        })
        const json = await response.json()
        if (!response.ok) throw new Error(json?.error || 'Unable to load payment details')
        if (!cancelled) setOrderDetails(json)
      } catch (error) {
        if (!cancelled) setLoadError(error.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadOrderDetails()
    return () => {
      cancelled = true
    }
  }, [_id])

  async function waitForConfirmedOrder() {
    const maxAttempts = 20

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await client.query({
          query: MYORDERS,
          fetchPolicy: 'network-only'
        })
        const order = result.data.orders.find((item) => item.orderId === _id)

        const isPaidOrder = order && (String(order.paymentStatus).toUpperCase() === 'PAID' || Number(order.paidAmount || 0) > 0)

        if (isPaidOrder) {
          await clearCart()
          props?.navigation.reset({
            routes: [
              { name: 'Main' },
              {
                name: 'OrderDetail',
                params: { _id: order._id }
              }
            ]
          })
          return
        }
      } catch (error) {
        console.log('Moyasar confirmation polling error', error)
      }

      await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    setConfirmationTimedOut(true)
  }

  // Asks the backend to verify the payment with Moyasar (server-side, using
  // the secret key) and finalize the order. This is the native-flow
  // equivalent of what the web checkout's /moyasar/callback redirect used to
  // do - there's no browser here for Moyasar to redirect back through.
  async function confirmPayment(paymentId) {
    setIsConfirmingOrder(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${apiBase}/moyasar/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ orderId: _id, paymentId })
      })
      const json = await response.json()

      if (response.ok && json?.success && json?.orderId) {
        await clearCart()
        props?.navigation.reset({
          routes: [
            { name: 'Main' },
            {
              name: 'OrderDetail',
              params: { _id: json.orderId }
            }
          ]
        })
        return
      }

      if (json?.reason === 'mismatch') {
        setIsConfirmingOrder(false)
        FlashMessage({ message: t('moyasarPaymentIssue'), duration: 3000 })
        props?.navigation.goBack()
        return
      }

      // Confirmation didn't land yet (network hiccup, or the webhook/route
      // raced) - fall back to polling for the order to show up as paid.
      await waitForConfirmedOrder()
    } catch (error) {
      console.log('Moyasar confirm-payment error', error)
      await waitForConfirmedOrder()
    }
  }

  function handlePaymentResult(paymentResult) {
    if (paymentResult instanceof PaymentResponse) {
      if (paymentResult.status === PaymentStatus.paid) {
        confirmPayment(paymentResult.id)
        return
      }
      FlashMessage({ message: t('PaymentNotSuccessfull'), duration: 2000 })
      return
    }

    console.log('Moyasar payment error', paymentResult?.message || paymentResult)
    FlashMessage({ message: t('PaymentNotSuccessfull'), duration: 2000 })
  }

  if (isConfirmingOrder) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: currentTheme.themeBackground }}>
        <ActivityIndicator size='large' color={currentTheme.main} />
        <Text style={{ marginTop: 20, fontSize: 22, fontWeight: '600', textAlign: 'center', color: currentTheme.fontMainColor }}>{confirmationTimedOut ? 'Payment submitted' : 'Confirming your order'}</Text>
        <Text style={{ marginTop: 12, fontSize: 15, lineHeight: 22, textAlign: 'center', color: currentTheme.fontSecondColor }}>
          {confirmationTimedOut ? "Your payment was submitted successfully. We're still waiting for the backend to confirm the order, so it may appear shortly in My Orders." : "Your card payment was submitted. We're waiting for backend confirmation before opening your order tracking screen."}
        </Text>
        {confirmationTimedOut ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              props?.navigation.reset({
                routes: [{ name: 'Main' }]
              })
            }}
            style={{ marginTop: 24, borderRadius: 999, backgroundColor: currentTheme.main, paddingHorizontal: 20, paddingVertical: 12 }}
          >
            <Text style={{ color: currentTheme.fontWhite, fontWeight: '600' }}>Go to home</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.themeBackground }}>
      {loading ? (
        <ActivityIndicator style={{ position: 'absolute', top: '50%', left: '50%' }} color={currentTheme.main} />
      ) : loadError || !orderDetails ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Text style={{ color: currentTheme.fontMainColor, textAlign: 'center' }}>{loadError || t('PaymentNotSuccessfull')}</Text>
        </View>
      ) : (
        <CreditCard
          paymentConfig={
            new PaymentConfig({
              publishableApiKey: orderDetails.publishableKey,
              amount: orderDetails.amount,
              currency: orderDetails.currency,
              description: orderDetails.description,
              metadata: { orderId: _id }
            })
          }
          onPaymentResult={handlePaymentResult}
          style={{
            container: { backgroundColor: currentTheme.themeBackground },
            textInputs: {
              borderColor: currentTheme.horizontalLine,
              backgroundColor: currentTheme.cardBackground,
              color: currentTheme.fontMainColor,
              borderRadius: 10
            },
            textInputsPlaceholderColor: currentTheme.fontSecondColor,
            paymentButton: { backgroundColor: currentTheme.main, borderRadius: 999 },
            paymentButtonText: { color: currentTheme.fontWhite, fontWeight: '600' },
            errorText: { color: currentTheme.textErrorColor },
            activityIndicatorColor: currentTheme.fontWhite,
            webviewActivityIndicatorColor: currentTheme.main
          }}
        />
      )}
    </View>
  )
}

export default MoyasarCheckout
