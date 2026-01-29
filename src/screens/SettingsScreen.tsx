import React, {useState} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  RadioButton,
  Switch,
  IconButton,
  Divider,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSettingsStore} from '../stores/settingsStore';
import {httpService} from '../services/http';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({onBack}) => {
  const {
    settings,
    setServerUrl,
    setInterval,
    setBatteryMode,
    setOnlyWhenMoving,
    setOnlyOnWifi,
  } = useSettingsStore();

  const [urlInput, setUrlInput] = useState(settings.serverUrl);
  const [isTesting, setIsTesting] = useState(false);

  const handleSaveUrl = () => {
    setServerUrl(urlInput);
    Alert.alert('저장됨', '서버 URL이 저장되었습니다.');
  };

  const handleTestConnection = async () => {
    if (!urlInput) {
      Alert.alert('오류', 'URL을 입력해주세요.');
      return;
    }

    setIsTesting(true);
    try {
      const success = await httpService.testConnection(urlInput);
      if (success) {
        Alert.alert('성공', '서버에 연결할 수 있습니다.');
      } else {
        Alert.alert('실패', '서버에 연결할 수 없습니다.');
      }
    } catch {
      Alert.alert('실패', '연결 테스트 중 오류가 발생했습니다.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={onBack} />
        <Text variant="titleLarge">설정</Text>
        <View style={{width: 48}} />
      </View>

      <View style={styles.content}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          서버 설정
        </Text>

        <TextInput
          label="서버 URL"
          value={urlInput}
          onChangeText={setUrlInput}
          placeholder="https://api.example.com/ping"
          style={styles.input}
          mode="outlined"
        />

        <View style={styles.buttonRow}>
          <Button
            mode="outlined"
            onPress={handleTestConnection}
            loading={isTesting}
            style={styles.button}>
            연결 테스트
          </Button>
          <Button mode="contained" onPress={handleSaveUrl} style={styles.button}>
            저장
          </Button>
        </View>

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.sectionTitle}>
          전송 주기
        </Text>

        <RadioButton.Group
          onValueChange={value => setInterval(Number(value) as 15 | 30 | 60)}
          value={String(settings.interval)}>
          <RadioButton.Item label="15분" value="15" />
          <RadioButton.Item label="30분" value="30" />
          <RadioButton.Item label="1시간" value="60" />
        </RadioButton.Group>

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.sectionTitle}>
          배터리 모드
        </Text>

        <RadioButton.Group
          onValueChange={value =>
            setBatteryMode(value as 'low' | 'balanced' | 'high')
          }
          value={settings.batteryMode}>
          <RadioButton.Item label="절약 (정확도 낮음)" value="low" />
          <RadioButton.Item label="균형" value="balanced" />
          <RadioButton.Item label="정확 (배터리 소모 높음)" value="high" />
        </RadioButton.Group>

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.sectionTitle}>
          고급 설정
        </Text>

        <View style={styles.switchRow}>
          <Text>이동 중에만 전송</Text>
          <Switch
            value={settings.onlyWhenMoving}
            onValueChange={setOnlyWhenMoving}
          />
        </View>

        <View style={styles.switchRow}>
          <Text>Wi-Fi에서만 전송</Text>
          <Switch value={settings.onlyOnWifi} onValueChange={setOnlyOnWifi} />
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
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  divider: {
    marginVertical: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
});
