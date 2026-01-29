import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {Button, Text, IconButton} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusCard} from '../components/StatusCard';
import {StatsCard} from '../components/StatsCard';
import {usePingStore} from '../stores/pingStore';
import {useSettingsStore} from '../stores/settingsStore';
import {locationService} from '../services/location';
import {storageService} from '../services/storage';

interface HomeScreenProps {
  onNavigateSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({onNavigateSettings}) => {
  const {isTracking, lastPing, todayCount, failedCount, pendingCount} =
    usePingStore();
  const {settings} = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 앱 시작 시 대기 중인 항목 수 확인
    const loadPendingCount = async () => {
      const count = await storageService.getQueueCount();
      usePingStore.getState().setPending(count);
    };
    loadPendingCount();
  }, []);

  const handleToggleTracking = async () => {
    if (!settings.serverUrl) {
      Alert.alert(
        '설정 필요',
        '먼저 서버 URL을 설정해주세요.',
        [
          {text: '취소', style: 'cancel'},
          {text: '설정하기', onPress: onNavigateSettings},
        ],
      );
      return;
    }

    const hasPermission = await locationService.requestPermission();
    if (!hasPermission) {
      Alert.alert('권한 필요', '위치 권한이 필요합니다.');
      return;
    }

    if (isTracking) {
      locationService.stopTracking();
    } else {
      locationService.startTracking(settings.interval);
    }
  };

  const handleManualPing = async () => {
    if (!settings.serverUrl) {
      Alert.alert('설정 필요', '먼저 서버 URL을 설정해주세요.');
      return;
    }

    const hasPermission = await locationService.requestPermission();
    if (!hasPermission) {
      Alert.alert('권한 필요', '위치 권한이 필요합니다.');
      return;
    }

    setIsLoading(true);
    try {
      await locationService.manualPing();
      Alert.alert('성공', '위치가 전송되었습니다.');
    } catch (error) {
      Alert.alert('실패', '위치 전송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryQueue = async () => {
    if (pendingCount === 0) return;

    setIsLoading(true);
    try {
      await locationService.retryQueue();
      Alert.alert('완료', '대기 중인 항목을 재전송했습니다.');
    } catch (error) {
      Alert.alert('실패', '재전송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          LifePing
        </Text>
        <IconButton icon="cog" size={24} onPress={onNavigateSettings} />
      </View>

      <View style={styles.content}>
        <StatusCard isTracking={isTracking} lastPing={lastPing} />

        <Button
          mode="contained"
          onPress={handleToggleTracking}
          style={styles.mainButton}
          buttonColor={isTracking ? '#F44336' : '#4CAF50'}>
          {isTracking ? '중지하기' : '시작하기'}
        </Button>

        <StatsCard
          todayCount={todayCount}
          failedCount={failedCount}
          pendingCount={pendingCount}
        />

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={handleManualPing}
            loading={isLoading}
            disabled={isLoading}
            style={styles.actionButton}>
            지금 전송하기
          </Button>

          {pendingCount > 0 && (
            <Button
              mode="outlined"
              onPress={handleRetryQueue}
              loading={isLoading}
              disabled={isLoading}
              style={styles.actionButton}>
              대기 항목 재전송 ({pendingCount})
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mainButton: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  actionButtons: {
    gap: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
});
