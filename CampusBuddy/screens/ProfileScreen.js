import { StatusBar } from "expo-status-bar";
import { Switch, Button, StyleSheet, Text, Pressable, TextInput, View, Modal, Alert, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { auth, db, userSchedule } from "../firebaseConfig"
import { EmailAuthProvider } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signOut } from "firebase/auth"
import { updateDoc, doc, arrayRemove, onSnapshot, arrayUnion } from "firebase/firestore";
import React, { useState, useEffect, useContext } from "react";
import { SHA256 } from 'crypto-js';
import ThemeContext  from "../components/ui/ThemeContext";
import theme from "../components/ui/theme";
import {EventRegister} from "react-native-event-listeners";

export default function ProfileScreen({ navigation, route }) {
  const [newId, setNewId] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [mode,setMode] = useState(false);
  const theme = useContext(ThemeContext);

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
    <View style={[styles.container]}>
      <Text style = {[styles.textStyle, {color: theme.color}]}>{auth.currentUser?.uid}</Text>
  
      <Text style = {[styles.textStyle, {color: theme.color}]}>Current Id: {id}</Text>
      <Switch 
        value={mode} 
        onValueChange={(value) => {
        setMode(value);
        EventRegister.emit("changeTheme", value);
      }} />
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
    fontWeight: "bold",
    textAlign: "center"
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
});