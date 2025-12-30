import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useKakaoRoute } from '../hooks/use-kakao-route';
import { useTravelMarkers } from '../hooks/use-travel-markers';
import type { RouteInfo, TravelMarker } from '../types/travel';
import { CATEGORIES } from '../types/travel';
import KakaoMapView from './kakao-map-view';

export default function TravelPlanner() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMarkerName, setNewMarkerName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<1 | 2 | 3>(2);
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<TravelMarker | null>(null);
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const { markers, isAddingMode, addMarker, removeMarker, toggleAddingMode } = useTravelMarkers();
  const { getRouteInfo, loading } = useKakaoRoute();

  const dayMarkers = markers.filter(m => m.day === selectedDay);

  // 경로 계산
  useEffect(() => {
    const calculateRoutes = async () => {
      if (dayMarkers.length < 2) {
        setRoutes([]);
        setTotalDistance(0);
        setTotalDuration(0);
        return;
      }

      const newRoutes: RouteInfo[] = [];
      let distance = 0;
      let duration = 0;

      for (let i = 0; i < dayMarkers.length - 1; i++) {
        const routeInfo = await getRouteInfo(dayMarkers[i], dayMarkers[i + 1]);
        if (routeInfo) {
          newRoutes.push(routeInfo);
          distance += routeInfo.distance || 0;
          duration += routeInfo.duration || 0;
        }
      }

      setRoutes(newRoutes);
      setTotalDistance(distance);
      setTotalDuration(duration);
    };

    calculateRoutes();
  }, [dayMarkers]);

  const handleLocationSelect = (coords: { lat: number; lng: number }) => {
    setPendingCoords(coords);
    setShowAddModal(true);
  };

  const handleAddMarker = () => {
    if (newMarkerName.trim() && pendingCoords) {
      addMarker(newMarkerName.trim(), pendingCoords.lat, pendingCoords.lng, selectedCategory, selectedDay);
      setNewMarkerName('');
      setPendingCoords(null);
      setShowAddModal(false);
      toggleAddingMode();
    }
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setPendingCoords(null);
    setNewMarkerName('');
    toggleAddingMode();
  };

  const handleMarkerClick = (marker: TravelMarker) => {
    setSelectedMarker(marker);
  };

  const handleRemoveMarker = (id: number) => {
    Alert.alert(
      '장소 삭제',
      '이 장소를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            removeMarker(id);
            setSelectedMarker(null);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.logoText}>
          Jub<Text style={styles.logoHighlight}>Go</Text>
        </Text>
        <View style={styles.daySelector}>
          <TouchableOpacity
            style={[styles.dayButton, selectedDay === 1 && styles.dayButtonActive]}
            onPress={() => setSelectedDay(1)}
          >
            <Text style={[styles.dayButtonText, selectedDay === 1 && styles.dayButtonTextActive]}>
              Day 1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dayButton, selectedDay === 2 && styles.dayButtonActive]}
            onPress={() => setSelectedDay(2)}
          >
            <Text style={[styles.dayButtonText, selectedDay === 2 && styles.dayButtonTextActive]}>
              Day 2
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 지도 */}
      <View style={styles.mapContainer}>
        <KakaoMapView
          markers={markers}
          selectedDay={selectedDay}
          isAddingMode={isAddingMode}
          onLocationSelect={handleLocationSelect}
          onMarkerClick={handleMarkerClick}
          routes={routes}
        />
      </View>

      {/* 하단 정보 패널 */}
      <View style={styles.bottomPanel}>
        <ScrollView style={styles.markerList}>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              총 거리: {(totalDistance / 1000).toFixed(1)}km
            </Text>
            <Text style={styles.statsText}>
              총 시간: {Math.round(totalDuration / 60)}분
            </Text>
          </View>

          {dayMarkers.map((marker, index) => (
            <View key={marker.id} style={styles.markerItem}>
              <View style={styles.markerNumber}>
                <Text style={styles.markerNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.markerInfo}>
                <Text style={styles.markerName}>{marker.name}</Text>
                <Text style={styles.markerCategory}>
                  {CATEGORIES[marker.category].icon} {CATEGORIES[marker.category].name}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveMarker(marker.id)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.addButton, isAddingMode && styles.addButtonActive]}
          onPress={toggleAddingMode}
        >
          <Text style={styles.addButtonText}>
            {isAddingMode ? '취소' : '+ 장소 추가'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 장소 추가 모달 */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelAdd}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 장소 추가</Text>

            <TextInput
              style={styles.input}
              placeholder="장소 이름"
              value={newMarkerName}
              onChangeText={setNewMarkerName}
            />

            <Text style={styles.label}>카테고리</Text>
            <View style={styles.categoryButtons}>
              {([1, 2, 3] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={styles.categoryButtonText}>
                    {CATEGORIES[cat].icon} {CATEGORIES[cat].name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelAdd}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddMarker}
                disabled={!newMarkerName.trim()}
              >
                <Text style={styles.confirmButtonText}>추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 마커 정보 모달 */}
      <Modal
        visible={selectedMarker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMarker(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedMarker(null)}
        >
          <View style={styles.infoModal}>
            {selectedMarker && (
              <>
                <Text style={styles.infoTitle}>{selectedMarker.name}</Text>
                <Text style={styles.infoCategory}>
                  {CATEGORIES[selectedMarker.category].icon}{' '}
                  {CATEGORIES[selectedMarker.category].name}
                </Text>
                <Text style={styles.infoCoords}>
                  위도: {selectedMarker.lat.toFixed(4)}, 경도: {selectedMarker.lng.toFixed(4)}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  logoHighlight: {
    color: '#155dfc',
  },
  daySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  dayButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#666',
  },
  dayButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
  },
  bottomPanel: {
    height: 250,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#f8f8f8',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  markerList: {
    flex: 1,
  },
  markerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  markerNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  markerNumberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  markerInfo: {
    flex: 1,
  },
  markerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  markerCategory: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 20,
    color: '#999',
  },
  addButton: {
    margin: 12,
    padding: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonActive: {
    backgroundColor: '#999',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  categoryButtons: {
    gap: 8,
    marginBottom: 20,
  },
  categoryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#FF6B6B',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 250,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  infoCoords: {
    fontSize: 12,
    color: '#999',
  },
});
