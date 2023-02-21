// Import React and Component
import React, {useState, createRef} from 'react';
import { createUser } from "../firebaseConfig";
import { auth } from '../firebaseConfig'
import HomeScreen from "../BottomTabContainer";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import SignInScreen from './SignInScreen';

export default function SignUpScreen({ navigation, route })  {
  const [userId, setUserId] = useState('');  
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userConfirmPassword, setUserConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errortext, setErrortext] = useState('');
  const [
    isRegistrationSuccess,
    setIsRegistrationSuccess
  ] = useState(false);

  const firstNameInputRef = createRef();
  const lastNameInputRef = createRef();
  const emailInputRef = createRef();
  const passwordInputRef = createRef();

  const handleSubmitButton = async () => {
    setErrortext('');
    if (!userId) {
      alert('Please fill Username');
      return;
    }
    if (!userFirstName) {
        alert('Please fill First Name');
        return;
      }
    if (!userLastName) {
        alert('Please fill Last Name');
        return;
    }
    if (!userEmail) {
      alert('Please fill Email');
      return;
    }
    if (!userPassword) {
      alert('Please fill Password');
      return;
    }
    if (!userConfirmPassword) {
      alert('Please fill Confirm Password');
      return;
    }
    if (!/\d/.test(userPassword)) {
      alert('Password must contain at least one number');
      return;
    }
    if(!/^(?=.*[!@#$%^&*])/.test(userPassword)) {
      alert('Password must contain at least one special character');
      return;
    }
    if(userPassword != userConfirmPassword) {
      alert('Password must match with Confirm Password');
      return;
    }
    //Show Loader
    setLoading(true);

    try {
        createUser(userId, userFirstName, userLastName, userEmail, userPassword);
        
        if(auth.currentUser?.uid != undefined){
          navigation.navigate("Home")
        }else{
          navigation.navigate("SignIn")
        }
    } catch (e) {
        setIsRegistrationSuccess(false);
        console.error("Error creating user: ", e);
    }
    setIsRegistrationSuccess(true);
  }
  if (isRegistrationSuccess) {
    return (
      SignInScreen
    );
}
  return (
    <View style={{flex: 1, backgroundColor: '#FEF9F0'}}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          justifyContent: 'center',
          alignContent: 'center',
        }}>
        <KeyboardAvoidingView enabled behavior="padding">
            <View style={{alignItems: 'center'}}>
                <Image
                source={require('../assets/campus-buddy.png')}
                style={{
                    width: '80%',
                    height: 200,
                    resizeMode: 'contain',
                    margin: 10,
                }}
            />
          </View>
          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={(Username) => setUserId(Username)}
              underlineColorAndroid="#f000"
              placeholder="Enter Username"
              placeholderTextColor="#8b9cb5"
              autoCapitalize="sentences"
              returnKeyType="next"
              onSubmitEditing={() =>
                firstNameInputRef.current && firstNameInputRef.current.focus()
              }
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={(UserFirstName) => setUserFirstName(UserFirstName)}
              underlineColorAndroid="#f000"
              placeholder="Enter First Name"
              placeholderTextColor="#8b9cb5"
              autoCapitalize="sentences"
              returnKeyType="next"
              onSubmitEditing={() =>
                lastNameInputRef.current && lastNameInputRef.current.focus()
              }
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={(UserLastName) => setUserLastName(UserLastName)}
              underlineColorAndroid="#f000"
              placeholder="Enter Last Name"
              placeholderTextColor="#8b9cb5"
              autoCapitalize="sentences"
              returnKeyType="next"
              onSubmitEditing={() =>
                emailInputRef.current && emailInputRef.current.focus()
              }
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={(UserEmail) => setUserEmail(UserEmail)}
              underlineColorAndroid="#f000"
              placeholder="Enter Email"
              placeholderTextColor="#8b9cb5"
              keyboardType="email-address"
              ref={emailInputRef}
              returnKeyType="next"
              onSubmitEditing={() =>
                passwordInputRef.current &&
                passwordInputRef.current.focus()
              }
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={(UserPassword) =>
                setUserPassword(UserPassword)
              }
              underlineColorAndroid="#f000"
              placeholder="Enter Password"
              placeholderTextColor="#8b9cb5"
              ref={passwordInputRef}
              returnKeyType="next"
              secureTextEntry={true}
              onSubmitEditing={Keyboard.dismiss}
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.SectionStyle}>
            <Text>Password should include upper, lower case, number, and special characteres. </Text>
          </View>
          <View style={styles.SectionStyle}>
            <TextInput
              style={styles.inputStyle}
              onChangeText={(UserConfirmPassword) => setUserConfirmPassword(UserConfirmPassword)}
              underlineColorAndroid="#f000"
              placeholder="Enter Confirm Password"
              placeholderTextColor="#8b9cb5"
              returnKeyType="go"
              secureTextEntry={true}
              onSubmitEditing={Keyboard.dismiss}
              blurOnSubmit={false}
            />
          </View>
          {errortext != '' ? (
            <Text style={styles.errorTextStyle}>
              {errortext}
            </Text>
          ) : null}
          <TouchableOpacity
            style={styles.buttonStyle}
            activeOpacity={0.5}
            onPress={handleSubmitButton}>
            <Text style={styles.buttonTextStyle}>REGISTER</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
    SectionStyle: {
      flexDirection: 'row',
      height: 40,
      marginTop: 20,
      marginLeft: 35,
      marginRight: 35,
      margin: 10,
    },
    buttonStyle: {
      backgroundColor: '#477A74',
      borderWidth: 0,
      color: '#FFFFFF',
      borderColor: '#2F4858',
      height: 40,
      alignItems: 'center',
      borderRadius: 30,
      marginLeft: 35,
      marginRight: 35,
      marginTop: 20,
      marginBottom: 20,
    },
    buttonTextStyle: {
      color: '#FFFFFF',
      paddingVertical: 10,
      fontSize: 16,
    },
    inputStyle: {
      flex: 1,
      color: 'black',
      paddingLeft: 15,
      paddingRight: 15,
      borderWidth: 1,
      borderRadius: 30,
      borderColor: '#2F4858',
    },
    errorTextStyle: {
      color: 'red',
      textAlign: 'center',
      fontSize: 14,
    },
    successTextStyle: {
      color: 'black',
      textAlign: 'center',
      fontSize: 18,
      padding: 30,
    },
  });