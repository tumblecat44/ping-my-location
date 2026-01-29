import AsyncStorage from '@react-native-async-storage/async-storage';
import {LocationData, QueueItem} from '../types';
import {v4 as uuid} from 'uuid';

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
    const filtered = queue.filter(item => item.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  }

  async incrementRetry(id: string): Promise<void> {
    const queue = await this.getQueue();
    const updated = queue.map(item =>
      item.id === id ? {...item, retryCount: item.retryCount + 1} : item,
    );
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
  }

  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  }

  async getQueueCount(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }
}

export const storageService = new StorageService();
