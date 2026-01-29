import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {LocationData} from '../types';

interface StatusCardProps {
  isTracking: boolean;
  lastPing: LocationData | null;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  isTracking,
  lastPing,
}) => {
  const formatTime = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {backgroundColor: isTracking ? '#4CAF50' : '#9E9E9E'},
            ]}
          />
          <Text variant="titleLarge">
            {isTracking ? '추적 중' : '중지됨'}
          </Text>
        </View>

        {lastPing ? (
          <View style={styles.infoContainer}>
            <Text variant="bodyMedium" style={styles.infoText}>
              마지막 전송: {formatTime(lastPing.ts)}
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              위치: {lastPing.lat.toFixed(4)}, {lastPing.lng.toFixed(4)}
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              정확도: {lastPing.acc.toFixed(0)}m
            </Text>
          </View>
        ) : (
          <Text variant="bodyMedium" style={styles.noData}>
            아직 전송된 데이터가 없습니다
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  infoContainer: {
    marginTop: 8,
  },
  infoText: {
    marginBottom: 4,
    color: '#666',
  },
  noData: {
    color: '#999',
    fontStyle: 'italic',
  },
});
