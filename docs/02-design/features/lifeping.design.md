# LifePing - Design Document

> React Native 위치 자동 수집 앱 설계

## 1. 아키텍처

### 1.1 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                      LifePing App                        │
├──────────────┬──────────────┬───────────────────────────┤
│   UI Layer   │  Logic Layer │      Service Layer        │
├──────────────┼──────────────┼───────────────────────────┤
│  Screens     │  Stores      │  LocationService          │
│  Components  │  Hooks       │  HttpService              │
│              │              │  StorageService           │
└──────────────┴──────────────┴───────────────────────────┘
                                        │
                                        ▼
                              ┌─────────────────┐
                              │  Native Module  │
                              │  (Background    │
                              │   Geolocation)  │
                              └─────────────────┘
```

### 1.2 데이터 흐름

```
[Background Service]
        │
        ▼ 위치 수집 (주기적)
┌───────────────┐
│ LocationData  │
│ {ts,lat,lng}  │
└───────┬───────┘
        │
        ├──────────────────┐
        ▼                  ▼
┌───────────────┐  ┌───────────────┐
│ Local Queue   │  │ HTTP POST     │
│ (실패 시 저장)│  │ (서버 전송)   │
└───────────────┘  └───────────────┘
        │                  │
        └──────────────────┘
                  │
                  ▼ 전송 성공
        ┌─────────────────┐
        │ 서버/텔레그램   │
        │ → JSONL 저장    │
        └─────────────────┘
```

---

## 2. 디렉토리 구조

```
lifeping/
├── src/
│   ├── app/                    # App entry
│   │   └── App.tsx
│   │
│   ├── screens/                # 화면
│   │   ├── HomeScreen.tsx      # 메인 (ON/OFF, 상태)
│   │   └── SettingsScreen.tsx  # 설정
│   │
│   ├── components/             # UI 컴포넌트
│   │   ├── StatusCard.tsx      # 현재 상태 카드
│   │   ├── ToggleButton.tsx    # ON/OFF 버튼
│   │   └── LastPingInfo.tsx    # 마지막 전송 정보
│   │
│   ├── services/               # 비즈니스 로직
│   │   ├── location.ts         # 위치 수집
│   │   ├── http.ts             # HTTP 전송
│   │   └── storage.ts          # 로컬 저장
│   │
│   ├── stores/                 # 상태 관리 (Zustand)
│   │   ├── settingsStore.ts    # 설정 상태
│   │   └── pingStore.ts        # 전송 기록 상태
│   │
│   ├── types/                  # TypeScript 타입
│   │   └── index.ts
│   │
│   └── utils/                  # 유틸리티
│       ├── constants.ts
│       └── formatters.ts
│
├── android/                    # Android 네이티브
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

---

## 3. 화면 설계

### 3.1 HomeScreen (메인)

```
┌─────────────────────────────────────┐
│  LifePing              ⚙️ (설정)   │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │      🟢 추적 중             │   │
│  │                             │   │
│  │   마지막 전송: 14:30        │   │
│  │   위치: 대구 중구           │   │
│  │   정확도: 10m               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │     [ 🔴 중지하기 ]         │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  오늘 통계                  │   │
│  │  ─────────────────────      │   │
│  │  전송 횟수: 24              │   │
│  │  실패: 0                    │   │
│  │  대기 중: 0                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ 📍 지금 전송하기 ]              │
│                                     │
└─────────────────────────────────────┘
```

### 3.2 SettingsScreen (설정)

```
┌─────────────────────────────────────┐
│  ← 설정                            │
├─────────────────────────────────────┤
│                                     │
│  서버 설정                          │
│  ─────────────────────────────      │
│  서버 URL                           │
│  ┌─────────────────────────────┐   │
│  │ https://api.example.com/ping│   │
│  └─────────────────────────────┘   │
│                                     │
│  [ 연결 테스트 ]                    │
│                                     │
│  ─────────────────────────────      │
│                                     │
│  전송 설정                          │
│  ─────────────────────────────      │
│  전송 주기                          │
│  ○ 15분                            │
│  ● 30분                            │
│  ○ 1시간                           │
│                                     │
│  ─────────────────────────────      │
│                                     │
│  배터리 모드                        │
│  ○ 절약 (정확도 낮음)              │
│  ● 균형                            │
│  ○ 정확 (배터리 소모 높음)         │
│                                     │
│  ─────────────────────────────      │
│                                     │
│  고급 설정                          │
│  ─────────────────────────────      │
│  [ ] 이동 중에만 전송               │
│  [ ] Wi-Fi에서만 전송               │
│                                     │
└─────────────────────────────────────┘
```

---

## 4. 타입 정의

