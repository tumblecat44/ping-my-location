import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation, {
  GeolocationResponse,
} from '@react-native-community/geolocation';
import {LocationData} from '../types';
import {httpService} from './http';
import {storageService} from './storage';
import {usePingStore} from '../stores/pingStore';

class LocationService {
  private watchId: number | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'LifePing 위치 권한',
          message: '위치를 자동으로 기록하려면 권한이 필요합니다.',
          buttonPositive: '확인',
          buttonNegative: '취소',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position: GeolocationResponse) => {
          const data: LocationData = {
            ts: new Date().toISOString(),
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            acc: position.coords.accuracy || 0,
            speed: position.coords.speed ?? undefined,
            label: 'manual',
          };
          resolve(data);
        },
        error => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  }

  async sendPing(data: LocationData): Promise<boolean> {
    const {incrementCount, incrementFailed, setLastPing} =
      usePingStore.getState();

    try {
      await httpService.post(data);
      setLastPing(data);
      incrementCount();
      return true;
    } catch (error) {
      console.log('전송 실패, 큐에 저장:', error);
      await storageService.addToQueue(data);
      incrementFailed();
      return false;
    }
  }

  async manualPing(): Promise<LocationData> {
    const data = await this.getCurrentLocation();
    data.label = 'manual';
    await this.sendPing(data);
    return data;
  }

  startTracking(intervalMinutes: number): void {
    if (this.intervalId) {
      this.stopTracking();
    }

    // 시작 시 즉시 한 번 전송
    this.tick();

    // 주기적으로 전송
    this.intervalId = setInterval(
      () => this.tick(),
      intervalMinutes * 60 * 1000,
    );

    usePingStore.getState().setTracking(true);
  }

  private async tick(): Promise<void> {
    try {
      const data = await this.getCurrentLocation();
      data.label = 'auto';
      await this.sendPing(data);
    } catch (error) {
      console.log('위치 수집 실패:', error);
    }
  }

  stopTracking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    usePingStore.getState().setTracking(false);
  }

  async retryQueue(): Promise<void> {
    const queue = await storageService.getQueue();

    for (const item of queue) {
      try {
        await httpService.post(item.data);
        await storageService.removeFromQueue(item.id);
        usePingStore.getState().incrementCount();
      } catch {
        if (item.retryCount >= 3) {
          await storageService.removeFromQueue(item.id);
        } else {
          await storageService.incrementRetry(item.id);
        }
      }
    }

    const count = await storageService.getQueueCount();
    usePingStore.getState().setPending(count);
  }
}

export const locationService = new LocationService();
