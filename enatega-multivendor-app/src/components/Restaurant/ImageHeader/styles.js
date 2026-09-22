import { StyleSheet } from 'react-native'
import { scale } from '../../../utils/scaling'
import { alignment } from '../../../utils/alignment'
import { textStyles } from '../../../utils/textStyles'

const styles = (props = null) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    mainContainer: {
      backgroundColor:  props != null ? props.cardBackground : '#181818',
      width: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex:2
    },

    touchArea: {
      backgroundColor: props != null ? props.themeBackground : 'white',
      justifyContent: 'center',
      alignItems: 'center',
      width: scale(30),
      height: scale(30),
    },
    favouriteOverlay: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: scale(38),
      height: scale(28),
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
      borderRadius: scale(16),
      backgroundColor: props != null ? props.menuBar : 'white',
      borderWidth: 1,
      borderColor: props != null ? props.newBorderColor : '#F3F4F6'
    },
    fixedViewNavigation: {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1,
      ...alignment.PLmedium,
      ...alignment.PRmedium,
    },
    fixedIcons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 12,
    },
    restaurantDetails: {
      top: -scale(85),
    },
    mainRestaurantImg: {
      height: scale(250),
      width: '100%',
      position: 'relative',
      ...alignment.MBlarge
    },
    mainDetailsContainer: {
      position: 'absolute',
      bottom: 10,
      left: 0,
      right: 0,
      ...alignment.PLmedium,
      ...alignment.PRmedium,
      paddingBottom: scale(22),
      alignItems: props?.isRTL ? 'flex-end' : 'flex-start'
    },
    subDetailsContainer: {
      backgroundColor: props != null ? props.themeBackground : 'white',
      width: '45%',
      alignItems: 'center',
      borderRadius: scale(50),
      padding: scale(5),
      marginVertical: scale(3),
    },
    subContainer: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: scale(60),
    },
    titleContainer: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row', 
      alignItems: 'center',
      gap: scale(10),
      flex: 1,
      marginRight: props?.isRTL ? 0 : scale(10),
      marginLeft: props?.isRTL ? scale(10) : 0,
    },
    timingRow: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: scale(5),
    },
    timingRowMain: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignSelf: 'center',
      backgroundColor: '#F3F4F6',
      borderRadius: 10,
      padding: 10,
      marginBottom: 10,
      width: '100%'
    },
    restaurantImg: {
      width: scale(60),
      height: scale(60),
      borderRadius: 12
    },
    restaurantAbout: {
      fontSize: scale(14),
      fontWeight: '500'
    },
    fixedText: {
      padding: 10,
      borderRadius: 10,
      borderColor: 'white',
      borderWidth: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.74)',
      width: '50%',
      alignItems: 'center',
      alignSelf: 'center'
    },
    deliveryBox: {
      color: props != null ? props.fontWhite : 'white',
      borderRadius: scale(5),
      ...alignment.PxSmall
    },
    ratingBox: {
      flexDirection: props?.isRTL ? 'row-reverse' : 'row',
      gap: scale(10),
      alignItems: 'center',
      ...alignment.PLmedium,
      ...alignment.PRmedium,
    },
    seeReviewsBtn: {
      backgroundColor: props != null ? props.newButtonBackground : '#FFE2D0',
      borderRadius: 4,
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 16,
      paddingRight: 16,
      marginHorizontal: 15
    },
    flatListStyle: {
      // Fixed to the category bar's own height instead of '100%'. '100%' was
      // resolving against the header's large animated container height (not
      // the visible tab row), which stretched each item — and the active
      // pill's background with it — into a huge circle overlapping the
      // content below the tab bar.
      height: scale(56),
      width: '100%',
      backgroundColor: props != null ? props.themeBackground : 'white',
      zIndex: 2
    },
    headerContainer: {
      // No height/width: '100%' here on purpose. Inside a horizontal FlatList
      // item, a percentage height resolves against (and a default 'stretch'
      // cross-axis falls back to) the list's own box, not the visible tab
      // row — that's what was inflating the selected pill into a huge blob.
      // Sizing this from its own padding instead makes it independent of any
      // ancestor's height.
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: scale(10),
      ...alignment.PLlarge,
      ...alignment.PRlarge
    },
    navItem: {
      // Opts out of the FlatList row's default cross-axis 'stretch', so the
      // pill's height always comes from headerContainer's own padding.
      alignSelf: 'center'
    },
    activeHeader: {
      backgroundColor: props != null ? props.newButtonBackground : '#FFE2D0',
      borderRadius: scale(22),
      justifyContent: 'center'
    },
    heading: {
      fontWeight: 'bold'
    },
    overlayContainer: {
      position: 'absolute',
      top: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    },
    headerTitle: {
      ...textStyles.H5,
      ...textStyles.Bolder,
      color: props != null ? props.newFontcolor : 'black',
      flex: 1,
      textAlign: 'center'
    },
    center: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    }
  })
export default styles