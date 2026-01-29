import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';

interface StatsCardProps {
  todayCount: number;
  failedCount: number;
  pendingCount: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  todayCount,
  failedCount,
  pendingCount,
}) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          오늘 통계
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={styles.statNumber}>
              {todayCount}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              전송
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text
              variant="headlineMedium"
              style={[styles.statNumber, failedCount > 0 && styles.errorText]}>
              {failedCount}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              실패
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text
              variant="headlineMedium"
              style={[
                styles.statNumber,
                pendingCount > 0 && styles.warningText,
              ]}>
              {pendingCount}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              대기
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  errorText: {
    color: '#F44336',
  },
  warningText: {
    color: '#FF9800',
  },
});
