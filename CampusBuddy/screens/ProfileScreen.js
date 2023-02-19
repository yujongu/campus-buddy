import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { auth, db } from "../firebaseConfig"
import { signOut } from "firebase/auth"
import { updateDoc, doc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { onSnapshot } from "firebase/firestore";

export default function ProfileScreen({ navigation, route }) {
  const [newId, setNewId] = useState("");
  const [id, setId] = useState("");

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigation.popToTop();
      })
  }

  const handleChangeId = () => {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    updateDoc(userDocRef, { id: newId })
      .then(() => {
        console.log("Id updated successfully.");
      })
      .catch((error) => {
        console.error("Error updating id:", error);
      });
  }

  useEffect(() => {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setId(doc.data().id);
      } else {
        console.log("No such document!");
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>{auth.currentUser?.uid}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new Id"
        value={newId}
        onChangeText={(text) => setNewId(text)}
      />
      <Text>Current Id: {id}</Text>
      <Button title="Change Id" onPress={handleChangeId} />
      <Button title="Sign Out" onPress={handleSignOut} />
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
  input: {
    width: "80%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginVertical: 10,
    padding: 10,
  },
});
