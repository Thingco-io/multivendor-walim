import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { View, TouchableOpacity, StatusBar, Platform, ScrollView } from 'react-native'
import RadioButton from '../../ui/FdRadioBtn/RadioBtn'
import styles from './styles'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import analytics from '../../utils/analytics'
import { HeaderBackButton } from '@react-navigation/elements'
import navigationService from '../../routes/navigationService'
import { AntDesign, FontAwesome } from '@expo/vector-icons'

import { scale } from '../../utils/scaling'
import { useTranslation } from 'react-i18next'
import { textStyles } from '../../utils/textStyles'

function Payment(props) {
  const Analytics = analytics()

  const { t } = useTranslation()
  const { paymentMethod, coupon } = props?.route.params
  const [selectedPayment, setSelectedPayment] = useState(paymentMethod)
  const inset = useSafeAreaInsets()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const iconArray = [
    {
      payment: 'COD',
      label: t('cod'),
      index: 2,
      icon: 'dollar'
    },
    {
      payment: 'STRIPE',
      label: t('creditCart'),
      index: 0,
      icon: 'credit-card'
      // icon1: require('../../assets/images/visaIcon.png')
    },
    {
      payment: 'PAYPAL',
      label: t('paypal'),
      index: 1,
      icon: 'paypal'
    }
  ]

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(currentTheme.menuBar)
    }
    StatusBar.setBarStyle(themeContext.ThemeValue === 'Dark' ? 'light-content' : 'dark-content')
  })

  useLayoutEffect(() => {
    props?.navigation.setOptions({
      headerTitle: () => (
        <View style={{ alignItems: 'center', gap: scale(2) }}>
          <TextDefault
            style={{
              color: currentTheme.newFontcolor,
              ...textStyles.H4,
              ...textStyles.Bolder
            }}
          >
            {t('paymentMethod')}
          </TextDefault>
        </View>
      ),
      headerRight: null,
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: currentTheme.newFontcolor,
        ...textStyles.H4,
        ...textStyles.Bolder
      },
      headerTitleContainerStyle: {
        backgroundColor: currentTheme.newheaderBG
      },
      headerStyle: {
        backgroundColor: currentTheme.newheaderBG
      },
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=''
          backImage={() => (
            <View style={{ ...alignment.PLxSmall }}>
              <AntDesign name='arrowleft' size={22} color={currentTheme.newIconColor} />
            </View>
          )}
          onPress={() => {
            navigationService.goBack()
          }}
        />
      )
    })
  }, [props?.navigation])
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_PAYMENT)
    }
    Track()
  }, [])
  function onSelectPayment(paymentMethod) {
    props?.navigation.navigate('Checkout', { coupon, paymentMethod })
  }
  return (
    <>
      <View style={[styles(currentTheme).mainContainer, styles().flex, { paddingBottom: inset.bottom + scale(16) }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles().scrollContent}>
          <View style={styles(currentTheme).heroCard}>
            <View style={styles(currentTheme).heroIcon}>
              <AntDesign name='Safety' size={scale(22)} color={currentTheme.main} />
            </View>
            <TextDefault textColor={currentTheme.newFontcolor} style={styles().heroTitle} bolder>
              {t('paymentMethod')}
            </TextDefault>
            <TextDefault textColor={currentTheme.fontSecondColor} style={styles().heroSubtitle}>
              Choose how you want to pay for this order. You can review everything again before placing it.
            </TextDefault>
          </View>

          <TextDefault textColor={currentTheme.newFontcolor} style={styles().sectionTitle} bolder>
            Available options
          </TextDefault>

          {iconArray.map((item, index) => (
            <View key={'iconArray-' + index} style={styles(currentTheme).optionCard}>
              <TouchableOpacity
                style={styles(currentTheme).radioGroup}
                key={index.toString()}
                onPress={() => {
                  setSelectedPayment(item)
                }}
              >
                <View style={styles(currentTheme).paymentMethod}>
                  <View style={styles(currentTheme).iconContainer}>
                    <FontAwesome style={styles().iconStyle} name={item.icon} size={18} color={currentTheme.main} />
                  </View>
                  <View style={styles().optionCopy}>
                    <TextDefault textColor={currentTheme.newFontcolor} medium bolder>
                      {item.label}
                    </TextDefault>
                    <TextDefault textColor={currentTheme.fontSecondColor} style={styles().optionHint}>
                      {item.payment === 'COD' ? 'Pay when your rider arrives' : 'Protected checkout for fast confirmation'}
                    </TextDefault>
                  </View>
                </View>
                <View style={styles(currentTheme).radioContainer}>
                  <RadioButton
                    outerColor={currentTheme.horizontalLine}
                    innerColor={currentTheme.main}
                    isSelected={selectedPayment?.index === item.index}
                    size={12}
                    onPress={() => {
                      setSelectedPayment(item)
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles(currentTheme).securityNote}>
            <AntDesign name='lock' size={scale(16)} color={currentTheme.main} />
            <TextDefault textColor={currentTheme.fontSecondColor} style={styles().securityText}>
              Your payment details are handled securely by the selected payment provider.
            </TextDefault>
          </View>
        </ScrollView>
        <TouchableOpacity activeOpacity={0.85} disabled={!selectedPayment} style={[styles(currentTheme).continueButton, !selectedPayment && styles(currentTheme).disabledButton]} onPress={() => onSelectPayment(selectedPayment)}>
          <TextDefault textColor={currentTheme.fontWhite} style={styles().continueText} bolder center>
            Continue
          </TextDefault>
        </TouchableOpacity>
      </View>
    </>
  )
}

export default Payment
