import { scale, verticalScale } from '../../utils/scaling'
import { StyleSheet } from 'react-native'
import { alignment } from '../../utils/alignment'
import { theme } from '../../utils/themeColors'

const styles = (props = null) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },
    scrollContent: {
      paddingTop: verticalScale(18),
      paddingBottom: verticalScale(18)
    },
    heroCard: {
      borderRadius: scale(16),
      padding: scale(18),
      backgroundColor: props != null ? props?.cardBackground : 'white',
      borderWidth: 1,
      borderColor: props != null ? props?.horizontalLine : '#efefef',
      marginBottom: verticalScale(22)
    },
    heroIcon: {
      width: scale(44),
      height: scale(44),
      borderRadius: scale(22),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: props != null ? props?.lightHorizontalLine : '#fff4ec',
      marginBottom: verticalScale(14)
    },
    heroTitle: {
      fontSize: scale(23),
      lineHeight: scale(29)
    },
    heroSubtitle: {
      fontSize: scale(13),
      lineHeight: scale(20),
      marginTop: verticalScale(8)
    },
    sectionTitle: {
      fontSize: scale(15),
      marginBottom: verticalScale(10)
    },
    optionCard: {
      borderRadius: scale(14),
      borderWidth: 1,
      borderColor: props !== null ? props?.horizontalLine : '#efefef',
      backgroundColor: props != null ? props?.cardBackground : 'white',
      marginBottom: verticalScale(12)
    },
    paymentMethod: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(12)
    },
    optionCopy: {
      flex: 1
    },
    optionHint: {
      fontSize: scale(11),
      marginTop: verticalScale(4),
      lineHeight: scale(16)
    },
    mainContainer: {
      backgroundColor: props != null ? props?.themeBackground : 'white',
      ...alignment.PLmedium,
      ...alignment.PRmedium
    },
    radioContainer: {
      width: '10%',
      alignItems: 'center',
      justifyContent: 'center'
    },
    horizontalLine: {
      borderWidth: 0.5,
      borderColor: props !== null ? props?.iconBackground : 'white'
    },
    radioGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: scale(14)
    },
    iconContainer: {
      width: scale(42),
      height: scale(42),
      borderRadius: scale(21),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: props != null ? props?.lightHorizontalLine : '#fff4ec'
    },
    iconStyle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    securityNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(8),
      paddingVertical: verticalScale(8)
    },
    securityText: {
      flex: 1,
      fontSize: scale(12),
      lineHeight: scale(17)
    },
    continueButton: {
      height: verticalScale(50),
      borderRadius: scale(25),
      backgroundColor: props != null ? props?.main : theme.Pink.main,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: verticalScale(4)
    },
    disabledButton: {
      opacity: 0.55
    },
    continueText: {
      fontSize: scale(15)
    }
  })
export default styles
