import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import MapScreen from './components/MapScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <MapScreen />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