```typescript
// src/types/index.ts

// 위치 데이터
export interface LocationData {
  ts: string;        // ISO 8601 timestamp
  lat: number;       // 위도
  lng: number;       // 경도
  acc: number;       // 정확도 (미터)
  speed?: number;    // 속도 (m/s, optional)
  label?: string;    // 라벨 (auto, manual)
}

// 설정
export interface Settings {
  serverUrl: string;
  interval: 15 | 30 | 60;  // 분
  batteryMode: 'low' | 'balanced' | 'high';
  onlyWhenMoving: boolean;
  onlyOnWifi: boolean;
}

// 전송 상태
export interface PingStatus {
  isTracking: boolean;
  lastPing: LocationData | null;
  todayCount: number;
  failedCount: number;
  pendingCount: number;
}

// 전송 큐 아이템
export interface QueueItem {
  id: string;
  data: LocationData;
  retryCount: number;
  createdAt: string;
}
```

---

## 5. 상태 관리 (Zustand)

### 5.1 settingsStore

```typescript
// src/stores/settingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '../types';

interface SettingsState {
  settings: Settings;
  setServerUrl: (url: string) => void;
  setInterval: (interval: 15 | 30 | 60) => void;
  setBatteryMode: (mode: 'low' | 'balanced' | 'high') => void;
  setOnlyWhenMoving: (value: boolean) => void;
  setOnlyOnWifi: (value: boolean) => void;
}

const defaultSettings: Settings = {
  serverUrl: '',
  interval: 30,
  batteryMode: 'balanced',
  onlyWhenMoving: false,
  onlyOnWifi: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setServerUrl: (url) => set((s) => ({
        settings: { ...s.settings, serverUrl: url }
      })),
      setInterval: (interval) => set((s) => ({
        settings: { ...s.settings, interval }
      })),
      setBatteryMode: (mode) => set((s) => ({
        settings: { ...s.settings, batteryMode: mode }
      })),
      setOnlyWhenMoving: (value) => set((s) => ({
        settings: { ...s.settings, onlyWhenMoving: value }
      })),
      setOnlyOnWifi: (value) => set((s) => ({
        settings: { ...s.settings, onlyOnWifi: value }
      })),
    }),
    {
      name: 'lifeping-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 5.2 pingStore

```typescript
// src/stores/pingStore.ts
import { create } from 'zustand';
import { LocationData, PingStatus } from '../types';

interface PingState extends PingStatus {
  setTracking: (value: boolean) => void;
  setLastPing: (data: LocationData) => void;
  incrementCount: () => void;
  incrementFailed: () => void;
  setPending: (count: number) => void;
  resetToday: () => void;
}

export const usePingStore = create<PingState>((set) => ({
  isTracking: false,
  lastPing: null,
  todayCount: 0,
  failedCount: 0,
  pendingCount: 0,

  setTracking: (value) => set({ isTracking: value }),
  setLastPing: (data) => set({ lastPing: data }),
  incrementCount: () => set((s) => ({ todayCount: s.todayCount + 1 })),
  incrementFailed: () => set((s) => ({ failedCount: s.failedCount + 1 })),
  setPending: (count) => set({ pendingCount: count }),
  resetToday: () => set({ todayCount: 0, failedCount: 0 }),
}));
```

---

## 6. 서비스 설계

### 6.1 LocationService

```typescript
// src/services/location.ts
import BackgroundGeolocation, {
  Location,
  Config,
} from 'react-native-background-geolocation';
import { LocationData, Settings } from '../types';
import { httpService } from './http';
import { storageService } from './storage';

class LocationService {
  private isConfigured = false;

  async configure(settings: Settings): Promise<void> {
    const config: Config = {
      desiredAccuracy: this.getAccuracy(settings.batteryMode),
      distanceFilter: settings.onlyWhenMoving ? 50 : 0,
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
      heartbeatInterval: settings.interval * 60,
    };

    await BackgroundGeolocation.ready(config);

    BackgroundGeolocation.onLocation(this.onLocation);
    BackgroundGeolocation.onHeartbeat(this.onHeartbeat);

    this.isConfigured = true;
  }

  private getAccuracy(mode: string): number {
    switch (mode) {
      case 'low': return BackgroundGeolocation.DESIRED_ACCURACY_LOW;
      case 'high': return BackgroundGeolocation.DESIRED_ACCURACY_HIGH;
      default: return BackgroundGeolocation.DESIRED_ACCURACY_MEDIUM;
    }
  }

  private onLocation = async (location: Location): Promise<void> => {
    const data: LocationData = {
      ts: new Date().toISOString(),
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      acc: location.coords.accuracy,
      speed: location.coords.speed ?? undefined,
      label: 'auto',
    };

    await this.sendPing(data);
  };

  private onHeartbeat = async (): Promise<void> => {
    const location = await BackgroundGeolocation.getCurrentPosition({});
    await this.onLocation(location);
  };

