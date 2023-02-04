import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { sendDataToFirebase } from './firebaseConfig';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Welcome to Campus Buddy application!</Text>
      <StatusBar style="auto" />
    </View>
   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
/* <Button title="test"
onPress={() => sendDataToFirebase("lucyc998", "Lucy", "Cheng", "lucycheng9@gmail.com", "123")}
/>*/