import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Settings} from '../types';

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
    set => ({
      settings: defaultSettings,
      setServerUrl: url =>
        set(s => ({
          settings: {...s.settings, serverUrl: url},
        })),
      setInterval: interval =>
        set(s => ({
          settings: {...s.settings, interval},
        })),
      setBatteryMode: mode =>
        set(s => ({
          settings: {...s.settings, batteryMode: mode},
        })),
      setOnlyWhenMoving: value =>
        set(s => ({
          settings: {...s.settings, onlyWhenMoving: value},
        })),
      setOnlyOnWifi: value =>
        set(s => ({
          settings: {...s.settings, onlyOnWifi: value},
        })),
    }),
    {
      name: 'lifeping-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
