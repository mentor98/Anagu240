/**
 * Anagu Mobile App — Root Component
 * React Native / Expo
 */
import 'react-native-screens';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './navigation/RootNavigator';
import { useNetworkMonitor } from './hooks/useNetworkMonitor';

export default function App() {
  useNetworkMonitor(); // flush offline queue when network reconnects
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#1B4F72" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
