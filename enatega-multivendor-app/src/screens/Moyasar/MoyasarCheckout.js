import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CreditCard, PaymentConfig, PaymentResponse, PaymentStatus } from 'react-native-moyasar-sdk'
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
import { AntDesign, Feather } from '@expo/vector-icons'
import { scale, verticalScale } from '../../utils/scaling'

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
  const screenStyles = styles(currentTheme)
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
      <SafeAreaView style={screenStyles.centerScreen}>
        <ActivityIndicator size='large' color={currentTheme.main} />
        <Text style={screenStyles.stateTitle}>{confirmationTimedOut ? 'Payment submitted' : 'Confirming your order'}</Text>
        <Text style={screenStyles.stateText}>{confirmationTimedOut ? "Your payment was submitted successfully. We're still waiting for the backend to confirm the order, so it may appear shortly in My Orders." : "Your card payment was submitted. We're waiting for backend confirmation before opening your order tracking screen."}</Text>
        {confirmationTimedOut ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              props?.navigation.reset({
                routes: [{ name: 'Main' }]
              })
            }}
            style={screenStyles.stateButton}
          >
            <Text style={screenStyles.stateButtonText}>Go to home</Text>
          </TouchableOpacity>
        ) : null}
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={screenStyles.container}>
      {loading ? (
        <View style={screenStyles.centerScreen}>
          <ActivityIndicator size='large' color={currentTheme.main} />
          <Text style={screenStyles.loadingText}>Preparing secure checkout</Text>
        </View>
      ) : loadError || !orderDetails ? (
        <View style={screenStyles.centerScreen}>
          <View style={screenStyles.errorIcon}>
            <Feather name='alert-circle' size={scale(26)} color={currentTheme.textErrorColor} />
          </View>
          <Text style={screenStyles.stateTitle}>{t('PaymentNotSuccessfull')}</Text>
          <Text style={screenStyles.stateText}>{loadError || t('PaymentNotSuccessfull')}</Text>
        </View>
      ) : (
        <View style={screenStyles.content}>
          <View style={screenStyles.summaryCard}>
            <View style={screenStyles.brandRow}>
              <View style={screenStyles.brandIcon}>
                <AntDesign name='creditcard' size={scale(24)} color={currentTheme.main} />
              </View>
              <View style={screenStyles.brandCopy}>
                <Text style={screenStyles.heading}>{t('moyasarCheckout')}</Text>
                <Text style={screenStyles.subheading}>Your payment is processed securely by Moyasar.</Text>
              </View>
            </View>
            <View style={screenStyles.amountRow}>
              <Text style={screenStyles.amountLabel}>Amount due</Text>
              <Text style={screenStyles.amountValue}>
                {orderDetails.currency} {(Number(orderDetails.amount || 0) / 100).toFixed(2)}
              </Text>
            </View>
            <View style={screenStyles.secureRow}>
              <Feather name='shield' size={scale(15)} color={currentTheme.main} />
              <Text style={screenStyles.secureText}>Encrypted card checkout</Text>
            </View>
          </View>

          <View style={screenStyles.formCard}>
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
                container: screenStyles.sdkContainer,
                textInputs: {
                  borderColor: currentTheme.horizontalLine,
                  backgroundColor: currentTheme.themeBackground,
                  color: currentTheme.fontMainColor,
                  borderRadius: 12
                },
                textInputsPlaceholderColor: currentTheme.fontSecondColor,
                paymentButton: { backgroundColor: currentTheme.main, borderRadius: 999, height: verticalScale(50) },
                paymentButtonText: { color: currentTheme.fontWhite, fontWeight: '700' },
                errorText: { color: currentTheme.textErrorColor },
                activityIndicatorColor: currentTheme.fontWhite,
                webviewActivityIndicatorColor: currentTheme.main
              }}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.themeBackground
    },
    content: {
      flex: 1,
      paddingHorizontal: scale(18),
      paddingTop: verticalScale(18)
    },
    summaryCard: {
      borderRadius: scale(18),
      padding: scale(18),
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.horizontalLine,
      marginBottom: verticalScale(14)
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    brandIcon: {
      width: scale(48),
      height: scale(48),
      borderRadius: scale(24),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.lightHorizontalLine
    },
    brandCopy: {
      flex: 1,
      marginLeft: scale(12)
    },
    heading: {
      color: theme.fontMainColor,
      fontSize: scale(22),
      fontWeight: '700'
    },
    subheading: {
      color: theme.fontSecondColor,
      fontSize: scale(13),
      lineHeight: scale(19),
      marginTop: verticalScale(4)
    },
    amountRow: {
      marginTop: verticalScale(18),
      paddingTop: verticalScale(16),
      borderTopWidth: 1,
      borderTopColor: theme.horizontalLine,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    amountLabel: {
      color: theme.fontSecondColor,
      fontSize: scale(13)
    },
    amountValue: {
      color: theme.fontMainColor,
      fontSize: scale(18),
      fontWeight: '700'
    },
    secureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: verticalScale(12)
    },
    secureText: {
      color: theme.fontSecondColor,
      fontSize: scale(12),
      marginLeft: scale(7)
    },
    formCard: {
      flex: 1,
      borderRadius: scale(18),
      overflow: 'hidden',
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.horizontalLine
    },
    sdkContainer: {
      flex: 1,
      backgroundColor: theme.cardBackground,
      padding: scale(14)
    },
    centerScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: scale(24),
      backgroundColor: theme.themeBackground
    },
    loadingText: {
      marginTop: verticalScale(14),
      color: theme.fontSecondColor,
      fontSize: scale(14)
    },
    stateTitle: {
      marginTop: verticalScale(20),
      fontSize: scale(22),
      fontWeight: '700',
      textAlign: 'center',
      color: theme.fontMainColor
    },
    stateText: {
      marginTop: verticalScale(12),
      fontSize: scale(15),
      lineHeight: scale(22),
      textAlign: 'center',
      color: theme.fontSecondColor
    },
    stateButton: {
      marginTop: verticalScale(24),
      borderRadius: 999,
      backgroundColor: theme.main,
      paddingHorizontal: scale(22),
      paddingVertical: verticalScale(12)
    },
    stateButtonText: {
      color: theme.fontWhite,
      fontWeight: '700'
    },
    errorIcon: {
      width: scale(56),
      height: scale(56),
      borderRadius: scale(28),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.lightHorizontalLine
    }
  })

export default MoyasarCheckout
