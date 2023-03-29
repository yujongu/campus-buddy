import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, Pressable, TextInput, View, Modal, Alert, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { auth, db, userSchedule } from "../firebaseConfig"
import { EmailAuthProvider } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signOut } from "firebase/auth"
import { updateDoc, doc, arrayRemove, onSnapshot, arrayUnion } from "firebase/firestore";
import { useState, useEffect } from "react";
import { SHA256 } from 'crypto-js';
import { SafeAreaView } from "react-native-safe-area-context";

export default function User_profile({ navigation, route }) {
  const { email } = route.params;
  return (
    <SafeAreaView style={{justifyContent: "center", alignItems: 'center', flex:1}}>
        <Text>{email}'s profile page</Text>
    </SafeAreaView>
  )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
