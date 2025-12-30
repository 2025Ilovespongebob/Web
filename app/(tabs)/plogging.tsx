import SimpleRouteMap from '@/components/simple-route-map';
import { colors } from '@/styles/colors';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { usePloggingStore } from '../../stores/plogging-store';

const leftArrowSvg = `
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M5.22678 8.60179C5.17441 8.65404 5.13284 8.71611 5.10449 8.78445C5.07614 8.85279 5.06152 8.92605 5.06152 9.00004C5.06152 9.07403 5.07614 9.14729 5.10449 9.21563C5.13284 9.28396 5.17441 9.34604 5.22678 9.39829L11.9768 16.1483C12.0824 16.2539 12.2257 16.3132 12.375 16.3132C12.5244 16.3132 12.6677 16.2539 12.7733 16.1483C12.8789 16.0427 12.9382 15.8994 12.9382 15.75C12.9382 15.6007 12.8789 15.4574 12.7733 15.3518L6.42041 9.00004L12.7733 2.64829C12.8789 2.54267 12.9382 2.39941 12.9382 2.25004C12.9382 2.10067 12.8789 1.95741 12.7733 1.85179C12.6677 1.74617 12.5244 1.68683 12.375 1.68683C12.2257 1.68683 12.0824 1.74617 11.9768 1.85179L5.22678 8.60179Z"
    fill="#000000"
    stroke="#000000"
  />
</svg>
`;

export default function PloggingScreen() {
  const navigation = useNavigation();

  // 임시 위도/경도 데이터 (추후 백엔드에서 받아올 예정)
  const tempLocations = [
    { lat: 35.1925802, lng: 128.9072837, name: '목적지 1', grade: 1 as 1 | 2 | 3 },
    { lat: 35.1914518, lng: 128.9175635, name: '목적지 2', grade: 3 as 1 | 2 | 3 },
  ];
  const {isNavigating} = usePloggingStore()

  return (
    <View style={styles.container}>
      <SimpleRouteMap locations={tempLocations} />

      {/* Back Button */}
      {!isNavigating && 
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <SvgXml xml={leftArrowSvg} width={18} height={18} />
      </TouchableOpacity>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
});
