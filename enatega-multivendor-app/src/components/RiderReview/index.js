import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { Dimensions, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { Modalize } from 'react-native-modalize'
import TextDefault from '../Text/TextDefault/TextDefault'
import CrossCirleIcon from '../../assets/SVG/cross-circle-icon'
import { scale } from '../../utils/scaling'
import StarIcon from '../../assets/SVG/star-icon'
import { styles } from '../Review/styles'
import Button from '../Button/Button'
import { useMutation } from '@apollo/client'
import gql from 'graphql-tag'
import { reviewRider } from '../../apollo/mutations'
import { useTranslation } from 'react-i18next'

const SCREEN_HEIGHT = Dimensions.get('screen').height
const MODAL_HEIGHT = Math.floor(SCREEN_HEIGHT / 4)
const SNAP_HEIGHT = MODAL_HEIGHT

const REVIEWRIDER = gql`
  ${reviewRider}
`

/**
 * Feedback for the rider who delivered the order.
 *
 * Opened straight after the store review so the customer rates the restaurant
 * and the delivery separately. It mirrors the store Review sheet's layout and
 * styling — only the subject changes.
 */
function RiderReview({ onOverlayPress, theme, orderId, riderName, onSubmitted }, ref) {
  const { t } = useTranslation()

  const ratingRef = useRef()
  const [description, setDescription] = useState('')
  const [showSection, setShowSection] = useState(false)
  const [loading, setLoading] = useState(false)

  const [mutate] = useMutation(REVIEWRIDER, { onCompleted, onError })

  function onCompleted() {
    setDescription('')
    setShowSection(false)
    ratingRef.current = undefined
    ref?.current?.close()
    onSubmitted && onSubmitted()
  }

  function onError(error) {
    console.log(JSON.stringify(error))
    ref?.current?.close()
    onSubmitted && onSubmitted()
  }

  // Reset between orders so a previous rating is never carried over.
  useEffect(() => {
    setDescription('')
    setShowSection(false)
    ratingRef.current = undefined
  }, [orderId])

  const onSelectRating = (rating) => {
    if (!showSection) { setShowSection(true) }
    ratingRef.current = rating
  }

  const onClose = () => {
    ref?.current?.close()
    onSubmitted && onSubmitted()
  }

  const onSubmit = async () => {
    if (loading || !ratingRef.current) return
    setLoading(true)

    try {
      await mutate({
        variables: { order: orderId, description, rating: ratingRef.current }
      })
    } catch (error) {
      console.error('Error submitting rider review:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modalize snapPoint={SNAP_HEIGHT} handlePosition='inside' ref={ref} withHandle={false} adjustToContentHeight modalStyle={{ borderWidth: StyleSheet.hairlineWidth }} onOverlayPress={onOverlayPress}>
      <View style={styles.container(theme)}>
        <View style={styles.headingContainer(theme)}>
          <TextDefault bolder H3 textColor={theme.gray900}>
            {t('howWasRider')}
          </TextDefault>
          <TouchableOpacity onPress={onClose}>
            <CrossCirleIcon stroke={theme.newIconColor}/>
          </TouchableOpacity>
        </View>

        {!!riderName && (
          <View style={styles.itemContainer(theme)}>
            <TextDefault H5 bold textColor={theme.gray900} isRTL>{riderName}</TextDefault>
          </View>
        )}

        <View style={{ flexDirection: 'row' }}>
          <StarRating numberOfStars={5} onSelect={onSelectRating} theme={theme} />
        </View>

        {showSection && <View>
          <TextDefault textColor={theme.gray900} H4 bolder style={{ marginVertical: scale(8) }} isRTL >{t('tellAboutDelivery')}</TextDefault>
          <TextInput
            label={t('review')}
            placeholder={t('typeHere')}
            placeholderTextColor={theme.placeholderColor}
            value={description}
            onChangeText={(text) => setDescription(text)}
            style={styles.modalInput(theme)}
          />
          <Button text={t('submit')}
            buttonProps={{ onPress: onSubmit, disabled: loading }}
            buttonStyles={{ borderRadius: 15, backgroundColor: theme.primary, margin: 10, opacity: loading ? 0.6 : 1 }} textStyles={{ margin: 10, alignSelf: 'center' }}
            textProps={{ H4: true, bold: true, textColor: theme.black }}/>
        </View>}
      </View>
    </Modalize>
  )
}

const StarRating = ({ numberOfStars = 5, onSelect, defaultRating = 0, theme }) => {
  const stars = Array.from({ length: numberOfStars }, (_, index) => index + 1)
  const [selected, setSelected] = useState(defaultRating)
  const onPress = index => {
    onSelect(index)
    setSelected(index)
  }
  return (
    <View style={styles.starContainer(theme)}>
      {stars.map(index => <TouchableWithoutFeedback key={`star-${index}`} onPress={() => onPress(index)}>
        <View style={{ flex: 1 }}>
          <StarIcon isFilled={index <= selected}/>
        </View>
      </TouchableWithoutFeedback>)}
    </View>
  )
}

export default forwardRef(RiderReview)
