import React, { useState, useEffect } from "react";
import { Button, StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { auth } from "../firebaseConfig";

const BoardScreen = ({ navigation }) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


useEffect(() => {
  auth.onAuthStateChanged((user) => {
    if(user){
      navigation.navigate("Home")
    }
  })
}, [])

return (
  <KeyboardAvoidingView style={styles.container} behavior="padding">
    <Text style={styles.title}>hi</Text>

  </KeyboardAvoidingView>
);
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
},
title: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 40,
},
formContainer: {
  width: '80%',
},
formLabel: {
  fontSize: 16,
  marginTop: 20,
},
formInput: {
  borderWidth: 1,
  borderColor: '#ccc',
  padding: 10,
  fontSize: 16,
  marginTop: 8,
},
loginButton: {
  backgroundColor: 'blue',
  padding: 10,
  marginTop: 20,
  alignItems: 'center',
},
loginButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},
});

export default BoardScreen;
