

import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import SignUpScreen from './SignUpScreen';
import { authUser } from "../firebaseConfig";

const SignInScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const tomain= () => {
    if(authUser(username, password) != null){
        navigation.navigate('Home')
    }else{
        alert("Wrong password or username")
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Campus Buddy</Text>
      <View style={styles.formContainer}>
        <Text style={styles.formLabel}>Username</Text>
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
      </View>
    </View>
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