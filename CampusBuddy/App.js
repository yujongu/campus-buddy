import { useEffect, useState } from 'react'
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import { sendDataToFirebase } from "./firebaseConfig";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CalendarScreen from "./screens/CalendarScreen";
import HomeScreen from "./BottomTabContainer";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import User_profile from "./screens/User_profileScreen";
import SettingsScreen from './screens/SettingsScreen';
import { auth } from './firebaseConfig';
import FriendScreen from './screens/FriendScreen';
import {EventRegister} from "react-native-event-listeners";
import ThemeContext from "./components/ui/ThemeContext";
import theme from "./components/ui/theme";
import ForgotEmail from "./screens/ForgotEmail";
import ForgotPassword from "./screens/ForgotPassword";


const Stack = createNativeStackNavigator();

export default function App() {
  
  const [mode, setMode] = useState(false);

  useEffect(() => {
    let eventListener = EventRegister.addEventListener("changeTheme", (data) => {
      setMode(data);
      console.log(data);
    });
    return () => {
      EventRegister.removeEventListener(eventListener);
    }
  })

  return (
    <ThemeContext.Provider value={mode === true ? theme.dark : theme.light}>
      <NavigationContainer theme = {mode === true ? DarkTheme: DefaultTheme}>
        <Stack.Navigator>
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="user_profile"
            component={User_profile}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Friend"
            component={FriendScreen}
            options={{headerShown: true}}
          />
          <Stack.Screen
            name="ForgotEmail"
            component={ForgotEmail}
            options={{headerShown: true}}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPassword}
            options={{headerShown: true}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeContext.Provider>
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

