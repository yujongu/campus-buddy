import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, Pressable, TextInput, View, Modal, Alert, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { auth, db, userSchedule } from "../firebaseConfig"
import { EmailAuthProvider } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signOut } from "firebase/auth"
import { updateDoc, doc, arrayRemove, onSnapshot, arrayUnion } from "firebase/firestore";
import { useState, useEffect } from "react";
import { SHA256 } from 'crypto-js';

export default function ProfileScreen({ navigation, route }) {
  const [newId, setNewId] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

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
        console.log("username updated successfully.");
      })
      .catch((error) => {
        console.error("Error updating username:", error);
      });
  }

  const handleDeleteAccount = () => {
    const user = auth.currentUser;
    const hashedPassword = SHA256(password).toString(); // Store this in the database

    const credential = EmailAuthProvider.credential(user.email, hashedPassword);
  
    signInWithEmailAndPassword(auth, user.email, hashedPassword)
      .then((userCredential) => {
        userCredential.user.delete()
          .then(() => {
            // Account deleted successfully
            navigation.popToTop();
            alert("Successfully deleted")
          })
          .catch((error) => {
            alert("Wrong password entered");
            console.error("Error deleting account:", error);
            console.log(password);
            console.log(hashedPassword);
          });
      })
      .catch((error) => {
        alert("Wrong password entered");
        console.error("Error reauthenticating user:", error);
        console.log(password);
        console.log(hashedPassword);
      });
  };
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
  
      <Text>Current Id: {id}</Text>
      <Button title="Settings" onPress={() => navigation.navigate("Settings")} />
      <Button title="Sign Out" onPress={handleSignOut} />
      <Button title="Friend page" onPress={() => navigation.navigate("Friend")} />
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={true}
      />
      <Button title="Delete Account" onPress={handleDeleteAccount} />
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
  item: {
    backgroundColor: 'orange',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
});