  private async sendPing(data: LocationData): Promise<void> {
    try {
      await httpService.post(data);
    } catch (error) {
      await storageService.addToQueue(data);
    }
  }

  async start(): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('LocationService not configured');
    }
    await BackgroundGeolocation.start();
  }

  async stop(): Promise<void> {
    await BackgroundGeolocation.stop();
  }

  async getCurrentLocation(): Promise<LocationData> {
    const location = await BackgroundGeolocation.getCurrentPosition({});
    return {
      ts: new Date().toISOString(),
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      acc: location.coords.accuracy,
      label: 'manual',
    };
  }
}

export const locationService = new LocationService();
```

### 6.2 HttpService

```typescript
// src/services/http.ts
import axios, { AxiosInstance } from 'axios';
import { LocationData } from '../types';
import { useSettingsStore } from '../stores/settingsStore';

class HttpService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async post(data: LocationData): Promise<void> {
    const { serverUrl } = useSettingsStore.getState().settings;

    if (!serverUrl) {
      throw new Error('Server URL not configured');
    }

    await this.client.post(serverUrl, data);
  }

  async testConnection(url: string): Promise<boolean> {
    try {
      await this.client.get(url, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

export const httpService = new HttpService();
```

### 6.3 StorageService

```typescript
// src/services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData, QueueItem } from '../types';
import { v4 as uuid } from 'uuid';

const QUEUE_KEY = 'lifeping-queue';

class StorageService {
  async addToQueue(data: LocationData): Promise<void> {
    const queue = await this.getQueue();
    const item: QueueItem = {
      id: uuid(),
      data,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };
    queue.push(item);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }

  async getQueue(): Promise<QueueItem[]> {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  async removeFromQueue(id: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter((item) => item.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  }

  async incrementRetry(id: string): Promise<void> {
    const queue = await this.getQueue();
    const updated = queue.map((item) =>
      item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
    );
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
  }

  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  }
}

export const storageService = new StorageService();
```

---

## 7. 서버 API 스펙

### 7.1 Endpoint

```
POST /ping
Content-Type: application/json

{
  "ts": "2026-01-29T14:30:00+09:00",
  "lat": 35.8714,
  "lng": 128.6014,
  "acc": 10,
  "speed": 0,
  "label": "auto"
}
```

### 7.2 Response

```
성공: 200 OK
실패: 4xx/5xx → 로컬 큐에 저장 후 재시도
```

### 7.3 텔레그램 봇 대안

서버 대신 텔레그램 봇 사용 시:

```
POST https://api.telegram.org/bot{TOKEN}/sendMessage
{
  "chat_id": "{CHAT_ID}",
  "text": "{\"ts\":\"...\",\"lat\":...,\"lng\":...}"
}
```

---

## 8. 구현 순서

### Phase 1: MVP (2-3일)

| 순서 | 작업 | 예상 시간 |
|------|------|----------|
| 1 | 프로젝트 초기화 (RN + TS) | 1시간 |
| 2 | 타입 정의 | 30분 |
| 3 | Zustand 스토어 구현 | 1시간 |
| 4 | HomeScreen UI | 2시간 |
| 5 | SettingsScreen UI | 2시간 |
| 6 | LocationService 구현 | 3시간 |
| 7 | HttpService 구현 | 1시간 |
| 8 | 통합 테스트 | 2시간 |

### Phase 2: 안정화 (2일)

| 순서 | 작업 |
|------|------|
| 9 | StorageService (로컬 큐) |
| 10 | 재전송 로직 |
| 11 | 에러 핸들링 |
| 12 | 배터리 최적화 |

### Phase 3: 배포 (1일)

| 순서 | 작업 |
|------|------|
| 13 | APK 빌드 |
| 14 | README 작성 |
| 15 | GitHub 공개 |

---

## 9. 의존성

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.73.0",
    "react-native-background-geolocation": "^4.16.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "axios": "^1.6.0",
    "zustand": "^4.5.0",
    "react-native-paper": "^5.12.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/uuid": "^9.0.0"
  }
}
```

---

## 10. 테스트 계획

### 10.1 수동 테스트

| 케이스 | 예상 결과 |
|--------|----------|
| 앱 시작 → 추적 ON | 위치 수집 시작 |
| 30분 대기 | 자동 전송 발생 |
| 앱 종료 후 30분 | 백그라운드 전송 발생 |
| 네트워크 끊김 | 로컬 큐에 저장 |
| 네트워크 복구 | 큐에서 재전송 |
| 수동 ping 버튼 | 즉시 전송 |

### 10.2 배터리 테스트

- 24시간 추적 후 배터리 소모 확인
- 목표: 5% 이하

---

*작성일: 2026-01-29*
*Plan 문서: lifeping.plan.md*
