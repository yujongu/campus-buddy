

import { useState, createContext, useContext, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, } from "firebase/auth"
import { SHA256 } from 'crypto-js';
import { EmailAuthProvider } from "firebase/auth";




const SignInScreen = ({navigation}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

  
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if(user){
        navigation.navigate("Home")
      }
    })
  }, [])

  const tomain= () => {
    const user = auth.currentUser;
    const hashedPassword = SHA256(password).toString(); // Store this in the database
    signInWithEmailAndPassword(auth, username, hashedPassword)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('Logged in with:', user.email)
      }
    )
    .catch((error) => {
      alert(error.message)
    })
  }
  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Text style={styles.title}>Campus Buddy</Text>
      <View style={styles.formContainer}>
        <Text style={styles.formLabel}>Email</Text>
        <TextInput
          style={styles.formInput}
          value={username}
          onChangeText={setUsername}
        />
        <Text style={styles.formLabel}>Password</Text>
        <TextInput
          style={styles.formInput}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.loginButton} onPress={() => tomain()}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.loginButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
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

export default SignInScreen;