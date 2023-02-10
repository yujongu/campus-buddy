import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { auth } from "../firebaseConfig"
import {signOut} from "firebase/auth"
export default function ProfileScreen({ navigation, route }) {
  const handleSignOut = () => {
    signOut(auth)
    .then(() => {
      navigation.replace("SignIn")
    })
  }

  return (
    <View style={styles.container}>
      <Text>{auth.currentUser?.uid}</Text>
      <Button title="Sign Out" onPress={()=> handleSignOut()}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
