import React, {useState} from 'react';
import {PaperProvider, MD3LightTheme} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {HomeScreen} from './src/screens/HomeScreen';
import {SettingsScreen} from './src/screens/SettingsScreen';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4CAF50',
    secondary: '#2196F3',
  },
};

type Screen = 'home' | 'settings';

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        {currentScreen === 'home' ? (
          <HomeScreen onNavigateSettings={() => setCurrentScreen('settings')} />
        ) : (
          <SettingsScreen onBack={() => setCurrentScreen('home')} />
        )}
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
