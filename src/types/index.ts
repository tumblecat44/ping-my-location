// 위치 데이터
export interface LocationData {
  ts: string; // ISO 8601 timestamp
  lat: number; // 위도
  lng: number; // 경도
  acc: number; // 정확도 (미터)
  speed?: number; // 속도 (m/s, optional)
  label?: string; // 라벨 (auto, manual)
}

// 설정
export interface Settings {
  serverUrl: string;
  interval: 15 | 30 | 60; // 분
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
