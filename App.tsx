import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useStore } from './src/store';
import { Text, View } from 'react-native';

export default function App() {
  const initializeStore = useStore(state => state.initializeStore);
  const isInitialized = useStore(state => state.isInitialized);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Initializing...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
