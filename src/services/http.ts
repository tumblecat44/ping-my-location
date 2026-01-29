import axios, {AxiosInstance} from 'axios';
import {LocationData} from '../types';
import {useSettingsStore} from '../stores/settingsStore';

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
    const {serverUrl} = useSettingsStore.getState().settings;

    if (!serverUrl) {
      throw new Error('Server URL not configured');
    }

    await this.client.post(serverUrl, data);
  }

  async testConnection(url: string): Promise<boolean> {
    try {
      // HEAD 또는 간단한 요청으로 연결 테스트
      await this.client.post(
        url,
        {test: true},
        {timeout: 5000, validateStatus: () => true},
      );
      return true;
    } catch {
      return false;
    }
  }
}

export const httpService = new HttpService();
