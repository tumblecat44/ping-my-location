import {create} from 'zustand';
import {LocationData, PingStatus} from '../types';

interface PingState extends PingStatus {
  setTracking: (value: boolean) => void;
  setLastPing: (data: LocationData) => void;
  incrementCount: () => void;
  incrementFailed: () => void;
  setPending: (count: number) => void;
  resetToday: () => void;
}

export const usePingStore = create<PingState>(set => ({
  isTracking: false,
  lastPing: null,
  todayCount: 0,
  failedCount: 0,
  pendingCount: 0,

  setTracking: value => set({isTracking: value}),
  setLastPing: data => set({lastPing: data}),
  incrementCount: () => set(s => ({todayCount: s.todayCount + 1})),
  incrementFailed: () => set(s => ({failedCount: s.failedCount + 1})),
  setPending: count => set({pendingCount: count}),
  resetToday: () => set({todayCount: 0, failedCount: 0}),
}));
